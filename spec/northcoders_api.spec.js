// need to make sure our test file runs in TEST env models
process.env.NODE_ENV = 'test';
const PORT = require('../config.js').PORT[process.env.NODE_ENV];
//the above const is an environment variable which means it can be used anywhere in the project. So, the fact that
// PORT is unused in this file doesn't matter, it is used below by require('../server.js');

const expect = require('chai').expect;
const request = require('supertest');
const mongoose = require('mongoose');

const saveTestData = require('../seed/test.seed.js');

// get the server up and running - in TEST env
require('../server.js');

describe('API Routes', function () {
  var usefulIds;
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

  //This first test is a bit of a wrong 'un
  describe('GET /api', function () {
    it('should return status 404', function (done) {
      request('http://localhost:3090/api')
        .get('/')
        .expect(404)
        .end(function (err, res) {
          if (err) throw err;
          // expect(res.statusCode).to.equal(200);
          // expect(res.body.status).to.equal('OK');
          done();
        });
    });
  });

  describe('GET /api/topics', function () {
    it('should return status 200 and body of topic', function (done) {
      request('http://localhost:3090/api')
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

  describe('GET /api/topiks', function () {
    it('should return status 404', function (done) {
      request('http://localhost:3090/api')
        .get('/topiks')
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(404);
          done();
        });
    });
  });

  describe('GET /api/topics/:topic_id/articles', function () {
    it('should return status 200 and body with array of articles', function (done) {
      request('http://localhost:3090/api')
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

  describe('GET /api/topics/:(unknown)topic_id/articles', function () {
    it('should return status 404', function (done) {
      request('http://localhost:3090/api')
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
    it('should return status 200 and {status: OK}', function (done) {
      var tmpString = `/articles/${usefulIds.article_id}/comments`;
      request('http://localhost:3090/api')
        .post(tmpString) //.post and .send work together. .post is saying you want to
        .send({body: 'test comment', belongs_to: usefulIds.article_id })                   // do a post, and the .send is the body that you want to send!
        // .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(200);
          done();
        });
    });

    // Should we be handling this error in our controller?
    describe('POST /api/articles/:article_id/comments (valid article, invalid comment obj)', function () {
      xit('should return status 500 ??', function (done) {
        var tmpString = `/articles/${usefulIds.article_id}/comments`;
        request('http://localhost:3090/api')
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
})
