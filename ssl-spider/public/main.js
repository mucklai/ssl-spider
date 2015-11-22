$(document).ready(function() {
$('#datepicker').pickmeup({
    position		: 'right',
    hide_on_select	: true,
    format          : 'm-d-Y'
});

//Modal call start

$("#google").on("click",function(){
    console.log("hi");
    $("#myModal").modal('show');
});
//Modal call end


    var EXPIRING = 0;
    var STABLE = 1;
    var NO_SSL = 2;
    var SHA1 = 3;
    var TIMEOUT_VALUE = 180000;

    var socket = io('http://localhost');
    var completed = false;
    var updating = false;
    var current_page = EXPIRING;
    var current_urls = [];
    var total = 1000000;
    var num_total = 0;
    var num_expired = 0;
    var num_stable = 0;
    var num_no_ssl = 0;
    var num_sha1 = 0;

    socket.on('initialize', function () {
        //initialize -- nothing to do
    });

    socket.on('update', function (data) {
        //updating: update progress bar and table
        console.log(data);
    });

    socket.on('url', function (data) {
        //specific url
    });

    socket.on('not_found', function () {
        //url not found
    });
            
    $('#start').on('click', function(){
        updating = true;
        setTimeout(update, 100);
    });

    $('#pause').on('click', function(){
        //pause spider
        updating = false;
    });

    function update() {
        //send request for update
        if (updating) {
            setTimeout(update, 100);
        }
    }
});