var FacebookTokenStrategy = require('passport-facebook-token').Strategy;
var TokenAuth             = require('./TokenAuth');
var User                  = require('../models/User');
var appkeys 		  = require('./appkeys');


/*
old
var FACEBOOK_CLIENT_ID     = "1522281331351038";
var FACEBOOK_CLIENT_SECRET = "5290021aaaf15d0f770b3b6541519a6b";
*/

/*
old
var FACEBOOK_CLIENT_ID     = "1494519767479619";
var FACEBOOK_CLIENT_SECRET = "56b4a4400047a4d4d3d6fe8b6045f733";
*/

var FACEBOOK_CLIENT_ID = appkeys.FACEBOOK_CLIENT_ID;
var FACEBOOK_CLIENT_SECRET = appkeys.FACEBOOK_CLIENT_SECRET;

var FacebookAuthConfig = {

  config : function(app , passport) {

      passport.use(new FacebookTokenStrategy({
        clientID          : FACEBOOK_CLIENT_ID,
        clientSecret      : FACEBOOK_CLIENT_SECRET,
        passReqToCallback : true
      },
      function(req ,accessToken, refreshToken, profile, done) {

        console.log(profile);

        var id           = profile._json.id;
        var email        = profile._json.email;
        var name         = profile._json.first_name;
        var surname      = profile._json.last_name;
        var profileImage = "http://graph.facebook.com/" + id + "/picture?type=large";

        // TODO change this query to {accountId}
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
                    name         : name + ' ' + surname,
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
                          req.body.user  = newUser;

                          return done(err, newUser);
                      }
                  });
              }
            }
        });
      }));

      app.post('/user/login/facebook' , passport.authorize('facebook-token') , function(req , res) {
          if (req.body.token != undefined) {
            res.json({ token : req.body.token , user : req.body.user});
          }
          else
            res.send(401);
      });
  }

};

module.exports = FacebookAuthConfig;
