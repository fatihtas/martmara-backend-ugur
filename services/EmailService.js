var nodemailer = require('nodemailer');
var _jade      = require('jade');
var fs         = require('fs');

var SENDER_NAME  = "Martmara Support";
var FROM_ADDRESS = 'adminfg@martmara.com';

var transporter = nodemailer.createTransport({
    service: 'yandex',
    auth: {
        user: FROM_ADDRESS,
        pass: 'ALPEN7369lighty'
    }
});

function sendEmail (toAddress, subject, content){
	var mailOptions = {
    	from    : SENDER_NAME + " <" + FROM_ADDRESS + ">",
    	to      : toAddress,
    	subject : subject,
    	html    : content
  	};
	transporter.sendMail(mailOptions, function(error, info){
		if(error){
			return console.log(error);
		}
		console.log('Message sent: ' + info.response);
	});//send email with error check -yigityol



};


function parseTemplate (templateName , context , callback) {
	var template =  process.cwd() + '/email-templates/' + templateName;

	fs.readFile(template, 'utf8', function(err, file) {
		if (err) {
			callback(err);
		}
		else {
			var compiledTmpl = _jade.compile(file, {filename: template});
			var html 		 = compiledTmpl(context);
			callback(null , html);
		}
	});
}

var EmailService = {

	sendEmail : function(toAddress , subject , content) {
		sendEmail(toAddress , subject , content);
	}

};

module.exports = EmailService;