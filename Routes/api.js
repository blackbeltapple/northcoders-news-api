var express = require('express');
var apiRouter = express.Router();
var controllers = require('../Controllers/controllers')

apiRouter.get('/topics', function(req, res){
  console.log('you have requested topics');
  controllers.getAllTopics(function(error, data){
    if (error) res.status(500).send(error);
    res.send(data);
  });
});

module.exports = apiRouter;