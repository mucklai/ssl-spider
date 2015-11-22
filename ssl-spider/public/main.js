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

  var width = 300,
      height = 300,
      offset = 100,
      radius = Math.min(width, height) / 2;

  var color = d3.scale.ordinal()
      .range(["#65A6BF", "#9AC4D5", "#CCE2EA"]);


  var arc = d3.svg.arc()
      .outerRadius(radius - 20)
      .innerRadius(radius - 40);

  // second arc for labels
  var arc2 = d3.svg.arc()
    .outerRadius(radius)
    .innerRadius(radius + 20);

  var pie = d3.layout.pie()
      .sort(null)
      .startAngle(1.1*Math.PI)
      .endAngle(3.1*Math.PI)
      .value(function(d) { return d.songs; });
  //get data here
  var data = [
    {genre:'Otras', songs: 12},
    {genre: '2000s', songs: 42},
    {genre: '2010s', songs: 63}
  ];

  var svg = d3.select("body").append("svg")
      .attr("id", "chart")
      .attr("width", width + offset)
      .attr("height", height + offset)
      .attr('viewBox', '0 0 ' + width + offset + ''+ width + offset +'')
      .attr('perserveAspectRatio', 'xMinYMid')
    .append("g")
      .attr("transform", "translate(" + (width+offset) / 2 + "," + (height + offset) / 2 + ")");

    data.forEach(function(d) {
      d.songs = +d.songs;
    });

    var g = svg.selectAll(".arc")
        .data(pie(data))
      .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .style("fill", function(d) { return color(d.data.genre); })
        .transition().delay(function(d, i) { return i * 500; }).duration(500)
        .attrTween('d', function(d) {
           var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
           return function(t) {
             d.endAngle = i(t);
             return arc(d);
           };
        });

    g.append("text")
        .attr("transform", function(d) { return "translate(" + arc2.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .attr("class", "d3-label")
        .style("text-anchor", "middle")
        .text(function(d) { return d.data.genre; });

    var aspect = width / height,
        chart = $("#chart");
    $("window").on("resize", function() {
        var targetWidth = Math.min(width + offset, chart.parent().width());
        chart.attr("width", targetWidth);
        chart.attr("height", targetWidth / aspect);
    }).trigger('resize');
    //Pie chart end


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

    var socket = io('http://localhost');
    socket.on('data', function (data) {
        data = JSON.parse(data);
        switch(data.type) {
            case 0:
                //initialize -- nothing to do
                return;
            case 1:
                //updating: update progress bar and table
                data = data.data;

                return;
            case 2:
                //specific url
                return;
        }
    });

    $('#start').on('click', function(){
        //start spider
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