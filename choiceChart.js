var margin = {top: 10, right: 25, bottom: 70, left: 65}, timewidth = 250, timeheight = 400;

var x = d3.time.scale()
					.range([0, timewidth]);

var y = d3.scale.linear()
					.range([timeheight, 0]);

var xAxis = d3.svg.axis()
							.scale(x)
//							.orient("bottom")
							.ticks(5)
							.tickFormat(d3.time.format("%Y"));
							

var yAxis = d3.svg.axis()
							.scale(y)
							.orient("left");		//evtl. tickFormat für Achsensplit????


var svg = d3.select("#choiceChart").append("svg")
		  .attr("width", timewidth + margin.left + margin.right)
		  .attr("height", timeheight + margin.top + margin.bottom)
		.append("g")
		  .attr("transform", "translate(50,30)");

var parseDate = d3.time.format("%Y-%m-%d").parse;
var year = d3.time.format("%Y-%m");

d3.tsv("diffstats", function(d) {
	return {version2: year(parseDate(d.version2)),
	};

}, function(error, rows) {
	rows.sort(function(a, b) {
                return d3.ascending(a.version2, b.version2);
        });	
	console.log(rows);
	console.log("test");
	
	var counts = {};
	rows.forEach(function(r) {
    if (!counts[r.version2]) {
        counts[r.version2] = 0;
    }
    counts[r.version2]++;
	});
	
	var data = [];
	Object.keys(counts).forEach(function(key) {
    data.push({
        version2: key,
        count: counts[key]
    });
	});

	console.log(counts);
	console.log(data);

	var minVersion2 = d3.min(data, function (d){ return d.version2});
	minVersion2 = new Date(minVersion2);
	var maxVersion2 = d3.max(data, function (d){ return d.version2});
	maxVersion2 = new Date(maxVersion2);

	y.domain([0, d3.max(data, function(d) { return d.count; })]).nice();
	x.domain([minVersion2, maxVersion2]).nice();

	var AxisY = svg.append("g")
		    .attr("class", "y axis")
		    .call(yAxis)
		  .append("text")
				.attr("x", 25)
		    .attr("y", -20)
		    .attr("dy", ".71em")
		    .style("text-anchor", "end")
				.attr("fill", "black")
		    .text("Changes");

	var AxisX = svg.append("g")
		    .attr("class", "x axis")
				.attr("transform", "translate(0," + timeheight + ")")
		    .call(xAxis)
		  .append("text")
		    .attr("transform", "translate(" +timewidth+", 10)") //hier eigentlich nur rotation //translate die drunter
				.attr("x", 35)
		    .attr("y", -12)
		    .attr("dy", ".71em")
		    .style("text-anchor", "end")
				.attr("fill", "Black")
		    .text("Year");

	var rects = svg.selectAll(".bar")
				  .data(data)
				.enter().append("rect")
				  .attr("class", "bar")
				  .attr("x", function(d, i) { return i * (timewidth / data.length)+2; })
				  .attr("width", timewidth / data.length) //add -0.1 for padding
				  .attr("y", function(d) { return y(d.count) })
				  .attr("height", function(d) { return timeheight - y(d.count);})
					.attr("fill", "steelblue");	

var brush = d3.svg.brush()
 .x(x)
 .on("brush", brushmove)
 .on("brushend", brushend);

svg.append("g")
 .attr("class", "brush")
 .call(brush)
.selectAll('rect')
 .attr('height', timeheight);

function brushmove() {
	console.log("brushmove");
	

}

function brushend() {
	console.log("brushend");
	var extent =	brush.extent();
	console.log(extent);
}



});
