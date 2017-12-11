

/*
 * BarChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data						-- the dataset 'household characteristics'
 * @param _config					-- variable from the dataset (e.g. 'electricity') and title for each bar chart
 */

BarChart = function(_parentElement, _data, _config, _keys){
    this.parentElement = _parentElement;
    this.data = _data;
    this.config = _config;
    this.stackKeys = _keys;
    this.displayData = _data;


    this.initVis();
}



/*
 * Initialize visualization (static content; e.g. SVG area, axes)
 */

BarChart.prototype.initVis = function(){
    var vis = this;

    // Set up dimensions
    vis.margin = { top: 40, right: 100, bottom: 60, left: 100 };
    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = 400 - vis.margin.top - vis.margin.bottom;

    // Create new svg
    vis.svg_bar = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Append bar chart titles
    vis.svg_bar.append("text")
        .attr("class", "graph-titles")
        .attr("x", (vis.width / 2))
        .attr("y", 0 - (vis.margin.top / 2))
        .attr("text-anchor", "middle")
        .attr("fill", "blue")
        .text(function() {
            return vis.config;
        });


    vis.stack = d3.stack()
        .keys(vis.stackKeys)
        .offset(d3.stackOffsetNone);


    // Set up scales and axes
    vis.y = d3.scaleBand()
        .rangeRound([0,vis.height])
        .paddingInner(0.1);

    vis.x = d3.scaleLinear()
        .range([0, vis.width]);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.yAxisGroup = vis.svg_bar.append("g")
        .attr("class", "y-axis axis")
        .attr("transform", "translate(50,0)") // move into position

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.xAxisGroup = vis.svg_bar.append("g")
        .attr("class", "x-axis axis");


    // (Filter, aggregate, modify data)
    vis.wrangleData();
}



/*
 * Data wrangling
 */

BarChart.prototype.wrangleData = function(){
    var vis = this;

    // (1) Group data by key variable (e.g. 'electricity') and count leaves
    vis.nestedData = d3.nest()
        .key(function(d) {
            return d[vis.config];
        })
        .rollup(function(leaves) {
            return leaves.length;
        })
        .entries(vis.displayData);



    // (2) Sort columns descending
    vis.nestedData.sort(function(a, b) {
        return b.value - a.value;
    });



    // Update the visualization
    vis.updateVis();
}



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 */

BarChart.prototype.updateVis = function(){
    var vis = this;


    // (1) Update domains
    vis.y.domain(vis.nestedData.map(function(d) {
        return d.key;
    }));

    vis.x.domain([0, d3.max(vis.nestedData, function(d) {
        return d.value;
    })]);


    // (2) Draw rectangles
    vis.rectangles = vis.svg_bar.selectAll("rect")
        .data(vis.nestedData);

    vis.svg_bar.selectAll("text.bar").remove();
    vis.rectangles.exit().remove();

    console.log("data check first value");
    console.log(vis.nestedData[0].value);
    console.log(vis.x(vis.nestedData[0].value));

    vis.rectangles.transition()
        .duration(800)
        .attr("width", function(d) { return vis.x(d.value); })
        .style("fill", "blue");

    vis.rectangles.enter().append("rect")
        .attr("fill", "blue")

        .merge(vis.rectangles)
        .attr("class", "bar")
        .attr("y", function(d) { return vis.y(d.key); })
        .attr("height", vis.y.bandwidth())
        .attr("x", 50)
        .attr("width", function(d) { return vis.x(d.value); });


    // (3) Draw labels
    vis.svg_bar.selectAll("text.bar")
        .data(vis.nestedData)
        .enter().append("text")
        .attr("class", "bar")
        .attr("text-anchor", "middle")
        .attr("x", function(d) { return vis.x(d.value) + 70; })
        .attr("y", function(d, index) {
            return (vis.y(d.key) + (vis.y.bandwidth() / 2));
        })
        .text(function(d) { return d.value; });

    // Update the y-axis
    vis.svg_bar.select(".y-axis")
        .transition()
        .duration(800)
        .call(vis.yAxis);
}



/*
 * Filter data when the user changes the selection
 * Example for brushRegion: 07/16/2016 to 07/28/2016
 */

BarChart.prototype.selectionChanged = function(brushRegion){
    var vis = this;

    // Filter data accordingly without changing the original data
    vis.displayData = vis.data.filter(function(d) {
        return d.survey >= brushRegion[0] && d.survey <= brushRegion[1];
    });

    // Update the visualization
    vis.wrangleData();
}
