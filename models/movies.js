const Joi = require('joi');
const mongoose = require('mongoose');

const Movie = mongoose.model('Movie', new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    numberInStock: {
        type: Number,
        default: 10,
        min: 0
    },
    dailyRentalRate: {
        type: Number,
        default: 2,
        min: 0,
        max: 255
    }
}));

function validateMovie(movie) {
    const schema = Joi.object({
        title: Joi.string().min(1).required(),
        genre: Joi.string().min(1).required(),
        numberInStock: Joi.number(),
        dailyRentalRate: Joi.number()
    })
    return schema.validate(movie);
}

exports.validate = validateMovie;
exports.Movie = Movie;