var User   	   = require('../models/User');
var Venue      = require('../models/Venue');
var UserThanks = require('../models/UserThanks');
var TokenAuth  = require('../config/TokenAuth');
var jwt    	   = require('jwt-simple');
var moment 	   = require('moment');

var EmailService = require('./EmailService');

var UserService = {

	register : function(req , res) {
		var name        = req.body.name;
		var email       = req.body.email;
		var password    = req.body.password;
		var dateOfBirth = req.body.dateOfBirth;
		var gender      = req.body.gender;

		if (email == undefined || password == undefined) {
			res.send(400);
			return;
		}

		email = email.toLowerCase();

		var newUser = new User({
			name 	    : name,
			email 	    : email,
			password    : password,
			dateOfBirth : dateOfBirth,
			gender 	    : gender
		});

		newUser.save(function(err) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				delete newUser.password;
				var userJson = newUser.toJSON();

				var token 	  = TokenAuth.generateToken(newUser);
				userJson.token = token;

				res.send(userJson);
			}
		});
	},

	forgotPassword : function(req , res) {
		var email    = req.body.email;
		var language = req.body.language;

		if (email == undefined) {
			res.send(400);
			return;
		}

		User
		.findOne({email : email})
		.exec(function(err , user) {
			if (err || !user) {
				console.log(err);
				res.send(400);
			}
			else {
				var token;
				require('crypto').randomBytes(3, function(ex, buf) {
				  	token = buf.toString('hex');

				  	var content;
					var subject;
					var name = user.name;

					if (language == 'tr') {

						content = "<html>";
						content += "Selamlar,";
						content += "<br/>";
						content += "<br/>";
						content += "Az önce birisi Martmara hesabınızın şifresini değiştirme isteği gönderdi. Eğer bu isteği siz yolladıysanız, yeni şifrenizi uygulama içinde bu kod ile belirleyebilirsiniz. :";
						content += "<br/>";
						content += "<br/>";
						content += token;
						content += "<br/>";
						content += "<br/>";
						content += "Eğer şifrenizi değiştirmek istemiyorsanız yada bu isteği siz yollamadıysanız, lütfen bu eposta’yı dikkate almayınız ve siliniz. Hesabınızı güvende tutmak için bu epostayı kimseye yollamayınız.";
						content += "<br/>";
						content += "<br/>";
						content += "Teşekkürler";
						content += "<br/>";
						content += "- Martmara | Dükkan Gezgini Takımı";

						subject = "Şifre Değişikliği";
					}
					else {

						content = "<html>";
						content += "Hi there,";
						content += "<br/>";
						content += "<br/>";
						content += "Someone recently requested a password change for your Martmara account. If this was you, you can set a new password in the app with this token:";
						content += "<br/>";
						content += "<br/>";
						content += token;
						content += "<br/>";
						content += "<br/>";
						content += "If you don’t want to change your password or didn’t request this, just ignore and delete this email. To keep your account secure, please don’t forward this email to anyone.";
						content += "<br/>";
						content += "<br/>";
						content += "Thanks";
						content += "<br/>";
						content += "- Martmara | Market Browser Team";

						subject = "Password Reset";
					}

					EmailService.sendEmail(email , subject , content);

					var currentDate = new Date();
					var numberOfDaysToAdd = 2;
					currentDate.setDate(currentDate.getDate() + numberOfDaysToAdd);

					user.resetToken  = token;
					user.resetExpiry = currentDate;
					user.save();

					res.send(200);
				});
			}
		});
	},

	resetPassword : function(req , res) {
		var token        = req.body.token;
		var newPassword  = req.body.newPassword;

		if (token == undefined || newPassword == undefined) {
			res.send(400);
			return;
		}

		User
		.findOne({resetToken : token})
		.where('resetExpiry').gte(new Date())
		.exec(function(err , user) {
			if (err || !user) {
				console.log(err);
				res.send(400);
			}
			else {
				user.password = newPassword;
				user.save(function(err) {
					if (err) {
						console.log(err);
						res.send(400);
					}
					else {
						res.send(200);
					}
				})
			}
		});
	},

	login : function(req , res) {
		if (req.headers.email && req.headers.password) {

		    User.findOne({ email: req.headers.email }, function(err, user) {
				if (err) {
					res.send('Authentication error', 401);
					return;
				}

				if(!user) {
					res.send('Authentication error' , 401);
					return;
				}

		        user.comparePassword(req.headers.password, function(err, isMatch) {
		      		if (err) {
		      			res.send('Authentication error', 401);
		      			return;
		      		}

					if (isMatch) {
						var token = TokenAuth.generateToken(user);
						res.json({
							token   : token,
							user    : user.toJSON()
						});
					}
					else {
						res.send('Authentication error', 401);
					}
				});
			});
		}
		else {
			res.send('Authentication error', 401);
		}
	},

	adminLogin : function(req , res) {
		if (req.headers.email && req.headers.password) {

		    User.findOne({ email: req.headers.email }, function(err, user) {
				if (err) {
					res.send('Authentication error', 401);
					return;
				}

				if(!user) {
					res.send('Authentication error' , 401);
					return;
				}

		        user.comparePassword(req.headers.password, function(err, isMatch) {
		      		if (err) {
		      			res.send('Authentication error', 401);
		      			return;
		      		}

					if (isMatch && (user.userType == User.USER_TYPE_SUPER_ADMIN || user.userType == User.USER_TYPE_ADMIN) ) {	
						var token = TokenAuth.generateToken(user);
						res.json({
							token   : token,
							user    : user.toJSON()
						});
					}
					else {
						res.send('Authentication error', 401);
					}
				});
			});
		}
		else {
			res.send('Authentication error', 401);
		}
	},

	createAdmin : function(req , res) {
		var email    = req.body.email;
		var password = req.body.password;

		if (email == undefined || password == undefined) {
			res.send(400);
			return;
		}

		var admin = new User({
			email    : email,
			password : password,
			userType : User.USER_TYPE_ADMIN
		});

		admin.save(function(err) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(200);
			}
		});
	},

	removeAdmin : function(req , res) {
		var adminId = req.body.adminId;

		if (adminId == undefined) {
			res.send(400);
			return;
		}

		User
		.findOne({_id : adminId})
		.exec(function(err , admin) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				admin.userType = User.USER_TYPE_NORMAL;
				admin.save(function(err) {
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

	listAdmins : function(req , res) {
		var page = req.body.page;

		var queryCallback = function(err , results) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(results);
			}
		}

		var query = User
					.find()
					.where('userType').in([User.USER_TYPE_ADMIN , User.USER_TYPE_SUPER_ADMIN])
					.sort('_id')
					.select('-password')
					.limit(25);

		if (page)
			query = query.paginate({page : page , perPage : 25} , queryCallback);
		else
			query = query.paginate({page : 1    , perPage : 25} , queryCallback);
	},

	changePassword : function(req , res) {
		var user 		= req.user;
		var newPassword = req.body.password;

		if (newPassword == undefined) {
			res.send(400);
			return;
		}

		user.password = newPassword;
		user.save(function(err) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(200);
			}
		});
	},

	updateProfileImage : function(req , res) {
		var profileImage = req.body.profileImage;
		var user         = req.user;

		if (profileImage == undefined) {
			res.send(400);
			return;
		}

		user.profileImage = profileImage;
		user.save(function(err) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send({profileImage : profileImage});
			}
		});
	},

	refreshToken : function(req , res) {
		var user = req.user;
		res.send({token : TokenAuth.generateToken(user)});
	},

	addBookmark : function(req , res) {
		var venueId = req.body.venueId;
		var user    = req.user;

		if (venueId == undefined) {
			res.send(400);
			return;
		}

		var exists = false;
		for (var i = 0; i < user.bookmarks.length; i++) {
			if(user.bookmarks[i].toString() == venueId) {
				exists = true;
				break;
			}
		}

		if (!exists) {
			user.bookmarks.push(venueId);
			user.save(function(err) {
				if (err) {
					res.send(400);
				}
				else {
					res.send(200);
				}
			});
		}
		else {
			res.send(200);
		}
	},

	removeBookmark : function(req , res) {
		var user    = req.user;
		var venueId = req.body.venueId;

		if (venueId == undefined) {
			res.send(400);
			return;
		}

		var bookmarks = user.bookmarks;
		var index 	  = -1;

		for (var i = 0; i < bookmarks.length; i++) {
			if(bookmarks[i].toString() == venueId) {
				index = i;
				break;
			}
		}

		bookmarks.splice(index , 1);

		user.bookmarks = bookmarks;
		user.save(function(err) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(200);
			}
		});
	},

	getBookmarks : function (req , res) {
		var user = req.user;

		User
		.findOne({_id : user._id})
		.exec(function (err , result) {
			if (err || !result) {
				res.send(400);
			}
			else {
				var bookmarks = result.bookmarks;

				Venue
				.find()
				.where('_id').in(bookmarks)
				.populate('categories')
				.populate('creator' , '-password')
				.select('-products')
				.exec(function (err , venues) {
					if (err) {
						res.send(400);
					}
					else {
						res.send(venues);
					}
				});
			}
		});
	},

	getBookmarkIdList : function(req , res) {
		var user = req.user;

		User
		.findOne({_id : user._id})
		.exec(function (err , result) {
			if (err || !result) {
				res.send(400);
			}
			else {
				var bookmarks = result.bookmarks;

				Venue
				.find()
				.where('_id').in(bookmarks)
				.select('_id')
				.exec(function (err , venues) {
					if (err) {
						res.send(400);
					}
					else {
						res.send(venues);
					}
				});
			}
		});
	},

	thankUser : function(req , res) {
		var venueId 	       = req.body.venueId;
		var thanksReceiverUser = req.body.thanksReceiverUser;
		var thanksGiverUser    = req.user;

		UserThanks
			.findOne()
			.where('venue').equals(venueId)
			.where('thanksReceiverUser').equals(thanksReceiverUser)
			.where('thanksGiverUser').equals(thanksGiverUser)
			.exec(function(err , result) {
				if(result)
					res.send(200);
				else {
					var thanks = new UserThanks({
						venue 			   : venueId,
						thanksGiverUser    : thanksGiverUser,
						thanksReceiverUser : thanksReceiverUser
					});

					thanks.save(function(err){
						if(err)
							res.send(400);
						else
							res.send(200);
					});
				}
			});
	},

	updateUser : function(req , res) {
		var dateOfBirth    = req.body.dateOfBirth;
		var gender         = req.body.gender;
		var profilePicture = req.body.profilePicture;
		var user 		   = req.user;

		if (dateOfBirth == undefined && gender == undefined) {
			res.send(400);
			return;
		}

		if (dateOfBirth) 
			user.dateOfBirth = dateOfBirth;

		if (gender != undefined) 
			user.gender = gender;

		if (profilePicture != undefined) {
			user.profilePicture = profilePicture;
		}

		user.save(function(err) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(user);
			}
		});
	},

	getUsersWithPage : function(req , res) {
		var page = req.body.page;

		if (page == undefined) {
			page = 1;
		}

		User
		.find()
		.select('-password')
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

	getUserPageCount : function(req , res) {
		User
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

	editUserStatus : function(req , res) {
		var banned = req.body.banned;
		var userId = req.body.userId;

		if (banned == undefined || userId == undefined) {
			res.send(400);
			return;
		}

		User
		.findOne({_id : userId})
		.select('-password')
		.exec(function(err , result) {
			if (err || !result) {
				res.send(400);
			}
			else {
				result.banned = banned;
				result.save(function(err) {
					if (err) {
						console.log(err);
						res.send(400);
					}
					else {
						res.send(result);
					}
				});
			}
		});
	}
};

module.exports = UserService;