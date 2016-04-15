


	var margin = {top: 10, right: 25, bottom: 70, left: 65}, timewidth = 250, timeheight = 400;

var x = d3.time.scale()
					.range([0, timewidth]);

var y = d3.scale.linear()
					.range([timeheight, 0]);

var xAxis = d3.svg.axis()
							.scale(x)
							.ticks(5)
							.tickFormat(d3.time.format("%Y"));
							
var yAxis = d3.svg.axis()
							.scale(y)
							.orient("left");		//evtl. tickFormat für Achsensplit????







							
							
function init ()
{
	// load the tables
	d3.tsv("statsTables/filestats", function(dd) {
		// get the file's table and immediately parse the date
		for (var i = 0; i < dd.length; i++)
		{
			dd[i]["date"] = new Date (dd[i]["date"]);
			filestats[ dd[i]["model"] + dd[i]["versionid"]  ] = dd[i];
		}
		
		
		d3.tsv("statsTables/diffstats", function(d) {
			// get the diffs table and parse numbers
			for (var i=0; i < d.length; i++){
				d[i]["bivesinsert"] = +d[i]["bivesinsert"];
				d[i]["bivesmove"] = +d[i]["bivesmove"];
				d[i]["bivesdelete"] = +d[i]["bivesdelete"];
				d[i]["bivesupdate"] = +d[i]["bivesupdate"];
				d[i]["bives"] = +d[i]["bives"]; 
				
			}
			diffstats=d;
			
			// if that's done we can initialise the choise chart
			initialiseChoiceChart ();
		});
	});






	// select the landing page as start
	selectChart("landingpage");

	// register click-listeners to the tab-buttons
	$("#donutbutton").click (function (){donut (window.extent[0], window.extent[1]);});
	$("#heatmapbutton").click (function (){bivesOverview(window.extent[0], window.extent[1]);});
	$("#boxplot1button").click (function (){boxplot(window.extent[0], window.extent[1]);});
	$("#boxplot2button").click (function (){boxplot2(window.extent[0], window.extent[1]);});
	$("#logolink").click (function (){selectChart("landingpage");;});





	// load info material and fill the i-buttons
	$.getJSON("javascriptAndCss/info.json", function(json){

		attachInfo ("#smallInfoTimespan", '#timeSpanBox', json.timespan);
		attachInfo ("#smallInfoDataset", '#datasetBox', json.dataset);
		attachInfo ("#smallInfoDonut", '#donutBox', json.donutVis + json.donutUsage);
		attachInfo ("#smallInfoHeat", '#heatBox', json.heatmapVis + json.heatmapUsage);
		attachInfo ("#smallInfoBox1", '#box1Box', json.boxplot1Vis + json.boxplot1Usage);
		attachInfo ("#smallInfoBox2", '#box2Box', json.boxplot2Vis + json.boxplot2Usage);

		//load startpage info from json
		$("#projectInfo").append(json.projectInfo.motivation).append(json.projectInfo.question);
		$("#acknowledgments").append(json.acknowledgments.design).append(json.acknowledgments.funding);
	});

}












function initialiseChoiceChart ()
{
	rows=diffstats;
 	console.log (rows[0]);
	
	rows.sort(function(a, b) {
                return d3.ascending(a.version2id, b.version2id);
        });	
	
	var counts = {};
	rows.forEach(function(r) {
		
		var datum = filestats[ r["model"] + r["version2id"]  ].date;
		
    if (!counts[datum]) {
        counts[datum] = 0;
    }
    counts[datum]++;
	});
	
	var max = 0;
	var data = [];
	Object.keys(counts).forEach(function(key) {
    data.push({
        datum: new Date(key)
		,
        count: counts[key]
    });
		if (counts[key] > max)
			max = counts[key];
	});


	var minVersion2 = d3.min(data, function (d){ return d.datum });
	var maxVersion2 = d3.max(data, function (d){ return d.datum });
	

	y.domain([0, max]).nice();
	x.domain([minVersion2, maxVersion2]).nice();

	
var svg = d3.select("#choiceChart").append("svg")
		  .attr("width", timewidth + margin.left + margin.right)
		  .attr("height", timeheight + margin.top + margin.bottom)
		.append("g")
		  .attr("transform", "translate(50,30)");		
	svg.append("g")
		    .attr("class", "y axis")
				.attr("fill", "white")
		    .call(yAxis)
		  .append("text")
				.attr("x", 25)
		    .attr("y", -20)
		    .attr("dy", ".71em")
		    .style("text-anchor", "end")
				.attr("fill", "white")
		    .text("Changes");

	
	svg.append("g")
		    .attr("class", "x axis")
				.attr("transform", "translate(0," + timeheight + ")")
				.attr("fill", "white")
		    .call(xAxis);

				
				
				
	var rects = svg.selectAll(".bar")
				  .data(data)
					.enter()
					.append("rect")
				  .attr("class", "bar")
				  .attr("x", function(d) { var meinx = x(d.datum); if (isNaN (meinx)){ console.log ("das is nan: " + meinx); /*console.log (d.datum); console.log (new Date(d.datum)); console.log (x(new Date(d.datum)));*/} return meinx; })
				  .attr("width", timewidth / data.length) 
				  .attr("y", function(d) { return y(d.count) })
				  .attr("height", function(d) { return timeheight - y(d.count);})
					.attr("fill", "white");	

var date1 = moment(document.getElementById("date1").value);
var date2 = moment(document.getElementById("date2").value);

var brush = d3.svg.brush()
	.x(x)
	.extent([date1, date2])
	.on("brush", brushmove)
	.on("brushend", brushend);

svg.append("g")
	.attr("class", "brush")
	.call(brush)
.selectAll('rect')
	.attr('height', timeheight);


var modelType = ["BioModels", "CellML"], 
    j = 0;  // Choose the rectangle as default

// Create the shape selectors
var dataset = d3.select('#choiceChart').append("dataset")
	.append("text")
	.text("Dataset");

var form = d3.select("#choiceChart").append("form");

labels = form.selectAll("label")
    .data(modelType)
    .enter()
    .append("label")
    .text(function(d) {return d;})
    .insert("input")
    .attr({
		id: function(d, i) { return d;},
        type: "checkbox",
        class: "modelType",
        name: "mode",
        value: function(d, i) {return i;}
    })
    .property("checked", function(d, i) {return i===j;});

var hold = -1; var wait = 1;

var date1Up = document.getElementById("date1Up");
date1Up.onmouseup = function(){ hold = 0;};
date1Up.onmouseout = function(){ hold = 0;};
date1Up.onmousedown = function () { wait = 1; hold = -1; holdit("date1", "up");};

var date1Down = document.getElementById("date1Down");
date1Down.onmouseup = function(){ hold = 0;};
date1Down.onmouseout = function(){ hold = 0;};
date1Down.onmousedown = function () { wait = 1; hold = -1; holdit("date1", "down");};

var date2Up = document.getElementById("date2Up");
date2Up.onmouseup = function(){ hold = 0;};
date2Up.onmouseout = function(){ hold = 0;};
date2Up.onmousedown = function () { wait = 1; hold = -1; holdit("date2", "up");};

var date2Down = document.getElementById("date2Down");
date2Down.onmouseup = function(){ hold = 0;};
date2Down.onmouseout = function(){ hold = 0;};
date2Down.onmousedown = function () { wait = 1; hold = -1; holdit("date2", "down");};

var date1Field = document.getElementById("date1");
date1Field.addEventListener("keydown", function (e) {
	if(e.keyCode === 13){
		var newDate = Date.parse(date1Field.value);
		console.log(newDate);
		alert("jupp");
		if(newDate != null){
			if(newDate < minVersion2){
				newDate = minVersion2;
			} else if(newDate > maxVersion2){
				newDate = maxVersion2;
			}
			brush.extent([newDate, date2]);
			date1 = newDate;
			extent = brush.extent();
			brushed();
		} else {
			alert("Please enter a correct date.");
		}

	}
});


var date2Field = document.getElementById("date2");
date2Field.addEventListener("keydown", function (e) {
	if(e.keyCode === 13){
		var newDate = Date.parse(date2Field.value);
		if(newDate != null){
			if(newDate < minVersion2){
				newDate = minVersion2;
			} else if(newDate > maxVersion2){
				newDate = maxVersion2;
			}
			brush.extent([date1, newDate]);
			date2 = newDate;
			extent = brush.extent();
			brushed();
		} else {
			alert("Please enter a correct date.");
		}
	}
});

function holdit(btn, mode) {
	console.log(hold, wait)
/* 	var testDay = moment("01/01/2010");
	console.log(moment(testDay).format('DD/MM/YYYY'));
	console.log(testDay);
	testDay.add(1, 'days');
	console.log(testDay);	
	console.log(moment(testDay).format('DD/MM/YYYY'));
	testDay.add(1, 'days');
	console.log(testDay);	
	console.log(moment(testDay).format('DD/MM/YYYY')); */
	if (hold == -1 && wait == 1){
		setTimeout(function(){
			wait = 0;
			if(mode === "up"){
				//console.log("a " + document.getElementById(btn).value);
				var newDate = moment(document.getElementById(btn).value).add(1, 'd');
				//console.log("b " + newDate);
				//console.log(Date.parse(date1Field.value));
				document.getElementById(btn).value = moment(newDate).format('YYYY-MM-DD');
				//console.log("c " + document.getElementById(btn).value);
				if(btn == "date2"){
					brush.extent([date1, newDate]);
					date2 = newDate;
				} else {
					brush.extent([newDate, date2]);
					date1 = newDate;
				}
				extent = brush.extent();
				brushed();
			} else {
				var newDate = moment(document.getElementById(btn).value).add(-1, 'days');
				document.getElementById(btn).value = moment(newDate).format('YYYY-MM-DD');
				if(btn == "date2"){
					brush.extent([date1, newDate]);
					date2 = newDate;
				} else {
					brush.extent([newDate, date2]);
					date1 = newDate;
				}
				extent = brush.extent();
				brushed();
			}
					
			holdit(btn, mode);
		}, 300);
	} else if (hold == -1){
		setTimeout(function(){
			wait = 0;
			if(mode === "up"){
				//console.log("a " + document.getElementById(btn).value);
				var newDate = moment(document.getElementById(btn).value).add(1, 'd');
				//console.log("b " + newDate);
				//console.log(Date.parse(date1Field.value));
				document.getElementById(btn).value = moment(newDate).format('YYYY-MM-DD');
				//console.log("c " + document.getElementById(btn).value);
				if(btn == "date2"){
					brush.extent([date1, newDate]);
					date2 = newDate;
				} else {
					brush.extent([newDate, date2]);
					date1 = newDate;
				}
				extent = brush.extent();
				brushed();
			} else {
				var newDate = moment(document.getElementById(btn).value).add(-1, 'days');
				document.getElementById(btn).value = moment(newDate).format('YYYY-MM-DD');
				if(btn == "date2"){
					brush.extent([date1, newDate]);
					date2 = newDate;
				} else {
					brush.extent([newDate, date2]);
					date1 = newDate;
				}
				extent = brush.extent();
				brushed();
			}
					
			holdit(btn, mode);
		}, 1);
	}
};

function brushed() {
	svg.select(".brush").call(brush);
}

function brushmove() {
	extent = brush.extent();
	date1 = moment(window.extent[0]);
	date2 = moment(window.extent[1]);
	document.getElementById("date1").value = date1.format('YYYY-MM-DD');
	document.getElementById("date2").value = date2.format('YYYY-MM-DD');
}

function brushend() {
// 	alert("brushEND");
	svg.select(".brush").call(brush);
	extent = brush.extent();
}

}
