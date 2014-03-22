'use strict';

var utils = require('../../src/utils');

describe('Response utils', function () {

  var res = {
    success: {
      statusCode: 200,
      body: {
        data: {
          foo: 'bar'
        }
      }
    },
    error: {
      statusCode: 400,
      body: {
        error: {
          message: 'err'
        }
      }
    }
  };

  describe('#parse', function () {

    it('returns the response body', function () {
      expect(utils.parse.call(null, res.success, {})).to.equal(res.success.body);
    });

    it('can extract a deep property from the body', function () {
      expect(utils.parse.call(null, res.success, {
        dataProperty: 'data'
      })).to.equal(res.success.body.data);
    });

  });

  describe('#catch', function () {

    describe('response.statusCode < 400', function () {

      it('is a no-op', function () {
        expect(utils.catch.bind(null, res.success, {})).to.not.throw();
      });

    });

    describe('utils.statusCode > 399', function () {

      it('throws a ResponseError', function () {
        expect(utils.catch.bind(null, res.error, {})).to.throw(utils.ResponseError);
      });

      it('appends the statusCode to the error', function () {
        expect(utils.catch.bind(null, res.error, {})).to.throw(sinon.match.has('statusCode', 400));
      });

      it('appends the body to the error', function () {
        expect(utils.catch.bind(null, res.error, {})).to.throw(sinon.match.has('body', res.error.body));
      });

      it('can deep extract an error message using dot notation', function () {
        expect(utils.catch.bind(null, res.error, {errorProperty: 'error.message'})).to.throw('err');
      });

      it('falls back to a statusCode dictionary name', function () {
        expect(utils.catch.bind(null, res.error, {})).to.throw('Bad Request');
      });

    });

  });

});