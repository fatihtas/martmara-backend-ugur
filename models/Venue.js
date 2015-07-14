var mongoose  = require('../config/mongoose');
var Schema    = mongoose.Schema;

var STATUS_WAITING_APPROVAL = 2;
var STATUS_APPROVED 		= 3;
var STATUS_DENIED			= 4;

var OWNER_STATUS_PENDING    = 1;
var OWNER_STATUS_NO_REQUEST = 2;
var OWNER_STATUS_APPROVED   = 3;


var VenueSchema = Schema({
	status            : {type : Number , default : STATUS_APPROVED , index : true},
	name              : String,
	foursquareId      : String,
	website			  : String,
	email			  : String,
	phoneNumber 	  : String,
	mobilePhoneNumber : String,
	address			  : String,
	city   			  : String,
	country 		  : String,
	operatingHours    : [{
		_id			  	  : false,
		dayOfTheWeek  	  : Number,
		openingHour   	  : Number,
		closingHour   	  : Number,
		closingExtra      : Number,
		openingHourString : String,
		closingHourString : String
	}],
	rating			  : Number,
	ratingCount       : Number,
	location 		  : {type  : [Number] , index : '2dsphere'},
	categories        : {type: [{ type: Schema.Types.ObjectId, ref: 'Category' }], index: true },
	supplyChains      : {type: [{ type: Schema.Types.ObjectId, ref: 'SupplyChain' }]},
	ownerInfo 		  : {
		_id			  : false,
		owner 		  : {type : Schema.Types.ObjectId , ref : 'User'},
		taxNumber	  : String,
		taxOffice     : String,
		businessId	  : String,
		phoneNumber   : String
	},

	ownerStatus       : {type : Number, default : OWNER_STATUS_NO_REQUEST , index : true},

	claimRequests     : [{
		owner 		  : {type : Schema.Types.ObjectId , ref : 'User'},
		taxNumber	  : String,
		taxOffice     : String,
		businessId	  : String,
		phoneNumber   : String
	}],

	creator			  : {type : Schema.Types.ObjectId , ref : 'User'},
	creationDate      : {type : Date , default : Date.now},

	media : {
		_id			  	  : false,
		exteriorPhoto 	  : String,
		interiorPhoto1    : String,
		interiorPhoto2    : String,
		businessCardPhoto : String,
		video 			  : String,
		videoThumbnail 	  : String
	},

	keywords 	: [{
		_id	    : false,
		order   : {type : Number , index : true},
		keyword : {type : String , index : true}
	}]
});

var Venue = mongoose.model('Venue', VenueSchema);

Venue.STATUS_WAITING_APPROVAL = STATUS_WAITING_APPROVAL;
Venue.STATUS_APPROVED 		  = STATUS_APPROVED;
Venue.STATUS_DENIED 		  = STATUS_DENIED;

Venue.OWNER_STATUS_PENDING    = OWNER_STATUS_PENDING;
Venue.OWNER_STATUS_APPROVED   = OWNER_STATUS_APPROVED;
Venue.OWNER_STATUS_NO_REQUEST = OWNER_STATUS_NO_REQUEST;


module.exports = Venue;