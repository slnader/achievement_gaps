
/*###################################################
Set up the controls for the map
#####################################################*/
//Thousands separator formattor
	var commaFormat = d3.format(",");

//Create dropdown menus to select gap, grade, and subject

//Grade
var grade_2 = d3.selectAll("#grade_2");

grade_2.html("<span class='control-text'>Age</span><br/>");

grade_2
	.append("select")
    .attr("id", "grade_2")
    .selectAll("option")
    .data(["4", "8", "12"])
    .enter()
    .append("option")
      .attr("value", function(d){return d;})
      .text(function(d){
        if(d=="4"){
            return "9 year olds"
        }
        else if(d=="8"){
            return "13 year olds"
        }
        else{
            return "17 year olds"
        }});

//Subject
var subject_2 = d3.selectAll("#subject_2");

subject_2.html("<span class='control-text'>Subject</span><br/> ");

subject_2
	.append("select")
    .attr("id", "subject_2")
    .selectAll("option")
    .data(["math", "read"])
    .enter()
    .append("option")
      .attr("value", function(d){return d;})
      .text(function(d){ return d=="math" ? "Math" : "Reading";});

/*###################################################
Define all current inputs
#####################################################*/
//Selected grade
var gradeSelected = d3.selectAll("#grade_2")[0][1].value;
//Selected subject
var subSelected = d3.selectAll("#subject_2")[0][1].value;

//Queue up all data for the chart
		queue()
			  .defer(d3.csv, "data/ltt naep scores - 1.28.2015.csv")
			  .await(ready);

/*###################################################
Initialize map with data
#####################################################*/
function ready(error, csv){

if(error){
	console.log(error);
				}
else{

		var dateFormat = d3.time.format("%Y").parse,
		bisectDate = d3.bisector(function(d) { return d.year; }).left;

		csv.forEach(function(d){
			d.year = dateFormat(d.year);
            d.Black_Students = parseFloat(d.Black_Students);
            d.White_Students = parseFloat(d.White_Students);
            d.Hispanic_Students = parseFloat(d.Hispanic_Students);

		});

	//Filter data by grade, group, and subject
		var data = csv.filter(function(row){
			  			return row['grade'] == gradeSelected && row['sub'] == subSelected;
			  		});

 /*##############################################################
Bar chart
###############################################################*/

//Set inital dimensions of chart
	var w = 800,
      h = 600,
      padding_bottom=50,
      padding_left = 50,
      padding_right = 135;

/*#################################################################
#Set up x and y axes
##################################################################*/
//Scale for x-value
var xScale = d3.time.scale()
    			.range([padding_left,w-padding_right]);

//Scale for y-value
var yScale = d3.scale.linear()
			.range([h-padding_bottom, padding_bottom]);

//Color scale
var color = d3.scale.category10();

//Create x and y axes
	var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(3);
	var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

var line = d3.svg.line()
	.interpolate("linear")
	.defined(function(d) { return d.score!=9999; })
    .x(function(d) { return xScale(d.year); })
    .y(function(d) { return yScale(d.score); });

/*####################################################################
#Set up data for time series
######################################################################*/

color.domain(d3.keys(data[0]).filter(function(key){
	return key!== "year" && key!=="grade" && key!=="sub"
}));

var states = color.domain().map(function(name){
	return{
		name: name,
		values: data.map(function(d){
			return{year: d.year, score: +d[name]};
		})
	};
});

//xScale.domain(d3.extent(data, function(d){ return d.year;}));

    xScale.domain([dateFormat("1975"), dateFormat("2012")]);

yScale.domain([180,320]);

/*#####################################################################
Draw chart
######################################################################*/

//Draw svg for scatterplot
var lineplot = d3.select("#national_score_container")
				.append("svg")
				.attr("width", "100%")
				.attr("height", "100%")
				.attr("viewBox", "0 0 "+w+ " "+h)
				.attr("preserveAspectRatio", "xMidYMid")
                .attr("class", "svg-line-container")
				.append("g")
				.attr("id", "line-graph");

//Call x and y axes
lineplot.append("g")
		.attr("class", "x-axis")
		.attr("transform", "translate(0," + yScale(180) + ")")
		.call(xAxis)
		.selectAll("text")
		.attr("class", "state_label")
        .attr("x", 10)
        .style("text-anchor", "end");

lineplot.append("g")
		.attr("class", "y-axis")
		.attr("transform", "translate(" + padding_left + ",0)")
		.call(yAxis);

//Draw labels for y axis
var y_label = lineplot.append("text")
	    .attr("class", "y_label")
	    .attr("text-anchor", "end")
	    .attr("y", 0)
	    .attr("x", -w/4)
	    .attr("dy", ".75em")
	    .attr("transform", "rotate(-90)");

y_label
	    .text("Average NAEP Score");

//Time series
var state = lineplot
			  .selectAll(".state")
			  .data(states)
			  .enter()
			  .append("g")
			  .attr("class", "state")
			  .attr("id", function(d){return d.name});
state
	  .append("path")
	  .attr("class", "score-line")
	  .attr("id", function(d){return d.name})
      .attr("d", function(d){return line(d.values)})
	  .style("stroke", function(d){ 
	    	return color(d.name)
	    })
      .style("fill", "none");

//Performance lines
//Beginning Skills and Understandings
var level_one =	lineplot
					.append("g");

			level_one		
					.append("line")
					.attr("class", "benchmark")
					.attr("x1", padding_left)
					.attr("y1", yScale(200))
					.attr("x2", w-padding_right)
					.attr("y2", yScale(200))
					.attr("stroke-width", 1)
					.attr("stroke", "#C6C6A9");

var level_one_text = level_one
	.append("text")
	.attr("x", (w-padding_right)/2.5)
	.attr("y", yScale(200));

level_one_text
	.text("Level 200: Beginning Skills and Understandings")
	.attr("font-size", "10px");

//Numerical Operations and Beginning Problem Solving
var level_two =	lineplot
					.append("g");

				level_two
					.append("line")
					.attr("class", "benchmark")
					.attr("x1", padding_left)
					.attr("y1", yScale(250))
					.attr("x2", w-padding_right)
					.attr("y2", yScale(250))
					.attr("stroke-width", 1)
					.attr("stroke", "#C6C6A9");


var level_two_text = level_two
	.append("text")
	.attr("x", (w-padding_right)/2.5)
	.attr("y", yScale(250));

level_two_text
	.text("Level 250: Numerical Operations and Beginning Problem Solving")
	.attr("font-size", "10px");

//Moderately Complex Procedures and Reasoning

var level_three = lineplot
					.append("g");

				level_three
					.append("line")
					.attr("class", "benchmark")
					.attr("x1", padding_left)
					.attr("y1", yScale(300))
					.attr("x2", w-padding_right)
					.attr("y2", yScale(300))
					.attr("stroke-width", 1)
					.attr("stroke", "#C6C6A9");

var level_three_text =level_three
	.append("text")
	.attr("x", (w-padding_right)/2.5)
	.attr("y", yScale(300));

level_three_text
	.text("Level 300: Moderately Complex Procedures and Reasoning")
	.attr("font-size", "10px");



//Line text
state
	.append("text")
	 .attr("class", "score-line-label")
	 .datum(function(d) { 
	 	for(i=1; i<9; i++){
		 	if(d.values[d.values.length - i].score!=9999){
		 	return {name: d.name, value: d.values[d.values.length - i], range: d.values[9].score- d.values[0].score};
		 	break; 	
		 	}
	 	}
	 })
      .attr("transform", function(d,i) { return "translate(" + xScale(d.value.year) + "," + yScale(d.value.score) + ")"; })
      .attr("x", 3)
      .attr("dy", ".35em")
      .attr("font-size", "10px")
      .attr("id", function(d){return d.name})
      .style("opacity", 1)
      .text(function(d) { return d.name.replace(/_/g, ' ')+ " (+" + d3.round(d.range) + " pts)"; });

//Mouseover prep
  var focus = lineplot.append("g")
      .attr("class", "focus")
      .style("display", "none");

  focus.append("circle")
      .attr("r", 3);

  focus.append("text")
      .attr("x", 9)
      .attr("dy", "2em")
      .attr("font-size", "10px");


function lineOn(){
	   	var id = this.id;

		var x = d3.mouse(this)[0],
  		y = d3.mouse(this)[1];
	    var xScale0 = xScale.invert(x);
	    var yScale0 = yScale.invert(y);

	    if(x>=xScale.range()[0] && x<=xScale.range()[1]) {
			focus.attr("transform", "translate(" + x + "," + y + ")").style("display", "inline");
	    	focus.select("text").text(d3.round(yScale0,2));	  	
	    }
}   

function lineOut(){
		var x = d3.mouse(this)[0],
  		y = d3.mouse(this)[1];

		if(x<xScale.range()[0] || x>xScale.range()[1]) {
				focus.style("display", "none");  	
		}



	}
state
	.on("mouseover", lineOn)
	.on("mousemove", lineOn)
	.on("mouseout", lineOut);
/*
//Call help tooltips on dropdowns
$(function () {

$('#grade_2').tooltip({
        'placement': 'bottom',
        'title': "Use this menu to toggle between grades.",
        'trigger' : 'hover'
});

$('#subject_2').tooltip({
        'placement': 'bottom',
        'title': "Use this menu to toggle between subjects.",
        'trigger' : 'hover'
});

});*/

/*###################################################
Change data based on user inputs
#####################################################*/

//Data filtering function
function transitionData(){

	/*################################################################
	#Filter data for map and scatterplot and updates values
	###################################################################*/

	//Selected grade
	var gradeSelected = d3.selectAll("#grade_2")[0][1].value;
	//Selected subject
	var subSelected = d3.selectAll("#subject_2")[0][1].value;

		//Filter data by grade, group, and subject
		var data = csv.filter(function(row){
			  			return row['grade'] == gradeSelected && row['sub'] == subSelected;
			  		});

	/*####################################################################
	#Set up data for time series
	######################################################################*/

	color.domain(d3.keys(data[0]).filter(function(key){
		return key!== "year" && key!=="grade" && key!=="sub"
	}));

	var states = color.domain().map(function(name){
		return{
			name: name,
			values: data.map(function(d){
				return{year: d.year, score: +d[name]};
			})
		};
	});
	
	//X domain (Year)
	//xScale.domain(d3.extent(data, function(d){ return d.year;}));

	//Y scale (NAEP scores)
	//yScale.domain([180, 320]);


	//Create x and y axes
	var yAxis = d3.svg.axis().scale(yScale).orient("left");
	var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

	//Hide focus point
	focus.style("display", "none");
	/*####################################################################
	#Update lines on chart
	######################################################################*/

	//Delay for transitions
	var delay = function(d, i){return i*5;};

	//Select lines for update
	var state = lineplot
			  .selectAll(".state")
			  .data(states);

	//Enter statement for update
	var state_enter = state
					  .enter()
					  .append("g")
					  .attr("class", "state")
					  .attr("id", function(d){return d.name});

	//Exit statement for update
	state.exit().remove();

	//Append line
	state_enter.append("path")
	  .attr("class", ".score-line");

	var lines = state.select(".score-line");

	lines
		.transition()
		.duration(750)
		.delay(delay)
		.ease("linear")
	    .attr("d", function(d){return line(d.values)})
	     .style("stroke", function(d){ 
	    	return color(d.name)
	    })
	    .style("fill", "none");

	//Text transition

	var level_one_value = subSelected=="read" ? "Level 200: Demonstrate Partially Developed Skills and Understanding" : "Level 200: Beginning Skills and Understandings";
	var level_two_value = subSelected=="read" ? "Level 250: Interrelate Ideas and Make Generalizations" : "Level 250: Numerical Operations and Beginning Problem Solving";
	var level_three_value = subSelected=="read" ? "Level 300: Understand Complicated Information" : "Level 300: Moderately Complex Procedures and Reasoning";

    level_one_text
		.text(level_one_value)
		.attr("font-size", "10px");

	level_two_text
		.text(level_two_value)
		.attr("font-size", "10px");

	level_three_text
		.text(level_three_value)
		.attr("font-size", "10px");


	state.select(".score-line-label")
	 .datum(function(d) { 
	 	for(i=1; i<9; i++){
		 	if(d.values[d.values.length - i].score!=9999){
		 	return {name: d.name, value: d.values[d.values.length - i], range: d.values[9].score- d.values[0].score};
		 	break; 	
		 	}
	 	}
	 })
	  .transition()
	  .duration(750)
	  .delay(delay)
	  .ease("linear")
      .attr("transform", function(d,i) { 

            if(gradeSelected=="4" && subSelected=="read" && d.name=="Black_Students"){
                var score = d.value.score-2
            }
            else{
                var score = d.value.score;
            }
      	return "translate(" + xScale(d.value.year) + "," + yScale(score) + ")"; 
      })
      .attr("x", 3)
      .attr("dy", ".35em")
      .attr("font-size", "10px")
      .attr("id", function(d){return d.name})
      .style("opacity", 1)
      .text(function(d) { return d.name.replace(/_/g, ' ')+ " (+" + d3.round(d.range) + " pts)"; });

	//Axis transitions
	var axisTransition = lineplot.transition().duration(750);

	var axisText=	axisTransition
				.select(".x-axis")
				.attr("transform", "translate(0," + yScale(180) + ")")
				.call(xAxis)
				.selectAll("text")
                .attr("x", 10)
                .style("text-anchor", "end");

    //Mouseover
state
	.on("mouseover", lineOn)
	.on("mousemove", lineOn)
	.on("mouseout", lineOut);

	};


		//Current Grade
		grade_2.on("change", transitionData);

		//Current subject
		subject_2.on("change", transitionData);

	}	
}