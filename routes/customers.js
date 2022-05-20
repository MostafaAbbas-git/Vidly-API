const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const express = require('express');
const router = express.Router();
const { Customer, validate: validateCustomer } = require('../models/customers');

router.get('/', async(req, res) => {

    const customers = await Customer.find().sort('name');
    res.send(customers);
});


router.post('/', [auth, validate(validateCustomer)], async(req, res) => {

    let customer = await createCustomer(req.body.name, req.body.phone, req.body.isGold);
    res.send(customer);
});


router.put('/:id', [auth, validate(validateCustomer)], async(req, res) => {

    const customer = await Customer.findByIdAndUpdate(req.params.id, { name: req.body.name, phone: req.body.phone, isGold: req.body.isGold }, { new: true });
    if (!customer) res.status(404).send('The customer with the given ID was not found.');

    res.send(customer);
});


router.get('/:id', async(req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send('The customer with the given ID was not found.');
    res.send(customer);
});


router.delete('/:id', async(req, res) => {
    // find it first
    const customer = await Customer.findByIdAndRemove(req.params.id);
    if (!customer) return res.status(404).send('The genre with the given ID was not found.');

    //Return the customer to the client
    res.send(customer);
});

async function createCustomer(name, phone, isGold) {
    const customer = new Customer({
        name: name,
        phone: phone,
        isGold: isGold
    });

    try {
        const result = await customer.save();
        console.log(result);
        return result;
    } catch (ex) {
        for (var field in ex.erros)
            console.log(ex.errors[field].message);
    }
}

module.exports = router;