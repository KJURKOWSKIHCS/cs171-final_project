// create the svg
StackChart = function(_parentElement, _classElement, _inputData, _config){
    this.parentElement = _parentElement;
    this.classElement = _classElement;
    this.data = _inputData;
    this.config = _config;
    this.displayData = []; // see data wrangling
    this.monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // DEBUG RAW DATA

    this.initVis();
}
StackChart.prototype.initVis = function() {
    var vis = this;



    vis.stack_svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("class", vis.classElement);

    vis.margin = {top: 50, right: 100, bottom: 120, left: 75};
    vis.width = 960 - vis.margin.left - vis.margin.right;
    vis.height = 500 - vis.margin.top - vis.margin.bottom;
    vis.g = vis.stack_svg.append("g").attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    vis.stack_svg.append("text")
        .attr("class", "graph-titles")
        .attr("x", (vis.width / 2))
        .attr("y", (vis.margin.top / 2))
        .attr("text-anchor", "middle")
        .attr("fill", "maroon")
        .text(function() {
            return vis.config;
        });

// set x scale
    vis.x = d3.scaleBand()
        .rangeRound([0, vis.width])
        .paddingInner(0.05)
        .align(0.1);

// set y scale
    vis.y = d3.scaleLinear()
        .rangeRound([vis.height, 0]);

// set the colors
    vis.z = d3.scaleOrdinal()
        //.range(['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f']);
        .range(['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928', '#999']);


// load the csv and create the chart

    var data = vis.data;

    var keys = vis.data.columns.slice(2);
    console.log(keys);
    console.log(data);

    //data.sort(function(a, b) { return b.total - a.total; });
    vis.x.domain(vis.data.map(function(d) { return d.date; }));
    vis.y.domain([0, d3.max(vis.data, function(d) { return d.all_per_month; })]).nice();
    vis.z.domain(keys);

    vis.g.append("g")
        .selectAll("g")
        .data(d3.stack().keys(keys)(vis.data))
        .enter().append("g")
        .attr("fill", function(d) { return vis.z(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("x", function(d) { return vis.x(d.data.date); })
        .attr("y", function(d) {
            return vis.y(d[1]); })
        .attr("height", function(d) { return vis.y(d[0]) - vis.y(d[1]); })
        .attr("width", vis.x.bandwidth())
        .on("mouseover", function(d) {
            //vis.tooltip.style("display", null);
            vis.tip.show(d);
        })
        .on("mouseout", function() {
            //vis.tooltip.style("display", "none");
            vis.tip.hide();
        });

    vis.g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(d3.axisBottom(vis.x)
            .tickFormat(d3.timeFormat("%b %Y")))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    vis.g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(vis.y).ticks(null, "s"))
        .append("text")
        .attr("x", 2)
        .attr("y", vis.y(vis.y.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start");

    vis.g.append("g")
        .attr("class", "y-axis axis")
        .append("text")
        .attr("transform", "rotate(-270)")
        .attr("x", vis.height/2)
        .attr("y", 35)
        .attr("dy", "1em")
        .attr("fill", "red")
        .attr("text-anchor", "middle")
        .text("Arrivals (Thousands)");

    vis.legend = vis.g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });



    vis.legend.append("rect")
        .attr("x", vis.width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", vis.z);

    vis.legend.append("text")
        .attr("x", vis.width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) {
            switch (d) {
                case "czech":
                    return"Czech Republic and Moravia";
                case "netherlands":
                    return "The Nerherlands";
                case "germany":
                    return "Germany and Austria";
                case "other_camps":
                    return "Other Camps";
                default:
                    return d.charAt(0).toUpperCase() + d.slice(1);
            }
        });

    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset(function(d){
            var offsetY = vis.y(d[0]);
            var offsetX = vis.x(d.data.date);
            return [-offsetY, 10];
        })
        .direction('se')
        .html(function(d) {
            console.log(d);
            var text =  "<h4>Arrivals in " + vis.monthNames[d.data.date.getMonth()] + " 19" + d.data.date.getYear() + "</h4>";
            text += "<span style='color: #ff7f00'>" + "Belgium: " + numberFormatter(d.data.belgium) + "</span><br>";
            text += "<span style='color: #e31a1c'>" + "Czech Republic/Moravia: " + numberFormatter(d.data.czech) + "</span><br>";
            text += "<span style='color: #b2df8a'>" + "France: " + numberFormatter(d.data.france) + "</span><br>";
            text += "<span style='color: #cab2d6'>" + "Germany and Austria: " + numberFormatter(d.data.germany) + "</span><br>";
            text += "<span style='color: #fb9a99'>" + "Greece: " + numberFormatter(d.data.greece) + "</span><br>";
            text += "<span style='color: #a6cee3'>" + "Hungary: " + numberFormatter(d.data.hungary) + "</span><br>";
            text += "<span style='color: #ffff99'>" + "Italy: " + numberFormatter(d.data.italy) + "</span><br>";
            text += "<span style='color: #33a02c'>" + "The Netherlands: " + numberFormatter(d.data.netherlands) + "</span><br>";
            text += "<span style='color: #b15928'>" + "Norway: " + numberFormatter(d.data.norway) + "</span><br>";
            text += "<span style='color: #1f78b4'>" + "Poland: " + numberFormatter(d.data.poland) + "</span><br>";
            text += "<span style='color: #fdbf6f'>" + "Slovakia: " + numberFormatter(d.data.slovakia) + "</span><br>";
            text += "<span style='color: #6a3d9a'>" + "Yugoslavia: " + numberFormatter(d.data.yugoslavia) + "</span><br>";
            text += "<span style='color: #999;'>" + "Other camps: " + numberFormatter(d.data.other_camps) + "</span><br>";
            return text; });

    vis.stack_svg.call(vis.tip);



    vis.wrangleData();
}

StackChart.prototype.wrangleData = function(){
    var vis = this;

    vis.displayData = vis.fundingData;


    // Update the visualization
    vis.updateVis();
}

StackChart.prototype.updateVis = function(){
    var vis = this;

}