var mongoose = require('../config/mongoose');
var Schema   = mongoose.Schema;

var CategorySchema = Schema({
	nameTr 		: String,
	nameEn		: String,
	keywords 	  : [{
		_id		 : false,
		language : String,
		order    : {type : Number , index : true},
		keyword  : {type : String , index : true}
	}]
});

var Category = mongoose.model('Category', CategorySchema);

module.exports = Category;