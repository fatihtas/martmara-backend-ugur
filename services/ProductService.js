var Product 		 = require('../models/Product');
var Venue 			 = require('../models/Venue');
var VenueProduct     = require('../models/VenueProduct');
var CategoryProduct  = require('../models/CategoryProduct');
var VenueProductUser = require('../models/VenueProductUser');
var VenueService     = require('./VenueService');
var Util             = require('../util/Util');

var async = require('async');

var ProductServiceHelpers = {

	createProduct : function(product , callback) {
		var newProduct = new Product(ProductServiceHelpers.prepareNewProduct(product));
		newProduct.save(function(err) {
			if (err)
				callback(err);
			else
				callback(null , newProduct);
		});
	},

	prepareNewProduct : function(product) {
		var nameEn   = product.nameEn;
		var nameTr   = product.nameTr;

		if (nameEn == undefined && nameTr == undefined) {
			console.log("Missing product parameters!");
			return;
		}

		var keywordArray = [];

		if (nameEn) {
			var nameEnLowerCase = nameEn.toLowerCase();
			var convertedName   = Util.convertAccentedCharacters(nameEnLowerCase);  // convert all turkish vs characters into english form (ex : ç -> c)
			var keywords        = convertedName.trim().split(/\s+/);                // trim and split by whitespace


			for (var i = 0; i < keywords.length; i++) {
				var newKeyword = {
					order    : i,
					keyword  : keywords[i],
					language : 'en'
				};
				keywordArray.push(newKeyword);
			}

			keywordArray.push({
				order    : 0,
				keyword  : convertedName,
				language : 'en'
			});
		}

		if (nameTr) {
			var nameTrLowerCase = nameTr.toLowerCase();
			var convertedName   = Util.convertAccentedCharacters(nameTrLowerCase);  // convert all turkish vs characters into english form (ex : ç -> c)
			var keywords        = convertedName.trim().split(/\s+/);                // trim and split by whitespace

			for (var i = 0; i < keywords.length; i++) {
				var newKeyword = {
					order    : i,
					keyword  : keywords[i],
					language : 'tr'
				};
				keywordArray.push(newKeyword);
			}

			keywordArray.push({
				order    : 0,
				keyword  : convertedName,
				language : 'tr'
			});
		}

		var newProduct = {
			keywords : keywordArray,
		};
	
		if(nameEn)
			newProduct.nameEn = nameEn;
		if(nameTr)
			newProduct.nameTr = nameTr;

		return newProduct;
	}

};

var ProductService = {

	createProduct : function(req , res) {
		var nameEn = req.body.nameEn;
		var nameTr = req.body.nameTr;

		if (nameEn == undefined && nameTr == undefined) {
			res.send(400);
			return;
		}

		var orArray = [];
		var match   = {};

		if (nameEn != undefined) {
			orArray.push({
				'nameEn' : nameEn,
				'nameTr' : {$exists : false}
			});
		}

		if (nameTr != undefined) {
			orArray.push({
				'nameTr' : nameTr,
				'nameEn' : {$exists : false}
			});
		}

		if (nameTr != undefined && nameEn != undefined) {
			match.nameEn = nameEn;
			match.nameTr = nameTr;

			orArray = undefined;
		}

		var query = Product
					.findOne();

		if (orArray == undefined) {
			query = query.findOne(match);
		}
		else {
			query = query.or(orArray);
		}

		query.exec(function(err , existingProduct) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else if(existingProduct) {
				res.send(400 , {message : 'Product Exists!'});
			}
			else {
				ProductServiceHelpers.createProduct(req.body , function(err , newProduct) {
					if (err) {
						console.log(err);
						res.send(400);
					}
					else {
						res.send(newProduct);
					}
				});
			}
		});
	},

	deleteProduct : function(req , res) {
		var productId = req.body.productId;

		if (productId == undefined) {
			res.send(400);
			return;
		}

		res.send(200);

		Product
		.remove({_id : productId})
		.exec(function(err) {
			if (err) {
				console.log(err);
			}
		});

		VenueProduct
		.remove({product : productId})
		.exec(function(err) {
			if (err) {
				console.log(err);
			}
		});

		VenueProductUser
		.remove({product : productId})
		.exec(function(err) {
			if (err) {
				console.log(err);
			}
		});

		CategoryProduct
		.find()
		.where('products').in([productId])
		.exec(function(err , categoryProducts) {
			if (err) {
				console.log(err);
			}
			else {
				for (var i = 0; i < categoryProducts.length; i++) {
					var categoryProduct = categoryProducts[i];
					var products        = categoryProduct.products;
					var index    		= -1;

					for (var j = 0; j < products.length; j++) {
						var product = products[j];

						if (product == productId) {
							index = j;
							break;
						}
					}

					products.splice(index , 1);

					categoryProduct.products = products;
					categoryProduct.save(function(err) {
						if (err) {
							console.log(err);
						}
					});
				};
			}
		});
	},

	editProduct : function(req , res) {
		var productId = req.body.productId;
		var nameEn    = req.body.nameEn;
		var nameTr    = req.body.nameTr;

		if (productId == undefined || (nameEn == undefined && nameTr == undefined)) {
			res.send(400);
			return;
		}

		var preparedProduct = ProductServiceHelpers.prepareNewProduct({nameEn : nameEn , nameTr : nameTr});

		Product
		.findOne({_id : productId})
		.exec(function(err , product) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				product.nameEn   = preparedProduct.nameEn;
				product.nameTr   = preparedProduct.nameTr;
				product.keywords = preparedProduct.keywords;
				product.save(function(err) {
					if (err) {
						console.log(err);
						res.send(400);
					}
					else {
						res.send(product);
					}
				});
			}
		});
	},

	editVenueProduct : function(req , res) {
		var product     = req.body.product;
		var venue       = req.body.venue;
		var photo       = req.body.photo;
		var price       = req.body.price;
		var currency    = req.body.currency;
		var description = req.body.description;

		if (product == undefined || venue == undefined) {
			res.send(400);
			return;
		}

		async.parallel({

			updateProduct : function(callback) {
				Product
				.findOne({_id : product._id})
				.exec(function(err , result) {
					if (err) {
						callback(err);
					}
					else {
						var updatedProduct = ProductServiceHelpers.prepareNewProduct(product);

						if (updatedProduct.nameEn) 
							result.nameEn = updatedProduct.nameEn;
						if (updatedProduct.nameTr)
							result.nameTr = updatedProduct.nameTr;

						result.keywords = updatedProduct.keywords;
						result.save(callback);
					}
				});
			},

			updateVenueProduct : function(callback) {
				VenueProduct
				.findOne({product : product._id , venue : venue})
				.exec(function(err , result) {
					if (err) {
						callback(err);
					}
					else {
						if (photo) {
							result.photos.push(photo);
						}
						if (price)
							result.price    = price;
						if (currency) 
							result.currency = currency;
						if(description)
							result.description = description;
						
						result.save(callback);
					}
				});
			}

		} , function(err , results) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(200);
			}
		});
	},

	rateProduct : function(req , res) {
		var user    = req.user;
		var rating  = req.body.rating;
		var review  = req.body.review;
		var product = req.body.product;
		var venue   = req.body.venue;

		if (venue == undefined || product == undefined) {
			res.send(400);
			return;
		}

		if (rating == undefined && review == undefined) {
			res.send(400);
			return;
		}

		VenueProductUser
		.findOne()
		.where('user').equals(user._id)
		.where('product').equals(product)
		.where('venue').equals(venue)
		.where('rating').exists()
		.where('rating').ne(0)
		.exec(function(err , result) {
			if (err) {
				console.log(err);
				res.send(400);
				return;
			}

			console.log(result);

			// update previous rating of the user
			if (result) {
				result.rating = rating;
				result.save(function(err) {
					if (err) {
						console.log(err);
						res.send(400);
					}
					else {
						ProductService.calculateProductRating(venue , product , false);
						res.send(200);
					}
				});

				rating = 0;
			}

			var vpu = new VenueProductUser({
				user    : user._id,
				venue   : venue,
				product : product,
				rating  : rating,
				review  : review
			});

			vpu.save(function(err) {
				if (err) {
					console.log(err);
					res.send(400);
				}
				else {
					if (!result)
						ProductService.calculateProductRating(venue , product , true);
					res.send(200);
				}
			});

		});
	},

	calculateProductRating : function(venueId , productId , isNewRating) {
		VenueProductUser
		.find()
		.where('venue').equals(venueId)
		.where('product').equals(productId)
		.exec(function(err , results) {
			if (err) {
				console.log(err);
			}
			else {
				var totalRating = 0;
				var userCount   = 0;

				for (var i = 0; i < results.length; i++) {
					var vpu    = results[i];
					var rating = vpu.rating;

					if (rating != undefined && rating != 0) {
						totalRating += rating;
						userCount ++;
					}
				}

				var newRating = totalRating / userCount;

				VenueProduct
				.findOne({venue : venueId , product : productId})
				.exec(function(err , result) {
					if (err) {
						console.log(err);
					}
					else {

						result.rating = newRating;
						result.save(function(err) {
							if (err) {
								console.log(err);
							}
							else {
								// Product rating changed, update venue rating accordingly
								VenueService.calculateVenueRating(venueId , isNewRating);
							}
						});
					}
				});
			}
		});
	},

	listProductsWithPage : function(req , res) {
		var page = req.body.page;

		if (page == undefined) 
			page = 1;

		Product
		.find()
		.select('-keywords')
		.paginate({page : page , perPage : 25} , function(err , results) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(results);
			}
		});
	},

	getProductPageCount : function(req , res) {
		Product
		.count()
		.exec(function(err , count) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				var p = count / 25;
				
				if(count % 25 > 0) {
					p += 1;
				}

				p = Math.floor(p);
				
				var pageCount = {
					count : p
				};

				res.send(pageCount);
			}
		});
	},

	getProduct : function(req , res) {
		var productId = req.body.productId;

		if (productId == undefined) {
			res.send(400);
			return;
		}	

		Product
		.findOne({_id : productId})
		.exec(function(err , product) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(product);
			}
		});
	},

	getVenueProduct : function(req , res) {
		var venueId   = req.body.venueId;
		var productId = req.body.productId;

		if (venueId == undefined || productId == undefined) {
			res.send(400);
			return;
		}

		VenueProduct
		.findOne({venue : venueId , product : productId})
		.populate('product')
		.exec(function(err , result) {
			if (err || !result) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(result);
			}
		});
	},

	shoppedHere : function(req , res) {
		var venue    = req.body.venue;
		var product  = req.body.product;
		var user     = req.user;
		var price    = req.body.price;
		var currency = req.body.currency;
		var unit     = req.body.unit;
		var review   = req.body.review;

		if (venue == undefined || product == undefined || price == undefined || currency == undefined || unit == undefined || review == undefined) {
			res.send(400);
			return;
		}

		var vpu = new VenueProductUser({
			venue    : venue,
			product  : product,
			user     : user,
			price    : price,
			currency : currency,
			unit     : unit,
			review   : review
		});

		vpu.save(function(err) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(200);
			}
		});
	},

	getComments : function(req , res) {
		var venueId   = req.body.venueId;
		var productId = req.body.productId;
		var maxDate   = req.body.maxDate; 

		if (venueId == undefined || productId == undefined) {
			res.send(400);
			return;
		}

		var query = VenueProductUser
					.find({venue : venueId , product : productId})
					.populate('user');

		if (maxDate) {
			query = query.where('creationDate').lt(maxDate);
		}

		query.exec(function(err , results) {
			if (err) {
				console.log(err);
				res.send(400);
			}
			else {
				res.send(results);
			}
		});
	}
};

module.exports = ProductService;