/*###################################################
Set up the controls for the map
#####################################################*/

//Thousands separator formattor
	var commaFormat = d3.format(",");

//Create dropdown menus to select gap, grade, and subject
//Gap
var gap_3 = d3.selectAll("#gap_3");

gap_3.html("<span class='control-text'>Group</span><br/>");

gap_3
	.append("select")
    .attr("id", "gap_3")
    .selectAll("option")
    .data(["blk", "hsp"])
    .enter()
    .append("option")
      .attr("value", function(d){return d;})
      .text(function(d){ return d=="blk" ? "Black-White" : "Hispanic-White";});

//Grade
var grade_3 = d3.selectAll("#grade_3");

grade_3.html("<span class='control-text'>Grade</span><br/>");

grade_3
	.append("select")
    .attr("id", "grade_3")
    .selectAll("option")
    .data(["4", "8"])
    .enter()
    .append("option")
      .attr("value", function(d){return d;})
      .text(function(d){ return d=="4" ? "Grade Four" : "Grade Eight";});

//Subject
var subject_3 = d3.selectAll("#subject_3");

subject_3.html("<span class='control-text'>Subject</span><br/>");

subject_3
	.append("select")
    .attr("id", "subject_3")
    .selectAll("option")
    .data(["math", "read"])
    .enter()
    .append("option")
      .attr("value", function(d){return d;})
      .text(function(d){ return d=="math" ? "Math" : "Reading";});

//Sort
var sort_3 = d3.selectAll("#sort_3");

sort_3.html("<span class='control-text'>Sort bar chart</span><br/>");

sort_3
	.append("select")
	.attr("id", "sort_3")
	.selectAll("option")
	.data(["name", "gap", "white", "minority", "average"])
	.enter()
	.append("option")
		.attr("value", function(d){return d;})
		.text(function(d){
			if(d=="name"){
				return "State Name";
			}
			else if(d=="gap"){
				return "Achievement Gap"
			}
			else if(d=="white"){
				return "White Scores";
			}
			else if(d=="minority"){
				return "Black Scores";
			}
			else{
				return "State Average Scores";
			}
		});


//Tooltip
var tooltip_3 = d3.select("body")
				.append("div")   
  				.attr("class", "info-window")
  				.style("opacity", 0);


//Legend title
var gap_legend_title = d3.select('#gap_legend_3')
    .append("p")
    .attr("class", "legend-label")
    .text("Achievement Gap in Standard Deviations");

//Map color legend
var gap_legend_3 = d3.select('#gap_legend_3')
    .append("div")
    .attr("id", "gap_legend_3")
    .append('ul')
    .attr('class', 'list-inline');

/*###################################################
Define all current inputs
#####################################################*/
//Selected gap
var gapSelected = d3.selectAll("#gap_3")[0][1].value;
//Selected grade
var gradeSelected = d3.selectAll("#grade_3")[0][1].value;
//Selected subject
var subSelected = d3.selectAll("#subject_3")[0][1].value;
//Selected sort
var sortSelected = d3.selectAll("#sort_3")[0][1].value;


//Queue up all data for the chart
		queue()
              .defer(d3.json, "data/states.js")
			  .defer(d3.csv, "data/adjusted naep gaps with scores - 1.28.2015.csv")
			  .await(ready);

/*###################################################
Initialize map with data
#####################################################*/
function ready(error, json, csv){

if(error){
	console.log(error);
				}
else{

//Width and height
    var w = 550,
        h = w*.7;

		csv.forEach(function(d){
            d.slideyear = parseFloat(d.slideyear);
			d.whtnaepdev = parseFloat(d.whtnaepdev);
			d.naepdev = parseFloat(d.naepdev);
			d.avgnaepdev = parseFloat(d.avgnaepdev);
			d.wht_pct = parseFloat(d.wht_pct);
			d.min_pct = parseFloat(d.min_pct);
			d.enrl = parseFloat(d.enrl);
			d.totenrl = parseFloat(d.totenrl);
			d.whtenrl = parseFloat(d.whtenrl);
			d.vgap = parseFloat(d.vgap);
			d.natavg = parseFloat(d.natavg);
            d.whtnaepscore = parseFloat(d.whtnaepscore);
            d.naepscore = parseFloat(d.naepscore);
            d.naepavg = parseFloat(d.naepavg);
			
		});

    //Year selected
    var firstYearSelected = 2011;


    var slide_min = d3.min(csv.filter(function(row){
        return row['vgap']!=9999 && row['group']==gapSelected
            && row['grade'] == gradeSelected && row['sub'] == subSelected;}), function(d){return d.slideyear});

    var slide_max = d3.max(csv.filter(function(row){
        return row['vgap']!=9999 && row['group']==gapSelected
            && row['grade'] == gradeSelected && row['sub'] == subSelected;}), function(d){return d.slideyear});

    //Filter data by grade, year, and subject
    var data = csv.filter(function(row){
        return row['vgap']!=9999 && row['group']==gapSelected && row['year'] == firstYearSelected && row['grade'] == gradeSelected && row['sub'] == subSelected;
    });

    //Time slider

    $(function() {
        $( "#time_3" ).slider({
            value:8,
            min: slide_min,
            max: slide_max,
            step: 1
        });

        $( "#current-year_3" ).val($( "#time_3" ).slider( "value" ));
    });

    var yearText = d3.selectAll("#current-year_3")
        .text(parseFloat(firstYearSelected));

    //Index for data
	var stateName = function(d) { return d.fips; };
	var whiteScore = function(d){ return d.whtnaepdev;};
	var minScore = function(d){return d.naepdev;};
	var avgScore = function(d){return d.avgnaepdev;};
	var gapScore = function(d){return d.vgap};

	 // sort by state name
	var sortedData = data.sort(function(a, b) {
			return d3.ascending(stateName(a), stateName(b));		
	});

/*##############################################################
 Map
 ###############################################################*/
    //Index csv data on fips and convert string gaps to numbers
    mapdata_3 = window.data = _(data).chain().map(function(d) {
        d.vgap = parseFloat(d.vgap);
        d.whtnaepscore = parseFloat(d.whtnaepscore);
        d.naepscore = parseFloat(d.naepscore);
        d.naepavg = parseFloat(d.naepavg);
        d.natavg = parseFloat(d.natavg);
        d.year = d.year;
        return [d.fips, d];
    }).object().value();

    //Choose color scale for map

    var gap_color_3 = d3.scale.threshold().domain([-0.5, -0.3, -0.1, 0.1, 0.3, 0.5, 0.7, 0.9, 1.1, 1.3, 1.5, 1.7])
        .range(["#74a9cf","#a6bddb","#d0d1e6","#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026", "#800026"]);

    //Shading function for choropleth based on residuals
    var gap_shading_3 = function(d){
        var name = d.properties.STATE_NAME;
        var value = mapdata_3[name] ? mapdata_3[name].vgap : null;
        if(value>1.8){return gap_color_3(1.8)}
        else if(value) {
            return gap_color_3(value);
        }
        else{return '#D3D3C9'}
    };

    //Initial scale and offset for map projection
    var scale  = 700;
    var offset = [w/2, h/2];

//Set up map projection, svg, and rectangle for map background
    var projection = d3.geo.albersUsa()
        .scale(scale)
        .translate(offset);

    var path = d3.geo.path()
        .projection(projection);


//Select map area where data will enter
//Achievement gap map
    var gap_container_3 = d3.select("#gap_container_3")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", "0 0 "+w+ " "+h)
        .attr("preserveAspectRatio", "xMidYMid")
        .attr("class", "svg-map-container")
        .append("g")
        .attr("id", "gap-container_3");

    var gap_map_3 = gap_container_3.selectAll("gap-states-3")
        .data(json.features)
        .enter()
        .append("path")
        .attr("class", "gap-states-3")
        .attr("id", function(d){return d.properties.STATE_NAME.replace(/\s+/g, '');})
        .attr("fill", gap_shading_3)
        .attr("d", path);

    //Set colors for legend
     var colors = ["#a6bddb","#d0d1e6","#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026", "#800026"];

    var gap_keys_3 = gap_legend_3.selectAll('li.key')
        .data(colors)
        .enter().append('li')
        .attr('class', 'key')
        .attr('id', 'gap-legend-3')
        .style('border-top-color', String);

    //Set legend text
    gap_keys_3.text(function(d,i) {

        var r = gap_color_3.invertExtent(d);
            return d3.round((r[1]+r[0])/2,2);

    });

    //Set legend text explanation

    var gap_explanation_better = d3.select('#gap_legend_3')
        .append("span")
        .attr("id", "negative_gap")
        .attr("width", "50%")
        .html("Blacks do better");

    var gap_explanation_worse =d3.select('#gap_legend_3')
        .append("span")
        .attr("id", "positive_gap")
        .attr("width", "50%")
        .html("Whites do better");

/*##############################################################
Bar chart
###############################################################*/

//Set inital dimensions of chart
    var w = 500,
        h = w*1.15,
        padding_bottom=50,
        padding_right = 105,
        padding_left = 10,
        padding_top =20;


//State menu
var highlight_3 = d3.selectAll("#highlight_3");

highlight_3.html("<span class='control-text'>Select state</span><br/>");

//Get unique list of states
var uniqueState = d3.nest()
				    .key(function(d) { return d.fips; })
				    .sortKeys(d3.ascending)
				    .entries(data, d3.map);

//Add an "all" option
var stateArray = ["All"];

uniqueState.forEach(function(d){
	stateArray.push(d.key);
})

//Push list to dropdown
var stateMenu = highlight_3
	.append("select")
    .attr("id", "highlight_3")
	.selectAll("option")
    .data(stateArray)
    .enter()
    .append("option")
     .attr("index", function(d, i) { return i; })
      .attr("value", function(d){return d;})
      .text(function(d){ return d});

    //Sort state dropdown alphabetically
    var sortList = d3.selectAll("#highlight_3 option")
        .datum(function() { return this.dataset; });
/*#################################################################
#Set up x and y axes
##################################################################*/

//Scale for y-value
var yScale = d3.scale.ordinal()
    .domain(sortedData.map(function(d){ return d.fips;}))
    .rangeRoundBands([h-padding_bottom, padding_top], 0.5, 0.5);

//Scale for x-value
var xScale = d3.scale.linear()
    .domain([150, 300])
    .range([padding_right,w-padding_left]);

//Create scale for circles to size by number of black/hispanic students
var rScaleTotal = d3.scale.sqrt()
  	.domain([d3.min(data, function(d){return d.totenrl}), d3.max(data, function(d){return d.totenrl})])
  	.range([6, 12]).nice();

var rScale = d3.scale.quantile().domain([0,1]).range([0.25,0.5,0.75]);

//Create x and y axes

	var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);
	var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);

/*#####################################################################
Draw chart
######################################################################*/

//Draw svg for scatterplot
var barplot = d3.select("#state_levels")
				.append("svg")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("viewBox", "0 0 "+w+ " "+h)
                .attr("preserveAspectRatio", "xMidYMid")
                .attr("class", "svg-container");

//Legend for plot

var legend =  d3.select('#bar-legend_3')
						.append("svg")
                        .attr("width", "100%")
                        .attr("height", "100%")
                        .attr("viewBox", "0 0 "+w+ " "+h/8)
                        .attr("preserveAspectRatio", "xMidYMid")
                        .attr("class", "svg-legend-container");

var bar_legend = legend.append("g");

var y_legend_start=30;
var x_legend_start=padding_right;

bar_legend
	.append("text")
	.attr("x", padding_right)
	.attr("y", 10)
	.text("NAEP Scores")
	.attr("font-size", "10px");

bar_legend
	.append("line")
	.attr("class", "first-line")
	.attr("x1", x_legend_start)
	.attr("y1", y_legend_start)
	.attr("x2", x_legend_start+50)
	.attr("y2", y_legend_start);

bar_legend
	.append("line")
	.attr("class", "second-line")
	.attr("x1", x_legend_start)
	.attr("y1", y_legend_start)
	.attr("x2", x_legend_start+100)
	.attr("y2", y_legend_start);

bar_legend
	.append("circle")
	.attr("class", "min-circles")
	.attr("cx", x_legend_start)
	.attr("cy", y_legend_start)
	.attr("r", 5);

bar_legend
	.append("circle")
	.attr("class", "avg-circles")
	.attr("cx", x_legend_start+50)
	.attr("cy", y_legend_start)
	.attr("r", 10);

bar_legend
	.append("circle")
	.attr("class", "wht-circles")
	.attr("cx", x_legend_start+100)
	.attr("cy", y_legend_start)
	.attr("r", 5);

bar_legend
	.append("text")
	.attr("x", x_legend_start)
	.attr("y", y_legend_start+15)
    .attr("class", "min-legend-text")
	.text("Black")
	.attr("font-size", "10px");


bar_legend
	.append("text")
	.attr("x", x_legend_start+55)
	.attr("y", y_legend_start+15)
	.text("State")
	.attr("font-size", "10px");


bar_legend
	.append("text")
	.attr("x", x_legend_start+100)
	.attr("y", y_legend_start+15)
	.text("White")
	.attr("font-size", "10px");

var size_legend = legend.append("g");

size_legend
	.selectAll("circle")
	.data([10000,100000,500000])
	.enter()
	.append("circle")
	.attr("cx", x_legend_start+170)
	.attr("cy", y_legend_start-30)
	.attr("r", function(d){return rScaleTotal(d)})
	.attr("class", "avg-circles")
	.attr("transform", function(d, i) { return "translate(+"+ (5+(i * 40))+","+x_legend_start/4+")"; });

size_legend
	.selectAll("text")
	.data([10000,100000,500000])
	.enter()
	.append("text")
	 .attr("y", y_legend_start+20)
     .attr("x", function(d,i){return x_legend_start+170+(i * 42) })
     .text(function(d){
     	return commaFormat(d3.round(d));
     })
     .attr("font-size", "10px");

size_legend
	.append("text")
	.attr("x", x_legend_start+170)
	.attr("y", 10)
	.text("State Enrollment")
	.attr("font-size", "10px");
		
//Call x and y axes
barplot.append("g")
		.attr("class", "x-axis")
		.attr("transform", "translate(0," + (h - padding_bottom) + ")")
		.call(xAxis)
		.selectAll("text")
		.attr("class", "state_label")
        .attr("x", 10)
        .style("text-anchor", "end");

barplot.append("g")
		.attr("class", "y-axis")
		.attr("transform", "translate(" + padding_right + ",0)")
		.call(yAxis);

//Draw labels for y axis
var x_label = barplot.append("text")
	    .attr("class", "x_label")
	    .attr("text-anchor", "end")
        .attr("x", padding_right+w/2)
        .attr("y", h-20)
	    .attr("dy", ".75em");

x_label
	    .text("Average Naep Score");

//Draw national average line
	var national_average = data[0].natavg;

//Draw average
	var average_line=barplot.append("g");

			average_line
					.append("line")
					.attr("class", "average-line")
					.attr("y1", h-padding_bottom)
					.attr("x1", xScale(national_average))
					.attr("y2", padding_top)
					.attr("x2", xScale(national_average))
					.attr("stroke-width", 1)
					.attr("stroke", "#000");

		var avg_line_text = average_line
				.append("text")
				.attr("class", "average-text")
				.attr("y", padding_top-5)
				.attr("x", xScale(national_average))
                .style("text-anchor", "middle");


		avg_line_text
			.text("National Average")
			.attr("font-size", "10px");

//Draw circles for state data points
var circleplot = barplot.append("g").attr("class", "plot_area");


var chart = circleplot.selectAll("g")
			.data(data, function(d){return d.fips});

var line_element = chart.enter().append("g").attr("class", "state_line").attr("id", function(d){return d.fips.replace(/\s+/g, '');});

		var first_line = line_element.append("line");

		var second_line = line_element.append("line");

		var average = line_element.append("circle");

		var white = line_element.append("circle");

		var minority = line_element.append("circle");


		first_line
			.attr("class", "first-line")
			.attr("y1", function(d) {
				return yScale(d.fips);
				})
			.attr("x1", function(d) {
				return xScale(d.naepscore);
				})
			.attr("y2", function(d) {
			return yScale(d.fips);
			})
			.attr("x2", function(d) {
			return xScale(d.naepavg);
			});

		second_line
			.attr("class", "second-line")
			.attr("y1", function(d) {
				return yScale(d.fips);
				})
			.attr("x1", function(d) {
				return xScale(d.naepavg);
				})
			.attr("y2", function(d) {
			return yScale(d.fips);
			})
			.attr("x2", function(d) {
			return xScale(d.whtnaepscore);
			});

		average
			.attr("class", "avg-circles")
			.attr("cy", function(d) {
				return yScale(d.fips);
				})
			.attr("cx", function(d) {
				return xScale(d.naepavg);
				})
			.attr("r", function(d){return rScaleTotal(d.totenrl)});

		white
			.attr("class", "wht-circles")
			.attr("cy", function(d) {
				return yScale(d.fips);
				})
			.attr("cx", function(d) {
				return xScale(d.whtnaepscore);
				})
			.attr("r", function(d){return rScale(d.wht_pct)*rScaleTotal(d.totenrl)});

		minority
			.attr("class", "min-circles")
			.attr("cy", function(d) {
				return yScale(d.fips);
				})
			.attr("cx", function(d) {
				return xScale(d.naepscore);
				})
			.attr("r", function(d){return rScale(d.min_pct)*rScaleTotal(d.totenrl)});

/*###################################################
Mouseover functions
#####################################################*/
function dotOn(d){

//Grab ids of object and parent object to identify which svg the mouse is over	
	var id = this.id;
	var idString = "#"+id;
    var parentid = this.parentNode.id;
    var nullcolor = this.getAttribute("fill");

	//Get current value of gap
	var gapSelected = d3.selectAll("#gap_3")[0][1].value;
	if(gapSelected=="blk"){ var group = "black"}else{var group="hispanic"};

	//Get state selected
	var stateSelected = d3.selectAll("#highlight_3")[0][1].value.replace(/\s+/g, '');

	//Highlight selection
	    d3.selectAll(idString).classed("selected", function(){
            if (stateSelected == "All") {
                return true;
            }
            else {
                return (this.id == stateSelected);
            }
        });

	if(isIE==0){
			d3.selectAll(idString).moveToFront();
		}

    if(parentid=="gap-container_3" && nullcolor.toLowerCase()=="#d3d3c9"){ //if no achievement gap data for state
        var htmlBody="No data for this state available with current selections."
    }
    else{

        if(parentid=="gap-container_3"){
            var name = d.properties.STATE_NAME;

            //Content of tooltip
            var htmlBody = "<b>"+name+"</b><br/><b>"+mapdata_3[name].year+"</b><br/>Average <b>white</b> NAEP score: <b>"+
                d3.round(mapdata_3[name].whtnaepscore,2)+ "</b><br/> Average <b>"+group+ "</b> NAEP score: <b>" + d3.round(mapdata_3[name].naepscore,2)+
                "</b><br/>Average <b>state</b> NAEP score: <b>" + d3.round(mapdata_3[name].naepavg,2) +
                "</b><br/>Average <b>national</b> NAEP score: <b>" + d3.round(mapdata_3[name].natavg,2)+"</b>";

        }
        else{
            //Content of tooltip
            var htmlBody = "<b>"+d.fips+"</b><br/><b>"+d.year+"</b><br/>Average <b>white</b> NAEP score: <b>"+
                d3.round(d.whtnaepscore,2)+ "</b><br/> Average <b>"+group+ "</b> NAEP score: <b>" + d3.round(d.naepscore,2)+
                "</b><br/>Average <b>state</b> NAEP score: <b>" + d3.round(d.naepavg,2) +
                "</b><br/>Average <b>national</b> NAEP score: <b>" + d3.round(d.natavg,2)+"</b>";
        }
    }

    //var left_offset = d3.event.pageX+280 > $(window).width() ? -280 : 30;

//Show tooltip
			tooltip_3
					.attr("id", id)
                    .style("left", (d3.event.pageX+30) + "px")
                    .style("top", (d3.event.pageY-30) + "px")
					.style("opacity", function() {
                        if (stateSelected == "All") {
                            return 1;
                        }
                        else {
                            return (this.id == stateSelected) ? 1.0 : 0;
                        }
                    })
					.html(htmlBody)
                    .moveToFront();

}

function dotOut(d){

	var id = this.id;
	var idString = "#"+id;

	d3.selectAll(idString).classed("selected", false);

	if(isIE==0){
			d3.selectAll(idString).moveToBack();	
		}

	tooltip_3
		.style("opacity", 0);

}

		line_element.on("mouseover", dotOn)
					.on("mouseout", dotOut);

        gap_map_3
            .on("mouseover", dotOn)
            .on("mouseout", dotOut);
/*###################################################
Initialize help tooltips
#####################################################*/
    /*
$(function () {

$('#gap_3').tooltip({
        'placement': 'bottom',
        'title': "Use this menu to toggle between Blacks and Hispanics.",
        'trigger' : 'hover'
});

$('#sort_3').tooltip({
        'placement': 'bottom',
        'title': "Use this menu to sort the states by their characteristics.",
        'trigger' : 'hover'
});

$('#highlight_3').tooltip({
        'placement': 'bottom',
        'title': "Use this menu to follow a particular state.",
        'trigger' : 'hover'
});

$('#current-year_3').tooltip({
        'placement': 'bottom',
        'title': "Drag the slider to see states over time.",
        'trigger' : 'hover'
});

});
*/
/*###################################################
Change data based on user inputs
#####################################################*/
		

//Sort data function
function sortData(){

			var sorted = d3.selectAll("#sort_3")[0][1].value;

			//Sorting value
			if(sorted=="name"){	 
				var sortedData = function(a, b) {
						return d3.ascending(stateName(a), stateName(b));		
				};
			}
			else if(sorted=="gap"){
				var sortedData = function(a, b) {
						return d3.ascending(gapScore(a), gapScore(b));		
				};	
			}
			else if(sorted=="white"){
				var sortedData = function(a, b) {
						return d3.ascending(whiteScore(a), whiteScore(b));		
				};	
			}
			else if(sorted=="minority"){
				var sortedData = function(a, b) {
						return d3.ascending(minScore(a), minScore(b));		
				};	
			}
			else{
				var sortedData = function(a, b) {
						return d3.ascending(avgScore(a), avgScore(b));		
				};	
			}

			return sortedData;
};

//Initialize state menu selection value
 var thisState_3 = "All";

//Data filtering function
function transitionData(){

	/*##################################################
	#Update menus based on what's available for that year
	#####################################################*/
	//Selected year
	var yearSelected = d3.selectAll("#current-year_3")[0][0].value;

	//Get current value of gap
	var gapSelected = d3.selectAll("#gap_3")[0][1].value;
	
	//Get current value of grade
	var gradeSelected = d3.selectAll("#grade_3")[0][1].value;

	//Selected subject
	var subSelected = d3.selectAll("#subject_3")[0][1].value;

	//Adjust axis if eighth grade
	//Scale for x-value

	var xScale = gradeSelected==8 ? d3.scale.linear()
				.domain([200, 350])
				.range([padding_right,w-padding_left]) :
				d3.scale.linear()
				.domain([150, 300])
				.range([padding_right,w-padding_left]);

	var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);

	//Save group of gap selected for text updates
	if(gapSelected=="blk"){var gap_title="Black-White"; var gap_group="Black"}
	else{var gap_title="Hispanic-White"; var gap_group="Hispanic"}
	d3.selectAll("#gap_3_title").text(gap_title+ " Achievement Gap");

	//Update legend
	d3.selectAll(".min-legend-text").text(gap_group);
    d3.selectAll("#negative_gap").text(gap_group + "s do better");

	//Update sort menu based on group selected
	d3.selectAll("#sort_3").selectAll("option")
		.text(function(d){
			if(d=="name"){
				return "State Name";
			}
			else if(d=="gap"){
				return "Achievement Gap";
			}
			else if(d=="white"){
				return "White Scores";
			}
			else if(d=="minority" && gapSelected=="blk"){
				return "Black Scores";
			}
			else if(d=="minority" && gapSelected=="hsp"){
				return "Hispanic Scores";
			}
			else{
				return "State Average Scores";
			}
		});


	/*################################################################
	#Filter data for map and scatterplot and updates values
	###################################################################*/
	//Delay for transitions
	var delay = function(d, i){return i*5;};

    //Min and max for slider
    var slide_min = d3.min(csv.filter(function(row){
        return row['vgap']!=9999 && row['group']==gapSelected
            && row['grade'] == gradeSelected && row['sub'] == subSelected;}), function(d){return d.slideyear});

    var slide_max = d3.max(csv.filter(function(row){
        return row['vgap']!=9999 && row['group']==gapSelected
            && row['grade'] == gradeSelected && row['sub'] == subSelected;}), function(d){return d.slideyear});

    //Convert selected year to maximum slideyear if greater than maximum
    if(yearSelected>slide_max){var yearSelected=slide_max};

	//Filter data by grade, year, and subject
	var data = csv.filter(function(row){
			  			return row['vgap']!=9999 && row['group']==gapSelected && row['slideyear'] == yearSelected && row['grade'] == gradeSelected && row['sub'] == subSelected;
			  		});

    //Convert symbolic year to actual year
    var yearActual = d3.max(data.filter(function(row){
        return row['slideyear']==yearSelected}), function(d){return d.year});

    var yearText = d3.selectAll("#current-year_3").text(parseFloat(yearActual));

    //Update slider range
    $(function() {
        $("#time_3").slider({
            value: yearSelected,
            min: slide_min,
            max: slide_max,
            step: 1
        })
    });


    //Enter and exit for chart
		var chart = circleplot.selectAll("g")
			.data(data, function(d){return d.fips});

		chart.exit().remove();
	

	//Update state selection menu

	//Get unique list of states
		var uniqueState = d3.nest()
						    .key(function(d) { return d.fips; })
						    .sortKeys(d3.ascending)
						    .entries(data, d3.map);

		//Add an "all" option
		var stateArray = ["All"];

		uniqueState.forEach(function(d){
			stateArray.push(d.key);
		});

		//Check if previously selected state is available in new data selection
		var stateAvailable= false;

		for(i=0; i<=stateArray.length; i++){
			if(thisState_3==stateArray[i]){
				var stateAvailable = true;
				var index = i;
			}
		}

	var stateMenu = d3.selectAll("#highlight_3").select("select").selectAll("option")
					.data(stateArray, function(d){return d;});

	var stateMenuEnter = stateMenu
					    .enter()
					    .append("option")
					      .attr("index", function(d, i) { return i; })
					      .attr("value", function(d){return d;});

	stateMenuEnter
			.text(function(d){ return d;});

    stateMenu.exit().remove();

	//Sort state dropdown alphabetically and set value
	var sortList = d3.selectAll("#highlight_3 option")
	    .datum(function() { return this.dataset; });

       sortList
	    .attr("selected", function(d,i){
            if(stateAvailable==true){
	    		if(i==index){ return "selected"}
	    	}
	    	else{
	    		if(i==0){ return "selected"}
	    	}
	    });

		//Get sort order from dropdown

		var sortedData = data.sort(sortData());

		var yScale = d3.scale.ordinal()
			.domain(sortedData.map(function(d){ return d.fips;}))
			.rangeRoundBands([h-padding_bottom, padding_top], 0.5, 0.5);

		var yAxis = d3.svg.axis().scale(yScale).orient("left");

		var axisTransition = barplot.transition().duration(750);

		axisTransition
				.select(".x-axis")
				.call(xAxis)
				.selectAll("text")
                .attr("x", 10)
                .style("text-anchor", "end");

		axisTransition
			.select(".y-axis")
			.call(yAxis);

		//Update national average line
		
		var national_average = data[0].natavg;
		var average_line = barplot.select(".average-line");
		var average_text = barplot.select(".average-text");

		average_line
		.style("opacity", 1);

		average_line
		.transition()
			.duration(750)
			.delay(delay)
			.ease("linear")
					.attr("x1", xScale(national_average))
					.attr("x2", xScale(national_average));

		average_text
			.style("opacity", 1);

		average_text
			.transition()
			.duration(750)
			.delay(delay)
			.ease("linear")
			.attr("x", xScale(national_average));

		var chart_enter = chart.enter().append("g").attr("class", "state_line").attr("id", function(d){return d.fips.replace(/\s+/g, '');});

		chart_enter.on("mouseover", dotOn)
					.on("mouseout", dotOut);

		chart_enter.append("line").attr("class", "first-line");

		chart_enter.append("line").attr("class", "second-line");

		chart_enter.append("circle").attr("class", "avg-circles");

		chart_enter.append("circle").attr("class", "wht-circles");

		chart_enter.append("circle").attr("class", "min-circles");

		var first_line = chart.select(".first-line");
		var second_line = chart.select(".second-line");
		var avg_circles = chart.select(".avg-circles");
		var wht_circles = chart.select(".wht-circles");
		var min_circles = chart.select(".min-circles");


        first_line
            .transition()
            .duration(750)
            .delay(delay)
            .ease("linear")
            .attr("class", "first-line")
            .attr("y1", function(d) {
                return yScale(d.fips);
            })
            .attr("x1", function(d) {
                return xScale(d.naepscore);
            })
            .attr("y2", function(d) {
                return yScale(d.fips);
            })
            .attr("x2", function(d) {
                return xScale(d.naepavg);
            });

        second_line
            .transition()
            .duration(750)
            .delay(delay)
            .ease("linear")
            .attr("class", "second-line")
            .attr("y1", function(d) {
                return yScale(d.fips);
            })
            .attr("x1", function(d) {
                return xScale(d.naepavg);
            })
            .attr("y2", function(d) {
                return yScale(d.fips);
            })
            .attr("x2", function(d) {
                return xScale(d.whtnaepscore);
            });

        avg_circles
            .transition()
            .duration(750)
            .delay(delay)
            .ease("linear")
            .attr("class", "avg-circles")
            .attr("cy", function(d) {
                return yScale(d.fips);
            })
            .attr("cx", function(d) {
                return xScale(d.naepavg);
            })
            .attr("r", function(d){return rScaleTotal(d.totenrl)});

        wht_circles
            .transition()
            .duration(750)
            .delay(delay)
            .ease("linear")
            .attr("class", "wht-circles")
            .attr("cy", function(d) {
                return yScale(d.fips);
            })
            .attr("cx", function(d) {
                return xScale(d.whtnaepscore);
            })
            .attr("r", function(d){return rScale(d.wht_pct)*rScaleTotal(d.totenrl)});

        min_circles
            .transition()
            .duration(750)
            .delay(delay)
            .ease("linear")
            .attr("class", "min-circles")
            .attr("cy", function(d) {
                return yScale(d.fips);
            })
            .attr("cx", function(d) {
                return xScale(d.naepscore);
            })
            .attr("r", function(d){return rScale(d.min_pct)*rScaleTotal(d.totenrl)});

    /*################################################################
     #Map updates
     ###################################################################*/
    //Map data refresh

    mapdata_3 = window.data = _(data).chain().map(function(d) {
        d.vgap = parseFloat(d.vgap);
        d.resid = parseFloat(d.resid);
        d.whtnaepscore = parseFloat(d.whtnaepscore);
        d.naepscore = parseFloat(d.naepscore);
        d.naepavg = parseFloat(d.naepavg);
        d.natavg = parseFloat(d.natavg);
        d.year = d.year;
        return [d.fips, d];
    }).object().value();


    //Shading function for choropleth based on residuals
    var gap_shading_3 = function(d){
        var name = d.properties.STATE_NAME;
        var value = mapdata_3[name] ? mapdata_3[name].vgap : null;
        if(value){
                return gap_color_3(value);
            }
        else{return '#D3D3C9'}
    };

    //Map transition
    gap_container_3.selectAll(".gap-states-3")
        .transition()
        .duration(750)
        .ease("linear")
        .attr("fill", gap_shading_3);

	//Make sure state remains highlighted
    var stateSelected = d3.selectAll("#highlight_3")[0][1].value;
    var id = stateSelected.replace(/\s+/g, '');

    if(stateSelected=="All"){
        d3.selectAll('.state_line').style('opacity', 1);
        d3.selectAll('.gap-states-3').style('opacity', 1);
    }
    else{

        d3.selectAll('.state_line').style('opacity',function () {
            return (this.id == id) ? 1.0 : 0.1;
        });

        d3.selectAll('.gap-states-3').style('opacity',function () {
            return (this.id == id) ? 1.0 : 0.1;
        });
    }

    //return data;
	}

//Current Gap
		gap_3.on("change", transitionData);

		//Current Grade
		grade_3.on("change", transitionData);

		//Current subject
		subject_3.on("change", transitionData);

		//Sort data based on selection
		sort_3.on("change",transitionData);


		//Current year (jquery plug-in)
		$(function() {
	    $( "#time_3" ).slider({
	      slide: function( event, ui ) {
	        $( "#current-year_3" ).val( ui.value );
	        	transitionData();
	        	//sortData();
	      }
		    });
		    $( "#current-year_3" ).val($( "#time_3" ).slider( "value" ));
		  });

	//Highlight state

	highlight_3.on("change", function(){

		var stateSelected = d3.selectAll("#highlight_3")[0][1].value;
		var id = stateSelected.replace(/\s+/g, '');

		if(stateSelected=="All"){
			d3.selectAll('.state_line').style('opacity', 1);
            d3.selectAll('.gap-states-3').style('opacity', 1);
		}
		else{

			d3.selectAll('.state_line').style('opacity',function () {
		        return (this.id == id) ? 1.0 : 0.1;
		    });
            d3.selectAll('.gap-states-3').style('opacity',function () {
                return (this.id == id) ? 1.0 : 0.1;
            });
		}

		thisState_3 = stateSelected;

		if(isIE==0){
			barplot.selectAll("#"+id).moveToFront();	
		}

	});

	}
}


