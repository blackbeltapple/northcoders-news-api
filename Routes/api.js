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

apiRouter.get('/topics/:topic_id/articles', function(req, res){
  var topic = req.params.topic_id;
  console.log('you have requested all articles for ' + topic);
  controllers.getArticlesForTopic(topic, function(error, data){
    if (error) res.status(500).send(error);
    res.send(data);
  });
});

apiRouter.get('/articles', function(req, res){
  console.log('you have requested articles');
  controllers.getArticles(function(error, data){
    if (error) res.status(500).send(error);
    res.send(data);
  });
});

apiRouter.get('/articles/:article_id/comments', function(req, res){
  var article = req.params.article_id;
  console.log('you have requested comments for ' + article);
  controllers.getCommentsForArticle(article, function(error, data){
    if (error) res.status(500).send(error);
    res.send(data);
  });
});

// POST /api/articles/:article_id/comments
// ```
// Add a new comment to an article. This route requires a JSON body with a comment key and value pair
// e.g: {"comment": "This is my new comment"}
apiRouter.post('/articles/:article_id/comments', function(req, res){
  var article = req.params.article_id;
  var commentBody = req.body;
  // console.log('you have requested comments for ' + article + '. Comment: ' + commentBody);
  controllers.postComment(article, commentBody, function(error, data){
    if (error) res.status(500).send(error);
    res.send(data);
  });
});


module.exports = apiRouter;
