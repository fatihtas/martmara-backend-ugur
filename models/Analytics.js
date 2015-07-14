var mongoose  = require('../config/mongoose');
var Schema    = mongoose.Schema;

var HISTORY_TYPE_VENUE_DISPLAYED 			  = 1;
var HISTORY_TYPE_VENUE_DISPLAYED_AFTER_SEARCH = 2;
var HISTORY_TYPE_PHONE_CLICKED				  = 3;
var HISTORY_TYPE_WEBSITE_CLICKED			  = 4;
var HISTORY_TYPE_GET_DIRECTIONS_CLICKED		  = 5;
var HISTORY_TYPE_SHOPPED_HERE				  = 6;

var CURRENCY_TL   = 1;
var CURRENCY_USD  = 2;
var CURRENCY_EURO = 3;

var AnalyticsSchema = Schema({
	user          : {type : Schema.Types.ObjectId , ref : 'User'},
	venue   	  : {type : Schema.Types.ObjectId , ref : 'Venue' , index : true},
	date 		  : {type : Date , default : Date.now , index : true},
	type          : Number,
	searchKeyword : String
});

AnalyticsSchema.index({ "venue": 1, "date" : 1 });

var Analytics = mongoose.model('Analytics' , AnalyticsSchema);

Analytics.HISTORY_TYPE_VENUE_DISPLAYED 			    = HISTORY_TYPE_VENUE_DISPLAYED;
Analytics.HISTORY_TYPE_VENUE_DISPLAYED_AFTER_SEARCH = HISTORY_TYPE_VENUE_DISPLAYED_AFTER_SEARCH;
Analytics.HISTORY_TYPE_PHONE_CLICKED 		        = HISTORY_TYPE_PHONE_CLICKED;
Analytics.HISTORY_TYPE_WEBSITE_CLICKED 		        = HISTORY_TYPE_WEBSITE_CLICKED;
Analytics.HISTORY_TYPE_GET_DIRECTIONS_CLICKED       = HISTORY_TYPE_GET_DIRECTIONS_CLICKED;
Analytics.HISTORY_TYPE_SHOPPED_HERE 			    = HISTORY_TYPE_SHOPPED_HERE;

Analytics.CURRENCY_TL   = CURRENCY_TL;
Analytics.CURRENCY_USD  = CURRENCY_USD;
Analytics.CURRENCY_EURO = CURRENCY_EURO;

module.exports = Analytics;