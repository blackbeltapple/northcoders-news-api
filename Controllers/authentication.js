const User = require('../models/users');

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
    // if doesn't exist, create, save and respond OK
    const user = new User({username, name, password});
    const avatar_url = user.avatar_url;
    user.save(function (err) {

      if (err) return next(err);
      console.log('here', err);
      return res.json({
        // token: tokenForUser(user),
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
  signup: signup
};
