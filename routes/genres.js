const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const express = require('express');
const router = express.Router();
const { validate, Genre } = require('../models/genres.js');
const { Mongoose } = require('mongoose');

async function createGenre(name) {
    const genre = new Genre({
        name: name
    });
    try {
        const result = await genre.save();
        console.log(result);
        return result;
    } catch (ex) {
        for (var field in ex.erros)
            console.log(ex.errors[field].message);
    }
}

async function updateGenre(id, updateObject) {
    return await Genre.findByIdAndUpdate(id, { $set: updateObject }, { new: true });
}

async function getGenreById(id) {
    return await Genre.findById(id);
}

router.get('/', async(req, res) => {
    const genres = await Genre.find().sort('name');
    res.send(genres);
});

router.post('/', auth, async(req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message); // bad request 400


    let genre = await createGenre(req.body.name);
    res.send(genre);
});

router.put('/:id', [auth, validateObjectId], async(req, res) => {
    // validate the genre
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //////
    const matchedGenre = await Genre.find({ name: req.body.name });

    if (
        matchedGenre &&
        matchedGenre.length > 0 &&
        matchedGenre[0]._id != req.params.id
    )
        return res.status(400).send("Another genre with this name already exists");

    const updated = await updateGenre(req.params.id, req.body);
    if (!updated)
        return res
            .status(404)
            .send(`A genre with id ${req.params.id} was not found!`);
    res.send(updated);
    console.log(`Genre ${req.params.id} updated successfully`);
});

router.get('/:id', validateObjectId, async(req, res) => {

    const genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).send('The genre with the given ID was not found.');
    res.send(genre);
});

router.delete('/:id', [auth, admin, validateObjectId], async(req, res) => {
    //validate given id internally, return 404 if invalid.

    // find the genre, return 404 if not found.
    const genre = await Genre.findByIdAndRemove(req.params.id);
    if (!genre) return res.status(404).send(`A genre with id ${req.params.id} was not found!`);

    //Return the genre
    res.send(genre);
});

module.exports = router;