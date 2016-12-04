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

app.use(cors());
app.use(bodyParser.json());
app.use('/api', apiRouter);

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
