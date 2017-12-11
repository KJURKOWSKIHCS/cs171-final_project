
var curObject;
var zoomLevel = false;

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

    // (Filter, aggregate, modify data)
    vis.wrangleData(1912);
};


/*
 * Data wrangling
 */

MapChart.prototype.wrangleData = function(year){
    var vis = this;
    vis.displayedPoints = [];
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

    vis.campData.forEach(function(d) {
        var coordinates = vis.projection([d.Long, d.Lat]);
        if (parseInt(d.Start_date.slice(0, 4)) <= year && coordinates[0] <= vis.width && coordinates[1] <= vis.height - 200) {
            vis.displayedCamps.push(d);
        }
    });

    for (var key in vis.maxIndex) {
        var value = vis.maxIndex[key];
        var person = vis.displayedPoints.filter(function(data) {
            return data.Name === key;
        });
        person.sort(function(a, b) {
            return a.index - b.index;
        });
        for (var i = 0; i < value; i++) {
            vis.connections.push([person[i].Long, person[i].Lat, person[i+1].Long, person[i+1].Lat, key]);
        }
    }


    // Update the visualization
    vis.updateVis();
};


/*
 * The drawing function
 */

MapChart.prototype.updateVis = function(){
    var vis = this;

    //vis.gauge = vis.svg.call(d3.liquidfillgauge, 37);

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

    vis.tip_camp = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<p><strong>Camp Name:</strong> <span>" + d.Camp_name + "</span></p>"
                + "<p><strong>Prisoners:</strong> <span>" + numberFormatter(d.Est_prisoners) + "</span></p>"
                + "<p><strong>Deaths:</strong> <span>" + numberFormatter(d.Est_deaths) + "</span></p>"
                + "<p style='text-center; color: yellow'><strong>Click for more info</strong></p>";
        });

    vis.svg.call(vis.tip_camp);

    vis.tip_event = d3.tip()
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

    vis.svg.call(vis.tip_event);


    vis.connectors = vis.svg.selectAll(".connections")
        .data(vis.connections);


    vis.connectors
        .enter().append("line")
        .merge(vis.connectors)
        .attr("class", function(d) { return "connections " +  d[4];})
        .attr("x1", function(d) {return vis.projection([d[0], d[1]])[0];})
        .attr("x2", function(d) {return vis.projection([d[2], d[3]])[0];})
        .attr("y1", function(d) {return vis.projection([d[0], d[1]])[1];})
        .attr("y2", function(d) {return vis.projection([d[2], d[3]])[1];})
        .style("stroke", "black")
        .style("stroke-dasharray", ("7, 3"))
        .style("opacity", 0.3)
        .style("stroke-width", 5)
        .on('mouseover', function(d) {
            vis.svg.selectAll("." + d[4])
                .style("opacity", 1);
            //vis.highlight(d);
        })
        .on('mouseout', function(d) {
            vis.svg.selectAll("." + d[4])
                .style("opacity", 0.3);
        });

    vis.connectors.exit().remove();

    vis.camps = vis.svg.selectAll(".camps")
        .data(vis.displayedCamps);

    vis.camps
        .enter().append("rect")
        .attr("class", "camps")
        .merge(vis.camps)
        .attr("x", function(d) {return vis.projection([d.Long, d.Lat])[0]})
        .attr("y", function(d) {return vis.projection([d.Long, d.Lat])[1]})
        .attr("clip-path", "url(#map-clip)")
        .attr("width", 8)
        .attr("height", 8)
        .style("fill", "blue")
        .style("opacity", 0.5)
        .on('mouseover', vis.tip_camp.show)
        .on('mouseout', vis.tip_camp.hide)
        .on("click", function(d) { curObject = d;
            vis.zoom(d, zoomLevel, 'Camp');
        });

    vis.camps.exit().remove();


    vis.point = vis.svg.selectAll(".points")
        .data(vis.displayedPoints);

    vis.point
        .enter().append("circle")
        .attr("class", "points")
        .merge(vis.point)
        .attr("r", 6)
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
        .on('mouseover', vis.tip_event.show)
        .on('mouseout', vis.tip_event.hide)
        .on("click", function(d) { curObject = d;
            vis.zoom(d, zoomLevel, 'Event');
        });


    vis.point.exit().remove();



    vis.deathToll = vis.svg.append("text")
        .attr("x", vis.width/2)
        .attr("y", vis.height - 100)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", 30)
        .text("DEATH TOLL");



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
            console.log(d);
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
            console.log('circle');
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

};

MapChart.prototype.zoom = function(object, zoomed, objectType) {
    var vis = this;


    console.log($(vis.parentElement).width() + " is the parent div width at zoom, which is now");


    console.log(object);

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

        // $('#eventPictureObject').remove();
        // $('#eventDateObject').remove();
        // $('#eventPersonNameObject').remove();
        // $('#eventPlaceObject').remove();
        // $('#eventDescriptionObject').remove();

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

    vis.svg.selectAll(".connections")
        .transition().duration(1000)
        .attr("x1", function(d) {return vis.projection([d[0], d[1]])[0];})
        .attr("x2", function(d) {return vis.projection([d[2], d[3]])[0];})
        .attr("y1", function(d) {return vis.projection([d[0], d[1]])[1];})
        .attr("y2", function(d) {return vis.projection([d[2], d[3]])[1];});

    vis.newGauge(updateVal);

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

    vis.deathToll.remove();


    vis.deathToll = vis.svg.append("text")
        .attr("x", vis.width/2)
        .attr("y", vis.height - 100)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", 30)
        .text("DEATH TOLL");


};
//33 = 0 to 46 = 100
MapChart.prototype.newGauge = function(value) {
    var vis = this;
    console.log("you in here?");
    vis.gauge = vis.svg.call(d3.liquidfillgauge, value);
};

MapChart.prototype.highlight = function(lineData) {
    var vis = this;

    vis.svg.selectAll("." + lineData[4]);

};

