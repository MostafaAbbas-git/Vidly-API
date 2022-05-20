const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { User } = require('../models/users');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const Joi = require('joi');


// route handler
router.post('/', async(req, res) => {
    const { error } = validate(req.body); // validation of inputs
    if (error) return res.status(400).send(error.details[0].message); // bad request 400

    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Invalid username or password.');

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid username or password.');

    const token = user.generateAuthToken();
    res.send(token);
});

function validate(email, password) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(1024).required(),
    });
    return schema.validate(email, password);
}
module.exports = router;