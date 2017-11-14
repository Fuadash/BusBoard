const rp = require('request-promise');
const moment = require('moment');
const Arrival = require('./arrival');
const busStop = require('./busStop');
const baseAddress = "https://api.tfl.gov.uk/StopPoint/";
const postcodeAPI = "http://api.postcodes.io/postcodes/";

const makeLongLat = qr => {return {latitude : qr.result['latitude'], longitude : qr.result['longitude']}};

const makeBusStopQuery = longLat => {
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
};

const makeBusStopObjects = busStopQuery => {
    const nearbyStops = [];
    for(let stop of busStopQuery.stopPoints) {
        const newStop = new busStop(stop.commonName, stop.distance, stop.id);
        nearbyStops.push( newStop );
    }
    return nearbyStops;
};

const getClosestTwoStops = nearbyStops => nearbyStops.sort(busStop.compare).slice(0,2);

const makeArrivalObjects = response => {
    return response.map( busArrival => {
        let arrivalTime = moment(busArrival["expectedArrival"], "YYYY-MM-DDTHH:mm:ssZ");
        let destinationName = busArrival["destinationName"];
        let lineName = busArrival["lineName"];
        return new Arrival(arrivalTime, destinationName, lineName)
    });
};

const makeArrivalQueries = stops => {
    let stopArrivalsQueries = [];
    for (let stop of stops) {
        stopArrivalsQueries.push( rp(baseAddress + stop.id + '/Arrivals')
            .then(JSON.parse)
            .then(makeArrivalObjects)
            .then( p => stop.addArrivals(p) )
            .then( p => stop.sortArrivals() )
            .then( p => stop.arrivals = stop.arrivals.slice(0,5) )
            .then( p => stop.makeTimesReadable() )
        )
    }
    return Promise.all(stopArrivalsQueries).then( p => stops )
};

const findNearbyBusesJSON = postcode => {
    const postcodeQuery = postcodeAPI + postcode;
    return rp(postcodeQuery)               // initial postcode API query
        .then(JSON.parse)
        .then(makeLongLat)
        .then(makeBusStopQuery)     // query TFL for nearby bus stops
        .then(makeBusStopObjects)
        .then(getClosestTwoStops)
        .then(makeArrivalQueries)   // query TFL for arrivals for each stop
        .then(
            busStops => {
                console.log("Query success");
                return JSON.stringify(busStops);
            },
            failure => {
                console.log("Query failure: " + failure);
                return "Query failure: " + failure;
            }
        )
};

// findNearbyBusesJSON("NW5 1TL");
// findNearbyBusesJSON("");
module.exports = findNearbyBusesJSON;
