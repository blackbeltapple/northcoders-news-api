var express = require('express');
var apiRouter = express.Router();
var controllers = require('../Controllers/controllers');

// The reouter is responsible for intercepting the routes, and checking that the request is
// valid before sending request through to controller (and subsequently to the DB)

apiRouter.get('/topics', function (req, res) {
  console.log('you have requested topics');
  controllers.getAllTopics(function (error, data) {
    if (error) res.status(500).send(error);
    res.send(data);
  });
});

apiRouter.get('/topics/:topic_id/articles', function (req, res) {
  var topic = req.params.topic_id;
  console.log('you have requested all articles for ' + topic);
  controllers.getArticlesForTopic(topic, function (error, data) {
    if (error) res.status(500).send(error);
    res.send(data);
  });
});

apiRouter.get('/articles', function (req, res) {
  console.log('you have requested articles');
  controllers.getArticles(function (error, data) {
    if (error) res.status(500).send(error);
    res.send(data);
  });
});

apiRouter.get('/articles/:article_id/comments', function (req, res, next) {
  var article = req.params.article_id;
  console.log('you have requested comments for ' + article);
  controllers.getCommentsForArticle(article, function (error, data) {
    if (error) return next(error);
    res.send(data);
  });
});

// Add a new comment to an article. This route requires a JSON body with a body key and value pair
// e.g: {"body": "This is my new comment"}. It adds the belongs_to key/val from the params
apiRouter.post('/articles/:article_id/comments', function (req, res) {
  var article = req.params.article_id;
  var comment = {
    body: req.body.body,
    belongs_to: article
  };
  // In the router we should check that the request is valid
  if (!req.body.body || typeof req.body.body !== 'string') {
    // if not got req.body.body then **RETURN  res.status 400 plus msg
    return res.status(400).json({error: 'comment body must have a comment of type string'})
  }
  controllers.postComment(article, comment, function (error, data) {
    if (error) res.status(500).send(error);
    res.send(data);
  });
});

// PUT /api/articles/:article_id
// ```
// Increment or Decrement the votes of an article by one. This route requires a vote query of 'up' or 'down'
// e.g: /api/articles/:article_id?vote=up
apiRouter.put('/articles/:article_id', function (req, res) {
  var article = req.params.article_id;
  var query = req.query.vote;
  console.log('**********', article, query);
  // console.log('you have requested comments for ' + article + '. Comment: ' + commentBody);
  controllers.articleVotes(article, query, function (error, data) {
    if (error) res.status(500).send(error);
    res.send(data);
  });
});

apiRouter.delete('/comments/:comment_id', function (req, res) {
  var comment = req.params.comment_id;
  // console.log('you have requested deletion of comment- ' + comment);
  controllers.deleteComment(comment, function (error, data) {
    if (error) res.status(500).send(error);
    res.send(data);
  });
});

//  get   users/

apiRouter.get('/users/', function (req, res) {
  controllers.getUsers(function (error, data) {
    if (error) res.status(500).send(error);
    res.send(data);
  });
});

//  get   users/:username

apiRouter.get('/users/:username', function (req, res) {
  var user = req.params.username;
  // console.log('you have requested details of user ' + user);
  controllers.getUser(user, function (error, data) {
    if (error) res.status(500).send(error);
    res.send(data);
  });
});

module.exports = apiRouter;
