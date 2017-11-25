// Variable for the visualization instance
var europeMap;

// Start application by loading the data
loadData();

var data = [
    {"country":"Poland","total":28333,"disease":11,"wounds":0,"other":6},
    {"country":"Austria","total":28772,"disease":359,"wounds":0,"other":23},
    {"country":"France","total":30246,"disease":828,"wounds":1,"other":30}
]

var keys = ["wounds", "other", "disease"];


function loadData() {

    queue()
        .defer(d3.json, "data/world-110m.json")
        .defer(d3.json, "data/prisoners.json")
        .defer(d3.csv, "data/camps.csv")
        .await(createVis);
}


function createVis(error, worldData, prisoners, camps) {
    // TO-DO: INSTANTIATE VISUALIZATION

    europeMap = new MapChart("#europe-map", worldData, prisoners, camps);


}
