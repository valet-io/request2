'use strict';

var pick        = require('lodash.pick');
var httpStatus  = require('http-status');
var createError = require('create-error');
var dot         = require('dot-component');

var internals = {};

internals.error = function (options) {
  return new exports.ResponseError(
    internals.error.message.call(this, options),
    internals.error.properties.call(this)
  );
};

internals.error.message = function (options) {
  return options.errorProperty ? dot.get(this.body, options.errorProperty) : httpStatus[this.statusCode];
};

internals.error.properties = function (response) {
  return pick(response, 'body', 'statusCode');
};

exports.catch = function (options) {
  if (this.statusCode > 399) throw internals.error.call(this, options);
};

exports.ResponseError = createError('ResponseError');

exports.parse = function (options) {
  return options.dataProperty ? dot.get(this.body, options.dataProperty) : this.body;
};