const Joi = require('joi'); // for validation purposes

module.exports = function() {
    Joi.objectId = require('joi-objectid')(Joi);
}