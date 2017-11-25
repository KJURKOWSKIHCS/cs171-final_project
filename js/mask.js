/**
 * Created by Krystian Jurkowski on 11/23/2017.
 */

$(document).ready(function() {

    $.when($.ajax(maskInfo())).then(function () {

        console.log("function 1 done");
        setTimeout(function() {maskTitle()}, 5000);

    });

});

var maskTitle = function() {
    //Get the screen height and width
    var maskHeight = $(document).height();
    var maskWidth = $(window).width();


    //Set height and width to mask to fill up the whole screen
    $('#mask-title').css({'width':maskWidth,'height':maskHeight});

    //transition effect
    $('#mask-title').fadeIn(1000);
    $('#mask-title').fadeTo(3000,0.8).delay(3000);

    // sets window to fade out
    $('.btn').click(function(){
        window.setTimeout(function() {
            $('#mask-title').fadeOut(500);
        }, 0);
        $("#autoplay").delay(1000).click();
    });

};

var maskInfo = function(){

    //Get the screen height and width
    var maskHeight = $(document).height();
    var maskWidth = $(window).width();


    //Set height and width to mask to fill up the whole screen
    $('#mask-info').css({'width':maskWidth,'height':maskHeight});

    //transition effect
    $('#mask-info').fadeIn(0);
    $('#mask-info').fadeTo(0,1);

    window.setTimeout(function() {
        $('#mask-info').fadeOut(4000);
    }, 5000);


}