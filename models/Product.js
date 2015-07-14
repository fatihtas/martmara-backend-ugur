var mongoose  = require('../config/mongoose');
var Schema    = mongoose.Schema;

var ProductSchema = Schema({
	nameTr 		  : {type : String , index : true},
	nameEn		  : {type : String , index : true},
	keywords 	  : [{
		_id		 : false,
		language : String,
		order    : {type : Number , index : true},
		keyword  : {type : String , index : true}
	}]

});

var Product = mongoose.model('Product' , ProductSchema);

module.exports = Product;