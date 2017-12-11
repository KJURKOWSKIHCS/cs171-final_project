/**
 * Created by Krystian Jurkowski on 11/13/2017.
 */

var min = 1912;
var max = 1945;
var currVal = 1914;
var playShow;
var currYear = 1945;

$("#time-slider").slider({
    orientation: "vertical",
    range: "min",
    min: min,
    max: max,
    value: max,
    step: 1,
    slide: function(event, ui) {
        //$("#amount-backwards").val(1945 - ui.value + 1937);
        var year = max - ui.value + min;
        $('#time-selected').html(year);
        europeMap.wrangleData(year);
        if (year > currVal) {
            europeMap.generateTears(year);
        }
        else {
            europeMap.updateGauge(year);
        }
        currVal = year;
    }

});



$('#time-selected').html(max - $("#time-slider").slider("value") + min);

$('#autoplay').on('click', function () {

    setValue(currYear);

    var theYear = $("#time-slider").slider('value');




    playShow = setInterval(function () {


        theYear-=1;

        setValue( theYear );
        var year = max - $("time-slider").slider("value") + min;
        europeMap.wrangleData(year);
        if (year > currVal) {
            europeMap.generateTears(year);
        }
        else {
            europeMap.updateGauge(year);
        }
        currVal = year;

        if(theYear === min){
            clearInterval( playShow );
        }

    }, 1000);
});


$('#plus').on('click', function () {


    var theYear = $("#time-slider").slider('value');

    currYear = theYear - 1;

    setValue( theYear - 1);

    var yearTranslated = max - theYear + min;

    europeMap.wrangleData(yearTranslated);
    if (yearTranslated > currVal) {
        europeMap.generateTears(yearTranslated);
    }
    else {
        europeMap.updateGauge(yearTranslated);
    }
    currVal = yearTranslated;
});

$('#minus').on('click', function () {


    var theYear = $("#time-slider").slider('value');

    currYear = theYear + 1;

    setValue( theYear + 1);

    var yearTranslated = max - theYear + min;

    europeMap.wrangleData(yearTranslated);
    if (yearTranslated > currVal) {
        europeMap.generateTears(yearTranslated);
    }
    else if (yearTranslated <= 1912) {
        return;
    }
    else {
        europeMap.updateGauge(yearTranslated);
    }
    currVal = yearTranslated;
});

$('#pause').on('click', function () {


    var theYear = $("#time-slider").slider('value');

    currYear = theYear;

    clearInterval(playShow);

    setValue( theYear );
});


// For the Set clickable values, we use variable theValue to supply value.
function setValue(theValue) {

    // Animate the Button to the value clicked on.
    $("#time-slider").slider('value', theValue);

    //Display the numeric value on the html page.
    //$("#amount-backwards").val(1945 - $("#time-slider").slider("value") + 1937);
    $('#time-selected').html(max - $("#time-slider").slider("value") + min);
    console.log(max - $("#time-slider").slider("value") + min)
}