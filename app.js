var cluster = require('cluster');

if (cluster.isMaster) {

  var cpuCount = require('os').cpus().length;

  console.log(cpuCount);

  for (var i = 0; i < cpuCount; i++) {
    cluster.fork();  
  }

  cluster.on('exit' , function(worker) {
      cluster.fork();
  });

}
else {
	var express  = require('express');
	var http 	 = require('http');
	var path 	 = require('path');
	var passport = require('passport');
	var jwt 	 = require('jwt-simple');

	var app = express();

	 process.on('uncaughtException', function(err) {
	    console.log('Caught exception');
	    console.log(err);
	  });

	var ProductController   = require('./controllers/ProductController');
	var VenueController     = require('./controllers/VenueController');
	var UserController      = require('./controllers/UserController');
	var SearchController    = require('./controllers/SearchController');
	//var AnalyticsController = require('./controllers/AnalyticsController');//removed

	// Auth Config Imports
	var FacebookAuthConfig = require('./config/FacebookAuthConfig');
	var GoogleAuthConfig   = require('./config/GoogleAuthConfig');

	// all environments
	app.set('port', process.env.PORT || 3000);
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));

	FacebookAuthConfig.config(app , passport);
	GoogleAuthConfig.config(app , passport);

	// development only
	if ('development' == app.get('env')) {
	  app.use(express.errorHandler());
	}

	var TokenAuth = require('./config/TokenAuth.js');

	app.post('/product/createProduct' 				, TokenAuth.authenticate , ProductController.createProduct);
	app.post('/product/deleteProduct' 				, TokenAuth.authenticate , ProductController.deleteProduct);
	app.post('/product/editProduct'      			, TokenAuth.authenticate , ProductController.editProduct);
	app.post('/product/editVenueProduct' 			, TokenAuth.authenticate , ProductController.editVenueProduct);
	app.post('/product/rateProduct'   				, TokenAuth.authenticate , ProductController.rateProduct);
	app.post('/product/listProductsWithPage'   		, TokenAuth.authenticate , ProductController.listProductsWithPage);
	app.post('/product/getProductPageCount'   		, TokenAuth.authenticate , ProductController.getProductPageCount);
	app.post('/product/getProduct'  		   		, TokenAuth.authenticate , ProductController.getProduct);
	app.post('/product/getVenueProduct'  		    , TokenAuth.authenticate , ProductController.getVenueProduct);
	app.post('/product/shoppedHere'  		   		, TokenAuth.authenticate , ProductController.shoppedHere);
	app.post('/product/getComments'  		   		, TokenAuth.authenticate , ProductController.getComments);

	app.post('/venue/createCategory' 				, TokenAuth.authenticate , VenueController.createCategory);
	app.post('/venue/createVenue'    				, TokenAuth.authenticate , VenueController.createVenue);
	app.post('/venue/createSupplyChain'    			, TokenAuth.authenticate , VenueController.createSupplyChain);
	app.post('/venue/deleteVenue'    				, TokenAuth.authenticate , VenueController.deleteVenue);
	app.post('/venue/getSupplyChainList'    	    , TokenAuth.authenticate , VenueController.getSupplyChainList);
	app.post('/venue/createCategoryProduct'         , TokenAuth.authenticate , VenueController.createCategoryProduct);
	app.post('/venue/updateCategoryProduct'         , TokenAuth.authenticate , VenueController.updateCategoryProduct);
	app.post('/venue/getCategoryProducts'  			, TokenAuth.authenticate , VenueController.getCategoryProducts);
	app.post('/venue/listCategoryProductsWithPage'  , TokenAuth.authenticate , VenueController.listCategoryProductsWithPage);
	app.post('/venue/getCategoryProductPageCount'  	, TokenAuth.authenticate , VenueController.getCategoryProductPageCount);
	app.post('/venue/updateVenue'  					, TokenAuth.authenticate , VenueController.updateVenue);
	app.post('/venue/updateVenueLocation' 			, TokenAuth.authenticate , VenueController.updateVenueLocation);
	app.post('/venue/updateVenueProducts'  			, TokenAuth.authenticate , VenueController.updateVenueProducts);
	app.post('/venue/updateVenueMedia'    			, TokenAuth.authenticate , VenueController.updateVenueMedia);
	app.post('/venue/changeVenueStatus'    			, TokenAuth.authenticate , VenueController.changeVenueStatus);
	app.post('/venue/near'           				, TokenAuth.authenticate , VenueController.getNearVenues);
	app.post('/venue/getProducts'    			    , VenueController.getProducts);
	app.post('/venue/listVenues'    				, TokenAuth.authenticate , VenueController.listVenues);
	app.post('/venue/listVenuesWithPage'    		, TokenAuth.authenticate , VenueController.listVenuesWithPage);
	app.post('/venue/getVenuePageCount'    		    , TokenAuth.authenticate , VenueController.getVenuePageCount);
	app.post('/venue/getVenueDetails'    			, VenueController.getVenueDetails);
	app.post('/venue/claimVenue'                    , TokenAuth.authenticate , VenueController.claimVenue);
	app.post('/venue/approveVenueOwner'             , TokenAuth.authenticate , VenueController.approveVenueOwner);
	app.post('/venue/declineVenueOwner'             , TokenAuth.authenticate , VenueController.declineVenueOwner);

	app.post('/category/editCategory'               , TokenAuth.authenticate , VenueController.editCategory);
	app.post('/category/listCategoriesWithPage'     , TokenAuth.authenticate , VenueController.listCategoriesWithPage);
	app.post('/category/getCategoryPageCount'       , TokenAuth.authenticate , VenueController.getCategoryPageCount);
	app.post('/category/getCategory'                , TokenAuth.authenticate , VenueController.getCategory);

	app.post('/search' 				 				, TokenAuth.authenticate , SearchController.search);
	app.post('/search/searchVenue' 				 	, TokenAuth.authenticate , SearchController.searchVenue);
	app.post('/search/autoCompleteProduct' 		    , TokenAuth.authenticate , SearchController.autoCompleteProduct);
	app.post('/search/autoCompleteVenue' 		    , TokenAuth.authenticate , SearchController.autoCompleteVenue);
	app.post('/search/autoCompleteCategory'         , TokenAuth.authenticate , SearchController.autoCompleteCategory);
	app.post('/search/searchForExistingVenue'       , TokenAuth.authenticate , SearchController.searchForExistingVenue);

	app.post('/user/register'  						, UserController.register);
	app.post('/user/forgotPassword'  				, UserController.forgotPassword);
	app.post('/user/resetPassword'  				, UserController.resetPassword);
	app.post('/user/login'     						, UserController.login);
	app.post('/user/adminLogin'     				, UserController.adminLogin);
	app.post('/user/createAdmin'					, TokenAuth.authenticate , UserController.createAdmin);
	app.post('/user/removeAdmin'					, TokenAuth.authenticate , UserController.removeAdmin);
	app.post('/user/listAdmins'						, TokenAuth.authenticate , UserController.listAdmins);
	app.post('/user/changePassword'					, TokenAuth.authenticate , UserController.changePassword);
	app.post('/user/updateProfileImage'     		, TokenAuth.authenticate , UserController.updateProfileImage);
	app.post('/user/refreshToken'     				, TokenAuth.authenticate , UserController.refreshToken);
	app.post('/user/addBookmark'     				, TokenAuth.authenticate , UserController.addBookmark);
	app.post('/user/removeBookmark'     		    , TokenAuth.authenticate , UserController.removeBookmark);
	app.post('/user/getBookmarks'     				, TokenAuth.authenticate , UserController.getBookmarks);
	app.post('/user/getBookmarkIdList'     			, TokenAuth.authenticate , UserController.getBookmarkIdList);
	app.post('/user/thankUser'     				    , TokenAuth.authenticate , UserController.thankUser);
	app.post('/user/updateUser'     				, TokenAuth.authenticate , UserController.updateUser);
	app.post('/user/getUsersWithPage'				, TokenAuth.authenticate , UserController.getUsersWithPage);
	app.post('/user/getUserPageCount'				, TokenAuth.authenticate , UserController.getUserPageCount);
	app.post('/user/editUserStatus'				    , TokenAuth.authenticate , UserController.editUserStatus);

	/*
	app.post('/analytics/createAnalyticsEntry'      	   , TokenAuth.authenticate , AnalyticsController.createAnalyticsEntry);
	app.post('/analytics/getAnalytics'      			   , TokenAuth.authenticate , AnalyticsController.getAnalytics);
	app.post('/analytics/getTopAnalytics'      			   , TokenAuth.authenticate , AnalyticsController.getTopAnalytics);
	app.post('/analytics/getSearchAnalyticsPageCount'      , TokenAuth.authenticate , AnalyticsController.getSearchAnalyticsPageCount);
	app.post('/analytics/getSearchAnalytics'               , TokenAuth.authenticate , AnalyticsController.getSearchAnalytics);
	app.post('/analytics/getAllAnalytics'                  , TokenAuth.authenticate , AnalyticsController.getAllAnalytics);
	*/
	

	var httpServer = http.createServer(app).listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});

	var Venue = require('./models/Venue');
	var VenueServiceHelpers = require('./services/VenueService').VenueServiceHelpers;


	var MessageService = require('./services/MessageService');
	app.post('/messages/sendVerificationCode' , TokenAuth.authenticate , MessageService.sendVerificationCode);
	app.post('/messages/verifyCode'           , TokenAuth.authenticate , MessageService.verifyCode);

	/*
	app.get('/venueOwnerFix' , function(req , res) {
		var Venue = require('./models/Venue');

		Venue
		.find()
		.exec(function(err , venues) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(200);

				for (var i = 0; i < venues.length; i++) {
					var venue = venues[i];

					if (venue.ownerInfo != undefined && venue.ownerInfo.owner != undefined) {
						venue.ownerStatus = Venue.OWNER_STATUS_APPROVED;
					}
					else {
						venue.ownerStatus = Venue.OWNER_STATUS_NO_REQUEST;
					}

					venue.save(function(err) {
						if (err) {
							console.log(err);
						}
					});
				};
			}
		});
	});
*/
	/*
	app.post('/tempUpdate' , function(req , res) {
		var venueId 		  = req.body.venueId;
		var mobilePhoneNumber = req.body.mobilePhoneNumber;
		var phoneNumber 	  = req.body.phoneNumber;
		var operatingHours    = req.body.operatingHours;

		if (venueId == undefined) {
			res.send(400);
			return;
		}

		Venue
		.findOne({_id : venueId})
		.exec(function(err , result) {
			result.mobilePhoneNumber = mobilePhoneNumber;
			result.phoneNumber       = phoneNumber;
			result.operatingHours 	 = VenueServiceHelpers.adjustOperatingHours(operatingHours);
			result.save(function(err) {
				if(err) {
					console.log(err);
					res.send(400);
				}
				else {
					res.send(200);
				}
			});
		});
	});
*/


/*
	app.get('/keywordFixVenue' , function(req , res) {
		var Venue = require('./models/Venue');
		var Util  = require('./util/Util');

		Venue
		.find()
		.select('name keywords')
		.exec(function(err , results) {

			console.log(results.length);

			for (var i = 0; i < results.length; i++) {
				var venue = results[i];
				var name = venue.name;

				var nameLowerCase = name.toLowerCase();
				var convertedName = Util.convertAccentedCharacters(nameLowerCase);  // convert all turkish vs characters into english form (ex : ç -> c)
				var keywords      = convertedName.trim().split(/\s+/);              // trim and split by whitespace

				console.log("NAME  ----->  " + nameLowerCase + "  CONVERTED NAME -----> " + convertedName);

				
				var keywordArray = [];
				for (var j = 0; j < keywords.length; j++) {
					var newKeyword = {
						order   : j,
						keyword : keywords[j]
					};
					keywordArray.push(newKeyword);	
				}

				keywordArray.push({
					order   : 0,
					keyword : convertedName
				});
				
				venue.keywords = keywordArray;
				venue.save(function(err) {
					if (err) {
						console.log(err);
					}
					else {
						console.log('Saved.');
					}
				});
				
			};
		});

		res.send(200);
	});

	app.get('/keywordFixProduct' , function(req , res) {
		var Product = require('./models/Product');
		var Util  = require('./util/Util');

		Product
		.find({'keywords.keyword' : new RegExp('^' + '.*(oe).*|.*(ue).*|.*(Oe).*|.*(Ue).*')})
		.select('nameEn nameTr keywords')
		.exec(function(err , results) {

			console.log(results.length);

			for (var j = 0; j < results.length; j++) {
				var product = results[j];
				var nameEn = product.nameEn;
				var nameTr = product.nameTr;

				console.log(nameEn + " " + nameTr);

				
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

				
				product.keywords = keywordArray;
				product.save(function(err) {
					if(err) {
						console.log(err);
					}
					else {
						console.log("Saved.");
					}
				});
				
				
			};
		});

		res.send(200);
	});

	app.get('/keywordFixCategory' , function(req , res) {
		var Category = require('./models/Category');
		var Util  = require('./util/Util');

		Category
		.find({'keywords.keyword' : new RegExp('^' + '.*(oe).*|.*(ue).*|.*(Oe).*|.*(Ue).*')})
		.select('nameEn nameTr keywords')
		.exec(function(err , results) {

			console.log(results.length);

			for (var j = 0; j < results.length; j++) {
				var category = results[j];
				var nameEn = category.nameEn;
				var nameTr = category.nameTr;

				console.log(nameEn + " " + nameTr);

				
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

				
				category.keywords = keywordArray;
				category.save(function(err) {
					if(err) {
						console.log(err);
					}
					else {
						console.log("Saved.");
					}
				});
				
				
			};
		});

		res.send(200);
	});
*/


	/*
	app.get('/fix' , function(req ,res) {
		var VenueService = require('./services/VenueService');
		VenueService.fix();
		res.send(200);
	});
	*/

	/*
	app.get('/phoneNumberFix' , function(req , res) {

		var Venue = require('./models/Venue');

		res.send(200);

		Venue
		.find()
		.select('phoneNumber mobilePhoneNumber')
		.exec(function(err , venues) {
			if (err) {
				console.log(err);
			}
			else {
				for (var i = 0; i < venues.length; i++) {
					var phoneNumber       = venues[i].phoneNumber;
					var mobilePhoneNumber = venues[i].mobilePhoneNumber;

					var newPhoneNumber       = null;
					var newMobilePhoneNumber = null;

					//console.log(phoneNumber + ' ' + mobilePhoneNumber);

					if (phoneNumber != undefined && phoneNumber.length != 0) {
						if (phoneNumber.charAt(0) == '+') {
							// do nothing
						}
						else if(phoneNumber.charAt(0) == '0') {
							newPhoneNumber = '+9' + phoneNumber;
						}
						else {
							newPhoneNumber = '+90' + phoneNumber;
						}
					}

					if (mobilePhoneNumber != undefined && mobilePhoneNumber.length != 0) {
						if (mobilePhoneNumber.charAt(0) == '+') {
							// do nothing
						}
						else if(mobilePhoneNumber.charAt(0) == '0') {
							newMobilePhoneNumber = '+9' + mobilePhoneNumber;
						}
						else {
							newMobilePhoneNumber = '+90' + mobilePhoneNumber;
						}
					}

					if (newPhoneNumber != null) {
						console.log(phoneNumber + '--------' + newPhoneNumber);
						venues[i].phoneNumber = newPhoneNumber;
					}

					if (newMobilePhoneNumber != null) {
						console.log(mobilePhoneNumber + '--------' + newMobilePhoneNumber);	
						venues[i].mobilePhoneNumber = newMobilePhoneNumber;
					}


					if (newPhoneNumber || newMobilePhoneNumber) {
						console.log(' ');
						venues[i].save(function(err) {
							if (err) {
								console.log(err);
							}
						});
					}

				};
			}
		});

	});
	*/

}
