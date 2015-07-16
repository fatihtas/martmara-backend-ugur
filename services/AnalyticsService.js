var Analytics = require('../models/Analytics');
var Venue     = require('../models/Venue');

var AnalyticsService = {

	createAnalyticsEntry : function(req , res) {
		var venueId       = req.body.venueId;
		var type    	  = req.body.type;
		var searchKeyword = req.body.searchKeyword;
		var user          = req.user;

		if (venueId == undefined || type == undefined) {
			res.send(400);
			return;
		}

		if (type == Analytics.HISTORY_TYPE_VENUE_DISPLAYED_AFTER_SEARCH && searchKeyword == undefined) {
			res.send(400);
			return;
		}

		var analyticsItem = new Analytics({
			venue : venueId,
			type  : type,
			user  : user
		});

		if (type = Analytics.HISTORY_TYPE_VENUE_DISPLAYED_AFTER_SEARCH)
			analyticsItem.searchKeyword = searchKeyword;

		if (type == Analytics.HISTORY_TYPE_SHOPPED_HERE) {
			analyticsItem.products = products;
			analyticsItem.price    = price;
			analyticsItem.currency = currency;
		}

		analyticsItem.save(function(err) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(200);
			}
		});
	},

	getAnalytics : function(req , res) {
		var venueId = req.body.venueId;
		var type    = req.body.type;
		var minDate = req.body.minDate;
		var maxDate = req.body.maxDate;

		if (venueId == undefined || type == undefined) {
			res.send(400);
			return;
		}

		var query = Analytics.count({venue : venueId , type : type});

		if (minDate)
			query = query.where('date').gte(minDate);

		if (maxDate)
			query = query.where('date').lte(maxDate);

		query.exec(function(err , count) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send({count : count});
			}
		});
	},

	getTopAnalytics : function(req , res) {
		var type    = req.body.type;
		var minDate = req.body.minDate;
		var maxDate = req.body.maxDate;

		if (type == undefined || minDate == undefined || maxDate == undefined) {
			res.send(400);
			return;
		}

		Analytics
		.aggregate()
		.match({'type' : type , 'date' : {$lt : new Date(maxDate) , $gt : new Date(minDate)}})
		.group({_id  : '$venue' , count : {$sum : 1}})
		.sort({count : -1})
		.limit(50)
		.exec(function(err , results) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				Venue.populate(results , {path : "_id"} , function(err , venues) {

					var responseArray = [];

					for (var i = 0; i < venues.length; i++) {
						responseArray.push({
							venue : venues[i]._id ,
							count : venues[i].count
						});
					}

					res.send(responseArray);
				});
			}
		});
	},

	getSearchAnalyticsPageCount : function(req , res) {
		var venueId = req.body.venueId;
		var minDate = req.body.minDate;
		var maxDate = req.body.maxDate;

		if (venueId == undefined) {
			res.send(400);
			return;
		}

		var query = Analytics.count({venue : venueId , type : Analytics.HISTORY_TYPE_VENUE_DISPLAYED_AFTER_SEARCH});

		if (minDate)
			query = query.where('date').gte(minDate);

		if (maxDate)
			query = query.where('date').lte(maxDate);

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

	getSearchAnalytics : function(req , res) {
		var venueId = req.body.venueId;
		var minDate = req.body.minDate;
		var maxDate = req.body.maxDate;
		var page    = req.body.page;

		if (venueId == undefined) {
			res.send(400);
			return;
		}

		var query = Analytics.find({venue : venueId , type : Analytics.HISTORY_TYPE_VENUE_DISPLAYED_AFTER_SEARCH});

		if (minDate)
			query = query.where('date').gte(minDate);

		if (maxDate)
			query = query.where('date').lte(maxDate);

		if (!page)
			page = 1;

		query.paginate({page : page , perPage : 25} , function(err , results) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(results);
			}
		});
	},

	getAllAnalytics : function(req , res) {
		var venueId = req.body.venueId;
		var minDate = req.body.minDate;
		var maxDate = req.body.maxDate;

		if (venueId == undefined) {
			res.send(400);
			return;
		}

		var query = Analytics.find({venue : venueId , type : Analytics.HISTORY_TYPE_VENUE_DISPLAYED_AFTER_SEARCH});

		if (minDate)
			query = query.where('date').gte(minDate);

		if (maxDate)
			query = query.where('date').lte(maxDate);

		query.exec(function(err , results) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(results);
			}
		});
	}

};

module.exports = AnalyticsService;