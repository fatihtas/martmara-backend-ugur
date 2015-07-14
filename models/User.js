var mongoose  = require('../config/mongoose');
var Schema    = mongoose.Schema;

var bcrypt = require('bcrypt-nodejs');
var jwt    = require('jwt-simple');

var USER_TYPE_SUPER_ADMIN  = 1;
var USER_TYPE_ADMIN 	   = 2;
var USER_TYPE_VENUE_OWNER  = 3;
var USER_TYPE_NORMAL 	   = 4;

var SALT_WORK_FACTOR = 10;	

var GENDER_MALE   = 0;
var GENDER_FEMALE = 1;			

var UserSchema = Schema({
	name 	     : String,
	email        : {type: String , index : {unique : true} },
	password     : String,
	gender 	     : Number,
	dateOfBirth  : Date,
    profileImage : String,
    bookmarks    : {type : [{type : Schema.Types.ObjectId , ref : 'Venue'}]},
	userType     : {type : Number , default : USER_TYPE_NORMAL},
    resetToken   : String,
    resetExpiry  : Date,
    banned       : {type : Boolean , default : false}
});

UserSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password along with our new salt
        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

UserSchema.statics.findByEmail= function (email, cb) {
  this.findOne({ email: email }, cb);
}

var User = mongoose.model('User', UserSchema);

User.USER_TYPE_SUPER_ADMIN = USER_TYPE_SUPER_ADMIN;
User.USER_TYPE_ADMIN       = USER_TYPE_ADMIN;
User.USER_TYPE_VENUE_OWNER = USER_TYPE_VENUE_OWNER;
User.USER_TYPE_NORMAL      = USER_TYPE_NORMAL;


User.GENDER_MALE   = GENDER_MALE;
User.GENDER_FEMALE = GENDER_FEMALE;

module.exports = User;



