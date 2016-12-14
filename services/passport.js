// this is the setup for the passport library which handles Authentication
// we set up a local strategy and a JWT strategy
// The JWT strategy is used to manage the protection of certain routes - see if a user has a valid token???
// The local strategy is used for user signIN. It check against the 'local' database????

// strategy constructor
// set up the options fo rthe strategy
// create the strategy
// tell passport to use the strategy

// This is really just a case of following the documentation

// Tokens are usually sent in the headers of the request (the 'authorization' headr)
// A token is just a String

// Here we are going to get the encrypted token, decrypt it, and see if it resolves to a valid user ID in the DB.
// (the token is encrypted, the password is hashed. Different things
// Hashing is one way
// Encrypting/decrypting is two way

//
// JWT strategy
//

// authentication library
const passport = require('passport');
const User = require('../models/users');
const secret = require('../config.secret');

// Strategy constructor
const JwtStrategy = require('passport-jwt').Strategy;
// Utility function to extract JWT from request obj
const ExtractJwt = require('passport-jwt').ExtractJwt;

// passport-local strategy constructor
const LocalStrategy = require('passport-local');

// //////////////////////////////////////////////////////////////////////////////////
// //////////// JWT STRATEGY ////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////

// Setup options for JWT Strategy
const jwtOptions = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJwt.fromHeader('authorization')
};

// Create JWT Strategy
const jwtLogin = new JwtStrategy(jwtOptions, function (payload, done) {
  // payload contains the decoded JWT token from the request
  // done is a callback function to signify success or failure of the authentication process, very similar to Express' next()

  // Check if user ID in the payload exists in our database
  User.findById(payload.sub, function (err, user) {
    // if something goes wrong during searching for a user, call done with an error and no user (false)
    if (err) return done(err, false);
    // if we find a user, call done with no error and the user
    if (user) done(null, user);
    // if we don't find a user it's not an error, so we return no error and no user.
    else done(null, false);
  });
});

// Tell passport to use this Strategy
passport.use(jwtLogin);
