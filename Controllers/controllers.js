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
  commentDoc.find({belongs_to: article}, function(error, docs){
    if (error) return callback(error);
    callback(null, docs);
  })
}

module.exports = {
  getAllTopics: getAllTopics,
  getArticlesForTopic: getArticlesForTopic,
  getArticles: getArticles,
  getCommentsForArticle: getCommentsForArticle


}