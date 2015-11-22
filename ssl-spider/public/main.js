$(document).ready(function() {
    $('#pause').prop('disabled', true);
    $('#start').prop('disabled', false);
    $('#datepicker').pickmeup({
        position		: 'right',
        hide_on_select	: true,
        format          : 'm-d-Y'
    });

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
    var total = 100;
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

    socket.on('update', function (data) {
        if (updating) {
            data = JSON.parse(data);
            num_total = data.num_total;
            num_expired = data.num_expired;
            num_stable = data.num_stable;
            num_no_ssl = num_total - (num_expired + num_stable);
            num_sha1 = data.num_sha1;
            var new_urls = data.urls_to_send;
            var progress = Math.round( ((num_total/1.0) / total) * 100 );
	    console.log(new_urls);
	    maketable(new_urls);
            var progress_string = progress + "%";
            adjust_progress(progress_string)
            if (progress >= 95) {
                complete();
            }
        }
    });

    socket.on('url', function (data) {
        console.log("found");
        data = JSON.parse(data);
        $("#url_title").text(data.name);
        $("#url_name").text("Name: " + data.name);
        $("#url_cert").text("Certificate Valid Until: " + data.valid_to);
        $("#url_algo").text("Encryption algorithm: " + data.cipher);
        $("#url_grade").text("SSL Lab Grade: " + data.grade);
        $("#myModal").modal('show');
    });

    socket.on('not_found', function () {
        alert("Search query not found");
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
        adjust_progress('100%');
        completed = true;
        updating = false;
        $('#pause').prop('disabled', true);
        $('#start').prop('disabled', true);
        console.log("Complete!");
        $('#analysis').html('<canvas id="myChart" width="530" height="300"></canvas>');

        var data = [
        {
            value: num_expired,
            color:"#F7464A",
            highlight: "#FF5A5E",
            label: "SSL Expiring"
        },
        {
            value: num_stable,
            color: "#46BFBD",
            highlight: "#5AD3D1",
            label: "SSL Stable"
        },
        {
            value: num_no_ssl,
            color: "#FDB45C",
            highlight: "#FFC870",
            label: "No SSL"
        }];
        var options = {
            legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>",
            animateRotate : true
        }
        var ctx = document.getElementById("myChart").getContext("2d");
        var myDoughnutChart = new Chart(ctx).Doughnut(data,options);
    }
    function adjust_progress(progress_string) {
        $('#my_progress_bar').css('width', progress_string);
        $('#my_progress_text').text(progress_string);
    }

    $("#search").on('click', function(){
        var url = $("#searchInput").val();
        var send_data = JSON.stringify({name: url});
        socket.emit('url', send_data);
    });
   function maketable(new_urls,id){
	var html_table = "";
	switch(id) {
	
	case 1:
		for(i=0; i<new_urls.length;i++){
			var html_row =  "<tr id='"+new_urls[i].name+"' class='info urlrow'>";
			html_row += "<td>"+(i+1).toString()+"</td>";
			html_row += "<td>"+ new_urls[i].name+"</td>";
			html_row +="<td>"+new_urls[i].valid_to+"</td></tr>";
			html_table+=html_row;
		}
		$("#expiration_tbody").html(html_table);
		break;
	}
	
   }


});
