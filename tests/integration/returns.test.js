const moment = require('moment');
let server;
const request = require('supertest');
const mongoose = require('mongoose');
const { Rental } = require('../../models/rentals');
const { Movie } = require('../../models/movies');
const { User } = require('../../models/users');

describe('/api/returns', () => {

    let customerId;
    let movieId;
    let rental;
    let token;
    let movie;

    const exec = async() => {
        return await request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({ customerId, movieId });
    };

    beforeEach(async() => {
        server = require('../../index');

        token = new User().generateAuthToken();
        customerId = new mongoose.Types.ObjectId();
        movieId = new mongoose.Types.ObjectId();

        movie = new Movie({
            _id: movieId,
            title: '12345',
            genre: '12345',
            numberInStock: 10,
            dailyRentalRate: 2
        });
        await movie.save();

        rental = new Rental({
            customer: {
                _id: customerId,
                name: '12345',
                phone: '12345'
            },
            movie: {
                _id: movieId,
                title: '12345',
                dailyRentalRate: 2
            }
        });
        await rental.save();

    });

    afterEach(async() => {
        await server.close();
        await Rental.remove({});
        await Movie.remove({});
    });

    it('should return 401 if client is not logged in', async() => {
        token = '';
        const res = await exec();

        expect(res.status).toBe(401);
    });

    it('should return 400 if customerId is not provided', async() => {
        customerId = '';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 400 if movieId is not provided', async() => {
        movieId = '';

        const res = await exec();

        expect(res.status).toBe(400);
    });


    it('should return 404 if no rental found for this customer/movie', async() => {
        await Rental.remove({});

        const res = await exec();

        expect(res.status).toBe(404);
    });


    it('should return 400 if return is already processed', async() => {
        rental.dateReturned = new Date();
        await rental.save();

        const res = await exec();

        expect(res.status).toBe(400);
    });


    it('should return 200 if return was successful', async() => {

        const res = await exec();

        expect(res.status).toBe(200);
    });

    it('should set the return date if input is valid', async() => {
        const res = await exec();

        const rentalInDb = await Rental.findById(rental._id);
        const diff = new Date() - rentalInDb.dateReturned;

        expect(res.status).toBe(200);
        expect(diff).toBeLessThan(10 * 1000);
    });


    it('should calculate the rental fee', async() => {

        rental.dateOut = moment().add(-7, 'days').toDate();
        await rental.save();

        const res = await exec();
        const rentalInDb = await Rental.findById(rental._id);

        expect(rentalInDb.rentalFee).toBeDefined();
    });

    it('should increase the stock of the movie if the return is successful', async() => {

        const res = await exec();

        const movieInDb = await Movie.findById(movieId);

        expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
    });


    it('should return the rental if input is valid', async() => {

        const res = await exec();

        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining(['dateOut', 'dateReturned', 'customer', 'movie', 'rentalFee'])
        );
    });
});