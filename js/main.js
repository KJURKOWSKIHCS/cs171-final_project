// Variable for the visualization instance
var europeMap;

// Start application by loading the data
loadData();

var totalDataClean;
var totalDataCleanLate;

var auschwitz_ethnicities = [
    {"ethnicity":"Jews", "total":1100000, "deported-left":100000, "killed":1000000},
    {"ethnicity":"Poles", "total":140000, "deported-left":70000, "killed":70000},
    {"ethnicity":"Other", "total":25000, "deported-left":13000, "killed":12000},
    {"ethnicity":"Roma (Gypsies)", "total":23000, "deported-left":2000, "killed":21000},
    {"ethnicity":"Soviet POV", "total":15000, "deported-left":1000, "killed":14000}
];


function loadData() {

    queue()
        .defer(d3.json, "data/world-110m.json")
        .defer(d3.json, "data/prisoners.json")
        .defer(d3.json, "data/connections.json")
        .defer(d3.csv, "data/camp_data.csv")
        .defer(d3.csv, "data/arrivals_early.csv")
        .defer(d3.csv, "data/arrivals_later.csv")
        .await(function(error, worldData, prisonersData, connectionData, campData, arrivalsData, arrivalsDataLate){
            arrivalsData.forEach(function(d){
                d.date = new Date(d.date);
                for (i = 1, t = 0; i < arrivalsData.columns.length; ++i) {
                    d[arrivalsData.columns[i]] = parseInt(d[arrivalsData.columns[i]]);
                }
            });
            totalDataClean = arrivalsData;

            arrivalsDataLate.forEach(function(d){
                d.date = new Date(d.date);
                for (i = 1, t = 0; i < arrivalsDataLate.columns.length; ++i) {
                    d[arrivalsDataLate.columns[i]] = parseInt(d[arrivalsDataLate.columns[i]]);
                }
            });
            totalDataCleanLate = arrivalsDataLate;
            createVis(error, worldData, prisonersData, connectionData, campData, arrivalsData, arrivalsDataLate);
        });
}

const numberFormatter = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function createVis(error, worldData, prisoners, connections, camps, arrivals, arrivalsLate) {
    // TO-DO: INSTANTIATE VISUALIZATION


    europeMap = new MapChart("#europe-map", worldData, prisoners, connections, camps);


}
