/**
 * Created by Krystian Jurkowski on 11/23/2017.
 */


$('button#finishJourney').click(function(){

    console.log("finishing journey");

    $.when($.ajax(maskClosingInfo())).then(function () {

        console.log("function 1 done");
        setTimeout(function() {maskClosingTitle()}, 10000);

    });

});

var maskClosingTitle = function() {
    //Get the screen height and width
    var maskHeight = $(document).height();
    var maskWidth = $(window).width();


    //Set height and width to mask to fill up the whole screen
    $('#mask-closing-title').css({'width':maskWidth,'height':maskHeight});

    //transition effect
    $('#mask-closing-title').fadeIn(1000);
    $('#mask-closing-title').fadeTo(3000,0.8).delay(3000);

    $('#instructionEndModal').modal('show');

    // sets window to fade out
    $('button#startJourneyOver').click(function(){
        window.setTimeout(function() {
            $('#mask-closing-title').fadeOut(100);
        }, 0);
        setValue( 1945 );
        europeMap.wrangleData(1912);
        europeMap.updateGauge(1912);
        currVal = 1912;
        $('#instructionModal').modal('show');

        $('#instructionModal').on('hidden.bs.modal', function (e) {
            //$("#autoplay").delay(1000).click();
            console.log("modal closed");
        });
    });

    $('button#meetCreators').click(function() {
        $('#creatorsModal').modal('show');
    });



    $('.summaryHolder_1').css('display', 'none');
    $('.summaryHolder_2').css('display', 'none');
    $('.summaryHolder_3').css('display', 'none');
    $('.summaryHolder_4').css('display', 'none');


    $('.tracking_pic_close_1').fadeIn(2000);
    $('.tracking_pic_close_2').delay(1000).fadeIn(2000);
    $('.tracking_pic_close_3').delay(2000).fadeIn(2000);
    $('.tracking_pic_close_4').delay(3000).fadeIn(2000);


};

var maskClosingInfo = function(){

    //Get the screen height and width
    var maskHeight = $(document).height();
    var maskWidth = $(window).width();


    //Set height and width to mask to fill up the whole screen
    $('#mask-closing-info').css({'width':maskWidth,'height':maskHeight});

    //transition effect
    $('#mask-closing-info').fadeIn(1000);
    $('#mask-closing-info').fadeTo(3000,1000);

    window.setTimeout(function() {
        $('#mask-closing-info').fadeOut(4000);
    }, 10000);


}

function handlePicFade1() {
    $('.picHolder_1, .tracking_pic_close_1').fadeOut('slow', function(){
        $('.summaryHolder_1, .summary_1').fadeIn('slow');
    });
}

function handleSummaryFade1() {
    $('.summaryHolder_1, .summary_1').fadeOut('slow', function(){
        $('.picHolder_1, .tracking_pic_close_1').fadeIn('slow');
    });
}

function handlePicFade2() {
    $('.picHolder_2, .tracking_pic_close_2').fadeOut('slow', function(){
        $('.summaryHolder_2, .summary_2').fadeIn('slow');
    });
}

function handleSummaryFade2() {
    $('.summaryHolder_2, .summary_2').fadeOut('slow', function(){
        $('.picHolder_2, .tracking_pic_close_2').fadeIn('slow');
    });
}

function handlePicFade3() {
    $('.picHolder_3, .tracking_pic_close_3').fadeOut('slow', function(){
        $('.summaryHolder_3, .summary_3').fadeIn('slow');
    });
}

function handleSummaryFade3() {
    $('.summaryHolder_3, .summary_3').fadeOut('slow', function(){
        $('.picHolder_3, .tracking_pic_close_3').fadeIn('slow');
    });
}

function handlePicFade4() {
    $('.picHolder_4, .tracking_pic_close_4').fadeOut('slow', function(){
        $('.summaryHolder_4, .summary_4').fadeIn('slow');
    });
}

function handleSummaryFade4() {
    $('.summaryHolder_4, .summary_4').fadeOut('slow', function(){
        $('.picHolder_4, .tracking_pic_close_4').fadeIn('slow');
    });
}
