let request = require("request");
let rp = require('request-promise');
let moment = require('moment')
let readlineSync = require('readline-sync');
//let postcodeHandler = require('postcode-handler')
let Arrival = require('./arrival');
let busStop = require('./busStop');
const express = require('express');
const app = express();

const applicationID = "cfc9ed01";
const applicationKey = "27c9fea1477859bb507b2ac136254e9a";
const baseAddress = "https://api.tfl.gov.uk/StopPoint/";
const postcodeAPI = "http://api.postcodes.io/postcodes/";


app.use(express.static('frontend'));
app.get('/departureBoards', (req, res) => {
    let responsePromise = arrivalsForStops(req.query.postcode);
    responsePromise.then(
        data => {
                res.status(200);
                res.send(data);
            })
    responsePromise.catch(
        err => {
            res.status(400);
            res.send("Invalid Postcode");
        }
    )
});



app.listen(3000, () => console.log("Listening on port 3000"));

const stopID = '490008660N';
//let stopID = readlineSync.question("Give me a stop ID: ");

function arrivalsForStops(postcode) {
    let nearbyStops = makeBusStopObjectsNearest(postcode);
    let closest2Stops = get2closestStops(nearbyStops);
    let stopsPromises = closest2Stops.then(
        stops => {
            let stopsWithArivals = stops.map( s => createArrivals(s));
            return Promise.all(stopsWithArivals)
        }
    )

    return stopsPromises.then(
        p => {
            let stringData = JSON.stringify(p);
            return stringData;
        }
    )
}

function makeBusStopObjectsNearest(postcode) {
    const stopsQuery = getBusStopsNearPostcode(postcode);
    return nearbyStops = makeBusStopObjects(stopsQuery);
}

function getLongLat(postcode){
    const postcodeQuery = postcodeAPI + postcode;
    let data = rp(postcodeQuery)
        .then(
            function (response) {
                return JSON.parse(response)
            })
        .then(
            function (json){
                return {
                    'latitude' : json["result"]["latitude"],
                    'longitude' : json["result"]["longitude"]
                }
            }
        )
    return data;
}

function get2closestStops(nearbyStopsQuery) {
    return nearbyStopsQuery.then(
        function(nearbyStops) {
            nearbyStops.sort( busStop.compare );
            return nearbyStops.slice(0,2);
        }
    )
}


function getBusStopsNearPostcode(postcode) {
    let longLat = getLongLat(postcode);
    return longLat.then(
        longLat => {
            const query = {
                uri: baseAddress,
                qs: {
                    stopTypes: "NaptanPublicBusCoachTram",
                    lat: longLat.latitude,
                    lon: longLat.longitude,
                    radius: 300,
                },
                json: true,
            };
            return rp(query);
        }
    )
}

function makeBusStopObjects(busStopQuery) {
    return busStopQuery.then(
        response => {
            const nearbyStops = [];
            for(let stop of response.stopPoints) {
                const newStop = new busStop(stop.commonName, stop.distance, stop.id);
                nearbyStops.push( newStop );
            }
            return nearbyStops;
        }
    );
}

function parseArrivalPredictions(busStop) {
    const url = baseAddress + busStop.id + '/Arrivals';
    return rp(url)
        .then(response => { return JSON.parse(response)})
}

function createArrivals (busStop){
    const response = parseArrivalPredictions(busStop);
    return response.then(response => {
        response.forEach( j => {
            let arrivalTime = moment(j["expectedArrival"], "YYYY-MM-DDTHH:mm:ssZ");
            let destinationName = j["destinationName"];
            let lineName = j["lineName"];
            busStop.addArrival( new Arrival(arrivalTime, destinationName, lineName));
        });
        busStop.sortArrivals();
        busStop.readableTimes();
        return busStop;
        //printTimes(busStop);
    })
}

function printTimes (busStop){
    const toPrint = Math.min(busStop.arrivals.length, 5);
    console.log("\n" + busStop.name);
    for (let j=0; j<toPrint; j++) {
        console.log(busStop.arrivals[j].toString());
    }
}