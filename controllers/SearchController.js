var SearchService = require('../services/SearchService');

var SearchController = {

	search : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null)
			res.send(401);
		else
			SearchService.search(req , res);
	},

	searchVenue : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null)
			res.send(401);
		else
			SearchService.searchVenue(req , res);
	},

	autoCompleteProduct : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null)
			res.send(401);
		else
			SearchService.autoCompleteProduct(req , res);
	},

	autoCompleteVenue : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null)
			res.send(401);
		else
			SearchService.autoCompleteVenue(req , res);
	},

	autoCompleteCategory : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null)
			res.send(401);
		else
			SearchService.autoCompleteCategory(req , res);
	},

	searchForExistingVenue : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null)
			res.send(401);
		else
			SearchService.searchForExistingVenue(req , res);
	}
};

module.exports = SearchController;