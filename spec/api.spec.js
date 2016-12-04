/* eslint-env mocha, before, describe, it, xit */

// The purpose of this test suite is to test that the API is behaving
// correctly in terms of what it is sending back to the client. It is
// NOT to interrogate the database and check that items have been added
// and deleted.  We are just testing that the RESPONSE is correct, i.e.
// the status number,
// the length of res.body,
// the content of res.body,
// that res.body contains the correct keys. We need to test that PUT and
// POST requests return the new/editted data to the client - this
// is convention. The client should receive the new full mongo document.
// They may well need the _id that the DB created.
// We can also test that the schemas are working correctly
// I'm guessing there should be one describe block per route?
// -------------------------------------------------------------

// need to make sure our test file runs in TEST env models
process.env.NODE_ENV = 'test';
const PORT = require('../config.js').PORT[process.env.NODE_ENV];
// The above const is an environment variable
// PORT is unused in this file, but is used in server.js

const expect = require('chai').expect;
const request = require('supertest');
const mongoose = require('mongoose');
const saveTestData = require('../seed/test.seed.js');

// PORT = 3090
const ROOT = `http://localhost:${PORT}/api`;
// ROOT = http://localhost:3090/api

// get the server up and running - in TEST env
// this require pulls in the code from server.js AND EXECUTES IT
require('../server.js');

describe('API Routes', function () {
  var usefulIds;
  // the before 'hook' runs before the whole test suite
  // (if you want one to run before every test then you should use Before Each)
  before(function (done) {
    mongoose.connection.once('connected', function () {
      mongoose.connection.db.dropDatabase();
      saveTestData(function (idsObj) {
        usefulIds = idsObj;
        done();
      });
    });
  });
  // TODO GET articles should also retreve the number of comments
  // TODO params should handle uppercase and lowercase versions - NC news only handles lowercase!
  // TODO should prevent comment deletion if name is not northcoders

  describe('GET /api/topics', function () {
    it('should return status 200, and correct body', function (done) {
      request(ROOT)
        .get('/topics')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(200);
          expect(res.body.topics).to.be.an('array');
          expect(res.body.topics.length).to.equal(3);
          res.body.topics.forEach(function (element) {
            expect(element).to.have.all.keys('title', 'slug', '__v', '_id');
          });
          done();
        });
    });
  });

  describe('GET /api/topics/:topic_id/articles', function () {
    it('should return status 200 and body containing array with 1 article', function (done) {
      request(ROOT)
        .get('/topics/cats/articles')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(200);
          expect(res.body.articles).to.be.an('array');
          expect(res.body.articles.length).to.equal(1);
          done();
        });
    });
    it('should return status 404 for unknown topic', function (done) {
      request(ROOT)
        .get('/topics/ca/articles')
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(200);
          expect(res.body.articles).to.be.an('array');
          expect(res.body.articles.length).to.equal(0);
          done();
        });
    });
  });
  describe('GET /api/articles', function () {
    it('should return status 200 and array of articles', function (done) {
      request(ROOT)
        .get('/articles')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(200);
          expect(res.body.articles).to.be.an('array');
          expect(res.body.articles.length).to.equal(2);
          res.body.articles.forEach(function (element) {
            expect(element).to.have.all.keys('title', 'body', 'belongs_to', 'votes', 'created_by', '__v', '_id');
          });
          done();
        });
    });
  });
  describe('GET /api/articles/:article_id/comments', function () {
    it('should return status 200 and array of comments', function (done) {
      request(ROOT)
        .get(`/articles/${usefulIds.article_id}/comments`)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(200);
          expect(res.body.comments).to.be.an('array');
          expect(res.body.comments.length).to.equal(2);
          res.body.comments.forEach(function (element) {
            expect(element).to.have.all.keys('body', 'belongs_to', 'votes', 'created_at', 'created_by', '__v', '_id');
          });
          done();
        });
    });
  });
  describe('GET /api/users', function () {
    it('should return status 200 and array of users', function (done) {
      request(ROOT)
        .get('/users')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(200);
          expect(res.body.users).to.be.an('array');
          expect(res.body.users.length).to.equal(1);
          expect(res.body.users[0].username).to.equal('northcoder');
          res.body.users.forEach(function (element) {
            expect(element).to.have.all.keys('username', 'name', 'avatar_url', '__v', '_id');
          });
          done();
        });
    });
  });
  describe('GET /api/users/:username', function () {
    it('should return status 200 and array containing single user object', function (done) {
      request(ROOT)
        .get(`/users/northcoder`)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(200);
          expect(res.body.users).to.be.an('array');
          expect(res.body.users.length).to.equal(1);
          expect(res.body.users[0].username).to.equal('northcoder');
          expect(res.body.users[0].name).to.equal('Awesome Northcoder');
          expect(res.body.users[0].avatar_url).to.equal('https://avatars3.githubusercontent.com/u/6791502?v=3&s=200');
          res.body.users.forEach(function (element) {
            expect(element).to.have.all.keys('username', 'name', 'avatar_url', '__v', '_id');
          });
          done();
        });
    });
  });
  describe('PUT /api/articles/:article_id', function () {
    it('should upvote an article, and return the article document', function (done) {
      request(ROOT)
        .put(`/articles/${usefulIds.article_id}?vote=up`)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.be.an('object');
          expect(res.body.title).to.equal('Cats are great');
          expect(res.body).to.have.all.keys('title', 'body', 'belongs_to', 'votes', 'created_by', '__v', '_id');
          expect(res.body.votes).to.equal(1);
          done();
        });
    });
    it('should downvote an article, and return the article document', function (done) {
      request(ROOT)
        .put(`/articles/${usefulIds.article_id}?vote=down`)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.be.an('object');
          expect(res.body.title).to.equal('Cats are great');
          expect(res.body).to.have.all.keys('title', 'body', 'belongs_to', 'votes', 'created_by', '__v', '_id');
          expect(res.body.votes).to.equal(0);
          done();
        });
    });
    it('should return an error if vote query is not up or down', function (done) {
      request(ROOT)
        .put(`/articles/${usefulIds.article_id}?vote=nonsense`)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(400);
          // res.body.reason is set by us in api router
          expect(res.body.reason).to.equal('URL should include a query of \'vote=up\' or \'vote=down\'');
          done();
        });
    });
  });
  describe('PUT /api/comments/:comment_id', function () {
    it('should upvote a comment, and return the comment document', function (done) {
      request(ROOT)
        // .put(`/comments/${usefulIds.comment_id}?vote=up`)
        .put(`/comments/${usefulIds.comment_id}?vote=up`)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.all.keys('body', 'belongs_to', 'created_at', 'created_by', 'votes', '__v', '_id');
          expect(res.body.votes).to.equal(1);
          done();
        });
    });
    it('should downvote a comment, and return the comment document', function (done) {
      request(ROOT)
        .put(`/comments/${usefulIds.comment_id}?vote=down`)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.all.keys('body', 'belongs_to', 'created_at', 'created_by', 'votes', '__v', '_id');
          expect(res.body.votes).to.equal(0);
          done();
        });
    });
    it('should return an error if vote query is not up or down', function (done) {
      request(ROOT)
        .put(`/comments/${usefulIds.comment_id}?vote=nonsense`)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(400);
          // res.body.reason is set by us in api router
          expect(res.body.reason).to.equal('URL should include a query of \'vote=up\' or \'vote=down\'');
          done();
        });
    });
  });
  describe('POST /api/articles/:article_id/comments (valid article, valid comment obj)', function () {
    it('should post a comment to given article with username NC', function (done) {
      request(ROOT)
        .post(`/articles/${usefulIds.article_id}/comments`)
        .send({comment: 'test comment'})     // do a post, and the .send is the comment that you want to send!
        // .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(200);
          expect(res.body.comment).to.be.an('object');
          expect(res.body.comment).to.have.all.keys('body', 'belongs_to', 'created_at', 'created_by', 'votes', '__v', '_id');
          expect(res.body.comment.body).to.equal('test comment');
          expect(res.body.comment.belongs_to).to.equal(`${usefulIds.article_id}`);
          done();
        });
    });
    it('should return an error if do not pass a body with the comment', function (done) {
      request(ROOT)
        .post(`/articles/${usefulIds.article_id}/comments`)
        .send({incorrectbody: 'test comment'})     // do a post, and the .send is the comment that you want to send!
        // .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(400);
          // console.log(res.body.reason);
          // res.body.reason is set by us in api router
          expect(res.body.reason).to.equal('comment body must have a comment key of type string');
          done();
        });
    });
    xit('should return an error if article_id is not found TODO', function (done) {
      request(ROOT)
        .post(`/articles/${usefulIds.nonexistant_article_id}/comments`)
        .send({body: 'test comment'})     // do a post, and the .send is the comment that you want to send!
        // .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(400);
          // res.body.reason is set by us in api router
          expect(res.body.reason).to.equal('comment body must have a comment key of type string');
          done();
        });
    });
    xit('should return ??? TODO if article is valid but no req.body passed', function (done) {
      var tmpString = `/articles/${usefulIds.article_id}/comments`;
      request(ROOT)
        .post(tmpString)      // .post and .send work together. .post is saying you want to
        .send()                   // do a post, and the .send is the body that you want to send!
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(400);
          done();
        });
    });
  });
  describe('DELETE /comments/:comment_id', function () {
    it('should return status 200 and deleted comment', function (done) {
      request(ROOT)
        .delete(`/comments/${usefulIds.comment_id}`)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.all.keys('body', 'belongs_to', 'votes', 'created_at', 'created_by', '__v', '_id');
        });
      done();
    });
  });
  // This route isn't supported but will test that it returns 404
  describe('GET /api (ROOT)', function () {
    it('should return status 404', function (done) {
      request(ROOT)
        .get('/')
        .expect(404)
        .end(function (err, res) {
          if (err) throw err;
          done();
        });
    });
  });
  describe('GET unhandled routes', function () {
    it('/api/topiks should return status 404', function (done) {
      request(ROOT)
        .get('/topiks')
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(404);
          done();
        });
    });
  });
  after(function (done) {
    // clear the DB
    mongoose.connection.db.dropDatabase();
    done();
  });
});
