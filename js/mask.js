/**
 * Created by Krystian Jurkowski on 11/23/2017.
 */

$(document).ready(function() {

    $.when($.ajax(maskOpeningInfo())).then(function () {

        console.log("function 1 done");
        setTimeout(function() {maskOpeningTitle()}, 15000);

    });

});

var maskOpeningTitle = function() {
    //Get the screen height and width
    var maskHeight = $(document).height();
    var maskWidth = $(window).width();


    //Set height and width to mask to fill up the whole screen
    $('#mask-title').css({'width':maskWidth,'height':maskHeight});

    //transition effect
    $('#mask-title').fadeIn(1000);
    $('#mask-title').fadeTo(3000,0.8).delay(3000);

    // sets window to fade out
    $('#startJourney').click(function(){
        window.setTimeout(function() {
            $('#mask-title').fadeOut(0);
        }, 0);
        $('#instructionModal').modal('toggle');

        $('#instructionModal').on('hidden.bs.modal', function (e) {
            //$("#autoplay").delay(1000).click();
            console.log("modal closed");
        });
    });

    $('.tracking_pic_1').fadeIn(2000);
    $('.tracking_pic_2').delay(1000).fadeIn(2000);
    $('.tracking_pic_3').delay(2000).fadeIn(2000);
    $('.tracking_pic_4').delay(3000).fadeIn(2000);

};

var maskOpeningInfo = function(){

    //Get the screen height and width
    var maskHeight = $(document).height();
    var maskWidth = $(window).width();


    //Set height and width to mask to fill up the whole screen
    $('#mask-info').css({'width':maskWidth,'height':maskHeight});

    //transition effect
    $('#mask-info').fadeIn(0);
    $('#mask-info').fadeTo(0,1);

    window.setTimeout(function() {
        $('#mask-info').fadeOut(3000);
    }, 15000);


}