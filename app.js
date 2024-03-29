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
	app.use(express.urlencoded());
	app.use(express.json());
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

	var httpServer = http.createServer(app).listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});

	var Venue = require('./models/Venue');
	var VenueServiceHelpers = require('./services/VenueService').VenueServiceHelpers;


	var MessageService = require('./services/MessageService');
	app.post('/messages/sendVerificationCode' , TokenAuth.authenticate , MessageService.sendVerificationCode);
	app.post('/messages/verifyCode'           , TokenAuth.authenticate , MessageService.verifyCode);
	
}
