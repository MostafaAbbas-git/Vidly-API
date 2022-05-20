const winston = require('winston'); //LOGS
const express = require('express');
const app = express();

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);


/* HomePage */
app.get('/', (req, res) => {
    let message = "Welcome to my humble website";
    res.send(message);
});
//PORT
const port = process.env.PORT || 3000;
const server = app.listen(port, () => winston.info(`Listening on port ${port}...`));

module.exports = server;