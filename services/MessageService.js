var accountSID  = 'ACa049468c4507ced1d2aea094773710d6';
var authToken   = '6d68e56aa57aafec4cbd87bac348cf46';
var twilioPhone = "+12017318358";

var twilio = require('twilio')(accountSID, authToken);

var PhoneVerification = require('../models/PhoneVerification');

var MessageService = {

	sendVerificationCode : function (req , res) {
		var phoneNumber = req.body.phoneNumber;
		var user		= req.user;

		if (phoneNumber == undefined) {
			res.send(400);
			return;
		}

		var randomNumber = 0;

		for (var i = 0; i < 6; i++) {
			var temp = Math.floor(Math.random() *9) + 1;
			randomNumber += temp * Math.pow(10 , i);
		};

		var verification = new PhoneVerification({
			code : randomNumber,
			user : user
		});

		verification.save(function(err) {
			if (err) {
				console.log(err);
			}
		});

		twilio.messages.create({
		    body : randomNumber,
		    to   : phoneNumber,
		    from : twilioPhone
		}, function(err, message) {
			if (err) {
				console.log(err);
			}
			else
				console.log(message.sid);
		});

		res.send(200);
	},

	verifyCode : function(req , res) {
		var code = req.body.code;
		var user = req.user;

		if (code == undefined) {
			res.send(400);
			return;
		}

		PhoneVerification
		.findOne({user : user , code : code})
		.exec(function(err , result) {
			if (err) {
				res.send(400);
				return;
			}
			else {
				if (result) {
					res.send(200);
				}
				else {
					res.send(400);
				}
			}
		});
	}

};

module.exports = MessageService;