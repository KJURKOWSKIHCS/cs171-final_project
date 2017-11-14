// Variable for the visualization instance
var europeMap;

// Start application by loading the data
loadData();


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