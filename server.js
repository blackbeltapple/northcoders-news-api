if (!process.env.NODE_ENV) process.env.NODE_ENV = 'dev';

var express = require('express');
var cors = require('cors');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var app = express();
var config = require('./config');
var db = config.DB[process.env.NODE_ENV] || process.env.DB;
var PORT = config.PORT[process.env.NODE_ENV] || process.env.PORT;
var apiRouter = require('./Routes/api.js');
var Authentication = require('./Controllers/authentication');
var passport = require('passport');
const morgan = require('morgan');

require('./services/passport'); // this will execute this file to set up the passport strategy

mongoose.connect(db, function (err) {
  if (!err) {
    console.log(`connected to the Database: ${db}`);
  } else {
    console.log(`error connecting to the Database ${err}`);
  }
});
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });
// This is the equivalent of using CORS below - I think ??
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());

// api routes
app.use('/api', apiRouter);

// authentication routes - signup for new users, signin for existing
const requireSignin = passport.authenticate('local', {session: false});
app.post('/signup', Authentication.signup);
app.post('/signin', requireSignin, Authentication.signin);

app.use(function (err, req, res, next) {
 if(err.name === 'CastError') {
   res.status(500).json({error: {message: 'Northcoders News API: Invalid ID'}})
   next();
 }
});

// The error-handling middleware should always be the last app.use before app.listen
app.use(function (err, req, res, next) {
  console.log(err.reason);
  res.json({reason: 'NC News error'});
});

app.listen(PORT, function () {
  console.log(`listening on port ${PORT}`);
});
