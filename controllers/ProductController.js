var ProductService = require('../services/ProductService');
var User 		   = require('../models/User');

var ProductController = {

	createProduct : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null)
			res.send(401);
		else
			ProductService.createProduct(req , res);
	},

	deleteProduct : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || (user.userType != User.USER_TYPE_SUPER_ADMIN && user.userType != User.USER_TYPE_ADMIN))
			res.send(401);
		else
			ProductService.deleteProduct(req , res);
	},

	editProduct : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || (user.userType != User.USER_TYPE_SUPER_ADMIN && user.userType != User.USER_TYPE_ADMIN))
			res.send(401);
		else
			ProductService.editProduct(req , res);
	},

	editVenueProduct : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null)
			res.send(401);
		else
			ProductService.editVenueProduct(req , res);
	},

	rateProduct : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null)
			res.send(401);
		else
			ProductService.rateProduct(req , res);
	},

	listProductsWithPage : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || (user.userType != User.USER_TYPE_SUPER_ADMIN && user.userType != User.USER_TYPE_ADMIN))
			res.send(401);
		else
			ProductService.listProductsWithPage(req , res);
	},

	getProductPageCount : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || (user.userType != User.USER_TYPE_SUPER_ADMIN && user.userType != User.USER_TYPE_ADMIN))
			res.send(401);
		else
			ProductService.getProductPageCount(req , res);
	},

	getProduct : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || (user.userType != User.USER_TYPE_SUPER_ADMIN && user.userType != User.USER_TYPE_ADMIN))
			res.send(401);
		else
			ProductService.getProduct(req , res);
	},

	getVenueProduct : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null)
			res.send(401);
		else
			ProductService.getVenueProduct(req , res);
	},

	shoppedHere : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null)
			res.send(401);
		else
			ProductService.shoppedHere(req , res);
	},

	getComments : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null)
			res.send(401);
		else
			ProductService.getComments(req , res);
	}
};

module.exports = ProductController;