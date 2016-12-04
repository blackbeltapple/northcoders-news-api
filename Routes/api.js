var express = require('express');
var apiRouter = express.Router();
var controllers = require('../Controllers/controllers');

// The reouter is responsible for intercepting the routes, and checking that the request is
// valid before sending request through to controller (and subsequently to the DB). If
// request or body is not valid = don't send to DB. Can either do:
// return res.status(400).json({error: 'comment body must have a comment of type string'})
// or something like (pass errr to middleware)
// return next({myconsistenterrorkeyname: 'meaningful error msg' })

apiRouter.get('/topics', function (req, res) {  // matches original NC New API
  controllers.getAllTopics(function (error, data) {
    if (error) res.status(500).send(error);
    res.send({topics: data});
  });
});

apiRouter.get('/topics/:topic_id/articles', function (req, res) { // matches original NC New API
  var topic = req.params.topic_id;
  controllers.getArticlesForTopic(topic, function (error, data) {
    if (error) res.status(500).send(error);
    res.send({articles: data});
  });
});

apiRouter.get('/articles', function (req, res) {   // matches original NC New API
  controllers.getArticles(function (error, data) {
    if (error) res.status(500).send(error);
    res.send({articles: data});
  });
});


apiRouter.get('/articles/:article_id/comments', function (req, res, next) { // matches original NC New API
  var article = req.params.article_id;
  controllers.getCommentsForArticle(article, function (error, data) {
    if (error) return next(error);
    res.send({comments: data});
  });
});

// Add a new comment to an article. This route requires a JSON body with a body key and value pair
// e.g: {"body": "This is my new comment"}. It adds the belongs_to key/val from the params
apiRouter.post('/articles/:article_id/comments', function (req, res) {   // matches original NC New API
  var article = req.params.article_id;
  var comment = {
    body: req.body.comment,
    belongs_to: article
  };
  // In the router we should check that the request is valid
  if (!req.body.comment || typeof req.body.comment !== 'string') {
    // if not got req.body.body then **RETURN  res.status 400 plus msg
    return res.status(400).json({reason: 'comment body must have a comment key of type string'});
  }
  controllers.postComment(article, comment, function (error, data) {
    if (error) res.status(500).send(error);
    res.send({comment: data});
  });
});

// Increment or Decrement the votes of an article by one. This route requires a vote query of 'up' or 'down'
// e.g: /api/articles/:article_id?vote=up
apiRouter.put('/articles/:article_id', function (req, res) {  // matches original NC New API
  if (!req.query.vote || typeof req.query.vote !== 'string' ||
    (req.query.vote !== 'up' && req.query.vote !== 'down')) {
      // return here before calling controller, and send new error msg
    return res.status(400).json({reason: 'URL should include a query of \'vote=up\' or \'vote=down\''});
  }
  controllers.articleVotes(req.params.article_id, req.query.vote, function (error, data) {
    if (error) res.status(500).send(error);
    res.send(data);
  });
});

// Increment or Decrement the votes of a comment by one.
apiRouter.put('/comments/:comment_id', function (req, res) {   // ?? cannot test the match with original
  if (!req.query.vote || typeof req.query.vote !== 'string' ||
    (req.query.vote !== 'up' && req.query.vote !== 'down')) {
      // return here before calling controller, and send new error msg
    return res.status(400).json({reason: 'URL should include a query of \'vote=up\' or \'vote=down\''});
  }
  controllers.commentVotes(req.params.comment_id, req.query.vote, function (error, data) {
    if (error) res.status(500).send(error);
    res.send(data);
  });
});

apiRouter.delete('/comments/:comment_id', function (req, res) {   // Orig NC API doesn't return any data, just status 200
  var comment = req.params.comment_id;
  controllers.deleteComment(comment, function (error, data) {
    if (error) res.status(500).send(error);
    res.send(data);
  });
});

apiRouter.get('/users/', function (req, res) {    // matches original NC New API
  controllers.getUsers(function (error, data) {
    if (error) res.status(500).send(error);
    res.send({users: data});
  });
});

apiRouter.get('/users/:username', function (req, res) {   // matches original NC New API
  var user = req.params.username;
  controllers.getUser(user, function (error, data) {
    if (error) res.status(500).send(error);
    res.send({users: data});
  });
});

module.exports = apiRouter;
