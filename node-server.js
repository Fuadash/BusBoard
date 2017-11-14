const busQuery = require('./bus-queries');
const express = require('express');
const app = express();

app.use(express.static('frontend'));
app.get('/departureBoards', (req, res) => {
    let responsePromise = busQuery(req.query.postcode);
    responsePromise.then(
        data => {
            res.status(200);
            res.send(data);
        },
        err => {
            console.log("Invalid Postcode: " + err);
            res.status(400);
            res.send("Invalid Postcode");
        });
});

app.listen(3000, () => console.log("Listening on port 3000"));