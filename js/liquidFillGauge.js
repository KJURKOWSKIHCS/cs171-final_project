/*!
 * @license Open source under BSD 2-clause (http://choosealicense.com/licenses/bsd-2-clause/)
 * Copyright (c) 2015, Curtis Bratton
 * All rights reserved.
 */
(function(d3) {
    var idGenerator = (function() {
        var count = 0;
        return function(prefix) {
            return prefix + "-" + count++;
        };
    })();

    var defaultConfig = {
        // Values
        minValue: 0, // The gauge minimum value.
        maxValue: 100, // The gauge maximum value.

        // Styles
        backgroundColor: null, // The color of the background
        waveColor: "#a3210e", // The color of the fill wave.
        width: 0, // You might want to set the width and height if it is not detected properly by the plugin
        height: 0,

        // Gradient
        fillWithGradient: false, // Controls if the wave should be filled with gradient
        gradientPoints: [0, 0, 1., 1.], //  [x1, y1, x2, y2], coordinates for gradient start point(x1,y1) and final point(x2,y2)
        gradientFromColor: "#FFF",
        gradientToColor: "#000",

        // Waves
        waveHeight: 0.02, // The wave height as a percentage of the radius of the wave circle.
        waveCount: 4, // The number of full waves per width of the wave circle.
        waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.

        // Animations
        waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
        waveRiseTime: 700, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
        waveRiseAtStart: true, // If set to false and waveRise at true, will disable only the initial animation
        waveAnimate: true, // Controls if the wave scrolls or is static.
        waveAnimateTime: 14000, // The amount of time in milliseconds for a full wave to enter the wave circle.
        waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
        valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading and updating. If false, the final value is displayed.
        valueCountUpAtStart: true, // If set to false and valueCountUp at true, will disable only the initial animation

    };

    console.log(d3);

    d3.liquidfillgauge = function(g, value, settings) {
        // Handle configuration
        var config = d3.map(defaultConfig);
        d3.map(settings).each(function(val, key) {
            config.set(key, val);
        });


        g.each(function(d) {
            var gauge = d3.select(this);

            var width = config.get("width") !== 0 ? config.get("width") : parseInt(gauge.style("width"));
            var height = config.get("height") !== 0 ? config.get("height") : parseInt(gauge.style("height"));
            var radius = width/2;
            var locationX = width / 2 - radius;
            var locationY = height - radius;
            var fillPercent = Math.max(config.get("minValue"), Math.min(config.get("maxValue"), value)) / config.get("maxValue");

            var waveHeightScale;
            if (config.get("waveHeightScaling")) {
                waveHeightScale = d3.scaleLinear()
                    .range([0, config.get("waveHeight"), 0])
                    .domain([0, 50, 100]);
            } else {
                waveHeightScale = d3.scaleLinear()
                    .range([config.get("waveHeight"), config.get("waveHeight")])
                    .domain([0, 100]);
            }

            var textFinalValue = parseFloat(value).toFixed(2);
            var textStartValue = config.get("valueCountUp") ? config.get("minValue") : textFinalValue;
            var waveHeight = radius * waveHeightScale(fillPercent * 100);

            var waveLength = radius * 2 / config.get("waveCount");
            var waveClipCount = 1 + config.get("waveCount");
            var waveClipWidth = waveLength * waveClipCount;


            // Data for building the clip wave area.
            var data = [];
            for (var i = 0; i <= 40 * waveClipCount; i++) {
                data.push({
                    x: i / (40 * waveClipCount),
                    y: (i / (40))
                });
            };

            // Scales for controlling the size of the clipping path.
            var waveScaleX = d3.scaleLinear().range([0, waveClipWidth]).domain([0, 1]);
            var waveScaleY = d3.scaleLinear().range([0, waveHeight]).domain([0, 1]);

            // Scales for controlling the position of the clipping path.
            var waveRiseScale = d3.scaleLinear()
            // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
            // such that the it will won't overlap the fill circle at all when at 0%, and will totally cover the fill
            // circle at 100%.
                .range([(radius * 2 + waveHeight), (waveHeight)])
                .domain([0, 1]);
            var waveAnimateScale = d3.scaleLinear()
                .range([0, waveClipWidth - radius * 2]) // Push the clip area one full wave then snap back.
                .domain([0, 1]);

            // Center the gauge within the parent
            var gaugeGroup = gauge.append("g")
                .attr('transform', 'translate(' + locationX + ',' + locationY + ')');


            // The clipping wave area.
            var clipArea = d3.area()
                .x(function(d) {
                    return waveScaleX(d.x);
                })
                .y0(function(d) {
                    return waveScaleY(Math.sin(Math.PI * 2 * config.get("waveOffset") * -1 + Math.PI * 2 * (1 - config.get("waveCount")) + d.y * 2 * Math.PI));
                })
                .y1(function(d) {
                    return (radius * 2 + waveHeight);
                });

            var gaugeGroupDefs = gaugeGroup.append("defs");

            var clipId = idGenerator("clipWave");
            var waveGroup = gaugeGroupDefs
                .append("clipPath")
                .attr("id", clipId);
            var wave = waveGroup.append("path")
                .datum(data)
                .attr("d", clipArea);

            // The inner circle with the clipping wave attached.
            var fillCircleGroup = gaugeGroup.append("g")
                .attr("clip-path", "url(#" + clipId + ")");
            fillCircleGroup.append("rect")
                .attr("x", 0)
                .attr("y", 300)
                .attr("width", 1000)
                .attr("height", 150);


            fillCircleGroup.style("fill", config.get("waveColor"));


            // Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement can be controlled independently.
            var waveGroupXPosition = radius * 2 - waveClipWidth;

            if (config.get("waveAnimate")) {
                var animateWave = function() {
                    wave.transition()
                        .duration(config.get("waveAnimateTime"))
                        .ease(d3.easeLinear)
                        .attr('transform', 'translate(' + waveAnimateScale(1) + ',0)')
                        .on("end", function() {
                            wave.attr('transform', 'translate(' + waveAnimateScale(0) + ',0)');
                            animateWave();
                        });
                };
                animateWave();
            }

            var transition = function(from, to, riseWave) {
                // Update texts and animate


                // Update the wave
                toPercent = Math.max(config.get("minValue"), Math.min(config.get("maxValue"), to)) / config.get("maxValue");
                fromPercent = Math.max(config.get("minValue"), Math.min(config.get("maxValue"), from)) / config.get("maxValue");

                if (riseWave) {
                    waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fromPercent) + ')')
                        .transition()
                        .duration(config.get("waveRiseTime"))
                        .attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(toPercent) + ')');
                } else {
                    waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(toPercent) + ')');
                }
            };

            transition(
                textStartValue,
                textFinalValue,
                config.get("waveRise") && config.get("waveRiseAtStart"),
                config.get("valueCountUp") && config.get("valueCountUpAtStart")
            );

            // Event to update the value
            gauge.on("valueChanged", function(newValue) {
                transition(value, newValue, config.get("waveRise"), config.get("valueCountUp"));
                value = newValue;
            });

            gauge.on("destroy", function() {
                // Stop all the transitions
                waveGroup.interrupt().transition();
                wave.interrupt().transition();

                // Unattach events
                gauge.on("valueChanged", null);
                gauge.on("destroy", null);
            });
        });
    };
})(d3);