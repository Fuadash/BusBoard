let request_handlers = require('./request-handlers');
let readlineSync = require('readline-sync');

let stopID = readlineSync.question("Give me a stop ID: ");
request_handlers.getArrivalPredictions(stopID);
