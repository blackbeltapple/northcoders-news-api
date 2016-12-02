const mongoose = require('mongoose');

const articleDoc = require('../../models/articles.js');

mongoose.connect('mongodb://localhost/northcoders-news-api', function (error) {
  if (error) {
    console.log(error);
    process.exit();
  }

  articleDoc.find(function (error, data) {
    if (error) {
      console.error(error);
    }
    console.log(data + '\n number of data entries: ' + data.length);
    process.exit();
  });
});
