var AnalyticsService = require('../services/AnalyticsService');
var User 		 	 = require('../models/User');

var AnalyticsController = {

	createAnalyticsEntry : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null)
			res.send(401);
		else
			AnalyticsService.createAnalyticsEntry(req , res);
	},

	getAnalytics : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || user.userType == User.USER_TYPE_NORMAL)
			res.send(401);
		else
			AnalyticsService.getAnalytics(req , res);
	},

	getTopAnalytics : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || user.userType == User.USER_TYPE_NORMAL)
			res.send(401);
		else
			AnalyticsService.getTopAnalytics(req , res);
	},

	getSearchAnalyticsPageCount : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || user.userType == User.USER_TYPE_NORMAL)
			res.send(401);
		else
			AnalyticsService.getSearchAnalyticsPageCount(req , res);
	},

	getSearchAnalytics : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || user.userType == User.USER_TYPE_NORMAL)
			res.send(401);
		else
			AnalyticsService.getSearchAnalytics(req , res);
	},

	getAllAnalytics : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || user.userType == User.USER_TYPE_NORMAL)
			res.send(401);
		else
			AnalyticsService.getAllAnalytics(req , res);
	}

};

module.exports = AnalyticsController;