$(document).ready(function() {
    $('#pause').prop('disabled', true);
    $('#start').prop('disabled', false);
    $('#datepicker').pickmeup({
        position		: 'right',
        hide_on_select	: true,
        format          : 'm-d-Y'
    });

    //Modal call start

    $("#google").on("click",function(){
        $("#myModal").modal('show');
    });
    //Modal call end

    var EXPIRING = 0;
    var STABLE = 1;
    var NO_SSL = 2;
    var SHA1 = 3;
    var TIMEOUT_VALUE = 180000;

    var socket = io('http://localhost:8080');
    var completed = false;
    var updating = false;
    var current_type = EXPIRING;
    var current_page = 0;
    var current_urls = [];
    var total = 1000;
    var num_total = 0;
    var num_expired = 0;
    var num_stable = 0;
    var num_no_ssl = 0;
    var num_sha1 = 0;

    var timeout_minutes = 4;
    var timeout = timeout_minutes * 60 * 2;
    var timer_id;

    var started = false;

    socket.on('initialize', function () {
        //initialize -- nothing to do
    });

    socket.on('update', function (data) {
        data = JSON.parse(data);
        num_total = data.num_total;
        num_expired = data.num_expired;
        num_stable = data.num_stable;
        num_no_ssl = num_total - (num_expired + num_stable);
        num_sha1 = data.num_sha1;
        var new_urls = data.urls_to_send;
        console.log("Progress: " + (((num_total/1.0) / total) * 100));
        console.log("New data:");
        //console.log(new_urls);
        if (num_total == total) {
            complete();
        }
    });

    socket.on('url', function (data) {
        //specific url
    });

    socket.on('not_found', function () {
        alert("Search query not found");
    });
            
    $('#start').on('click', function(){
        $('#start').prop('disabled', true);
        $('#pause').prop('disabled', false);
        timer_id = window.setInterval(timer, 500);
        if (!started) {
            started = true;
            var d = $('#datepicker').val().split('-');
            var date = new Date();
            date.setFullYear(d[2], d[0] - 1, d[1]);
            console.log(date);
            if (date) {
                //check for date value and read
                socket.emit('start',date.toString())
                updating = true;
                setTimeout(update, 1000);
            } else {
                alert("Invalid date");
            }
        } else {
            socket.emit('resume');
            updating = true;
            setTimeout(update, 1000);
        }
    });

    $('#pause').on('click', function() {
        window.clearInterval(timer_id);
        $('#pause').prop('disabled', true);
        $('#start').prop('disabled', false);
        socket.emit('pause');
        updating = false;
        console.log("pause");
    });

    function update() {
        console.log("Requesting update");
        var send_data = JSON.stringify({
            type: current_type,
            page: current_page
        });
        socket.emit('update_me', send_data);
        if (updating) {
            setTimeout(update, 1000);
        }
    }

    function url() {
        //request information about url
    }

    function timer() {
        if (completed) {
            window.clearInterval(timer_id);
        } else if (updating) {
            timeout -= 1;
            if (timeout == 0) {
                complete();
            }
        }
    }

    function complete() {
        window.clearInterval(timer_id);
        completed = true;
        updating = false;
        $('#pause').prop('disabled', true);
        $('#start').prop('disabled', true);
        console.log("Complete!");
        //update progress bar to pie chart
    }
});