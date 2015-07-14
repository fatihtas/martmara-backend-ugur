var UserService = require('../services/UserService');
var User        = require('../models/User');

var UserController = {

	register : function (req , res) {
		UserService.register(req , res);
	},

	forgotPassword : function(req , res) {
		UserService.forgotPassword(req , res);
	},

	resetPassword : function(req , res) {
		UserService.resetPassword(req , res);
	},

	login : function (req , res) {
		UserService.login(req , res);
	},

	adminLogin : function (req , res) {
		UserService.adminLogin(req , res);
	},

	listAdmins : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || user.userType != User.USER_TYPE_SUPER_ADMIN) 
			res.send(401);
		else
			UserService.listAdmins(req , res);
	},

	createAdmin : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || user.userType != User.USER_TYPE_SUPER_ADMIN) 
			res.send(401);
		else
			UserService.createAdmin(req , res);
	},

	removeAdmin : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || user.userType != User.USER_TYPE_SUPER_ADMIN) 
			res.send(401);
		else
			UserService.removeAdmin(req , res);
	},

	changePassword : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null) 
			res.send(401);
		else
			UserService.changePassword(req , res);
	},

	updateProfileImage : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null) 
			res.send(401);
		else
			UserService.updateProfileImage(req , res);
	},

	refreshToken : function(req , res) {
		UserService.refreshToken(req , res);
	},

	addBookmark : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null) 
			res.send(401);
		else
			UserService.addBookmark(req , res);
	},

	removeBookmark : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null) 
			res.send(401);
		else
			UserService.removeBookmark(req , res);
	},

	getBookmarks : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null) 
			res.send(401);
		else
			UserService.getBookmarks(req , res);
	},

	getBookmarkIdList : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null) 
			res.send(401);
		else
			UserService.getBookmarkIdList(req , res);
	},

	thankUser : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null)
			res.send(401);
		else
			UserService.thankUser(req , res);
	},

	updateUser : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null)
			res.send(401);
		else
			UserService.updateUser(req , res);
	},

	getUsersWithPage : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || user.userType != User.USER_TYPE_SUPER_ADMIN) 
			res.send(401);
		else
			UserService.getUsersWithPage(req , res);
	},

	getUserPageCount : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || user.userType != User.USER_TYPE_SUPER_ADMIN) 
			res.send(401);
		else
			UserService.getUserPageCount(req , res);
	},

	editUserStatus : function(req , res) {
		var user = req.user;

		if (user == undefined || user == null || user.userType != User.USER_TYPE_SUPER_ADMIN) 
			res.send(401);
		else
			UserService.editUserStatus(req , res);
	}

};

module.exports = UserController;