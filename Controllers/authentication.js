const User = require('../models/users');
var configSecret = require('../config.secret');  // a secret config file - in gitignore - do not share
const jwt = require('jwt-simple');

// this is a function to create a JWT token for the user
function tokenForUser (user) {
  const timestamp = new Date().getTime();
  return jwt.encode({
    sub: user.id,
    iat: timestamp
  }, configSecret.secret);
}

// In here we are going to check if the user is valid and if so, give them a token.
// The user is sending username and password via the req.body
//   check that the user exists in DB
//    check that the user sent password matches the one in the db
function signin (req, res, next) {
  // res.send({msg: "hi"})
  // User has already been authenticated
  // Passport puts the user under the request object. NICE!
  // Send JWT and user info
  const {username, name, avatar_url} = req.user;
  res.send({
    token: tokenForUser(req.user),
    user: {username, name, avatar_url}
  });
}

// eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1ODUxNzhlYzAzNDI5YTcxYzhhNGNlYzUiLCJpYXQiOjE0ODE3MzYzODkzNjV9.4vKiVDC-1oKJ1A7dlLgBtF4C2gBj0BnE0zefrb7pAJg

function signup (req, res, next) {
  // this function will receive req.body containing username and password
  var username = req.body.username;
  var name = req.body.name;
  var password = req.body.password;
// validation
  if (!username || !password || !name) {
    return res.status(422).send({
      error: 'You must provide username, name and password'
    });
  }
  // check if a user was passed
  User.findOne({username: username}, function (err, existingUser) {
    if (err) return next(err);

    // check if an existing user exists
    // if exists, respond with an error
    if (existingUser) {
      // 422 = unprocessable entity
      return res.status(422).send({error: 'Username is in use'});
    }
    // if doesn't exist, create, save and respond OK.
    // after the save function you only need return certain parts of the user doc to the client
    const user = new User({username, name, password});
    const avatar_url = user.avatar_url;
    user.save(function (err) {
      if (err) return next(err);
      return res.json({
        token: tokenForUser(user),
        user: {
          username: username,
          name: name,
          avatar_url: avatar_url
        }
      });
    });

  });
}

module.exports = {
  signup: signup,
  signin: signin
};
