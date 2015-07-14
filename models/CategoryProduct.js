var mongoose = require('../config/mongoose');
var Schema   = mongoose.Schema;

var CategoryProductSchema = Schema({
	category : {type : Schema.Types.ObjectId  , ref : 'Category'},
	products : [{type : Schema.Types.ObjectId , ref : 'Product'}]
});

CategoryProductSchema.index({"category": 1} , { unique: true });

var CategoryProduct = mongoose.model('CategoryProduct', CategoryProductSchema);

module.exports = CategoryProduct;