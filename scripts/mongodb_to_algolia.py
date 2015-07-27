import json
import pymongo
import sys
import time
import bson
import datetime
from bson.objectid import ObjectId
from bson import Binary, Code
from bson import json_util
#buradaki araligi degistirerek venue set'ten select yapabiliriz
#ornek: _skip=100 _limit=200 olursa [100,300] venue'larinda islem yapilir.


_skip = int(input())#start index
_limit = int(input())#number of venues to write to file
filename = input()#output file name

class JSONEncoder(json.JSONEncoder):
	def default(self, o):
		if isinstance(o, ObjectId):
			return str(o)
		if isinstance(o, datetime.datetime):
			return str(o)
		return json.JSONEncoder.default(self, o)


client = pymongo.MongoClient('ds051770-a0.mongolab.com',51770)
db = client.heroku_app31071968
db.authenticate('bora', 'QWEasd123')#readonly user
db_venues = db.venues
db_venueproducts = db.venueproducts
db_products = db.products
db_categories = db.categories

lastarray = []
outputjson = {}
myc=0

commatag=0

start = time.time()

f = open(filename, 'wb')

f.write(bytes(str('['),'utf-8'))

total_n_of_venue = db_venues.count()
for venue in db_venues.find({},{'creator':0,'operatingHours':0,'keywords':0,'status':0,'ownerStatus':0,'__v':0}).skip(_skip).limit(_limit):

	venue_id = venue['_id']
	
	#location
	venue['geoloc']={}
	venue['geoloc']['lat'] = venue['location'][0]
	venue['geoloc']['lng'] = venue['location'][1]
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
	product_ids = []
	for productofvenue in db_venueproducts.find({'venue':venue_id},{'product':1}):
		product_id = productofvenue['product']
		product_ids.append(product_id)
	productlist = list(db_products.find({'_id':{'$in' : product_ids}},{'nameEn':1,'nameTr':1,'_id':0}))
	venue['products'] = productlist
	myc+=1
	
	thinvenue={}
	
	
	if (commatag==0):
		f.write(bytes(str(JSONEncoder().encode(venue)),'utf-8'))
		commatag=1
	else:
		f.write(bytes(',\n'+str(JSONEncoder().encode(venue)),'utf-8'))
	print ("venue:",myc,"\ttotalvenue:", total_n_of_venue,"\tproductintisvenue:",len(product_ids))
	
f.write(bytes(str('\n]'),'utf-8'))

end = time.time()

print (end - start)
