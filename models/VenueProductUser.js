var mongoose  = require('../config/mongoose');
var Schema    = mongoose.Schema;

var CURRENCY_TL   = 1;
var CURRENCY_USD  = 2;
var CURRENCY_EURO = 3;

var VenueProductUserSchema = Schema({
	venue   	 : {type : Schema.Types.ObjectId , ref : 'Venue'},
	product 	 : {type : Schema.Types.ObjectId , ref : 'Product'},
	user    	 : {type : Schema.Types.ObjectId , ref : 'User'},
	rating  	 : Number,
	review  	 : String,
	price        : Number,
	currency     : Number,
	unit         : Number,
	creationDate : {type : Date , default : Date.now}
});

var VenueProductUser = mongoose.model('VenueProductUser' , VenueProductUserSchema);

VenueProductUser.CURRENCY_TL   = CURRENCY_TL;
VenueProductUser.CURRENCY_USD  = CURRENCY_USD;
VenueProductUser.CURRENCY_EURO = CURRENCY_EURO;

module.exports = VenueProductUser;