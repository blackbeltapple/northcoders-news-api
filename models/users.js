var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');


var UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true
  },
  avatar_url: {
    type: String,
    required: true,
    lowercase: true,
    default: 'https://avatar3.githubusercontent.com/u/6791502?v=3&s=200'
  },
  password: {
    type: String,
    required: true
  }
});

// 'on save' hook, encrypt password
// before saving a model, this function will auto run
UserSchema.pre('save', function (next) {
  // the context of this function is an instance of the user model
  const user = this;
  // generate a salt, then run callback
  // 10 is the level of salt added - more is more secure, but takes longer (async)
  bcrypt.genSalt(10, function (err, salt) {
    if (err) { return next(err); }
    // hash (encrypt) our password using the salt (this.password)
    bcrypt.hash(user.password, salt, null, function (err, hashedPassword) {
      console.log('salt')
      if (err) { return next(err); }
      // overwrite plain text password with newly encrypted password
      user.password = hashedPassword;
      next();
    });
  });
});

module.exports = mongoose.model('users', UserSchema);
