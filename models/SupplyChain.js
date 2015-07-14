var mongoose = require('../config/mongoose');
var Schema   = mongoose.Schema;

var SupplyChainSchema = Schema({
	nameEn 		: String,
	nameTr      : String,
	keywords 	: [{
		_id	    : false,
		order   : {type : Number , index : true},
		keyword : {type : String , index : true}
	}]
});

var SupplyChain = mongoose.model('SupplyChain', SupplyChainSchema);

module.exports = SupplyChain;