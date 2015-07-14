var VenueService = require('../services/VenueService');
var User 		 = require('../models/User');

var VenueController = {

	createCategory : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null) 
			res.send(401);
		else
			VenueService.createCategory(req , res);
	},

	createSupplyChain : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null) 
			res.send(401);
		else
			VenueService.createSupplyChain(req , res);
	},

	createVenue : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null) 
			res.send(401);
		else
			VenueService.createVenue(req , res);
	},

	createCategoryProduct : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || (user.userType != User.USER_TYPE_SUPER_ADMIN && user.userType != User.USER_TYPE_ADMIN)) 
			res.send(401);
		else
			VenueService.createCategoryProduct(req , res);
	},

	updateCategoryProduct : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || (user.userType != User.USER_TYPE_SUPER_ADMIN && user.userType != User.USER_TYPE_ADMIN)) 
			res.send(401);
		else
			VenueService.updateCategoryProduct(req , res);
	},
	
	getCategoryProducts : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || (user.userType != User.USER_TYPE_SUPER_ADMIN && user.userType != User.USER_TYPE_ADMIN)) 
			res.send(401);
		else
			VenueService.getCategoryProducts(req , res);
	},

	listCategoryProductsWithPage : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || (user.userType != User.USER_TYPE_SUPER_ADMIN && user.userType != User.USER_TYPE_ADMIN)) 
			res.send(401);
		else
			VenueService.listCategoryProductsWithPage(req , res);
	},

	getCategoryProductPageCount : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || (user.userType != User.USER_TYPE_SUPER_ADMIN && user.userType != User.USER_TYPE_ADMIN)) 
			res.send(401);
		else
			VenueService.getCategoryProductPageCount(req , res);
	},

	deleteVenue : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || (user.userType != User.USER_TYPE_SUPER_ADMIN && user.userType != User.USER_TYPE_ADMIN)) 
			res.send(401);
		else
			VenueService.deleteVenue(req , res);
	},

	editCategory : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || (user.userType != User.USER_TYPE_SUPER_ADMIN && user.userType != User.USER_TYPE_ADMIN)) 
			res.send(401);
		else
			VenueService.editCategory(req , res);
	},

	listCategoriesWithPage : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || (user.userType != User.USER_TYPE_SUPER_ADMIN && user.userType != User.USER_TYPE_ADMIN)) 
			res.send(401);
		else
			VenueService.listCategoriesWithPage(req , res);
	},

	getCategoryPageCount : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || (user.userType != User.USER_TYPE_SUPER_ADMIN && user.userType != User.USER_TYPE_ADMIN)) 
			res.send(401);
		else
			VenueService.getCategoryPageCount(req , res);
	},

	getCategory : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || (user.userType != User.USER_TYPE_SUPER_ADMIN && user.userType != User.USER_TYPE_ADMIN)) 
			res.send(401);
		else
			VenueService.getCategory(req , res);
	},

	updateVenue : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null) 
			res.send(401);
		else
			VenueService.updateVenue(req , res);
	},

	updateVenueLocation : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null) 
			res.send(401);
		else
			VenueService.updateVenueLocation(req , res);
	},

	updateVenueProducts : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null) 
			res.send(401);
		else
			VenueService.updateVenueProducts(req , res);
	},

	updateVenueMedia : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null) 
			res.send(401);
		else
			VenueService.updateVenueMedia(req , res);
	},

	changeVenueStatus : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || (user.userType != User.USER_TYPE_SUPER_ADMIN && user.userType != User.USER_TYPE_ADMIN)) 
			res.send(401);
		else
			VenueService.changeVenueStatus(req , res);
	},

	getNearVenues : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null) 
			res.send(401);
		else
			VenueService.getNearVenues(req , res);
	},

	listVenues : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null) 
			res.send(401);
		else
			VenueService.listVenues(req , res);
	},

	listVenuesWithPage : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null) 
			res.send(401);
		else
			VenueService.listVenuesWithPage(req , res);
	},

	getVenuePageCount : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null) 
			res.send(401);
		else
			VenueService.getVenuePageCount(req , res);
	},

	getVenueDetails : function(req , res) {	
		VenueService.getVenueDetails(req , res);
	},

	getSupplyChainList : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null) 
			res.send(401);
		else
			VenueService.getSupplyChainList(req , res);
	},

	getProducts : function(req , res) {
		VenueService.getProducts(req , res);
	},

	claimVenue : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null) 
			res.send(401);
		else
			VenueService.claimVenue(req , res);
	},

	approveVenueOwner : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || (user.userType != User.USER_TYPE_SUPER_ADMIN && user.userType != User.USER_TYPE_ADMIN)) 
			res.send(401);
		else
			VenueService.approveVenueOwner(req , res);
	},

	declineVenueOwner : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || (user.userType != User.USER_TYPE_SUPER_ADMIN && user.userType != User.USER_TYPE_ADMIN)) 
			res.send(401);
		else
			VenueService.declineVenueOwner(req , res);
	}

};

module.exports = VenueController;