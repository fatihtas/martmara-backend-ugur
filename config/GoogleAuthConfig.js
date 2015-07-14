var GoogleTokenStrategy = require('passport-google-token').Strategy;
var TokenAuth           = require('./TokenAuth');
var User                = require('../models/User');

/*
var GOOGLE_CLIENT_ID     = "323883066036-jc1jnr0jgd3nnn9np8efa6svn3mbnrom.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = "WnOJPmemU1YzMRs7KjmcWGrO";
*/

var GOOGLE_CLIENT_ID     = "952167144833-9vf9gvuo7j9v69bonosmd9lo9i034p22.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = "N255okeT04i-_4p4ivoI8RmL";


var GoogleAuthConfig = {  
  
  config : function(app , passport) {

      passport.use(new GoogleTokenStrategy({
        clientID          : GOOGLE_CLIENT_ID,
        clientSecret      : GOOGLE_CLIENT_SECRET,
        passReqToCallback : true
      },
      function(req ,accessToken, refreshToken, profile, done) {

        console.log(profile);

        var email        = profile._json.email;
        var name         = profile._json.name;
        var profileImage = profile._json.picture;

        if (name == undefined) {
            name = profile._json.given_name;
        }

        if (email == undefined) {
            return done("email required", null);
        }

        User
        .findOne({email : email})
        .exec(function(err , result) {
            if (err) {
              console.log(err);
              return done(err , null);
            }
            else {

              if (result != undefined) {
                  if (result.profileImage == undefined || result.profileImage.length == 0) {
                    result.profileImage = profileImage;
                    result.save(function(err) {
                      if (err) {
                        console.log(err);
                        return done(err);
                      }
                      else {
                        var token =  TokenAuth.generateToken(result);
                        req.body.token =  token;
                        req.body.user  = result;

                        return done(err, result);
                      }
                    });
                  }
                  else {
                    var token =  TokenAuth.generateToken(result);
                    req.body.token =  token;
                    req.body.user  = result;

                    return done(err, result);
                  }
              }
              else {
                // TODO gender and birthday, maybe some other fields
                  var newUser = new User({
                    email        : email,
                    name         : name,
                    profileImage : profileImage
                  });

                  newUser.save(function(err) {
                      if (err) {
                          console.log(err);
                          return done(err , null);
                      }
                      else {
                          var token = TokenAuth.generateToken(newUser);
                          req.body.token = token;
                          req.body.user = newUser;

                          return done(err, newUser);
                      }
                  });
              }
            }
        });
      }));

      app.post('/user/login/google' , passport.authorize('google-token') , function(req , res) {
          if (req.body.token != undefined) {
            res.json({ token : req.body.token , user :  req.body.user});
          }
          else
            res.send(401);
      });
  }

};

module.exports = GoogleAuthConfig;