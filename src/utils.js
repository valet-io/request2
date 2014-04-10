'use strict';

var _           = require('lodash');
var httpStatus  = require('http-status');
var createError = require('create-error');
var dot         = require('dot-component');

var internals = {};

internals.error = function (response, options) {
  return new exports.ResponseError(
    internals.error.message(response, options),
    internals.error.properties(response)
  );
};

internals.error.message = function (response, options) {
  return options.errorProperty ? dot.get(response.body, options.errorProperty) : httpStatus[response.statusCode];
};

internals.error.properties = function (response) {
  return _.pick(response, 'body', 'statusCode');
};

exports.catch = function (response, options) {
  if (response.statusCode > 399) throw internals.error(response, options);
};

exports.ResponseError = createError('ResponseError');

exports.parse = function (response, options) {
  return options.dataProperty ? dot.get(response.body, options.dataProperty) : response.body;
};