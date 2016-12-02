// need to make sure our test file runs in TEST env models
process.env.NODE_ENV = 'test';
const PORT = require('../config.js').PORT[process.env.NODE_ENV];

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
    it('should return status 200', function (done) {
      console.log()
      request('http://localhost:3090/api')
        .get('/topics')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(200);
          expect(res.body[0].title).to.equal('Football');
          done();
        });
    });
  });

  describe('POST /api/articles/:article_id/comments', function () {
    xit('should return status 200 and {status: OK}', function (done) {
      request('http://localhost:3090/api')
        .post('/articles/${usefulIds.article_id}/comments')
        .send({comment: 'test comment'})
        // .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.statusCode).to.equal(200);
          expect(res.body.status).to.equal('OK');
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
