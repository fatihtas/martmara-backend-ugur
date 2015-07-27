var Venue       	 = require('../models/Venue');
var Product     	 = require('../models/Product');
var User     	 	 = require('../models/User');
var VenueProductUser = require('../models/VenueProductUser');
var VenueProduct     = require('../models/VenueProduct');
var Category    	 = require('../models/Category');
var CategoryProduct  = require('../models/CategoryProduct');
var SupplyChain 	 = require('../models/SupplyChain');
var Util        	 = require('../util/Util');

var ProductService = require('./ProductService');

var async    = require('async');
var ObjectId = require ("mongoose").Schema.Types.ObjectId;

var geocoderProvider = 'google';
var httpAdapter      = 'https';

var extra = {
    apiKey   : 'AIzaSyB6DNnuvqms1WM3XNKjS6YRwZ4C176uEZw',
    formatter: null
};

var geocoder = require('node-geocoder').getGeocoder(geocoderProvider, httpAdapter, extra);

var VenueServiceHelpers = {

	prepareNewCategory : function(category) {
		var nameEn = category.nameEn;
		var nameTr = category.nameTr;

		if (nameEn == undefined && nameTr == undefined) {
			console.log("Missing parameters!");
			return;
		}

		var keywordArray = [];

		if (nameEn) {
			var nameEnLowerCase = nameEn.toLowerCase();
			var convertedName   = Util.convertAccentedCharacters(nameEnLowerCase);  // convert all turkish vs characters into english form (ex : ç -> c)
			var keywords        = convertedName.trim().split(/\s+/);                // trim and split by whitespace


			for (var i = 0; i < keywords.length; i++) {
				var newKeyword = {
					order    : i,
					keyword  : keywords[i],
					language : 'en'
				};
				keywordArray.push(newKeyword);
			}

			keywordArray.push({
				order    : 0,
				keyword  : convertedName,
				language : 'en'
			});
		}

		if (nameTr) {
			var nameTrLowerCase = nameTr.toLowerCase();
			var convertedName   = Util.convertAccentedCharacters(nameTrLowerCase);  // convert all turkish vs characters into english form (ex : ç -> c)
			var keywords        = convertedName.trim().split(/\s+/);                // trim and split by whitespace

			for (var i = 0; i < keywords.length; i++) {
				var newKeyword = {
					order    : i,
					keyword  : keywords[i],
					language : 'tr'
				};
				keywordArray.push(newKeyword);
			}

			keywordArray.push({
				order    : 0,
				keyword  : convertedName,
				language : 'tr'
			});
		}

		var newCategory = {
			keywords : keywordArray,
		};

		if(nameEn)
			newCategory.nameEn = nameEn;
		if(nameTr)
			newCategory.nameTr = nameTr;

		return newCategory;
	},

	createCategory : function(category , callback) {
		var nameEn = category.nameEn;
		var nameTr = category.nameTr;

		if (nameEn == undefined && nameTr == undefined) {
			callback("Missing parameters!");
			return;
		}

		var newCategory = new Category(VenueServiceHelpers.prepareNewCategory(category));
		newCategory.save(function(err) {
			if (err)
				callback(err);
			else
				callback(null , newCategory);
		});
	},

	createSupplyChain : function(supplyChain , callback) {
		var nameEn = supplyChain.nameEn;
		var nameTr = supplyChain.nameTr;

		if (nameEn == undefined && nameTr == undefined) {
			callback("Missing parameters!");
			return;
		}

		var keywordArray = [];

		if (nameEn) {
			var nameEnLowerCase = nameEn.toLowerCase();
			var convertedName   = Util.convertAccentedCharacters(nameEnLowerCase);  // convert all turkish vs characters into english form (ex : ç -> c)
			var keywords        = convertedName.trim().split(/\s+/);                // trim and split by whitespace


			for (var i = 0; i < keywords.length; i++) {
				var newKeyword = {
					order    : i,
					keyword  : keywords[i],
					language : 'en'
				};
				keywordArray.push(newKeyword);
			}

			keywordArray.push({
				order   : 0,
				keyword : convertedName
			});
		}

		if (nameTr) {
			var nameTrLowerCase = nameTr.toLowerCase();
			var convertedName   = Util.convertAccentedCharacters(nameTrLowerCase);  // convert all turkish vs characters into english form (ex : ç -> c)
			var keywords        = convertedName.trim().split(/\s+/);                // trim and split by whitespace

			for (var i = 0; i < keywords.length; i++) {
				var newKeyword = {
					order    : i,
					keyword  : keywords[i],
					language : 'tr'
				};
				keywordArray.push(newKeyword);
			}

			keywordArray.push({
				order   : 0,
				keyword : convertedName
			});
		}

		var newSupplyChain = new SupplyChain({
			nameEn 	 : nameEn,
			nameTr   : nameTr,
			keywords : keywordArray
		});

		newSupplyChain.save(function(err) {
			if (err)
				callback(err);
			else
				callback(null , newSupplyChain);
		});
	},
/*
	fix : function() {
		Venue
		.find()
		.select('operatingHours')
		.exec(function(err , results) {
			if (err) {
				console.log(err);
			}
			else {
				for (var i = 0; i < results.length; i++) {
					var venue          = results[i];
					var operatingHours = venue.operatingHours;

					var newOperatingHoursArray = [];

					for (var j = 0; j < operatingHours.length; j++) {
						var op = operatingHours[j];

						if (op.openingHourString != undefined) {
							var openingHourSplit = op.openingHourString.split(':');
							var closingHourSplit = op.closingHourString.split(':');

							var openingHourInt   = parseInt(openingHourSplit[0]);
							var openingMinuteInt = parseInt(openingHourSplit[1]);

							var closingHourInt   = parseInt(closingHourSplit[0]);
							var closingMinuteInt = parseInt(closingHourSplit[1]);

							newOperatingHoursArray.push({
								dayOfTheWeek 	  : op.dayOfTheWeek,
								openingHourString : op.openingHourString,
								closingHourString : op.closingHourString,
								openingHour  	  : openingHourInt * 60 + openingMinuteInt,
								closingHour       : closingHourInt * 60 + closingMinuteInt
							});
						}
					}

					var adjustedOps = VenueServiceHelpers.adjustOperatingHours(newOperatingHoursArray);
					venue.operatingHours = adjustedOps;
					venue.save(function(err) {
						if (err) {
							console.log(err);
						}
					});
				}
			}
		});
	},
*/
	adjustOperatingHours : function(operatingHours) {
		var opsToAdd = [];
		for (var i = 0; i < operatingHours.length; i++) {
		    var openingHour = parseInt(operatingHours[i].openingHour);
		    var closingHour = parseInt(operatingHours[i].closingHour);
		    var day         = parseInt(operatingHours[i].dayOfTheWeek);

		    if (openingHour >= closingHour) {
		        // Find the following date and set closingExtra

		        var nextDay;
		        if (day == 7)
		        	nextDay = 1;
		        else
		        	nextDay = day + 1;

		        var nextDayExists = false;
		        for (var j = 0; j < operatingHours.length; j++) {
		            if (operatingHours[j].dayOfTheWeek == nextDay) {
		                operatingHours[j].closingExtra = closingHour;
		                operatingHours[i].closingHour  = 1440;
		                nextDayExists = true;
		                break;
		            }
		        }

		        if (!nextDayExists) {
		            opsToAdd.push({
		                closingExtra : closingHour,
		                dayOfTheWeek : nextDay
		            });
		        }
		    }
		}

		for (var i = 0; i < opsToAdd.length; i++) {
		    operatingHours.push(opsToAdd[i]);
		}

		return operatingHours;
	},

	prepareNewProduct : function(product) {
		var nameEn   = product.nameEn;
		var nameTr   = product.nameTr;
		var price    = product.price;
		var currency = product.currency;

		if (nameEn == undefined && nameTr == undefined) {
			console.log("Missing product parameters!");
			return;
		}

		var keywordArray = [];

		if (nameEn) {
			var nameEnLowerCase = nameEn.toLowerCase();
			var convertedName   = Util.convertAccentedCharacters(nameEnLowerCase);  // convert all turkish vs characters into english form (ex : ç -> c)
			var keywords        = convertedName.trim().split(/\s+/);                // trim and split by whitespace


			for (var i = 0; i < keywords.length; i++) {
				var newKeyword = {
					order    : i,
					keyword  : keywords[i],
					language : 'en'
				};
				keywordArray.push(newKeyword);
			}

			keywordArray.push({
				order    : 0,
				keyword  : convertedName,
				language : 'en'
			});
		}

		if (nameTr) {
			var nameTrLowerCase = nameTr.toLowerCase();
			var convertedName   = Util.convertAccentedCharacters(nameTrLowerCase);  // convert all turkish vs characters into english form (ex : ç -> c)
			var keywords        = convertedName.trim().split(/\s+/);                // trim and split by whitespace

			for (var i = 0; i < keywords.length; i++) {
				var newKeyword = {
					order    : i,
					keyword  : keywords[i],
					language : 'tr'
				};
				keywordArray.push(newKeyword);
			}

			keywordArray.push({
				order    : 0,
				keyword  : convertedName,
				language : 'tr'
			});
		}

		var newProduct = {
			keywords : keywordArray,
		};

		if(nameEn)
			newProduct.nameEn = nameEn;
		if(nameTr)
			newProduct.nameTr = nameTr;
		if (price)
			newProduct.price = price;
		if (currency)
			newProduct.currency = currency;

		return newProduct;
	},

	createVenueProducts : function(productsArray , venue) {
		for (var i = 0; i < productsArray.length; i++) {
			var product  = productsArray[i].product;
			var price    = productsArray[i].price;
			var currency = productsArray[i].currency;

			var newVenueProduct = new VenueProduct({
				venue    : venue._id,
				product  : product,
				location : venue.location
			});

			if (price != undefined)
				newVenueProduct.price = price;

			if (currency != undefined)
				newVenueProduct.currency = currency;

			newVenueProduct.save(function(err) {
				if (err) {
					console.log(err);
				}
			});
		}
	},

	addCategoryProductsToVenueProducts : function(venue) {
		CategoryProduct
		.find()
		.where('category').in(venue.categories)
		.exec(function(err , results) {
			if (err) {
				console.log(err);
			}
			else {
				if (results) {
					for (var i = 0; i < results.length; i++) {
						var productsToAdd = results[i].products;

						for (var j = 0; j < productsToAdd.length; j++) {
							var product = productsToAdd[j];

							var newVenueProduct = new VenueProduct({
								venue    : venue._id,
								product  : product,
								location : venue.location
							});

							newVenueProduct.save(function(err) {
								if (err)
									console.log(err);
							});
						}
					}
				}
			}
		});
	},

	createProductsForNewVenue : function(products , venue) {
		if (!products || products.length == 0)
			return;

		var productsArray     = [];  // this is the array that we will later use to create VenueProduct objects
		var productsWithoutId = {};  // this is the products without id.

		var nameEnArray = [];
		var nameTrArray = [];

		// Seperate products with id and without id
		// Seperate nameEn and nameTr into two array for existing product search
		for (var i = 0; i < products.length; i++) {
			var productId = products[i]._id;

			if (productId) {
				productsArray.push({
					product  : productId,
					price    : products[i].price,
					currency : products[i].currency
 				});
			}
			else {
				var p = VenueServiceHelpers.prepareNewProduct(products[i]);  // The product will be created later
				productsWithoutId[p.nameEn + p.nameTr] = p;  // This is the only way to quick access new product with a unique key. Its ugly but it works.

				if(p.nameEn)
					nameEnArray.push(p.nameEn);
				if(p.nameTr)
					nameTrArray.push(p.nameTr);
			}

		}

		nameEnArray.push(null);
		nameTrArray.push(null);

		if (Object.keys(productsWithoutId).length != 0) {
			// Check if there exists a product with the same names
			Product
			.find()
			.where('nameEn').in(nameEnArray)
			.where('nameTr').in(nameTrArray)
			.exec(function(err , results) {
				if(err) {
					callback(err);
				}
				else {
					if(results) {
						for(var i = 0 ; i < results.length ; i++) {
							var currentProduct = results[i];
							var key = currentProduct.nameEn + currentProduct.nameTr;

							if(productsWithoutId[key]) {
								productsArray.push({
									product  : currentProduct._id.toString(),
									price    : productsWithoutId[key].price,
									currency : productsWithoutId[key].currency
								});

								delete productsWithoutId[key];
							}
						}
					}

					var keys = Object.keys(productsWithoutId);
					var productsToCreate = [];

					for(var i = 0 ; i < keys.length ; i++) {
						var productToCreate = {};

						if (productsWithoutId[keys[i]].nameEn)
							productToCreate.nameEn = productsWithoutId[keys[i]].nameEn;

						if (productsWithoutId[keys[i]].nameTr)
							productToCreate.nameTr = productsWithoutId[keys[i]].nameTr;

						if (productsWithoutId[keys[i]].keywords)
							productToCreate.keywords = productsWithoutId[keys[i]].keywords;

						productsToCreate.push(productToCreate);
					}

					if(productsToCreate && productsToCreate.length != 0) {
						// Create the products...
						Product.collection.insert(productsToCreate , function(err , docs) {
							if(err) {
								console.log(err);
								console.log(docs);
							}
							else {

								for(var i = 0 ; i < docs.length ; i++) {
									var currentDoc = docs[i];
									var key        = currentDoc.nameEn + currentDoc.nameTr;
									var product    = productsWithoutId[key];

									productsArray.push({
										product  : currentDoc._id.toString(),
										price    : product.price,
										currency : product.currency
									});
								}

								VenueServiceHelpers.createVenueProducts(productsArray , venue);
							}
						});
					}
					else {
						VenueServiceHelpers.createVenueProducts(productsArray , venue);
					}
				}
			});
		}
		else {
			VenueServiceHelpers.createVenueProducts(productsArray , venue);
		}
	},

	createCategories : function(categories , callback) {
		var categoryIdArray    = [];
		var categoriesWithName = [];

		for (var i = 0; i < categories.length; i++) {
			var categoryId = categories[i]._id;

			if (categoryId)
				categoryIdArray.push(categoryId);
			else
				categoriesWithName.push(categories[i]);
		}

		if (categoriesWithName != undefined && categoriesWithName.length != 0) {
			var parallelArray   = [];
			var newCategoryArray = [];

			function createFunction(category) {
				return function(callback) {
					var orArray = [];
					var match   = {};

					if (category.nameEn != undefined) {
						orArray.push({
							'nameEn' : category.nameEn,
							'nameTr' : {$exists : false}
						});
					}

					if (category.nameTr != undefined) {
						orArray.push({
							'nameTr' : category.nameTr,
							'nameEn' : {$exists : false}
						});
					}

					if (category.nameTr != undefined && category.nameEn != undefined) {
						match.nameEn = category.nameEn;
						match.nameTr = category.nameTr;

						orArray = undefined;
					}

					var query = Category
								.findOne();

					if (orArray == undefined) {
						query = query.findOne(match);
					}
					else {
						query = query.or(orArray);
					}

					query
					.exec(function(err , result) {
						if (err) {
							callback(err);
						}

						else {
							if (result == undefined) {
								VenueServiceHelpers.createCategory(category , function(err , newCategory) {
									if (err) {
										callback(err);
									}
									else {
										newCategoryArray.push(newCategory._id);
										callback(null , newCategory);
									}
								});
							}
							else {
							 	newCategoryArray.push(result._id);
								callback(null , result);
							}
						}
					});
				}
			}

			// Find or create categories with given names
			for (var i = 0; i < categoriesWithName.length; i++) {
				parallelArray.push(createFunction(categoriesWithName[i]));
			}

			async.parallel(parallelArray , function(err , results) {
				if (err) {
					callback(err);
				}
				else {
					for (var i = 0; i < newCategoryArray.length; i++) {
						var newCategory = newCategoryArray[i];

						var exists = false;
						for (var j = 0; j < categoryIdArray.length; j++) {
							if(categoryIdArray[j].toString() == newCategory.toString()) {
								exists = true;
								break;
							}
						}

						if (!exists)
							categoryIdArray.push(newCategory);
					}

					callback(null , categoryIdArray);
				}
			});
		}
		else {
			callback(null , categoryIdArray);
		}
	},

	reverseGeocode : function(lat , lng , callback) {
		geocoder.reverse(lat, lng, callback);
	}

};


var VenueService = {
/*
	fix : function() {
		VenueServiceHelpers.fix();
	},
*/
	createCategory : function(req , res) {
		var nameEn = req.body.nameEn;
		var nameTr = req.body.nameTr;

		if (nameEn == undefined && nameTr == undefined) {
			res.send(400);
			return;
		}

		var orArray = [];
		var match   = {};

		if (nameEn != undefined) {
			orArray.push({
				'nameEn' : nameEn,
				'nameTr' : {$exists : false}
			});
		}

		if (nameTr != undefined) {
			orArray.push({
				'nameTr' : nameTr,
				'nameEn' : {$exists : false}
			});
		}

		if (nameTr != undefined && nameEn != undefined) {
			match.nameEn = nameEn;
			match.nameTr = nameTr;

			orArray = undefined;
		}

		var query = Category
					.findOne();

		if (orArray == undefined) {
			query = query.findOne(match);
		}
		else {
			query = query.or(orArray);
		}

		query.exec(function(err , existingCategory) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else if(existingCategory) {
				res.send(400 , {message : 'Category Exists!'});
			}
			else {
				VenueServiceHelpers.createCategory(req.body , function(err , newCategory) {
					if (err) {
						console.log(err);
						res.send(400);
					}
					else {
						res.send(newCategory);
					}
				});
			}
		});
	},

	createSupplyChain : function(req , res) {
		VenueServiceHelpers.createSupplyChain(req.body , function(err , supplyChain) {
			if (err) {
				res.send(400);
			}
			else {
				res.send(supplyChain);
			}
		});
	},

	createVenue : function(req , res) {
		var name  	     	  = req.body.name;
		var foursquareId 	  = req.body.foursquareId;
		var website			  = req.body.website;
		var email 		 	  = req.body.email;
		var phoneNumber  	  = req.body.phoneNumber;
		var mobilePhoneNumber = req.body.mobilePhoneNumber;
		var address      	  = req.body.address;
		var city		 	  = req.body.city;
		var country      	  = req.body.country;
		var operatingHours    = req.body.operatingHours;
		var latitude     	  = req.body.latitude;
		var longitude    	  = req.body.longitude;
		var categories   	  = req.body.categories;
		var supplyChains      = req.body.selectedSupplyChainList;
		var products          = req.body.products;
		var ownerInfo         = req.body.ownerInfo;
		var media			  = req.body.media;
		var code              = req.body.code;

		var user = req.user;

		if (name == undefined || latitude == undefined || longitude == undefined || categories == undefined) {
			res.send(400);
			return;
		}

		if(phoneNumber == undefined && mobilePhoneNumber == undefined) {
			res.send(400);
			return;
		}

		if(operatingHours == undefined) {
			res.send(400);
			return;
		}

		var nameLowerCase = name.toLowerCase();
		var convertedName = Util.convertAccentedCharacters(nameLowerCase);  // convert all turkish vs characters into english form (ex : ç -> c)
		var keywords      = convertedName.trim().split(/\s+/);              // trim and split by whitespace

		var keywordArray = [];
		for (var i = 0; i < keywords.length; i++) {
			var newKeyword = {
				order   : i,
				keyword : keywords[i]
			};
			keywordArray.push(newKeyword);
		}

		keywordArray.push({
			order   : 0,
			keyword : convertedName
		});

		var newVenue = new Venue({
			name 		 	  : name,
			foursquareId 	  : foursquareId,
			location     	  : [longitude , latitude],
			website      	  : website,
			email		 	  : email,
			phoneNumber  	  : phoneNumber,
			mobilePhoneNumber : mobilePhoneNumber,
			address      	  : address,
			city 		 	  : city,
			country		 	  : country,
			supplyChains 	  : supplyChains,
			keywords    	  : keywordArray,
			media 			  : media,
			operatingHours    : VenueServiceHelpers.adjustOperatingHours(operatingHours),
			creator 		  : user._id
		});

		if (user.userType == User.USER_TYPE_NORMAL) {
			newVenue.status = Venue.STATUS_WAITING_APPROVAL;
		}
		else {
			newVenue.status = Venue.STATUS_APPROVED;
		}

		// Set venue owner info
		if (ownerInfo != undefined) {
			ownerInfo.owner    = user._id;
			//ownerInfo.status   = Venue.OWNER_STATUS_PENDING;
			//newVenue.ownerInfo = ownerInfo;
			newVenue.ownerStatus   = Venue.OWNER_STATUS_PENDING;
			newVenue.claimRequests = [ownerInfo];
		}

		VenueServiceHelpers.createCategories(categories , function(err , createdCategories) {
			newVenue.categories = createdCategories;

			if (address == undefined || address.length == 0) {
				VenueServiceHelpers.reverseGeocode(latitude , longitude , function(err , data) {
					var adressData = data[0];
					var address    = '';

					if (adressData.streetName)
						address += adressData.streetName + ' ';

					if (adressData.streetNumber)
						address += adressData.streetNumber + ' ';

					if (adressData.zipcode)
						address += adressData.zipcode + ' ';

					if (adressData.city)
						address += adressData.city + ' ';

					if (adressData.country)
						address += adressData.country;

					console.log(address);

					newVenue.address = address;
					newVenue.save(function(err) {
						if (err) {
							console.log(err);
							res.send(400);
						}
						else {
							var temp = newVenue.toObject();
							temp.code = code;
							res.send(temp);

							//res.send(newVenue);
							VenueServiceHelpers.createProductsForNewVenue(products , newVenue);
							VenueServiceHelpers.addCategoryProductsToVenueProducts(newVenue);
						}
					});
				});
			}
			else {
				newVenue.save(function(err) {
					if (err) {
						console.log(err);
						res.send(400);
					}
					else {
						var temp = newVenue.toObject();
						temp.code = code;
						res.send(temp);

						//res.send(newVenue);
						VenueServiceHelpers.createProductsForNewVenue(products , newVenue);
						VenueServiceHelpers.addCategoryProductsToVenueProducts(newVenue);
					}
				});
			}
		});
	},

	/*
	createCategoryProduct : function(req , res) {
		var categoryNameEn = req.body.categoryNameEn;
		var categoryNameTr = req.body.categoryNameTr;
		var products       = req.body.products;

		if ((categoryNameEn == undefined && categoryNameTr == undefined) || products == undefined) {
			res.send(400);
			return;
		}

		// Create or update categoryProduct
		function createOrUpdateCategoryProduct(category , products) {
			CategoryProduct
			.findOne()
			.where('category').equals(category._id)
			.exec(function(err , result) {
				if (err) {
					console.log(err);
					res.send(400);
				}
				else {
					// Save new CategoryProduct
					if (result == undefined) {
						var newCategoryProduct = new CategoryProduct({
							category : category,
							products : products
						});

						newCategoryProduct.save(function(err) {
							if (err) {
								console.log(err);
								res.send(400);
							}
							else {
								res.send(200);
							}
						});
					}
					// Update existing CategoryProduct
					else {
						result.products = products;
						result.save(function(err) {
							if (err) {
								console.log(err);
								res.send(400);
							}
							else {
								res.send(200);		
							}
						});
					}
				}
			});
		}

		// Find or create the products
		function findOrCreateProducts(category , products) {
			var parallelArray = [];

			for (var i = 0; i < products.length; i++) {

				
				function createFunction(product) {
					return function(callback) {
						var nameEn = product.nameEn;
						var nameTr = product.nameTr;

						// Search for an existing product with the same name, create a new one if it doesnt exists
						Product
						.findOne()
						.where('nameEn').equals(nameEn)
						.where('nameTr').equals(nameTr)
						.exec(function(err , existingProduct) {
							if (err) {
								callback(err);
							}
							else {
								if (existingProduct != undefined) {
									callback(null , existingProduct);
								}
								else {
									var newProduct = new Product(VenueServiceHelpers.prepareNewProduct(product));
									newProduct.save(function(err) {
										if (err) {
											callback(err);
										}
										else {
											callback(null , newProduct);
										}
									});
								}
							}
						});
					};
				}

				parallelArray.push(createFunction(products[i]));
			}

			async.parallel(parallelArray , function(err , results) {
				if (err) {
					console.log(err);
					res.send(400);
				}
				else {
					createOrUpdateCategoryProduct(category , results);
				}
			});
		}

		// Find or create given category
		Category
		.findOne()
		.where('nameEn').equals(categoryNameEn)
		.where('nameTr').equals(categoryNameTr)
		.exec(function(err , category) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				if (category != undefined) {
					findOrCreateProducts(category , products);
				}
				else {
					VenueServiceHelpers.createCategory({
						nameEn : categoryNameEn,
						nameTr : categoryNameTr
					} , 
					function(err , result) {
						findOrCreateProducts(result , products);
					});
				}
			}	
		});
	},
	*/

	createCategoryProduct : function(req , res) {
		var categoryId = req.body.categoryId;
		var products   = req.body.products;

		if (categoryId == undefined || products == undefined) {
			res.send(400);
			return;
		}

		var cp = new CategoryProduct({
			category : categoryId,
			products : products
		});

		cp.save(function(err) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(200);
			}
		});
	},

	updateCategoryProduct : function(req , res) {
		var categoryId = req.body.categoryId;
		var products   = req.body.products;

		if (categoryId == undefined || products == undefined) {
			res.send(400);
			return;
		}

		CategoryProduct
		.findOne({category : categoryId})
		.exec(function(err , cp) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else if(!cp) {
				res.send(400 , {message : 'CategoryProduct doesnt exists!'});
			}
			else {
				cp.products = products;
				cp.save(function(err) {
					if (err) {
						console.log(err);
						res.send(400);
					}
					else {
						res.send(200);
					}
				});
			}
		});
	},

	getCategoryProducts : function(req , res) {
		var categoryId = req.body.categoryId;

		if (categoryId == undefined) {
			res.send(400);
			return;
		}

		CategoryProduct
		.findOne({category : categoryId})
		.populate('products')
		.exec(function(err , result) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else if(!result) {
				res.send(new Array());
			}
			else {
				res.send(result.products);
			}
		});
	},

	listCategoryProductsWithPage : function(req , res) {
		var page = req.body.page;

		if (page == undefined)
			page = 1;

		CategoryProduct
		.find()
		.select('-products')
		.populate('category')
		.paginate({page : page , perPage : 25} , function(err , results) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(results);
			}
		});
	},

	getCategoryProductPageCount : function(req , res) {
		CategoryProduct
		.count()
		.exec(function(err , count) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				var p = count / 25;

				if(count % 25 > 0) {
					p += 1;
				}

				p = Math.floor(p);

				var pageCount = {
					count : p
				};

				res.send(pageCount);
			}
		});
	},

	deleteVenue : function(req , res) {
		var venueId = req.body.venueId;

		if (venueId == undefined) {
			res.send(400);
			return;
		}

		res.send(200);

		Venue
		.remove({_id : venueId})
		.exec(function(err) {
			if (err) {
				console.log(err);
			}
		});

		User
		.find()
		.where('bookmarks').in([venueId])
		.exec(function(err , users) {
			if (err) {
				console.log(err);
			}
			else {
				for (var i = 0; i < users.length; i++) {
					var user      = users[i];
					var bookmarks = user.bookmarks;
					var index     = -1;

					for (var j = 0; j < bookmarks.length; j++) {
						if(bookmarks[j] == venueId) {
							index = j;
							break;
						}
					}

					bookmarks.splice(index , 1);

					user.bookmarks = bookmarks;
					user.save(function(err) {
						if (err) {
							console.log(err);
						}
					});
				}
			}
		});

		VenueProduct
		.remove({venue : venueId})
		.exec(function(err) {
			if (err) {
				console.log(err);
			}
		});

		VenueProductUser
		.remove({venue : venueId})
		.exec(function(err) {
			if (err) {
				console.log(err);
			}
		});
	},

	editCategory : function(req , res) {
		var categoryId = req.body.categoryId;
		var nameEn     = req.body.nameEn;
		var nameTr     = req.body.nameTr;

		if (categoryId == undefined) {
			res.send(400);
			return;
		}

		var preparedCategory = VenueServiceHelpers.prepareNewCategory({nameTr : nameTr , nameEn : nameEn});

		Category
		.findOne({_id : categoryId})
		.exec(function(err , category) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				category.nameEn = nameEn;
				category.nameTr = nameTr;
				category.keywords = preparedCategory.keywords;

				category.save(function(err) {
					if (err) {
						console.log(err);
						res.send(400);
					}
					else {
						res.send(category);
					}
				});
			}
		});
	},

	listCategoriesWithPage : function(req , res) {
		var page = req.body.page;

		if (page == undefined) 
			page = 1;

		Category
		.find()
		.select('-keywords')
		.paginate({page : page , perPage : 25} , function(err , results) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(results);
			}
		});
	},

	getCategoryPageCount : function(req , res) {
		Category
		.count()
		.exec(function(err , count) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				var p = count / 25;

				if(count % 25 > 0) {
					p += 1;
				}

				p = Math.floor(p);

				var pageCount = {
					count : p
				};

				res.send(pageCount);
			}
		});
	},

	getCategory : function(req , res) {
		var categoryId = req.body.categoryId;

		if (categoryId == undefined) {
			res.send(400);
			return;
		}

		Category
		.findOne({_id : categoryId})
		.select('-keywords')
		.lean()
		.exec(function(err , category) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {

				CategoryProduct
				.findOne({category : categoryId})
				.exec(function(err , result) {
					if (err) {
						console.log(err);
						res.send(400);
					}
					else if(result) {
						category.categoryProductExists = true;
						res.send(category);
					}
					else {
						category.categoryProductExists = false;
						res.send(category);
					}
				});

			}
		});
	},

	updateVenue : function(req , res) {
		var venue   = req.body;
		var venueId = venue._id;

		if (venueId == undefined) {
			res.send(400);
			return;
		}

		Venue
		.findOne({_id : venueId})
		.exec(function(err , existingVenue) {
			if (err || !existingVenue) {
				console.log(err);
				res.send(400);
			}
			else {
				existingVenue.name = venue.name;

				var nameLowerCase = venue.name.toLowerCase();
				var convertedName = Util.convertAccentedCharacters(nameLowerCase);  // convert all turkish vs characters into english form (ex : ç -> c)
				var keywords      = convertedName.trim().split(/\s+/);              // trim and split by whitespace

				var keywordArray = [];
				for (var i = 0; i < keywords.length; i++) {
					var newKeyword = {
						order   : i,
						keyword : keywords[i]
					};
					keywordArray.push(newKeyword);
				}

				keywordArray.push({
					order   : 0,
					keyword : convertedName
				});

				existingVenue.keywords          = keywordArray;
				existingVenue.website 			= venue.website;
				existingVenue.email   			= venue.email;
				existingVenue.phoneNumber 		= venue.phoneNumber;
				existingVenue.mobilePhoneNumber = venue.mobilePhoneNumber;
				existingVenue.address 			= venue.address;
				existingVenue.operatingHours    = VenueServiceHelpers.adjustOperatingHours(venue.operatingHours);
				existingVenue.supplyChains      = venue.supplyChains;
				existingVenue.ownerInfo         = venue.ownerInfo;

				try {
					existingVenue.ownerInfo.owner = venue.ownerInfo.owner._id;
				}
				catch(exception) {
					console.log(exception);
				}

				var categories = venue.categories;

				VenueServiceHelpers.createCategories(categories , function(err , createdCategories) {
					if (err) {
						console.log(err);
						res.send(400);
					}
					else {
						existingVenue.categories = createdCategories;
						existingVenue.save(function(err) {
							if (err) {
								console.log(err);
								res.send(400);
							}
							else {
								res.send(200);

								VenueServiceHelpers.addCategoryProductsToVenueProducts(existingVenue);
							}
						});
					}
				});
			}
		});
	},

	updateVenueLocation : function(req , res) {
		var venueId   = req.body.venueId;
		var latitude  = req.body.latitude;
		var longitude = req.body.longitude;

		if (venueId == undefined || latitude == undefined || longitude == undefined) {
			res.send(400);
			return;
		}

		Venue
		.findOne({_id : venueId})
		.exec(function(err , venue) {
			if (err || !venue) {
				console.log(err);
				res.send(400);
			}
			else {
				VenueServiceHelpers.reverseGeocode(latitude , longitude , function(err , data) {
					var adressData = data[0];
					var address    = '';

					if (adressData.streetName)
						address += adressData.streetName + ' ';

					if (adressData.streetNumber)
						address += adressData.streetNumber + ' ';

					if (adressData.zipcode)
						address += adressData.zipcode + ' ';

					if (adressData.city)
						address += adressData.city + ' ';

					if (adressData.country)
						address += adressData.country;

					console.log(address);

					venue.location = [longitude , latitude];
					venue.address  = address;
					venue.save(function(err) {
						if (err) {
							console.log(err);
							res.send(400);
						}
						else {
							res.send(200);

							VenueProduct
							.find({venue : venueId})
							.exec(function(err , results) {
								if (err || !results) {
									console.log(err);
								}
								else {
									for (var i = 0; i < results.length; i++) {
										results[i].location = [longitude , latitude];
										results[i].save(function(err) {
											if (err) {
												console.log(err);
											}
										});
									};
								}
							});
						}
					});
				});
			}
		});
	},

	updateVenueProducts : function(req , res) {
		var venueId    		 = req.body.venueId;
		var productsToRemove = req.body.productsToRemove;
		var productsToAdd    = req.body.productsToAdd;

		if (venueId == undefined || (productsToRemove == undefined && productsToAdd == undefined)) {
			res.send(400);
			return;
		}

		async.parallel({

			remove : function(callback) {
				if (productsToRemove != undefined) {
					VenueProduct
					.remove()
					.where('product').in(productsToRemove)
					.exec(callback);
				}
				else
					callback(null);
			},

			add : function(callback) {
				if (productsToAdd != undefined) {
					Venue
					.findOne({_id : venueId})
					.exec(function(err , result) {
						if (err || !result) {
							callback(err);
						}
						else {
							VenueServiceHelpers.createProductsForNewVenue(productsToAdd , result);
							callback(null);
						}
					});
				}
				else
					callback(null);
			}

		} , function(err , results) {
			if (err)
				res.send(400);
			else
				res.send(200);
		});
	},

	updateVenueMedia : function(req , res) {
		var venueId = req.body.venueId;
		var media   = req.body.media;

		if (venueId == undefined || media == undefined) {
			res.send(400);
			return;
		}

		Venue
		.findOne({_id : venueId})
		.select('media')
		.exec(function(err , result) {
			if (err || !result) {
				console.log(err);
				res.send(400);
			}
			else {
				result.media = media;
				result.save(function(err) {
					if (err)
						res.send(400);
					else
						res.send(200);
				});
			}
		});
	},

	changeVenueStatus : function(req , res) {
		var venueId = req.body.venueId;
		var status  = req.body.status;

		if(venueId == undefined || status == undefined) {
			res.send(400);
			return;
		}

		Venue
		.findOne({_id : venueId})
		.exec(function(err , venue) {
			if (err || !venue) {
				console.log(err);
				res.send(400);
			}
			else {
				venue.status = status;
				venue.save(function(err) {
					if (err) {
						console.log(err);
						res.send(400);
					}
					else {
						res.send(200);
					}
				});
			}
		});
	},

	getNearVenues : function(req , res) {
		var latitude  = req.body.latitude;
		var longitude = req.body.longitude;
		var maxId     = req.body.maxId;

		if (latitude == undefined || longitude == undefined) {
			res.send(400);
			return;
		}

		var query = Venue
					.find({location : {
						$nearSphere : {
							$geometry : {
								type 		: 'Point',
								coordinates : [longitude , latitude]
							},
							$maxDistance : 15000
						}
					}})
					.where('status').equals(Venue.STATUS_APPROVED);

		if (maxId) {
			query = query.where('_id').lt(maxId);
		}

		query.populate('categories');
		query.populate('creator' , '-password');
		query.populate('ownerInfo.owner' , '-password');
		query.limit(30);
		query.exec(function(err , results) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(results);
			}
		});
	},

	listVenues : function(req , res) {
		var maxName = req.body.maxName;
		var status  = req.body.status;

		var query = Venue
					.find()
					.sort('keywords.0.keyword')
					.limit(25)
					.populate('categories')
					.populate('ownerInfo.owner' , '-password')
					.populate('creator' , '-password');

		if (maxName)
			query = query.where('keywords.0.keyword').gt(maxName);

		if (status)
			query = query.where('status').equals(status);
		else
			query = query.where('status').equals(Venue.STATUS_APPROVED);

		query.exec(function(err , results) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(results);
			}
		});
	},

	listVenuesWithPage : function(req , res) {
		var page        = req.body.page;
		var status      = req.body.status;
		var userId      = req.body.userId;
		var minDate     = req.body.minDate;
		var maxDate     = req.body.maxDate;
		var sortType    = req.body.sortType;
		var ownerStatus = req.body.ownerStatus;

		var queryCallback = function(err , results) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(results);
			}
		}

		var query = Venue
					.find()
					.limit(25)
					.populate('categories')
					//.populate('ownerInfo.owner' , '-password')
					//.populate('claimRequests.owner' , '-password')
					.populate('creator' , '-password');

		if (sortType == undefined)
			sortType = 0;

		if (sortType == 0) {
			query = query.sort('keywords.0.keyword');
		}
		else if(sortType == 1) {
			query = query.sort('-keywords.0.keyword');
		}
		else if(sortType == 2) {
			query = query.sort('creationDate');
		}
		else if(sortType == 3) {
			query = query.sort('-creationDate');
		}

		if (status)
			query = query.where('status').equals(status);
		else {
			if (!ownerStatus)
				query = query.where('status').equals(Venue.STATUS_APPROVED);
		}

		if (userId) 
			query = query.find({creator : userId});

		if (minDate) 
			query = query.where('creationDate').gt(minDate);

		if (maxDate) 
			query = query.where('creationDate').lt(maxDate);

		if (ownerStatus)
			query = query.where('ownerStatus').equals(ownerStatus);

		if (page)
			query = query.paginate({page : page , perPage : 25} , queryCallback);
		else
			query = query.paginate({page : 1    , perPage : 25} , queryCallback);
	},

	getVenuePageCount : function(req , res) {
		var status      = req.body.status;
		var ownerStatus = req.body.status;

		var query = Venue.count();

		if (status)
			query = query.where('status').equals(status);
		else
			query = query.where('status').equals(Venue.STATUS_APPROVED);

		if (ownerStatus)
			query = query.where('ownerStatus').equals(ownerStatus);

		query.exec(function(err , count) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				var p = count / 25;

				if(count % 25 > 0) {
					p += 1;
				}

				p = Math.floor(p);

				var pageCount = {
					count : p
				};

				res.send(pageCount);
			}
		});
	},

	getVenueDetails : function(req , res) {
		var venueId = req.body.venueId;

		if (venueId == undefined) {
			res.send(400);
			return;
		}

		Venue
		.findOne({_id : venueId})
		.populate('categories')
		.populate('creator' , '-password')
		.populate('ownerInfo.owner' , '-password')
		.populate('claimRequests.owner' , '-password')
		.populate('supplyChains')
		.exec(function(err , result) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(result);
			}
		});
	},

	getSupplyChainList : function(req , res) {
		SupplyChain
		.find()
		.exec(function(err , results) {
			if (err) {
				res.send(400);
			}
			else {
				res.send(results);
			}
		});
	},

	getProducts : function(req , res) {
		var venueId = req.body.venueId;

		if (venueId == undefined) {
			res.send(400);
			return;
		}

		VenueProduct
		.find({venue : venueId})
		.populate('product')
		.exec(function(err , results) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(results);
			}
		});
	},

	calculateVenueRating : function(venueId , isNewRating) {
		Venue
		.findOne({_id : venueId})
		.exec(function(err , venue) {
			if (err) {
				console.log(err);
				return;
			}

			VenueProduct
			.find({venue : venueId})
			.exec(function(err , venueProducts) {
				if (err) {
					console.log(err);
				}
				else {
					var totalProductRating = 0;
					var votedProductCount  = 0;

					for (var i = 0; i < venueProducts.length; i++) {
						if (venueProducts[i].rating != 0) {
							totalProductRating += venueProducts[i].rating;
							votedProductCount++;
						}
					}

					if (isNewRating) {
						var ratingCount = venue.ratingCount;
						if (ratingCount == undefined)
							ratingCount = 1;
						else
							ratingCount += 1;

						venue.ratingCount = ratingCount;
					}

					var newVenueRating = totalProductRating / votedProductCount;
					venue.rating = newVenueRating;

					venue.save(function(err) {
						if (err)
							console.log(err);
					});
				}
			});
		});
	},

	claimVenue : function(req , res) {
		var venueId   = req.body.venueId;
		var ownerInfo = req.body.ownerInfo;
		var user      = req.user;

		if (venueId == undefined || ownerInfo == undefined) {
			res.send(400);
			return;
		}

		Venue
		.findOne({_id : venueId})
		.exec(function(err , venue) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else if(!venue) {
				console.log("Change Venue Owner Status No Venue!");
				res.send(400);
			}
			else {
				var claimRequests = venue.claimRequests;
				ownerInfo.owner   = user._id;

				if (claimRequests == null || claimRequests.length == 0) {
					claimRequests = [ownerInfo];
				}
				else {
					claimRequests.push(ownerInfo);
				}

				venue.claimRequests = claimRequests;
				venue.ownerStatus   = Venue.OWNER_STATUS_PENDING;
				venue.save(function(err) {
					if (err) {
						console.log(err);
						res.send(400);
					}
					else {
						res.send(200);
					}
				});
			}
		});
	},

	approveVenueOwner : function(req , res) {
		var venueId   = req.body.venueId;
		var ownerInfo = req.body.ownerInfo;

		if (venueId == undefined || ownerInfo == undefined) {
			res.send(400);
			return;
		}

		Venue
		.findOne({_id : venueId})
		.exec(function(err , venue) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else if(!venue) {
				console.log("Change Venue Owner Status No Venue!");
				res.send(400);
			}
			else {
				venue.ownerStatus   = Venue.OWNER_STATUS_APPROVED;
				venue.claimRequests = [];

				ownerInfo.owner     = ownerInfo.owner._id;
				venue.ownerInfo     = ownerInfo;
				venue.save(function(err) {
					if (err) {
						console.log(err);
						res.send(400);
					}
					else {
						res.send(200);
					}
				});
			}
		});
	},

	declineVenueOwner : function(req , res) {
		var venueId   = req.body.venueId;
		var ownerInfo = req.body.ownerInfo;

		if (venueId == undefined || ownerInfo == undefined) {
			res.send(400);
			return;
		}

		Venue
		.findOne({_id : venueId})
		.exec(function(err , venue) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else if(!venue) {
				console.log("Change Venue Owner Status No Venue!");

				res.send(400);
			}
			else {
				var claimRequests = venue.claimRequests;
				var index = -1;

				for (var i = 0; i < claimRequests.length; i++) {
					if(claimRequests[i]._id.toString() == ownerInfo._id.toString()) {
						index = i;
						break;
					}
				}

				if (index != -1)
					claimRequests.splice(index , 1);

				if (claimRequests.length == 0)
					venue.ownerStatus = Venue.OWNER_STATUS_NO_REQUEST;

				venue.claimRequests = claimRequests;
				venue.save(function(err) {
					if (err) {
						console.log(err);
						res.send(400);
					}
					else {
						res.send(200);
					}
				});
			}
		});
	}

};

VenueService.VenueServiceHelpers = VenueServiceHelpers;

module.exports = VenueService;
