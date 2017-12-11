

/*
 * BarChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data						-- the dataset 'household characteristics'
 * @param _config					-- variable from the dataset (e.g. 'electricity') and title for each bar chart
 */

BarChart = function(_parentVis, _data, _config, _svg, _additionalVis, _divWidth){
    this.parentVis = _parentVis;
    this.data = _data;
    this.config = _config;
    this.displayData = _data;
    this.svg = _svg;
    this.additionalVis = _additionalVis;
    this.divWidth = _divWidth;


    this.initVis();
}



/*
 * Initialize visualization (static content; e.g. SVG area, axes)
 */

BarChart.prototype.initVis = function(){
    var vis = this;

    vis.stackKeys = ["killed", "deported-left"];


    // Set up dimensions
    vis.margin = { top: 40, right: 150, bottom: 60, left: 100 };
    // vis.width = $("." + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.width = (vis.divWidth) - vis.margin.left - vis.margin.right;
    console.log("the width of the vis svg is: " + vis.width);
    vis.height = 400 - vis.margin.top - vis.margin.bottom;





    //Create new svg
    vis.svg_bar = d3.select("#" + vis.parentVis).append("svg")
        .attr("class", "bar-chart")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.svg_legend = d3.select("#" + vis.additionalVis).append("svg")
        .attr("class", "legend-box")
        .attr("width", vis.width)
        .attr("height", vis.height)
        .append("g")
        .attr("transform", "translate(" + 0 + "," + vis.margin.top + ")");


    // Append bar chart titles
    vis.svg_bar.append("text")
        .attr("class", "graph-titles")
        .attr("x", (vis.width / 2))
        .attr("y", 0 - (vis.margin.top / 2))
        .attr("text-anchor", "middle")
        .attr("fill", "maroon")
        .text(function() {
            return vis.config;
        });

    // Set up scales and axes
    vis.y = d3.scaleBand()
        .rangeRound([0,vis.height])
        .paddingInner(0.1);

    vis.x = d3.scaleLinear()
        .range([0, vis.width]);

    vis.colors = d3.scaleOrdinal([ "rgb(128, 0, 0)", "rgb(0, 0, 0)"]);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.yAxisGroup = vis.svg_bar.append("g")
        .attr("class", "y-axis axis")
        .attr("transform", "translate(" + 0 + "," + 0 +")") // move into position

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.xAxisGroup = vis.svg_bar.append("g")
        .attr("class", "x-axis axis");

    vis.factGenerator();

    // (Filter, aggregate, modify data)
    vis.wrangleData();
}



/*
 * Data wrangling
 */

BarChart.prototype.wrangleData = function(){
    var vis = this;

    vis.stack = d3.stack()
        .keys(vis.stackKeys)
        .offset(d3.stackOffsetNone);

    vis.layers = vis.stack(vis.data);

    console.log("checking layers");
    console.log(vis.layers);

    vis.data.sort(function(a,b){
        return b.total - a.total;
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
    vis.y.domain(vis.data.map(function(d) {
        return d.ethnicity;
    }));

    vis.x.domain([0, d3.max(vis.layers[vis.layers.length-1], function(d) {
        console.log(d);
        console.log("adding " + d[0] + " + " + d[1]);
        return d[1];
    })]).nice();


    vis.layer = vis.svg_bar.selectAll(".layer")
        .data(vis.layers)
        .enter()
        .append("g")
        .attr("class", "layer")
        .style("fill", function(d, i) {
            return vis.colors(i);
        });

    vis.layer.selectAll("rect")
        .data(function(d) {
            return d;
        })
        .enter()
        .append("rect")
        .merge(vis.layer)
        .attr("y", function(d) {
            return vis.y(d.data.ethnicity);
        })
        .attr("x", function(d) {
            return vis.x(d[0]);
        })
        .attr("height", vis.y.bandwidth())
        .attr("width", function(d) {
            return vis.x(d[1]) - vis.x(d[0]);
        })
        .attr("stroke", "black")
        .attr("stroke-width", "2px")
        .on("mouseover", function(d) {
            appendData(d);

        });

    //
    // vis.layer.selectAll("line")
    //     .data(function(d) {
    //         return d;
    //     })
    //     .enter()
    //     .append("line")
    //     .attr("x1", function(d) {
    //         return vis.x(d[0]);
    //     })
    //     .attr("x2", function(d) {
    //         return vis.x(d[1]) - vis.x(d[0]);
    //     })
    //     .attr("y1", function(d) {
    //         return vis.y(d.data.ethnicity);
    //     })
    //     .attr("y2", function(d) {
    //         return vis.y(d.data.ethnicity);
    //     })
    //     .attr("stroke-width", "5px")
    //     .attr("stroke", "black");




    // Update the y-axis
    vis.svg_bar.select(".y-axis")
        .transition()
        .duration(800)
        .call(vis.yAxis);

    vis.ordinal = d3.scaleOrdinal()
        .domain(["Killed", "Deported"])
        .range([ "rgb(128, 0, 0)", "rgb(0, 0, 0)"]);


    // vis.svg_bar.append("g")
    //     .attr("class", "legendOrdinal")
    //     .attr("transform", "translate(0," + vis.height + ")");
    //
    // vis.legendOrdinal = d3.legendColor()
    // //d3 symbol creates a path-string, for example
    // //"M0,-8.059274488676564L9.306048591020996,
    // //8.059274488676564 -9.306048591020996,8.059274488676564Z"
    //     .shape("rect")
    //     .shapePadding(20)
    //     .labelAlign("middle")
    //     .scale(vis.ordinal);
    //
    // vis.svg_bar.select(".legendOrdinal")
    //     .call(vis.legendOrdinal);

    var legendRectSize = 18;
    var legendSpacing = 10;


    var legend = vis.svg_legend.selectAll('.legend')                     // NEW
        .data(vis.ordinal.domain())                                   // NEW
        .enter()                                                // NEW
        .append('g')                                            // NEW
        .attr('class', 'legend')                                // NEW
        .attr('transform', function(d, i) {                     // NEW// NEW
            var offset = (20 * i) + legendSpacing;
            return 'translate(' + 0 + ',' + offset + ')';        // NEW
        });                                                     // NEW

    legend.append('rect')                                     // NEW
        .attr('width', legendRectSize)                          // NEW
        .attr('height', legendRectSize)                         // NEW
        .style('fill', vis.ordinal)                                   // NEW
        .style('stroke', vis.ordinal);                                // NEW

    legend.append('text')                                     // NEW
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)// NEW
        .text(function(d) { return d; });




    function appendData(d) {
        console.log(d);
        document.getElementById('visInfoEthnicity').innerHTML = "Ethnicity: " + d.data.ethnicity;
        // document.getElementById('visInfoDeported').innerHTML = "Deported: " + d.data.total;
        // document.getElementById('visInfoKilled').innerHTML = "Killed: " + d.data.killed;

        $('#visInfoDeported').html("Out of " + "<span id='visInfoDeportedText'>" + d.data.total + "</span>" + " Deported to the camp, " + "<span id='visInfoKilledText'>" + d.data.killed + "</span>" + " were killed.");

        if(d[0] === 0) {
            $('#visInfoKilledText').css("font-size", "35px");
            $('#visInfoDeportedText').css("font-size", "20px");
        }
        else {
            $('#visInfoKilledText').css("font-size", "20px");
            $('#visInfoDeportedText').css("font-size", "35px");
        }

    }
}



BarChart.prototype.factGenerator = function() {
    var vis = this;

    vis.campName = 'auschwitz';
    vis.jsonFactData = "data/" + vis.campName + "_facts.json";

    d3.json(vis.jsonFactData, function(error, data) {

        console.log("checking facts data");
        console.log(data);

        $('#factGenerator').click(function () {

            $('.generated-content').remove();

            console.log("clicked button");

            var factsLength = data[0].Facts.length;
            console.log(factsLength);

            var randomFact = data[0].Facts[Math.floor(Math.random() * factsLength)];

            // CREATE NEW PARAGRAPH-TAG
            var paragraph = document.createElement("p");
            paragraph.className = "generated-content";

            // CREATE PARAGRAPH CONTENT
            var node = document.createTextNode(randomFact);

            // ADD PARAGRAPH CONTENT TO TAG
            paragraph.appendChild(node);

            // ADD PARAGRAPH TO DIV-CONTAINER WITH ID "content"
            var element = document.getElementById("content");
            element.appendChild(paragraph);
        });

    });

}




