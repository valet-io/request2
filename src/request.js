'use strict';

var EventEmitter = require('events').EventEmitter;
var emitThen     = require('emit-then');
var Promise      = require('bluebird');
var _            = require('lodash');
var url          = require('url');
var needle       = Promise.promisifyAll(require('needle'));
var utils        = require('./utils');

var internals = {};

internals.options = function (request, options) {
  options = options || {};
  return _.defaults(options, {
    json: (request.method === 'POST' || request.method === 'PUT'),
    query: options.qs || {}
  });
};

internals.query = function (request, options) {
  var parsed = url.parse(request.url, true);
  _.extend(parsed.query, options.query);
  request.url = url.format(parsed);
};

internals.needle = function (request) {
  return needle.requestAsync(
    request.method,
    request.url,
    request.data,
    _.pick(request.options, 'timeout', 'follow', 'proxy', 'agent', 'headers', 'auth', 'json')
  );
};

var Request = function (method, url, data, options) {
  this.method = method;
  this.url = url;
  this.data = data;
  this.options = internals.options(this, options);
  internals.query(this, this.options);
  EventEmitter.call(this);
};

Request.ResponseError = utils.ResponseError;

Request.prototype = Object.create(EventEmitter.prototype);

Request.prototype.emitThen = emitThen;

Request.prototype.send = Promise.method(function () {
  return this
    .emitThen('preRequest', this)
    .bind(this)
    .then(function () {
      var request = internals.needle(this);
      try {
        this.emit('postRequest', _.clone(this));
      } catch (e) {}
      return request;
    })
    .spread(function (response) {
      return response;
    })
    .tap(function (response) {
      this.response = response;
      return this.emitThen('preResponse', this, response);
    })
    .tap(function (response) {
      return utils.catch(response, this.options);
    })
    .then(function (response) {
      return utils.parse(response, this.options);
    })
    .tap(function () {
      return this.emitThen('postResponse', this, this.response);
    });
});

module.exports = Request;