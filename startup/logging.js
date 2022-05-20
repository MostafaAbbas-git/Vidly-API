const winston = require('winston');
require('winston-mongodb');
require('express-async-errors');

module.exports = function() {
    // Handle uncaught exceptions (works only on sync. code):
    new winston.ExceptionHandler(
        new winston.transports.File({ filename: 'log/uncaughtExceptions.log' }),
        new winston.transports.Console({ colorize: true, prettyPrint: true })
    );

    winston.add(new winston.transports.File({ filename: 'log/logfile.log', format: winston.format.json() }));
    winston.add(new winston.transports.MongoDB(({
        db: 'mongodb://localhost:27017/vidly',
        level: 'error',
        options: { useUnifiedTopology: true },
        format: winston.format.json()
    })));
    // Temp. console print
    winston.add(new winston.transports.Console({ colorize: true, prettyPrint: true }));

    process.on('unhandledRejection', (ex) => {
        throw ex;
    });
}