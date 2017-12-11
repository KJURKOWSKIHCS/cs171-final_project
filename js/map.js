
var curObject;
var zoomLevel = false;

MapChart = function(_parentElement, _data, _prisonerData, _connectionData, _campData){
    this.parentElement = _parentElement;
    this.data = _data;
    this.prisonerData = _prisonerData;
    this.connectionData = _connectionData;
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

    console.log($(vis.parentElement).width() + " is the map div width at init, which is now");


    vis.width = $(vis.parentElement).width(),
    vis.height = 950 - vis.margin.top - vis.margin.bottom;

    vis.mapCenter = [12, 52];

    vis.projection = d3.geoMercator()
        .center(vis.mapCenter)
        .scale(2100);

    vis.path = d3.geoPath()
        .projection(vis.projection);

    vis.svg = d3.select(vis.parentElement).append("svg")
        .attr("width", vis.width)
        .attr("height", vis.height);

    vis.zoomed = false;
    fromPercent = 0;

    vis.svg_legend = d3.select("#mapLegend").append("svg")
        .attr("class", "map-legend-box")
        .attr("width", "225px")
        .attr("height", "200px")
        .append("g")
        .attr("transform", "translate(" + 0 + "," + vis.margin.top + ")");

    vis.pastPrisoners = [];
    vis.pastCamps = [];


    //https://www.visualcinnamon.com/2016/06/glow-filter-d3-visualization.html

    //Container for the gradients
    var defs = vis.svg.append("defs");

    //Filter for the outside glow
    var filter = defs.append("filter")
        .attr("id","glow");
    filter.append("feGaussianBlur")
        .attr("stdDeviation","2")
        .attr("result","coloredBlur");
    var feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
        .attr("in","coloredBlur");
    feMerge.append("feMergeNode")
        .attr("in","SourceGraphic");

    vis.allStartingPoints = [
        {
            "Name":"Karl",
            "Surname": "Gorath",
            "index":"0",
            "max_index":"4",
            "died": "false",
            "Place_name": "Bad Zwishenahn",
            "Lat": "53.183611",
            "Long": "8.009722",
            "Event_date": "1912-12-12",
            "Description": "Karl Gorath was born in Bad Zwishenahn in northern Germany",
            "Source": "https://www.ushmm.org/wlc/en/media_oi.php?ModuleId=10005261&MediaId=278",
            "Photo_links":
                [
                    {
                        "File_name":"gorath-1.gif",
                        "Source":"",
                        "Photo_description":"Photo: Karl Gorath"
                    }
                ]
        },
        {
            "Name":"Etty",
            "Surname": "Hillesum",
            "index":"0",
            "max_index":"6",
            "died": "true",
            "Place_name": "Middelburg",
            "Lat": "51.5",
            "Long": "3.616667",
            "Event_date": "1914-01-15",
            "Description": "Etty (Esther) Hillesum was born in small town on Middelburg on 15th of January, 1914",
            "Source": "https://jwa.org/encyclopedia/article/hillesum-etty",
            "Photo_links":
                [
                    {
                        "File_name":"hillesum-1.png",
                        "Source":"",
                        "Photo_description":"Photo: Etty Hillesum"
                    }
                ]
        },
        {
            "Name":"Joseph",
            "Surname": "Mandrowitz",
            "index":"0",
            "max_index":"5",
            "died": "false",
            "Place_name": "Czemierniki",
            "Lat": "51.673056",
            "Long": "22.631667",
            "Event_date": "1925-10-05",
            "Description": "Joseph was born in Czermierniki, Poland. His father was a bootmaker and his mother was a seamstress. He was trained as a tailor and he left his house to work in his trade on a ranch 4 miles away from Czemierniki.",
            "Source": "https://www.theguardian.com/world/2015/jan/26/tales-from-auschwitz-survivor-stories",
            "Photo_links": [
                {
                    "File_name": "mandrowitz-2.jpg",
                    "Source": "http://chelm.freeyellow.com/czemierniki.html",
                    "Photo_description": "Family of Mandrowitz"
                }
            ]
        },
        {
            "Name": "Irene",
            "Surname": "Weiss",
            "index":"0",
            "max_index":"7",
            "died": "false",
            "Place_name":"Bótrágy",
            "Lat":"48.322778",
            "Long":"22.4125",
            "Event_date":"1930-11-21",
            "Description":"Irene Fogel Weiss was born on November 21, 1930 in Bótrágy, Czechoslovakia, now Batrad, Ukraine.",
            "Source":"https://www.theguardian.com/world/2015/jan/26/tales-from-auschwitz-survivor-stories",
            "Photo_links":
                [
                    {
                        "File_name":"weiss-1.jpeg",
                        "Source":"",
                        "Photo_description":"Photo: Irene Weiss"
                    }
                ]
        }
    ];


    // (Filter, aggregate, modify data)
    vis.wrangleData(1912);
};


/*
 * Data wrangling
 */

MapChart.prototype.wrangleData = function(year){
    var vis = this;
    vis.displayedPoints = [];
    vis.glowPrisoners = [];
    vis.glowCamps = [];
    vis.displayedCamps = [];

    vis.maxIndex = {
        "Irene": null,
        "Joseph": null,
        "Etty": null,
        "Karl": null
    };
    vis.connections = [];

    vis.world = topojson.feature(vis.data, vis.data.objects.countries).features;


    vis.prisonerData.forEach(function(d, i, array) {
        array[i].Geopoints.forEach(function(l, j, arr) {
            arr[j].Lat = +l.Lat;
            arr[j].Long = +l.Long;
            arr[j].index = +l.index;
            arr[j].max_index = +l.max_index;
        });
    });

    vis.prisonerData.forEach(function(d) {
        d.Geopoints.forEach(function(points) {
            if (parseInt(points.Event_date.slice(0,4)) <= year) {
                vis.displayedPoints.push(points);

                if (vis.maxIndex[points.Name] === null || vis.maxIndex[points.Name] < points.index)
                {
                    vis.maxIndex[points.Name] = points.index;
                }
            }
        });
    });

    vis.connectionData.forEach(function(d, i, array) {
        array[i].Origin = +array[i].Origin;
        array[i].Destination = +array[i].Destination;
        array[i].x1 = +array[i].x1;
        array[i].y1 = +array[i].y1;
        array[i].x2 = +array[i].x2;
        array[i].y2 = +array[i].y2;
    });

    vis.glowPrisoners = vis.displayedPoints.filter(function(d) {
        return vis.pastPrisoners.indexOf(d) < 0;
    });

    vis.campData.forEach(function(d, i, array) {
        array[i].Est_deaths = +d.Est_deaths;
        var coordinates = vis.projection([d.Long, d.Lat]);
        if (parseInt(d.Start_date.slice(0, 4)) <= year && coordinates[0] <= vis.width && coordinates[1] <= vis.height - 200) {
            vis.displayedCamps.push(d);
        }
    });

    vis.totalDeaths = 0;
    for (var k = 0; k < vis.campData.length; k++) {
        if (Number.isInteger(vis.campData[k].Est_deaths)) {
            vis.totalDeaths += vis.campData[k].Est_deaths;
        }
    }

    vis.glowCamps = vis.displayedCamps.filter(function(d) {
        return vis.pastCamps.indexOf(d) < 0;
    });

    vis.startingPoints = vis.displayedPoints.filter(function(d) {
        return d.index === 0;
    });

    vis.deathPoints = vis.displayedPoints.filter(function(d, i, array) {
        return d.index === d.max_index && d.died === "true";
    });

    vis.totalToDate = 0;
    if (year > 1932) {
        for (var i = 1; i < year - 1945 + 14; i++) {
            vis.totalToDate += i * (vis.totalDeaths/91);
        }
        vis.totalToDate = Math.floor(vis.totalToDate);
    }


    // Update the visualization
    vis.updateVis();
};


/*
 * The drawing function
 */

MapChart.prototype.updateVis = function(){
    var vis = this;

    vis.svg.append("clipPath")
        .attr("id", "map-clip")
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", vis.width)
        .attr("height", vis.height - 200);


    vis.svg.selectAll("path")
        .data(vis.world)
        .enter().append("path")
        .attr("d", vis.path)
        .attr("clip-path", "url(#map-clip)")
        .style("fill", "darkgrey")
        .style("stroke", "lightgrey");

    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<p><strong>Camp Name:</strong> <span>" + d.Camp_name + "</span></p>"
                + "<p><strong>Prisoners:</strong> <span>" + numberFormatter(d.Est_prisoners) + "</span></p>"
                + "<p><strong>Deaths:</strong> <span>" + numberFormatter(d.Est_deaths) + "</span></p>"
                + "<p style='text-center; color: yellow'><strong>Click for more info</strong></p>";
        });

    vis.svg.call(vis.tip);

    vis.pointTip = d3.tip()
        .attr('class', 'd3-tip eventTip')
        .offset([-10, 0])
        .html(function(d) {
            var image = "img/profile/" + d.Profile_picture;

            return "<div id='tipPicture'><img id='eventPictureObject' src=" + image + " style='width:50px;'/></div>"
                + "<p><strong>Name:</strong> <span>" + d.Name + " " + d.Surname + "</span></p>"
                + "<p><strong>Place:</strong> <span>" + d.Place_name + "</span></p>"
                + "<p><strong>Date:</strong> <span>" + d.Event_date + "</span></p>"
                + "<p style='text-center; color: maroon'><strong>Click for more info</strong></p>";
        });

    vis.svg.call(vis.pointTip);

    vis.clips = vis.svg.selectAll(".picClips")
        .data(vis.allStartingPoints).enter()
        .append("clipPath")
        .attr("id", function(d) {return d.Name + "-clip";})
        .append("circle")
        .attr("cx", function(d) {
            if (d.Name === "Karl" || d.Name === "Etty") {
                return vis.projection([d.Long, d.Lat])[0] - 40;
            }
            else {
                return vis.projection([d.Long, d.Lat])[0] + 55;
            }
        })
        .attr("cy", function(d) {return vis.projection([d.Long, d.Lat])[1] - 40})
        .attr("r", 25);

    vis.picLines = vis.svg.selectAll(".picLines")
        .data(vis.startingPoints);

    vis.picLines.enter().append("line")
        .merge(vis.picLines)
        .attr("id", function(d) {return d.Name + "-line"})
        .attr("class", "picLines")
        .attr("x1", function(d) {
            if (d.Name === "Karl" || d.Name === "Etty") {
                return vis.projection([d.Long, d.Lat])[0] - 40;
            }
            else {
                return vis.projection([d.Long, d.Lat])[0] + 55;
            }
        })
        .attr("x2", function(d) {
            if (d.Name === "Karl" || d.Name === "Etty") {
                return vis.projection([d.Long, d.Lat])[0] - 6;
            }
            else {
                return vis.projection([d.Long, d.Lat])[0] + 6;
            }
        })
        .attr("y1", function(d) {return vis.projection([d.Long, d.Lat])[1] - 40})
        .attr("y2", function(d) {return vis.projection([d.Long, d.Lat])[1] - 6})
        .style("opacity", 1)
        .style("stroke", "white");

    vis.picLines.exit().remove();

    vis.picLabels = vis.svg.selectAll(".picLabels")
        .data(vis.startingPoints);

    vis.picLabels
        .enter().append("svg:image")
        .merge(vis.picLabels)
        .attr("class", "picLabels")
        .attr("x", function(d) {
            if (d.Name === "Karl" || d.Name === "Etty") {
                return vis.projection([d.Long, d.Lat])[0] - 65;
            }
            else {
                return vis.projection([d.Long, d.Lat])[0] + 30;
            }
        })
        .attr("y", function(d) {
            return vis.projection([d.Long, d.Lat])[1] - 65;
        })
        .attr("width", 50)
        .attr("height", 50)
        .attr("xlink:href", function(d) {return "img/profile/" + d.Name + ".PNG"})
        .attr("clip-path", function(d) {return "url(#" + d.Name + "-clip"});

    vis.picLabels.exit().remove();


    vis.connectionData.forEach(function(d, i, array) {

        if (d.displayed === "true" &&
            vis.displayedPoints.filter(function (data) {
                return d.Name === data.Name && d.Origin === data.index;
            }).length === 0 ||
            vis.displayedPoints.filter(function (data) {
                return d.Name === data.Name && d.Destination === data.index;
            }).length === 0) {
            vis.svg.selectAll("#" + d.Name + d.Origin + d.Destination).remove();
            array[i].displayed = "false";
        }


        if (vis.displayedPoints.filter(function (data) {
            return d.Name === data.Name && d.Origin === data.index;}).length !== 0 &&
            vis.displayedPoints.filter(function(data) {
                return d.Name === data.Name && d.Destination === data.index;}).length !== 0) {

            if (d.displayed === "false") {
                vis.connectors = vis.svg
                    .append("line")
                    .attr("id", d.Name + d.Origin + d.Destination)
                    .attr("class", d.Name + "-connector connect")
                    .attr("x1", vis.projection([d.x1, d.y1])[0])
                    .attr("y1", vis.projection([d.x1, d.y1])[1])
                    .attr("x2", vis.projection([d.x1, d.y1])[0])
                    .attr("y2", vis.projection([d.x1, d.y1])[1])
                    .style("stroke", "black")
                    .style("stroke-dasharray", ("13, 3"))
                    .style("opacity", 0.3)
                    .style("stroke-width", 5)
                    .on('mouseover', function() {
                        vis.svg.selectAll("." + d.Name + "-connector")
                            .style("opacity", 1);
                    })
                    .on('mouseout', function() {
                        vis.svg.selectAll("." + d.Name + "-connector")
                            .style("opacity", 0.3);
                    });

                vis.connectors.transition().duration(1000)
                    .attr("x2", vis.projection([d.x2, d.y2])[0])
                    .attr("y2", vis.projection([d.x2, d.y2])[1]);

                array[i].displayed = "true";
            }
        }
    });


    vis.camps = vis.svg.selectAll(".camps")
        .data(vis.displayedCamps);

    vis.camps
        .enter().append("rect")
        .attr("class", "camps")
        .merge(vis.camps)
        .attr("x", function(d) {return vis.projection([d.Long, d.Lat])[0]})
        .attr("y", function(d) {return vis.projection([d.Long, d.Lat])[1]})
        .attr("clip-path", "url(#map-clip)")
        .attr("width", function(d) {
            if (d.Camp_name === "Auschwitz-Birkenau") {
                return 15;
            }
            else {return 8;}
        })
        .attr("height", function(d) {
            if (d.Camp_name === "Auschwitz-Birkenau") {
                return 15;
            }
            else {return 8;}
        })
        .style("fill", "blue")
        .style("opacity", function(d) {
            if (d.Camp_name === "Auschwitz-Birkenau") {
                return 1;
            }
            else {return 0.5;}
        })
        .on("mouseover", function(d) {
            vis.tip.show(d);
            addGlowSquare(d);
        })
        .on('mouseout', function(d) {
            vis.tip.hide(d);
            removeGlow();
        })
        .on("click", function(d) { curObject = d;
            vis.zoom(d, zoomLevel, 'Camp');
        });


    vis.camps.exit().remove();

    var arc = d3.arc()
        .innerRadius(6)
        .outerRadius(6)
        .startAngle(0)
        .endAngle(10);

    var newArc = d3.arc()
        .innerRadius(6)
        .outerRadius(12)
        .startAngle(0)
        .endAngle(10);

    var auschwitzArc = d3.arc()
        .innerRadius(10)
        .outerRadius(10)
        .startAngle(0)
        .endAngle(10);

    var auschwitzNewArc = d3.arc()
        .innerRadius(9)
        .outerRadius(20)
        .startAngle(0)
        .endAngle(10);

    vis.glowCircle = vis.svg.selectAll(".glow-circle")
        .data(vis.glowPrisoners)
        .enter().append("path")
        .attr("class", "glow-circle")
        .attr("d", arc)
        .attr("transform", function(d) {
            return "translate(" + vis.projection([d.Long, d.Lat])[0] + "," + vis.projection([d.Long, d.Lat])[1] + ")";
        })
        .style("fill", "yellow")
        .style("stroke", "transparent")
        .style("filter", "url(#glow)")
        .style("fill-opacity", "0.3")
        .transition().duration(1000)
        .attr("d", newArc)
        .transition().duration(1000)
        .attr("d", arc)
        .on("end", function() {
            vis.svg.selectAll(".glow-circle").remove();
        });

    vis.glowSquare = vis.svg.selectAll(".glow-square")
        .data(vis.glowCamps)
        .enter().append("path")
        .attr("class", "glow-square")
        .attr("d", arc)
        .attr("transform", function(d) {
            return "translate(" + (vis.projection([d.Long, d.Lat])[0] + 4) + "," + (vis.projection([d.Long, d.Lat])[1] + 4) + ")";
        })
        .style("fill", "yellow")
        .style("stroke", "transparent")
        .style("filter", "url(#glow)")
        .style("fill-opacity", function(d) {
            if (d.Camp_name !== "Auschwitz-Birkenau") {
                return "0.3";
            }
            else {
                auschGlow(d);
                return "0";
            }
        })
        .transition().duration(1000)
        .attr("d", newArc)
        .transition().duration(1000)
        .attr("d", arc)
        .on("end", function() {
            vis.svg.selectAll(".glow-square").remove();
        });

    function auschGlow (campData) {
        vis.svg.append("path")
            .attr("class", "ausch-glow")
            .attr("d", auschwitzArc)
            .attr("transform", function(d) {
                return "translate(" + (vis.projection([campData.Long, campData.Lat])[0] + 7.5) + "," + (vis.projection([campData.Long, campData.Lat])[1] + 7.5) + ")";
            })
            .style("fill", "yellow")
            .style("stroke", "transparent")
            .style("filter", "url(#glow)")
            .style("fill-opacity", "0.3")
            .transition().duration(1000)
            .attr("d", auschwitzNewArc)
            .transition().duration(1000)
            .attr("d", auschwitzArc)
            .on("end", function() {
                vis.svg.selectAll(".ausch-glow").remove();
            });
    }


    function addGlowCircle(hoverData) {
        vis.svg.append("path")
            .attr("class", "mouse-glow")
            .attr("d", newArc)
            .attr("transform", function(d) {
                return "translate(" + vis.projection([hoverData.Long, hoverData.Lat])[0] + "," + vis.projection([hoverData.Long, hoverData.Lat])[1] + ")";
            })
            .style("fill", "yellow")
            .style("stroke", "transparent")
            .style("filter", "url(#glow)")
            .style("fill-opacity", "0.3");
    }

    function removeGlow () {
        vis.svg.selectAll(".mouse-glow").remove();
    }

    function addGlowSquare(hoverData) {
        if (hoverData.Camp_name !== "Auschwitz-Birkenau") {
            vis.svg.append("path")
                .attr("class", "mouse-glow")
                .attr("d", newArc)
                .attr("transform", function() {
                    return "translate(" + (vis.projection([hoverData.Long, hoverData.Lat])[0] + 4) + "," + (vis.projection([hoverData.Long, hoverData.Lat])[1] + 4) + ")";
                })
                .style("fill", "yellow")
                .style("stroke", "transparent")
                .style("filter", "url(#glow)")
                .style("fill-opacity", "0.3");
        }
        else {
            vis.svg.append("path")
                .attr("class", "mouse-glow")
                .attr("d", auschwitzNewArc)
                .attr("transform", function() {
                    return "translate(" + (vis.projection([hoverData.Long, hoverData.Lat])[0] + 7.5) + "," + (vis.projection([hoverData.Long, hoverData.Lat])[1] + 7.5) + ")";
                })
                .style("fill", "yellow")
                .style("stroke", "transparent")
                .style("filter", "url(#glow)")
                .style("fill-opacity", "0.3");
        }

    }

    vis.textNames = vis.toList(vis.maxIndex);

    for (var i = 0; i < vis.textNames.length; i++) {
        if (vis.textNames[i][1] !== null) {
            var associatedPoint = vis.prisonerData[i].Geopoints.filter(function(prisoner) {
                return prisoner.index === vis.textNames[i][1];
            });

            vis.nameLabel = vis.svg.selectAll("." + vis.textNames[i][0])
                .data(associatedPoint);

            vis.nameLabel.enter()
                .append("text")
                .attr("class", function() {return vis.textNames[i][0];})
                .merge(vis.nameLabel)
                .transition().duration(1000)
                .style("opacity", 1)
                .attr("x", function(d) {
                    if (d.Name === "Karl" && d.index !== 1) {
                        return vis.projection([d.Long, d.Lat])[0] - 40;
                    }
                    if (d.Name === "Irene") {
                        return vis.projection([d.Long, d.Lat])[0] + 17;
                    }
                    else {
                        return vis.projection([d.Long, d.Lat])[0] + 10;
                    }
                })
                .attr("y", function(d) {
                    if (d.Name === "Etty") {
                        return vis.projection([d.Long, d.Lat])[1] + 16;
                    }
                    if (d.Name === "Irene") {
                        return vis.projection([d.Long, d.Lat])[1] + 20;
                    }
                    else {
                        return vis.projection([d.Long, d.Lat])[1] - 7;
                    }
                })
                .text(function(d) {return vis.textNames[i][0];});

            vis.nameLabel.exit().remove();
        }
        else {
            if (vis.nameLabel) {
                vis.svg.selectAll("." + vis.textNames[i][0]).remove();
            }
        }
    }

    vis.svg.selectAll(".points").remove();

    vis.point = vis.svg.selectAll(".points")
        .data(vis.displayedPoints);

    vis.point
        .enter().append("circle")
        .attr("class", "points")
        .merge(vis.point)
        .attr("r", 7)
        .attr("cx", function(d) {return vis.projection([d.Long, d.Lat])[0];})
        .attr("cy", function(d) {return vis.projection([d.Long, d.Lat])[1];})
        .style("fill", function(d) {
            if (d.index === vis.maxIndex[d.Name]) {
                return "crimson";
            }
            else {
                return "pink";
            }
        })
        .style("stroke", "black")
        .on("click", function(d) { curObject = d;
            vis.zoom(d, zoomLevel, 'Event');
        })
        .on("mouseover", function(d) {
            vis.pointTip.show(d);
            addGlowCircle(d);
        })
        .on("mouseout", function(d) {
            vis.pointTip.hide(d);
            removeGlow();
        });

    vis.point.exit().remove();

    vis.deathIcon = vis.svg.selectAll(".deaths")
        .data(vis.deathPoints);


    vis.deathIcon.enter().append("svg:image")
        .attr("class", "death-image")
        .merge(vis.deathIcon)
        .attr("x", function(d) {return vis.projection([d.Long, d.Lat])[0] - 10;})
        .attr("y", function(d) {return vis.projection([d.Long, d.Lat])[1] - 12;})
        .attr("width", 20)
        .attr("height", 20)
        .attr("xlink:href", "img/death.png")
        .on("click", function(d) { curObject = d;
            vis.zoom(d, zoomLevel, 'Event');})
        .on("mouseover", function(d) {
            vis.pointTip.show(d);
            addGlowCircle(d);
        })
        .on("mouseout", function(d) {
            vis.pointTip.hide(d);
            removeGlow();
        });

    vis.svg.selectAll(".death-image")
        .style("opacity", function(d) {
            if (vis.maxIndex[d.Name] === d.max_index && d.died === "true") {return 1; }
            else {return 0;}
        });

    vis.deathIcon.exit().remove();

    vis.svg.selectAll(".deathToll").remove();

    vis.deathToll = vis.svg.append("text")
        .attr("class", "deathToll")
        .attr("x", vis.width/2)
        .attr("y", vis.height - 100)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", 30)
        .text("DEATH TOLL    " + vis.totalToDate);


    vis.ordinal = d3.scaleOrdinal()
        .domain(["Concentration Camp", "Prisoner Event", "Prisoner Current Location"])
        .range([ "rgb(0, 0, 255)", "rgb(255, 192, 203)", "rgb(237,20,61)"]);

    var legendRectSize = 18;
    var legendSpacing = 10;


    vis.legend = vis.svg_legend.selectAll('.legend')                     // NEW
        .data(vis.ordinal.domain())                                   // NEW
        .enter()                                                // NEW
        .append('g')                                            // NEW
        .attr('class', 'legend')                                // NEW
        .attr('transform', function(d, i) {                     // NEW// NEW
            var offset = (20 * i) + legendSpacing;
            return 'translate(' + '0' + ',' + offset + ')';        // NEW
        });
        // NEW

    var width;
    var height;

    vis.legend.each(function(d, i) {
        if (d === 'Concentration Camp') {
            vis.legend.append('rect')// NEW
                .attr('width', function(d, i) {
                    if (d === 'Concentration Camp') {
                        return legendRectSize;
                    }
                    else {
                        return '0px';
                    }
                })                          // NEW
                .attr('height', legendRectSize)                         // NEW
                .style('fill', vis.ordinal)                                   // NEW
                .style('stroke', 'white');
        }
        else {
            vis.legend.append('circle')
                .attr('r', function(d, i) {
                    if (d === 'Concentration Camp') {
                        return '0px';
                    }
                    else {
                        return legendRectSize / 2;
                    }
                })
                .style('fill', vis.ordinal)                                   // NEW
                .style('stroke', 'white')
                .attr('transform', function(d, i) {                     // NEW// NEW
                    return 'translate(10,10)';        // NEW
                });
        }
    });

                                // NEW

    vis.legend.append('text')                                     // NEW
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .style('stroke', 'maroon')
        .style('fill', 'white')
        .attr('font-size', '15px')
        .attr('transform', function(d,i) {
            return 'translate(0,8)';
        })
        .text(function(d) { return d; });

    vis.pastPrisoners = vis.displayedPoints;
    vis.pastCamps = vis.displayedCamps;
    vis.pastConnections = vis.connections;

};

MapChart.prototype.zoom = function(object, zoomed, objectType) {
    var vis = this;


    console.log($(vis.parentElement).width() + " is the parent div width at zoom, which is now");


    if (!zoomed) {
        zoomLevel = true;

    vis.projection
        .center([object.Long, object.Lat])
        .scale(9000);

    $('#myModal').modal('toggle');

        if (objectType === 'Camp') {
            vis.fillCampModal(object);
        }
        else {
            vis.fillModal(object);
        }

    }
    else {
        zoomLevel = false;

        vis.projection
            .center(vis.mapCenter)
            .scale(2100);

        $('.modal-content').remove();
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


    vis.svg.selectAll(".picLabels")
        .transition().duration(1200)
        .style("opacity", function() {
            if (vis.svg.selectAll(".picLabels").style("opacity") === "1") {
                return "0";
            }
            else {
                return "1";
            }
        });

    vis.svg.selectAll(".death-image")
        .transition().duration(1200)
        .style("opacity", function() {
            if (vis.svg.selectAll(".death-image").style("opacity") === "1") {
                return "0";
            }
            else {
                return "1";
            }
        });

    vis.svg.selectAll(".connect")
        .transition().duration(1200)
        .style("opacity", function() {
            if (vis.svg.selectAll(".connect").style("opacity") === "0.3") {
                return "0";
            }
            else {
                return "0.3";
            }
        });

    vis.svg.selectAll(".picLines")
        .transition().duration(1200)
        .style("opacity", function() {
            if (vis.svg.selectAll(".picLines").style("opacity") === "1") {
                return "0";
            }
            else {
                return "1";
            }
        });

    vis.textNames.forEach(function(d) {
        console.log(d);
        vis.svg.selectAll("." + d[0])
            .transition().duration(1200)
            .style("opacity", function() {
                if (vis.svg.selectAll("." + d[0]).style("opacity") === "1") {
                    return "0";
                }
                else {
                    return "1";
                }
            });
    });

    vis.newGauge(updateVal);

    vis.svg.selectAll(".deathToll").remove();

    vis.deathToll = vis.svg.append("text")
        .attr("class", "deathToll")
        .attr("x", vis.width/2)
        .attr("y", vis.height - 100)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", 30)
        .text("DEATH TOLL    " + numberFormatter(vis.totalToDate));

};

MapChart.prototype.createBarChart = function(pageLocation, divWidth) {
    var vis = this;

    console.log("activated function");

    $( "svg.legend-box" ).remove();
    $( "svg.bar-chart" ).remove();

    console.log(auschwitz_ethnicities);

    var barchart = new BarChart(pageLocation, auschwitz_ethnicities, "Auschwitz By Ethnicity", vis.svg, "legendBox", divWidth);
    console.log("called create bar chart");

}

MapChart.prototype.createStackChart = function(pageLocation, classLocation, divWidth, data, config) {
    var vis = this;

    //$( "svg." + classLocation ).remove();


    var stackChart = new StackChart(pageLocation, classLocation, data, config);
    console.log("called create stack chart");

}

MapChart.prototype.fillModal = function(object) {
    var vis = this;

    console.log(object.Place_name);

    $("#schemaFill").html(eventSchema);
    console.log("object photo links array size:" + object.Photo_links.length);

    if (object.Photo_links.length !== 0) {
        console.log(object.Photo_links[0].File_name);

        var image = "img/" + object.Photo_links[0].File_name;
        $('#existingPicture').append('<figure id="picFigure"></figure>');
        $('#picFigure').append('<img id="eventPictureObject" style="max-height:500px; height:expression(this.height > 500 ? 500 : true);"/>');
        $('#eventPictureObject').attr("src", image);
        $('#picFigure').append('<figcaption>' + object.Photo_links[0].Photo_description + '</figcaption>')
    }

    $('#eventDate').html("<h1 id='eventDateObject'> Date: " + object.Event_date + "</h1>");

    $('#eventPersonName').html("<h2 id='eventPersonNameObject'>Name: " + object.Name + "</h2>");

    $('#eventPlace').html("<h2 id='eventPlaceObject'>Place: " + object.Place_name + "</h2>");

    $('#eventInfo').html("<p id='eventDescriptionObject'>" + object.Description + "</p>");


}

MapChart.prototype.fillCampModal = function(object) {
    var vis = this;


    if (object.Camp_name === 'Auschwitz-Birkenau') {
        $("#schemaFill").html(auschwitzSchema);


        var image = "img/" + object.Photo;
        $('#existingPicture').append('<figure id="picFigure"></figure>');
        $('#picFigure').append('<img id="eventPictureObject" style="max-height:500px; height:expression(this.height > 500 ? 500 : true);"/>');
        $('#eventPictureObject').attr("src", image);
        $('#picFigure').append('<figcaption>' + object.Photo_description + '</figcaption>');

        $('#campName').html("<h1 id='infoCampName'>" + object.Camp_name + "</h1>");

        $('#campType').html("<h2 id='infoCampType'>Type: " + object.Camp_type + "</h2>");

        $('#countryToday').html("<p id='infoCountryToday'>Country today: " + object.Country_today + "</p>");

        $('#operationDates').html("<p id='infoOperationDates'>Dates of operation: " + object.Start_date + " to " + object.End_date + "</p>");

        $('#estDeaths').html("<p id='infoEstDeaths'>Estimated number of deaths: " + numberFormatter(object.Est_deaths) + "</p>");

        $('#estPrisoners').html("<p id='infoEstPrisoners'>Estimated number of prisoners: " + numberFormatter(object.Est_prisoners) + "</p>");

        $('#totalYears').html("<p id='infoTotalYears'>Open for: " + object.Total_years + " year(s)" + "</p>");


        $('#myModal').on('shown.bs.modal', function (e) {
            setTimeout(function () {
                var modalBodyWidth = $('.modal-body').width();
                vis.createBarChart("campVis1", modalBodyWidth);
                vis.createStackChart("stack-chart", "stack_chart", modalBodyWidth, totalDataClean, "Auschwitz By Arrivals (Early)");
                vis.createStackChart("stack-chart-later", "stack_chart_later", modalBodyWidth, totalDataCleanLate, "Auschwitz By Arrivals (Late)");

            }, 50);
        });


        //vis.createBarChart("campVis2");
    }
    else {
        $("#schemaFill").html(campSchemaGeneral);

        var photo_name = '';

        if (object.Photo === '') {
            photo_name = 'auschwitz.jpg';
        }
        else {
            photo_name = object.Photo;
        }

        var image = "img/" + photo_name;
        $('#existingPicture').append('<figure id="picFigure"></figure>');
        $('#picFigure').append('<img id="eventPictureObject" style="max-height:500px; height:expression(this.height > 500 ? 500 : true);"/>');
        $('#eventPictureObject').attr("src", image);
        $('#picFigure').append('<figcaption>' + object.Photo_description + '</figcaption>');

        $('#campName').html("<h1 id='infoCampName'>" + object.Camp_name + "</h1>");

        $('#campType').html("<h2 id='infoCampType'>Type: " + object.Camp_type + "</h2>");

        $('#countryToday').html("<p id='infoCountryToday'>Country today: " + object.Country_today + "</p>");

        $('#operationDates').html("<p id='infoOperationDates'>Dates of operation: " + object.Start_date + " to " + object.End_date + "</p>");

        $('#estDeaths').html("<p id='infoEstDeaths'>Estimated number of deaths: " + numberFormatter(object.Est_deaths) + "</p>");

        $('#estPrisoners').html("<p id='infoEstPrisoners'>Estimated number of prisoners: " + numberFormatter(object.Est_prisoners) + "</p>");

        $('#totalYears').html("<p id='infoTotalYears'>Open for: " + object.Total_years + " year(s)..." + "</p>");


    }
};

MapChart.prototype.zoomController = function(object) {
    var vis = this;
}

$('#myModal').on('hidden.bs.modal', function (e) {
    var vis = this;

    zoomLevel = true;
    europeMap.zoom(curObject, zoomLevel, 'Unzoom');

});

MapChart.prototype.generateTears = function(year) {
    var vis = this;

    var exponator = year - 1931;

    vis.displayedCamps.forEach(function(camp) {
        var yearsSoFar = year - parseInt(camp.Start_date.slice(0,4));
        var totalYears = parseInt(camp.Total_years);
        var yearsRemaining = totalYears - yearsSoFar;
        var numberOfDrops = camp.Est_deaths*Math.pow(0.5, yearsRemaining);
        numberOfDrops = Math.floor(numberOfDrops / 500);

        function getRandomBetween(min, max) {
            return Math.random() * (max - min) + min;
        }

        for (var i = 0; i < exponator; i++) {
            var hi = vis.svg.append("path")
                .attr("class", "tears")
                .attr("d", function() {
                    var centerx = vis.projection([camp.Long, camp.Lat])[0] + getRandomBetween(-10, 10);
                    var centery = vis.projection([camp.Long, camp.Lat])[1] + 2;
                    var controlOneQx = centerx + 1.5;
                    var controlOneQy = centery + 3.8;
                    var qOneX = centerx + 3;
                    var qOneY = centery + 7;
                    var aRx = 3.5;
                    var aRy = 3.5;
                    var aRotation = 0;
                    var laFlag = 1;
                    var sFlag = 1;
                    var aX = centerx - 3;
                    var aY = centery + 7;
                    var controlTwoQx = centerx - 1.5;
                    var controlTwoQy = controlOneQy;
                    var qTwox = centerx;
                    var qTwoy = centery;
                    var m = "M" + centerx + " " + centery + " ";
                    var q1 = "Q" + controlOneQx + " " + controlOneQy + " " + qOneX + " " + qOneY + " ";
                    var a = "A" + aRx + " " + aRy + " " + aRotation + " " + laFlag + " " + sFlag + " " + aX + " " + aY + " ";
                    var q2 = "Q" + controlTwoQx + " " + controlTwoQy + " " + qTwox + " " + qTwoy + "z";

                    return m + q1 + a + q2;
                })
                .style("fill", "#a3210e")
                .style("stroke", "#a3210e");

            hi
                .transition().duration(getRandomBetween(1000, 2000))
                .attr("d", function() {
                    var centerx = vis.projection([camp.Long, camp.Lat])[0] + getRandomBetween(-10, 10);
                    var centery = vis.height;
                    var controlOneQx = centerx + 1.5;
                    var controlOneQy = centery + 3.8;
                    var qOneX = centerx + 3;
                    var qOneY = centery + 7;
                    var aRx = 3.5;
                    var aRy = 3.5;
                    var aRotation = 0;
                    var laFlag = 1;
                    var sFlag = 1;
                    var aX = centerx - 3;
                    var aY = centery + 7;
                    var controlTwoQx = centerx - 1.5;
                    var controlTwoQy = controlOneQy;
                    var qTwox = centerx;
                    var qTwoy = centery;
                    var m = "M" + centerx + " " + centery + " ";
                    var q1 = "Q" + controlOneQx + " " + controlOneQy + " " + qOneX + " " + qOneY + " ";
                    var a = "A" + aRx + " " + aRy + " " + aRotation + " " + laFlag + " " + sFlag + " " + aX + " " + aY + " ";
                    var q2 = "Q" + controlTwoQx + " " + controlTwoQy + " " + qTwox + " " + qTwoy + "z";

                    return m + q1 + a + q2;
                })
                .remove();
        }
    });

    vis.updateGauge(year);
};

MapChart.prototype.updateGauge = function(year) {
    var vis = this;

    if (year <= 1932) {
        updateVal = 33;
    }
    else if (year <= 1937) {
        updateVal = 0.3*(year - 1932) + 33;
    }
    else if (year <= 1941) {
        updateVal = (0.3*(1937 - 1932)) + (year - 1937) + 33;
    }
    else if (year <= 1945) {
        updateVal = (0.3*(1937 - 1932)) + (1941 - 1937) + (1.875*(year - 1941)) + 33;
    }

    console.log(updateVal);

    vis.svg.selectAll(".fill-gauge-cont").remove();
    vis.newGauge(updateVal);

};
//33 = 0 to 46 = 100
MapChart.prototype.newGauge = function(value) {
    var vis = this;

    vis.gauge = vis.svg.call(d3.liquidfillgauge, value);

    vis.svg.selectAll(".deathToll").remove();

    vis.deathToll = vis.svg.append("text")
        .attr("class", "deathToll")
        .attr("x", vis.width/2)
        .attr("y", vis.height - 100)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", 30)
        .text("DEATH TOLL    " + numberFormatter(vis.totalToDate));
};

MapChart.prototype.highlight = function(lineData) {
    var vis = this;

    vis.svg.selectAll("." + lineData[4]);

};

MapChart.prototype.toList = function(dict) {
    return Object.keys(dict).map(function (key) {
        return [key, dict[key]];
    });
};

