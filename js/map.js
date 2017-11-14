

MapChart = function(_parentElement, _data, _prisonerData, _campData){
    this.parentElement = _parentElement;
    this.data = _data;
    this.prisonerData = _prisonerData;
    this.campData = _campData;

    this.initVis();
}


/*
 * Initialize visualization (static content; e.g. SVG area, axes, brush component)
 */

MapChart.prototype.initVis = function(){
    var vis = this;

    // * TO-DO *
    vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

    vis.width = 1000,
        vis.height = 800 - vis.margin.top - vis.margin.bottom;

    vis.mapCenter = [12, 50];

    vis.projection = d3.geoMercator()
        .center(vis.mapCenter)
        .scale(1200);

    vis.path = d3.geoPath()
        .projection(vis.projection);

    vis.svg = d3.select(vis.parentElement).append("svg")
        .attr("width", vis.width)
        .attr("height", vis.height);

    vis.zoomed = false;

    // (Filter, aggregate, modify data)
    vis.wrangleData();
};


/*
 * Data wrangling
 */

MapChart.prototype.wrangleData = function(){
    var vis = this;
    vis.firstStage = [];

    vis.world = topojson.feature(vis.data, vis.data.objects.countries).features;
    console.log(vis.prisonerData);

    vis.prisonerData.forEach(function(d, i, array) {
        array[i].Geopoints.forEach(function(l, j, arr) {
            arr[j].Lat = +l.Lat;
            arr[j].Long = +l.Long;
        });
    });

    vis.prisonerData.forEach(function(d) {
        return vis.firstStage.push(d.Geopoints[0]);
    });

    // Update the visualization
    vis.updateVis();
};


/*
 * The drawing function
 */

MapChart.prototype.updateVis = function(){
    var vis = this;

    vis.svg.selectAll("path")
        .data(vis.world)
        .enter().append("path")
        .attr("d", vis.path)
        .style("fill", "darkgrey")
        .style("stroke", "lightgrey");

    console.log(vis.prisonerData[0].Geopoints[0]);

    vis.point = vis.svg.selectAll(".points")
        .data(vis.firstStage);

    vis.point
        .enter()
        .append("circle")
        .attr("class", "points")
        .attr("r", 7)
        .attr("cx", function(d) {return vis.projection([d.Long, d.Lat])[0];})
        .attr("cy", function(d) {return vis.projection([d.Long, d.Lat])[1];})
        .style("fill", "crimson")
        .on("click", function(d) {vis.zoom(d);});

    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<p><strong>Camp Name:</strong> <span>" + d.Camp_name + "</span></p>"
                + "<p><strong>Prisoners:</strong> <span>" + d.Est_prisoners + "</span></p>"
                + "<p><strong>Deaths:</strong> <span>" + d.Est_deaths + "</span></p>";
        });

    vis.svg.call(vis.tip);

    vis.svg.selectAll(".camps")
        .data(vis.campData)
        .enter().append("rect")
        .attr("class", "camps")
        .attr("x", function(d) {return vis.projection([d.Long, d.Lat])[0]})
        .attr("y", function(d) {return vis.projection([d.Long, d.Lat])[1]})
        .attr("width", 8)
        .attr("height", 8)
        .attr("fill", "blue")
        .on('mouseover', vis.tip.show)
        .on('mouseout', vis.tip.hide);

};

MapChart.prototype.zoom = function(object) {
    var vis = this;

    if (!vis.zoomed) {

        vis.zoomed = true;

        vis.projection
            .center([object.Long, object.Lat])
            .scale(9000);

        vis.svg.append("rect")
            .attr("class", "popup")
            .attr("x", 20)
            .attr("y", 20)
            .attr("rx", 20)
            .attr("ry", 20)
            .attr("width", vis.width - 40)
            .attr("height", vis.height - 40)
            .style("fill", "transparent");

        vis.svg.selectAll(".popup")
            .transition().duration(2000)
            .style("opacity", 1)
            .style("fill", "white")
            .style("stroke", "black");

        vis.svg.append("rect")
            .attr("class", "xout")
            .attr("x", vis.width - 60)
            .attr("y", 40)
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", "transparent")
            .on("click", function() {vis.zoom(object)});

        vis.svg.selectAll(".xout")
            .transition().duration(2000)
            .style("opacity", 1)
            .style("fill", "silver")
            .style("stroke", "black");

        vis.svg.append("line")
            .attr("class", "xout-line")
            .attr("x1", vis.width - 58)
            .attr("x2", vis.width - 42)
            .attr("y1", 42)
            .attr("y2", 58)
            .style("stroke", "transparent")
            .on("click", function() {vis.zoom(object)});

        vis.svg.append("line")
            .attr("class", "xout-line")
            .attr("x1", vis.width - 42)
            .attr("x2", vis.width - 58)
            .attr("y1", 42)
            .attr("y2", 58)
            .style("stroke", "transparent")
            .on("click", function() {vis.zoom(object)});

        vis.svg.selectAll(".xout-line")
            .transition().duration(2000)
            .style("opacity", 1)
            .style("stroke", "black");
        
    }
    else {

        vis.zoomed = false;

        vis.projection
            .center(vis.mapCenter)
            .scale(1200);

        vis.svg.selectAll(".popup").remove();
        vis.svg.selectAll(".xout").remove();
        vis.svg.selectAll(".xout-line").remove();
    }

    vis.path.projection(vis.projection);

    vis.svg.selectAll("path")
        .transition().duration(1000)
        .attr("d", vis.path)
        .style("fill", "darkgrey")
        .style("stroke", "lightgrey");

    vis.svg.selectAll(".points")
        .transition().duration(1000)
        .attr("cx", function(d) {return vis.projection([d.Long, d.Lat])[0];})
        .attr("cy", function(d) {return vis.projection([d.Long, d.Lat])[1];});

    vis.svg.selectAll(".camps")
        .transition().duration(1000)
        .attr("x", function(d) {return vis.projection([d.Long, d.Lat])[0]})
        .attr("y", function(d) {return vis.projection([d.Long, d.Lat])[1]});

};


