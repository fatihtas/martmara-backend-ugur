var Venue    = require('../models/Venue');
var Product  = require('../models/Product');
var VenueProduct = require('../models/VenueProduct');
var Category = require('../models/Category');
var Util     = require('../util/Util');
var appkeys 		  = require('../config/appkeys');//getting keys

var async   = require('async');
var request = require('request');

var SORT_TYPE_DISTANCE   = 1;
var SORT_TYPE_RATING     = 2;

var FILTER_TYPE_OPEN     = 1;
var FILTER_TYPE_CLOSED   = 2;
var FILTER_TYPE_RATING   = 3;
var FILTER_TYPE_DISTANCE = 4;

var FOURSQUARE_CLIENT_ID = appkeys.FOURSQUARE_CLIENT_ID;
var FOURSQUARE_CLIENT_SECRET = appkeys.FOURSQUARE_CLIENT_SECRET;

function compareAutoCompleteResults(a,b) {
  if (a.name < b.name)
     return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}

var SearchServiceHelpers = {

	addFilters : function(query , filters , res) {
		for (var i = 0; i < filters.length; i++) {
			var filter     = filters[i];
			var filterType = filters[i].filterType;

			if(filterType == undefined) {
				res.send(400);
				return;
			}

			// Open filter
			if (filterType == FILTER_TYPE_OPEN) {

				var filterTime 		   = filter.filterTime;
				var filterDayOfTheWeek = filter.filterDayOfTheWeek;

				if (filterTime == undefined || filterDayOfTheWeek == undefined) {
					console.log("Missing filter parameters");
					res.send(400);
					return;
				}

				query = query
					    .find({
							'operatingHours' : {
								$elemMatch : {
									$or : [
										{
											'dayOfTheWeek' : filterDayOfTheWeek,
											'openingHour'  : {$lte : filterTime},
											'closingHour'  : {$gte : filterTime}
										},
										{
											'dayOfTheWeek' : filterDayOfTheWeek,
											'closingExtra' : {$gte : filterTime}
										}
									]
								}
							}
						});
			}
			// Closed filter
			else if (filterType == FILTER_TYPE_CLOSED) {

				var filterTime 		   = filter.filterTime;
				var filterDayOfTheWeek = filter.filterDayOfTheWeek;

				if (filterTime == undefined || filterDayOfTheWeek == undefined) {
					console.log("Missing filter parameters");
					res.send(400);
					return;
				}

				query = query
					.find({
						'operatingHours' : {
							$elemMatch : {
								$or : [
									{
										'dayOfTheWeek' : {$ne : filterDayOfTheWeek}
									},
									{
										'dayOfTheWeek' : filterDayOfTheWeek,
										'openingHour'  : {$gte : filterTime},
										'closingExtra' : {$lte : filterTime}
									},
									{
										'dayOfTheWeek' : filterDayOfTheWeek,
										'closingHour'  : {$lte : filterTime},
										'closingExtra' : {$lte : filterTime}
									}
								]
							}
						}
					});
			}
			// Rating filter
			else if (filterType == FILTER_TYPE_RATING) {

				var filterRating = filter.filterRating;

				if (filterRating == undefined) {
					console.log("Missing filter parameters");
					res.send(400);
					return;
				}

				if (filterRating != 0) {
					query = query.where('rating').gte(filterRating);
				}
			}
		};
	},

	autoCompleteProduct : function(prefix , limit , callback) {
		prefix = prefix.toLowerCase();
		prefix = Util.convertAccentedCharacters(prefix);

		async.parallel({

			// Find products that has the prefix on its first word(keyword)
			firstKeywordResults : function(callback) {
				Product
				.find({
					'keywords' : {
						$elemMatch : {
							'keyword' : new RegExp('^' + prefix + '\w*') ,
							'order' : 0
						}
					}
				} , { 'keywords.$' : 1 })
				.select('nameEn nameTr')
				.limit(limit)
				.lean()
				.exec(function(err , results) {
					callback(err , results);
				});
			},

			// Find products that has the prefix on its second or greater word(keyword)
			otherKeywordResults : function(callback) {
				Product
				.find({
					'keywords' : {
						$elemMatch : {
							'keyword' : new RegExp('^' + prefix + '\w*') ,
							'order' : {$gte : 1}
						}
					}
				} , { 'keywords.$' : 1})
				.select('nameEn nameTr')
				.limit(limit)
				.lean()
				.exec(function(err , results) {
					callback(err , results);
				});
			}

		}, function(err , results) {
			if (err) {
				callback(err , null);
				return;
			}

			var firstKeywordResults = results.firstKeywordResults;
			var otherKeywordResults = results.otherKeywordResults;

			// Put name field into firstKeywordResults
			for(var i = 0 ; i < firstKeywordResults.length ; i++) {
				var product = firstKeywordResults[i];

				if(product.keywords[0].language == 'en')
					product.name = product.nameEn;
				else
					product.name = product.nameTr;

				delete product.keywords;
			}

			// Put name field into otherKeywordResults
			for(var i = 0 ; i < otherKeywordResults.length ; i++) {
				var product = otherKeywordResults[i];

				if(product.keywords[0].language == 'en')
					product.name = product.nameEn;
				else
					product.name = product.nameTr;

				delete product.keywords;
			}

			firstKeywordResults.sort(compareAutoCompleteResults);
			otherKeywordResults.sort(compareAutoCompleteResults);

			// Combine the results while keeping the firstKeyword results on top of the list
			for (var i = 0; i < otherKeywordResults.length; i++) {

				// Traverse firstKeywordResults to see if the current item is already in the list
				var alreadyInTheList = false;
				for (var j = 0; j < firstKeywordResults.length; j++) {
					if(firstKeywordResults[j]._id.toString() == otherKeywordResults[i]._id.toString()) {
						alreadyInTheList = true;
						break;
					}
				}

				if (!alreadyInTheList)
					firstKeywordResults.push(otherKeywordResults[i]);
			}

			callback(null , firstKeywordResults);
		});
	},

	autoCompleteVenue : function(prefix , callback) {
		prefix = prefix.toLowerCase();
		prefix = Util.convertAccentedCharacters(prefix);

		async.parallel({

			// Find products that has the prefix on its first word(keyword)
			firstKeywordResults : function(callback) {
				Venue
				.find({'keywords.keyword' : new RegExp('^' + prefix + '\w*')})
				.where('keywords.order').equals(0)
				//.where('status').equals(Venue.STATUS_APPROVED)
				.exec(function(err , results) {
					callback(err , results);
				});
			},

			// Find products that has the prefix on its second or greater word(keyword)
			otherKeywordResults : function(callback) {
				Venue
				.find({'keywords.keyword' : new RegExp('^' + prefix + '\w*')})
				.where('keywords.order').gte(1)
				//.where('status').equals(Venue.STATUS_APPROVED)
				.exec(function(err , results) {
					callback(err , results);
				});
			}

		}, function(err , results) {
			if (err) {
				callback(err , null);
				return;
			}

			var firstKeywordResults = results.firstKeywordResults;
			var otherKeywordResults = results.otherKeywordResults;

			// Combine the results while keeping the firstKeyword results on top of the list
			for (var i = 0; i < otherKeywordResults.length; i++) {

				// Traverse firstKeywordResults to see if the current item is already in the list
				var alreadyInTheList = false;
				for (var j = 0; j < firstKeywordResults.length; j++) {
					if(firstKeywordResults[j]._id.toString() == otherKeywordResults[i]._id.toString()) {
						alreadyInTheList = true;
						break;
					}
				}

				if (!alreadyInTheList)
					firstKeywordResults.push(otherKeywordResults[i]);
			}

			callback(null , firstKeywordResults);
		});
	},

	autoCompleteCategory : function(prefix , callback) {
		prefix = prefix.toLowerCase();
		prefix = Util.convertAccentedCharacters(prefix);

		async.parallel({

			// Find products that has the prefix on its first word(keyword)
			firstKeywordResults : function(callback) {
				Category
				.find({
					'keywords' : {
						$elemMatch : {
							'keyword' : new RegExp('^' + prefix + '\w*') ,
							'order' : 0
						}
					}
				} , { 'keywords.$' : 1 })
				.select('nameEn nameTr')
				.lean()
				.exec(function(err , results) {
					callback(err , results);
				});
			},

			// Find products that has the prefix on its second or greater word(keyword)
			otherKeywordResults : function(callback) {
				Category
				.find({
					'keywords' : {
						$elemMatch : {
							'keyword' : new RegExp('^' + prefix + '\w*') ,
							'order' : {$gte : 1}
						}
					}
				} , { 'keywords.$' : 1})
				.select('nameEn nameTr')
				.lean()
				.exec(function(err , results) {
					callback(err , results);
				});
			}

		}, function(err , results) {
			if (err) {
				callback(err , null);
				return;
			}

			var firstKeywordResults = results.firstKeywordResults;
			var otherKeywordResults = results.otherKeywordResults;

			// Combine the results while keeping the firstKeyword results on top of the list
			for (var i = 0; i < otherKeywordResults.length; i++) {

				// Traverse firstKeywordResults to see if the current item is already in the list
				var alreadyInTheList = false;
				for (var j = 0; j < firstKeywordResults.length; j++) {
					if(firstKeywordResults[j]._id.toString() == otherKeywordResults[i]._id.toString()) {
						alreadyInTheList = true;
						break;
					}
				}

				if (!alreadyInTheList)
					firstKeywordResults.push(otherKeywordResults[i]);
			}

			for(var i = 0 ; i < firstKeywordResults.length ; i++) {
				var category = firstKeywordResults[i];

				if(category.keywords[0].language == 'en')
					category.name = category.nameEn;
				else
					category.name = category.nameTr;

				delete category.keywords;
			}

			callback(null , firstKeywordResults);
		});
	}

};

var SearchService = {

	search : function(req , res) {
		var latitude  = req.body.latitude;
		var longitude = req.body.longitude;
		var product   = req.body.product;
		var prefix    = req.body.prefix;
		var filters   = req.body.filters;
		var sortType  = req.body.sortType;

		if (latitude == undefined || longitude == undefined) {
			res.send(400);
			return;
		}

		if (product == undefined && prefix == undefined) {
			res.send(400);
			return;
		}

		// Search filters for a distance filter, if there exists a filter for maxDistance, update the query below accordingly
		var maxDistance = 10000;
		if (filters != undefined) {
			for (var i = 0; i < filters.length; i++) {
				var filter = filters[i];

				if (filter.filterType == FILTER_TYPE_DISTANCE) {
					maxDistance = filter.maxDistance;
					break;
				}
			}
		}

		console.log(maxDistance);

		var query = Venue
					.find({location : {
						$nearSphere : {
							$geometry : {
								type 		: 'Point',
								coordinates : [longitude , latitude]
							},
							$maxDistance   : maxDistance
						}
					}})
					.where('status').equals(Venue.STATUS_APPROVED)
					.limit(50)
					.populate('categories')
					.populate('creator' , '-password')
					.populate('ownerInfo.owner' , '-password')
					.lean();

		// Add filters to query
		if (filters) {
			SearchServiceHelpers.addFilters(query , filters , res);
		}

		if (sortType == SORT_TYPE_RATING) {
			query = query.sort('-rating');
		}

		async.parallel({

			venueSearchedProducts : function(callback) {
				SearchServiceHelpers.autoCompleteProduct(prefix , 100 , function(err , products) {
					VenueProduct
					.find({location : {
						$nearSphere : {
							$geometry : {
								type 		: 'Point',
								coordinates : [longitude , latitude]
							},
							$maxDistance   : maxDistance
						}
					}})
					.where('product').in(products)
					.exec(function(err , venueProducts) {
						if (err) {
							callback(err);
						}
						else {
							console.log(venueProducts.length);
							var venueSearchedProducts = {};

							for (var i = 0; i < venueProducts.length; i++) {
								var venueId = venueProducts[i].venue.toString();
								var product = venueProducts[i].product.toString();

								var venueEntry = venueSearchedProducts[venueId];
								if (venueEntry == undefined) {

									for (var j = 0; j < products.length; j++) {
										if(products[j]._id.toString() == product) {
											venueSearchedProducts[venueId] = [products[j]];
											break;
										}
									}
								}
								else {
									for (var j = 0; j < products.length; j++) {
										if(products[j]._id.toString() == product) {
											venueSearchedProducts[venueId].push(products[j]);
											break;
										}
									}
								}
							}

							console.log("venue products finished");

							callback(null , venueSearchedProducts);
						}
					});
				});
			},

			categories : function(callback) {
				SearchServiceHelpers.autoCompleteCategory(prefix , callback);
			},

			venues : function(callback) {
				SearchServiceHelpers.autoCompleteVenue(prefix , callback);
			}

		}, function(err , results) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				var venueSearchedProducts = results.venueSearchedProducts;

				var venueIdArray = Object.keys(venueSearchedProducts);
				var categories   = results.categories;
				var venues       = results.venues;

				var categoryIdArray = [];

				for (var i = 0; i < categories.length; i++) {
					categoryIdArray.push(categories[i]._id);
				}

				for (var i = 0; i < venues.length; i++) {
					venueIdArray.push(venues[i]._id);
				}

				query = query
						.or([
								{'categories' 	    : {$in : categoryIdArray}} ,
						 		{'_id'			    : {$in : venueIdArray}}
						]);

				query.exec(function(err , results) {
					if (err) {
						console.log(err);
						res.send(400);
					}
					else {
						for (var i = 0; i < results.length; i++) {
							var currentVenue = results[i];
							var searchedProductsEntry = venueSearchedProducts[currentVenue._id.toString()];

							if (searchedProductsEntry != undefined) {
								currentVenue.searchedProducts = searchedProductsEntry;
							}
						}

						res.send(results);
					}
				});
			}
		});
	},

	searchVenue : function(req , res) {
		var prefix = req.body.prefix;
		var maxId  = req.body.maxId;

		if (prefix == undefined) {
			res.send(400);
			return;
		}

		prefix = prefix.toLowerCase();
		prefix = Util.convertAccentedCharacters(prefix);

		var query = Venue
					.find({'keywords.keyword' : new RegExp('^' + prefix + '\w*')})
					.where('status').equals(Venue.STATUS_APPROVED)
					.sort('-_id')
					.limit(25)
					.populate('categories')
					.populate('ownerInfo.owner' , '-password')
					.populate('creator' , '-password');

		if (maxId)
			query = query.where('_id').lt(maxId);

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

	autoCompleteProduct : function(req , res) {
		var prefix = req.body.prefix;

		if (prefix == undefined) {
			res.send(400);
			return;
		}

		SearchServiceHelpers.autoCompleteProduct(prefix , 10 , function(err , results) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(results);
			}
		});
	},

	autoCompleteVenue : function(req , res) {
		var prefix = req.body.prefix;

		if (prefix == undefined) {
			res.send(400);
			return;
		}

		SearchServiceHelpers.autoCompleteVenue(prefix , function(err , results) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(results);
			}
		});
	},

	autoCompleteCategory : function(req , res) {
		var prefix = req.body.prefix;

		if (prefix == undefined) {
			res.send(400);
			return;
		}

		SearchServiceHelpers.autoCompleteCategory(prefix , function(err , results) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(results);
			}
		});
	},

	searchForExistingVenue : function(req , res) {
		var latitude  = req.body.latitude;
		var longitude = req.body.longitude;
		var prefix    = req.body.prefix;

		if (latitude == undefined || longitude == undefined || prefix == undefined) {
			res.send(400);
			return;
		}

		async.parallel({

			martmaraVenues : function(callback) {
				SearchServiceHelpers.autoCompleteVenue(prefix , function(err , results) {
					if (err) {
						callback(err);
						console.log(err);
					}

					var venueIdArray = [];
					var venues       = results;

					for (var i = 0; i < venues.length; i++) {
						venueIdArray.push(venues[i]._id);
					}

					Venue
					.find({location : {
						$nearSphere : {
							$geometry : {
								type 		: 'Point',
								coordinates : [longitude , latitude]
							},
							$maxDistance   : 15000
						}
					}})
					.where('status').equals(Venue.STATUS_APPROVED)
					.where('_id').in(venueIdArray)
					.populate('categories')
					.select('-products')
					.exec(callback);
				});
			},

			foursquareVenues : function(callback) {
				var url   = 'https://api.foursquare.com/v2/venues/search';
				var ll    = latitude + ',' + longitude;

				var currentDate = new Date();
				var year  = currentDate.getFullYear().toString();
				var date  = currentDate.getDate().toString();
				var month = (currentDate.getMonth() + 1).toString();

				if (date.length == 1)
					date = '0' + date;
				if (month.length == 1) 
					month = '0' + month;

				var v = year + date + month;

				url += '?ll=' + ll;
				url += '&query=' + prefix;
				url += '&limit=50';
				url += '&client_id=' + FOURSQUARE_CLIENT_ID;
				url += '&client_secret=' + FOURSQUARE_CLIENT_SECRET;
				url += '&v=' + v;

				console.log(url);

				request(url, function (error, response, body) {
					callback(error , JSON.parse(body).response.venues);
				});
			}

		} , function(err , results) {
			if (err) {
				res.send(400);
				console.log(err);
			}
			else {
				var martmaraVenues   = results.martmaraVenues;
				var foursquareVenues = results.foursquareVenues;

				res.send({
					martmaraVenues : martmaraVenues,
					foursquareVenues : foursquareVenues
				});
			}
		});
	}

};

module.exports = SearchService;
