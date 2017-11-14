function setSubmit() {
    $('#postcodeSubmit').submit(function(e) {
        e.preventDefault();
        updateArrivals(e);
    });
}


function updateArrivals(formObject) {
    // do GET request for departures
    var url = "http://localhost:3000/departureBoards?postcode=" + $('#postcodeSubmit input[name=postcode]').val();

    $.ajax({
        url : url,
        success : renderResults,
        failure : function(error) {
            console.log("failure");
        },
    })
}

function renderResults(response) {
    const json = JSON.parse(response);
    console.log(json);

    $("#results").css("display","block")

    let divMade = resultAnim();
    return divMade.then( divMade => {
        let newResults = "<h2>Results</h2>";
        for (let busStop of json) {

            newResults += `<h3>${busStop.name}</h3>`;
            newResults += "<ul>";
            for (let arrival of busStop.arrivals) {
                newResults += `<li>${arrival.arrivalTime} : ${arrival.destinationName} : ( ${arrival.lineName} )</li>`
            }
            newResults += "</ul>";
        }
        document.getElementById("results").innerHTML = newResults;
    })
}

function resultAnim(){
    let promise = new Promise(function(resolve,reject){
        let resultsCopy = $("#results");
        $("#results").remove();
        resultsCopy.appendTo( "#resultsContainer" );

        if (true){
            resolve("Done");
        }
        else{
            reject("not done");
        }
    })
    return promise;
}
