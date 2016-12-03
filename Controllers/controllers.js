const topicDoc = require('../models/topics.js');
const articleDoc = require('../models/articles.js');
const CommentDoc = require('../models/comments.js');
const usersDoc = require('../models/users.js');

const getAllTopics = function (callback) {
  topicDoc.find({}, function (error, docs) {
    if (error) return callback(error);
    callback(null, docs);
  });
};

const getArticlesForTopic = function (topic, callback) {
  articleDoc.find({belongs_to: topic}, function (error, docs) {
    if (error) return callback(error);
    callback(null, docs);
  });
};

const getArticles = function (callback) {
  articleDoc.find(function (error, docs) {
    if (error) return callback(error);
    callback(null, docs);
  });
};

const getCommentsForArticle = function (article, callback) {
  // 58402fcc631cf52f0f1362e0
  CommentDoc.find({belongs_to: article}, function (error, docs) {
    if (error) return callback(error);
    callback(null, docs);
  });
};

const postComment = function (article, comment, callback) {
  var newComment = new CommentDoc(comment);
  // DB connection error is possible here
  newComment.save(function (error, docs) {
    if (error) {
      // could customise the error msgs here and send back an obj that contain the error
      callback(error);
      return;
    }
    callback(null, docs);
  });
};

const articleVotes = function (article_id, upOrDown, callback) {
  var incNum;
  if (upOrDown === 'up') incNum = 1;
  else if (upOrDown === 'down') incNum = -1;
  articleDoc.findByIdAndUpdate(article_id, {$inc: {votes: incNum}}, {new: true}, function (error, data) {
    if (error) return callback(error);
    callback(null, data);
  });
};
const commentVotes = function (comment_id, upOrDown, callback) {
  var incNum;
  if (upOrDown === 'up') incNum = 1;
  else if (upOrDown === 'down') incNum = -1;
  CommentDoc.findByIdAndUpdate(comment_id, {$inc: {votes: incNum}}, {new: true}, function (error, data) {
    if (error) return callback(error);
    callback(null, data);
  });
};
const deleteCommment = function (comment_id, callback) {
  CommentDoc.findByIdAndRemove(comment_id, function (error, data) {
    if (error) return callback(error);
    callback(null, data);
  });
};

const getUsers = function (callback) {
  usersDoc.find({}, function (error, data) {
    if (error) return callback(error);
    callback(null, data);
  });
};

const getUser = function (user, callback) {
  usersDoc.find({username: user}, function (error, data) {
    if (error) return callback(error);
    callback(null, data);
  });
};

module.exports = {
  getAllTopics: getAllTopics,
  getArticlesForTopic: getArticlesForTopic,
  getArticles: getArticles,
  getCommentsForArticle: getCommentsForArticle,
  postComment: postComment,
  articleVotes: articleVotes,
  commentVotes: commentVotes,
  deleteComment: deleteCommment,
  getUsers: getUsers,
  getUser: getUser
};
