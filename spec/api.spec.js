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
        console.log('idsObj ', idsObj)
        usefulIds = idsObj;
        done();
      })
    })
  });
  // This route isn't supported but will test that it returns 404
  describe('GET /api', function () {
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
  describe('GET /api/topics', function () {
    it('should return status 200, and correct body', function (done) {
      //      request('http://localhost:3090/api')  // this is equivalent to request(ROOT)
      request(ROOT)
        .get('/topics')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(3);
          expect(res.body[0].title).to.equal('Football');
          res.body.forEach(function(element){
            expect(element).to.have.all.keys('title', 'slug', '__v', '_id');
          })
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
  describe('GET /api/topics/:topic_id/articles', function () {
    it('should return status 200 and body containing array with 1 article', function (done) {
      request(ROOT)
        .get('/topics/cats/articles')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(1);
          done();
        });
    });
  });
  describe('GET /api/topics/:(unknown)topic_id/articles - known route but unknown param', function () {
    it('should return status 404', function (done) {
      request(ROOT)
        .get('/topics/ca/articles')
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(0);
          done();
        });
    });
  });
  describe('POST /api/articles/:article_id/comments (valid article, valid comment obj)', function () {
    it('should post a comment to given article with username NC', function (done) {
      request(ROOT)
        .post(`/articles/${usefulIds.article_id}/comments`)
        .send({body: 'test comment'})     // do a post, and the .send is the comment that you want to send!
        // .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.all.keys('body', 'belongs_to', 'created_at', 'created_by', 'votes', '__v', '_id');
          expect(res.body.body).to.equal('test comment');
          expect(res.body.belongs_to).to.equal(`${usefulIds.article_id}`);
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
          // console.log(res.body.error);
          // res.body.error is set by us in api router
          expect(res.body.error).to.equal('comment body must have a comment of type string');
          done();
        });
    });
    xit('should return an error if article_id is not found', function (done) {
      request(ROOT)
        .post(`/articles/${usefulIds.nonexistant_article_id}/comments`)
        .send({body: 'test comment'})     // do a post, and the .send is the comment that you want to send!
        // .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(400);
          // res.body.error is set by us in api router
          expect(res.body.error).to.equal('comment body must have a comment of type string');
          done();
        });
    });
  })
  // Should we be handling this error in our controller?
  describe('POST /api/articles/:article_id/comments (valid article, invalid comment obj)', function () {
    xit('should return status 500 ??', function (done) {
      var tmpString = `/articles/${usefulIds.article_id}/comments`;
      request(ROOT)
        .post(tmpString) //.post and .send work together. .post is saying you want to
        .send({comment: 'test comment' })                   // do a post, and the .send is the body that you want to send!
        // .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(400);
          done();
        });
    });
  });
  after(function (done) {
    // clear the DB
    mongoose.connection.db.dropDatabase();
    done();
  });
})
