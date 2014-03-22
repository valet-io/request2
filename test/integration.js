'use strict';

var nock    = require('nock');
var Request = require('../');

describe('Integration', function () {

  var host;
  before(function () {
    host = nock('http://test.host');
  });

  after(function () {
    nock.restore();
  });

  describe('Success', function () {

    var reply = {foo: 'bar'};

    beforeEach(function () {
      host
        .get('/success')
        .reply(200, reply);
    });

    it('resolves a suceeding request body', function () {      
      return new Request('GET', 'http://test.host/success')
        .send()
        .then(function (body) {
          expect(body).to.deep.equal(reply);
        });
    });

    it('can deeply resolve the body', function () {
      return new Request('GET', 'http://test.host/success', null, {
        dataProperty: 'foo'
      })
      .send()
      .then(function (body) {
        expect(body).to.deep.equal(reply.foo);
      });
    });

    it('can handle a non-JSON response', function () {
      host
        .get('/text')
        .reply(200, 'hello');
      return new Request('GET', 'http://test.host/text')
        .send()
        .then(function (body) {
          expect(body.toString()).to.equal('hello');
        });
    });

  });

  describe('Failure', function () {

    var reply = {
      error: {
        message: 'Uh oh'
      }
    };

    beforeEach(function () {
      host
        .get('/error')
        .reply(404, reply);
    });

    it('rejects for an HTTP error', function () {      
      return expect(new Request('GET', 'http://test.host/error').send())
        .to.be.rejected
        .then(function (err) {
          expect(err).to.be.an.instanceOf(Request.ResponseError);
          expect(err.message).to.equal('Not Found');
          expect(err.body).to.deep.equal(reply);
          expect(err.statusCode).to.equal(404);
        });
    });

    it('can deeply resolve an error message', function () {      
      return expect(new Request('GET', 'http://test.host/error', null, {
        errorProperty: 'error.message'
      })
      .send())
      .to.be.rejectedWith(reply.error.message);
    });

  });

});