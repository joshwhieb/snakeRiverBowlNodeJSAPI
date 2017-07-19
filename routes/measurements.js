var DocumentDBClient = require('documentdb').DocumentClient;
var async = require('async');

function measurements(fingerMeasurements) {
  this.fingerMeasurements = fingerMeasurements;
}

module.exports = measurements;
