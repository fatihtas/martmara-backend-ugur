import json
import pymongo
import sys
import time
import bson
import datetime
from bson.objectid import ObjectId
from bson import Binary, Code
from bson import json_util
from multiprocessing import Process, Lock, Pool
#buradaki araligi degistirerek venue set'ten select yapabiliriz
#ornek: _skip=100 _limit=200 olursa [100,300] venue'larinda islem yapilir.

class JSONEncoder(json.JSONEncoder):
	def default(self, o):
		if isinstance(o, ObjectId):
			return str(o)
		if isinstance(o, datetime.datetime):
			return str(o)
		return json.JSONEncoder.default(self, o)

def do_whatever_necessary(venue,total_n_of_venue,lock,filename,myc,commatag):
	client = pymongo.MongoClient('ds051770-a0.mongolab.com',51770)
	db = client.heroku_app31071968
	db.authenticate('Bora_write', 'MmPasa_189m')#readonly user
	db_venues = db.venues
	db_venueproducts = db.venueproducts
	db_products = db.products
	db_categories = db.categories
	
	venue_id = venue['_id']
	
	venue['op_hours']={}
	if 'operatingHours' in venue:
		#print(venue['operatingHours'])
		for day in venue['operatingHours']:
			venue['op_hours'][str(day['dayOfTheWeek'])] = []
			
			try:
				venue['op_hours'][str(day['dayOfTheWeek'])].append(day['openingHourString']+':00')
				venue['op_hours'][str(day['dayOfTheWeek'])].append(day['closingHourString']+':00')
			except:
				print ('we have a problem. inspect venue with id: ',venue_id)
	if venue['operatingHours']:
		venue.pop("operatingHours",None)
		
	
	#location
	venue['geoloc']={}
	venue['geoloc']['lat'] = venue['location'][1]
	venue['geoloc']['lng'] = venue['location'][0]
	venue.pop("location", None)
	
	#category
	venue['categorydetails'] = []
	category_ids = []
	for eachcategory in venue['categories']:
		t1 = db_categories.find({'_id':eachcategory},{'nameEn':1,'nameTr':1,'_id':0})
		venue['categorydetails'] = list(t1)
		
	#switch
	venue['categories'] = venue['categorydetails']
	venue.pop("categorydetails", None)
	
	#below finds the products of this venue
	products_of_this_venue = []
	product_id_array = []
	for productofvenue in db_venueproducts.find({'venue':venue_id},{'product':1,'rating':1,'price':1,'currency':1}):
		products_of_this_venue.append(productofvenue)#(productofvenue['product'],productofvenue['rating'],productofvenue['price'],productofvenue['currency']))
		product_id_array.append(productofvenue['product'])#for teh products query.
	products = list(db_products.find({'_id':{'$in' : product_id_array}},{'nameEn':1,'nameTr':1,'_id':1}))
	client.close()
	#burada nested loop yapmak zorundayim, python'da dictionary'leri join edince de ayni seyi yapiyomus. n=number_of_total_venues ise bizim kod n^3'te calisiyor.
	for product in products_of_this_venue:
		for productofvenue in products:
			if product['product']==productofvenue['_id']:
				if 'nameEn' in productofvenue:
					product['nameEn']=productofvenue['nameEn']
				if 'nameTr' in productofvenue:
					product['nameTr']=productofvenue['nameTr']
		product.pop('_id',None)
		product.pop('product',None)
		
	#print (products_of_this_venue)
	
	venue['products'] = products_of_this_venue
	
	lock.acquire()
	f = open(filename, 'ab')
	if (commatag==0):
		f.write(bytes(str(JSONEncoder().encode(venue)),'utf-8'))
		commatag=1
	else:
		f.write(bytes(',\n'+str(JSONEncoder().encode(venue)),'utf-8'))
	if(myc%50==0):
		print ("venue:",myc,"\ttotalvenue:", total_n_of_venue,"\tproductintisvenue:",len(product_id_array))
	f.close()
	lock.release()
	return

	
if __name__ == '__main__':
	_skip = int(input("start:"))#start index
	_limit = int(input("limit:"))#number of venues to write to file
	filename = input("outputfilename:")#output file name

	client = pymongo.MongoClient('ds051770-a0.mongolab.com',51770)
	db = client.heroku_app31071968
	db.authenticate('Bora_write', 'MmPasa_189m')#readonly user
	db_venues = db.venues
	total_n_of_venue = db_venues.count()
	

	lastarray = []
	outputjson = {}
	myc=0

	commatag=0

	start = time.time()

	f = open(filename, 'wb')
	f.write(bytes(str(''),'utf-8'))
	f.close()
	
	lock = Lock()
	proc_pool = []
	for venue in db_venues.find({},{'creator':0,'keywords':0,'status':0,'ownerStatus':0,'__v':0}).skip(_skip).limit(_limit):
		proc_terminator = 0
		while(len(proc_pool)>50):
			if not proc_pool[proc_terminator].is_alive():
				del proc_pool[proc_terminator]
				break
			proc_terminator = (proc_terminator+1)%50
			if proc_terminator == 25:
				time.sleep(0.1)
				print ("sleeping!!!")
			#print("joins...")
		p = Process(target=do_whatever_necessary,args=(venue,total_n_of_venue,lock,filename,myc,commatag))
		p.start()
		proc_pool.append(p)
		#print("myc:",myc,proc_pool)
		myc+=1
		if(commatag==0):
			commatag=1
	
	while(len(proc_pool)!=0):
		proc_pool[0].join()
		del proc_pool[0]
	client.close()
	
	f = open(filename, 'ab')
	f.write(bytes(str('\n'),'utf-8'))
	f.close()
	end = time.time()

	print (end - start)
