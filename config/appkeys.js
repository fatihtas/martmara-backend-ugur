//we have one more token in services/VenueService.js, but it's embedded to a json object.
//since i can't try to compile this code at the moment, i won't take risk and I will leave it there for now.

var FACEBOOK_CLIENT_ID     = "1494519767479619";
var FACEBOOK_CLIENT_SECRET = "56b4a4400047a4d4d3d6fe8b6045f733";

var GOOGLE_CLIENT_ID     = "952167144833-9vf9gvuo7j9v69bonosmd9lo9i034p22.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = "N255okeT04i-_4p4ivoI8RmL";

var JWT_SECRET_TOKEN = '4353453?)ASDASD35JDJDJ111'

//  /services/messageservice.js
var accountSID  = 'ACa049468c4507ced1d2aea094773710d6';
var authToken   = '6d68e56aa57aafec4cbd87bac348cf46';
var twilioPhone = "+12017318358";

//  /services/searchservice.js
var FOURSQUARE_CLIENT_ID     = 'SSKIRMC24PBSSQ25VMSD30OSHLMLUNPJ2W0EMQJE1N2EHU5A';
var FOURSQUARE_CLIENT_SECRET = 'RSZO23NOHYMHZXGA5QYW22EBFIDCCS04WCMYVAOEMI3N5VWR';

var MONGO_CONNECTION_STRING = 'mongodb://admin:martmara8790@ds043190.mongolab.com:43190/heroku_app28700353'

exports.FACEBOOK_CLIENT_ID = FACEBOOK_CLIENT_ID;
exports.FACEBOOK_CLIENT_SECRET = FACEBOOK_CLIENT_SECRET;

exports.GOOGLE_CLIENT_ID = GOOGLE_CLIENT_ID;
exports.GOOGLE_CLIENT_SECRET = GOOGLE_CLIENT_SECRET;

exports.JWT_SECRET_TOKEN = JWT_SECRET_TOKEN;

// /services/messageservice.js
exports.accountSID = accountSID;
exports.authToken = authToken;
exports.twilioPhone = twilioPhone;

//  /services/searchservice.js
exports.FOURSQUARE_CLIENT_ID = FOURSQUARE_CLIENT_ID;
exports.FOURSQUARE_CLIENT_SECRET = FOURSQUARE_CLIENT_SECRET;

exports.MONGO_CONNECTION_STRING = MONGO_CONNECTION_STRING;
