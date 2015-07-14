var mongoose  = require('../config/mongoose');
var Schema    = mongoose.Schema;

var UserThanksSchema = Schema({
    thanksReceiverUser : {type : Schema.Types.ObjectId , ref : 'User'},
    thanksGiverUser    : {type : Schema.Types.ObjectId , ref : 'User'},
    venue              : {type : Schema.Types.ObjectId , ref : 'Venue'},
    date               : {type : Date , default : Date.now}
});

var UserThanks = mongoose.model('UserThanks' , UserThanksSchema);

module.exports = UserThanks;