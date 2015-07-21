var User = require('../models/User');

var jwt    = require('jwt-simple');
var moment = require('moment');
var appkeys = require('./appkeys');

var JWT_SECRET_TOKEN = appkeys.JWT_SECRET_TOKEN;

module.exports.authenticate = function(req, res, next) {
	var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];

	if (token) {
		try {
	    	var decoded = jwt.decode(token, JWT_SECRET_TOKEN);
	    	// handle token here

	    	if (decoded.exp <= Date.now()) {
				res.send(401);
				return;
			}

			User.findOne({ _id: decoded.iss }, function(err, user) {
				if (user) {
					delete user.password;
					req.user = user;
					next();
				}
				else {
					res.send(401);
					return;
				}
			});

	  	}
	   	catch (err) {
	    	return next();
	  	}
	}
	else {
		next();
	}
};

module.exports.generateToken = function(user) {
	var expires = moment().add(30 , 'days').valueOf();
	var token = jwt.encode(
		{
			iss: user._id,
			exp: expires
		},
		JWT_SECRET_TOKEN
	);

	return token;
};
