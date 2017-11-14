class Arrival {
    constructor(arrivalTime, destinationName, lineName) {
        this.arrivalTime = arrivalTime;
        this.destinationName = destinationName;
        this.lineName = lineName;
    }

    toString() {
        return this.arrivalTime.format("HH:mm:ss") + ' : ' + this.lineName + ' to ' + this.destinationName;
    }

    static compare(a, b) {
        if (a.arrivalTime < b.arrivalTime) {
            return -1;
        }
        if (a.arrivalTime > b.arrivalTime) {
            return 1;
        }
        return 0;
    }
}

module.exports = Arrival;