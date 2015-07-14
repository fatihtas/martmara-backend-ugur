var mongoose  = require('../config/mongoose');
var Schema    = mongoose.Schema;

var PhoneVerificationSchema = Schema({
	code    : Number,
	expires : {type : Date , default : Date.now , expires : 130},
	user    : {type : Schema.Types.ObjectId , ref : 'User'}
});

PhoneVerificationSchema.index({ "venue": 1, "date" : 1 });

var PhoneVerification = mongoose.model('PhoneVerification' , PhoneVerificationSchema);

module.exports = PhoneVerification;