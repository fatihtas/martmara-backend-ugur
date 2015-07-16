var mongoose = require ("mongoose");

var uristring = process.env.MONGOLAB_URI;
//var uristring = 'mongodb://127.0.0.1:27017/martmara';

// Production
//uristring = 'mongodb://admin:martmara8790@ds051770-a0.mongolab.com:51770/heroku_app31071968';


// Development
//var uristring = 'mongodb://admin:martmara8790@ds043190.mongolab.com:43190/heroku_app28700353';

if (uristring == undefined) {
  // Defaults to development
  uristring = 'mongodb://admin:martmara8790@ds043190.mongolab.com:43190/heroku_app28700353';
}

var theport = process.env.PORT || 5000;

//mongoose.set('debug' , true);

mongoose.connect(uristring, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + uristring);
  }
});

var paginate = require('paginate')({
    mongoose: mongoose
});

module.exports = mongoose;