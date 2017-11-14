let Arrival = require('./arrival');

class BusStop { //name distance arrival
    constructor (name, distance, id){
        this.name = name;
        this.distance = distance;
        this.id = id;
        this.arrivals = [];
    }
    addArrival(arrival) {
        this.arrivals.push( arrival );
    }

    addArrivals(arrivalArray) {
        arrivalArray.forEach(a => this.arrivals.push(a))
    }

    makeTimesReadable() {
        this.arrivals.forEach( a => {
            a.arrivalTime = a.arrivalTime.format("HH:mm:ss")
        })
    }

    sortArrivals() {
        this.arrivals.sort( Arrival.compare );
    }
    static compare(a, b) {
        return a.distance - b.distance;
    }
}

module.exports = BusStop;