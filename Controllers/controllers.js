const topicDoc = require ('../models/topics.js');
const articleDoc = require ('../models/articles.js');
const commentDoc = require ('../models/comments.js');



const getAllTopics = function (callback) {
  topicDoc.find({}, function(error, docs){
    if (error) return callback(error);
    callback(null, docs);
  })
}

const getArticlesForTopic = function (topic, callback) {
  articleDoc.find({belongs_to: topic}, function(error, docs){
    if (error) return callback(error);
    callback(null, docs);
  })
}

const getArticles = function (callback) {
  articleDoc.find(function(error, docs){
    if (error) return callback(error);
    callback(null, docs);
  })
}

const getCommentsForArticle = function (article, callback) {
  // 58402fcc631cf52f0f1362e0
  commentDoc.find({belongs_to: article}, function(error, docs){
    if (error) return callback(error);
    callback(null, docs);
  })
}

const postComment = function (article, comment, callback) {
  // 58402fcc631cf52f0f1362e0
  var newComment = new commentDoc(comment);
  newComment.save(function (error, docs){
    if (error) return callback(error);
    callback(null, docs);
  });
}

const articleVotes = function (article_id, upOrDown, callback) {
  // 58402fcc631cf52f0f1362e0
  var incNum;
  if (upOrDown === 'up') incNum = 1
  else if (upOrDown === 'down') incNum = -1;
  articleDoc.findByIdAndUpdate(article_id, {$inc: {votes: incNum}}, {new: true}, function (error, data) {
    if (error) return callback(error);
    callback(null, data);
  });
}


module.exports = {
  getAllTopics: getAllTopics,
  getArticlesForTopic: getArticlesForTopic,
  getArticles: getArticles,
  getCommentsForArticle: getCommentsForArticle,
  postComment: postComment,
  articleVotes: articleVotes
}
