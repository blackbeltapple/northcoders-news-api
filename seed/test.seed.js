// This file was given to us with the project

const async = require('async');

const models = require('../models/models');

const topics = [
  new models.Topics({title: 'Football', slug: 'football'}),
  new models.Topics({title: 'Cooking', slug: 'cooking'}),
  new models.Topics({title: 'Cats', slug: 'cats'})
];

const articles = [
  new models.Articles({title: 'Cats are great', body: 'something', belongs_to: 'cats'}),
  new models.Articles({title: 'Football is fun', body: 'something', belongs_to: 'football'}),
  // this next article gets deleted straight away
  new models.Articles({title: 'Coding is tricky', body: 'something', belongs_to: 'coding'})
];

const user = new models.Users({
  username: 'northcoder',
  name: 'Awesome Northcoder',
  avatar_url: 'https://avatars3.githubusercontent.com/u/6791502?v=3&s=200'
});

function saveUser (cb) {
  user.save(err => {
    if (err) cb(err);
    else cb(null);
  });
}

function saveTopics (cb) {
  models.Topics.create(topics, (err) => {
    if (err) cb(err);
    else cb(null);
  });
}

function saveArticles (cb) {
  models.Articles.create(articles, (err, docs) => {
    if (err) cb(err);
    // the following cb takes arg 'docs', which is what gets passed to next function in the waterfall (saveComments)
    else cb(null, docs);
  });
}

function saveComments (articlesArray, cb) {
  // this gets articlesArray from the cb of the previous function (saveArticles)
  const articleId = articlesArray[0]._id;
  // Save the id of the last article, then delete the article
  // This will give us a valid but non-existanat article_id
  const nonArticleId = articlesArray[2]._id;
  models.Articles.findByIdAndRemove(nonArticleId, (error, data) => {
    if (error) return cb(error);
  });
  const comment = new models.Comments({body: 'this is a comment', belongs_to: articleId});
  const comment2 = new models.Comments({body: 'this is another comment', belongs_to: articleId, created_by: 'someone'});
  // in the object below, we save a few useful ids that we will require during testing
  models.Comments.create([comment, comment2], err => {
    if (err) cb(err);
    else cb(null, {article_id: articleId, comment_id: comment._id, non_northcoder_comment: comment2._id, nonexistant_article_id: nonArticleId});
  });
}
/*
This waterfall code uses the asyn**c library which helps manag lots of async calls and callbacks.
The waterfall basically takes an array of functions. These are executed in sequence, each passing its results
to the next function as args. */
function saveTestData (cb) {
  async.waterfall([saveUser, saveTopics, saveArticles, saveComments], (err, ids) => {
    if (err) console.log(err);
    else {
      console.log('Test data seeded successfully.');
      cb(ids);
    }
  });
}

module.exports = saveTestData;
