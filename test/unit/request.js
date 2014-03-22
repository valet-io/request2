var Request  = require('../../src/request');
var needle   = require('needle');
var response = require('../../src/response');

describe('Request', function () {

  it('is an event emitter', function () {
    expect(Request).to.respondTo('emit');
  });

  it('mixes in emitThen', function () {
    expect(Request).to.respondTo('emitThen');
  });

  describe('Constructor', function () {

    it('accepts the method, URL, data, and options', function () {
      expect(new Request('method', 'url', 'data', 'options'))
        .to.contain({
          method: 'method',
          url: 'url',
          data: 'data',
          options: 'options'
        });
    });

    it('defaults to json: true for options', function () {
      expect(new Request().options).to.contain({json: true});
    });

  });

  var request;
  beforeEach(function () {
    request = new Request('method', 'url', 'data');
  });

  var spy;
  beforeEach(function () {
    spy = sinon.spy();
  });

  describe('#send', function () {

    var res;
    beforeEach(function () {
      res = {
        statusCode: 200,
        body: {}
      };
      sinon.stub(needle, 'requestAsync').resolves([res]);
      sinon.stub(response, 'parse').returns(res.body);
    });

    afterEach(function () {
      needle.requestAsync.restore();
      response.parse.restore();
    });

    it('emits a preRequest event before calling needle', function () {
      return request
        .on('preRequest', spy)
        .send()
        .finally(function () {
          expect(spy)
            .to.have.been.calledWith(request)
            .and.to.have.been.calledBefore(needle.requestAsync);
        });
    });

    it('calls needle.requestAsync', function () {
      return request.send().finally(function () {
        expect(needle.requestAsync).to.have.been.calledWith('method', 'url', 'data');
      });
    });

    it('excludes unneeded options from needle', function () {
      request.options.foo = 'bar';
      return request.send().finally(function () {
        expect(needle.requestAsync.firstCall.args[3]).to.not.contain.keys('foo');
      });
    });

    it('emits a safe postRequest event after calling needle', function () {
      var stub = sinon.stub().throws();
      return request
        .on('postRequest', stub)
        .send()
        .finally(function () {
          expect(stub)
            .to.have.been.calledWith(request)
            .and.to.have.been.calledAfter(needle.requestAsync);
        });
    });

    it('emits a preResponse event with the needle response', function () {
      return request
        .on('preResponse', spy)
        .send()
        .finally(function () {
          expect(spy)
            .to.have.been.calledWith(res)
            .and.to.have.been.calledBefore(response.parse);
        });
    });

    it('parses the response', function () {
      return request
        .send()
        .finally(function () {
          expect(response.parse).to.have.been.calledWith(request.options);
          expect(response.parse).to.have.been.calledOn(request.response);
        });
    });

    it('emits a postResponse event with the parsed body', function () {
      return request
        .on('postResponse', spy)
        .send()
        .finally(function () {
          expect(spy)
            .to.have.been.calledWith(res.body)
            .and.to.have.been.calledAfter(response.parse);
        });
    });

  });

});