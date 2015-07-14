var mongoose  = require('../config/mongoose');
var Schema    = mongoose.Schema;

var CURRENCY_TL   = 1;
var CURRENCY_USD  = 2;
var CURRENCY_EURO = 3;

var VenueProductSchema = Schema({
	location      : {type  : [Number] , index : '2dsphere'},
	venue   	  : {type : Schema.Types.ObjectId , ref : 'Venue'},
	product 	  : {type : Schema.Types.ObjectId , ref : 'Product' , index : true},
	rating  	  : {type : Number , default : 0},
	photos   	  : [String],
	price   	  : Number,
	currency      : Number,
	description   : String
});

VenueProductSchema.index({ "product": 1, "venue" : 1 }, { unique: true });
VenueProductSchema.index({ "product": 1, "location" : "2dsphere" });

var VenueProduct = mongoose.model('VenueProduct' , VenueProductSchema);

VenueProduct.CURRENCY_TL   = CURRENCY_TL;
VenueProduct.CURRENCY_USD  = CURRENCY_USD;
VenueProduct.CURRENCY_EURO = CURRENCY_EURO;

module.exports = VenueProduct;