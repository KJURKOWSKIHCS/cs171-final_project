/**
 * Created by Krystian Jurkowski on 11/13/2017.
 */


$("#time-slider").slider({
    orientation: "vertical",
    range: "min",
    min: 1937,
    max: 1945,
    value: 1941,
    step: 2,
    slide: function(event, ui) {
        //$("#amount-backwards").val(1945 - ui.value + 1937);
        $('#time-selected').html(1945 - ui.value + 1937);

        console.log(1945 - ui.value + 1937);
    }
});

$('#time-selected').html(1945 - $("#time-slider").slider("value") + 1937);

$('#autoplay').on('click', function () {

    setValue(1945);

    var theYear = $("#time-slider").slider('value');

    var playShow = setInterval(function () {

        theYear-=2;
        
        setValue( theYear );

        if(theYear === 1937){
            clearInterval( playShow );
        }

    }, 2000);
});

// For the Set clickable values, we use variable theValue to supply value.
function setValue(theValue) {

    // Animate the Button to the value clicked on.
    $("#time-slider").slider('value', theValue);

    //Display the numeric value on the html page.
    //$("#amount-backwards").val(1945 - $("#time-slider").slider("value") + 1937);
    $('#time-selected').html(1945 - $("#time-slider").slider("value") + 1937);
    console.log(1945 - $("#time-slider").slider("value") + 1937)
}


// test stacked bar chart, put temporarily into map div
// function init() {
//
//     var data = [
//         {"country":"Poland","total":28333,"disease":11,"wounds":0,"other":6},
//         {"country":"Austria","total":28772,"disease":359,"wounds":0,"other":23},
//         {"country":"France","total":30246,"disease":828,"wounds":1,"other":30}
//     ]
//
//     var keys = ["wounds", "other", "disease"];
//
//     var barchart = new BarChart("map", data, "test", keys);
//
// }
//
// init();