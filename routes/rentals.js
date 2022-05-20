const auth = require('../middleware/auth');
const { Rental, validate } = require('../models/rentals');
const { Movie } = require('../models/movies');
const { Customer } = require('../models/customers');
const express = require('express');
const router = express.Router();
var Fawn = require("fawn");

Fawn.init("mongodb://127.0.0.1:27017/vidly");

router.get('/', async(req, res) => {

    const rentals = await Rental.find().sort('-dateOut');
    res.send(rentals);
});

router.post('/', auth, async(req, res) => {
    // Validate rental post request 
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message); // bad request 400


    // Validate customer
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send('Invalid customer.');

    // Validate Movie
    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).send('Invalid movie.');
    if (movie.numberInStock === 0) return res.status(400).send('Movie not found in stock.');

    let rental = new Rental({
        customer: {
            name: customer.name,
            phone: customer.phone,
            isGold: customer.isGold,
            _id: customer._id
        },
        movie: {
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate,
            _id: movie._id
        }
    });

    try {
        // 2 tasks; save the newly created rental item, decrement the movie counter
        new Fawn.Task()
            .save('rentals', rental) // use the name of the collection
            .update('movies', { _id: movie._id }, { $inc: { numberInStock: -1 } })
            .run();
        res.send(rental);
    } catch (ex) {
        res.status(500).send('Something failed.');
    }

});

module.exports = router;