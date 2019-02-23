/*###################################################
Set up the controls for the map
#####################################################*/
//Thousands separator formattor
	var commaFormat = d3.format(",");

//Create dropdown menus to select gap, grade, and subject
//Gap
var gap_4 = d3.selectAll("#gap_4");

gap_4.html("<span class='control-text'>Group</span><br/>");

gap_4
	.append("select")
    .attr("id", "gap_4")
    .selectAll("option")
    .data(["blk", "hsp"])
    .enter()
    .append("option")
      .attr("value", function(d){return d;})
      .text(function(d){ return d=="blk" ? "Black-White" : "Hispanic-White";});

//Grade
var grade_4 = d3.selectAll("#grade_4");

grade_4.html("<span class='control-text'>Grade</span><br/>");

grade_4
	.append("select")
    .attr("id", "grade_4")
    .selectAll("option")
    .data(["4", "8"])
    .enter()
    .append("option")
      .attr("value", function(d){return d;})
      .text(function(d){ return d=="4" ? "Grade Four" : "Grade Eight";});

//Subject
var subject_4 = d3.selectAll("#subject_4");

subject_4.html("<span class='control-text'>Subject</span><br/>");

subject_4
	.append("select")
    .attr("id", "subject_4")
    .selectAll("option")
    .data(["math", "read"])
    .enter()
    .append("option")
      .attr("value", function(d){return d;})
      .text(function(d){ return d=="math" ? "Math" : "Reading";});

/*###################################################
Define all current inputs
#####################################################*/
//Selected gap
var gapSelected = d3.selectAll("#gap_4")[0][1].value;
//Selected grade
var gradeSelected = d3.selectAll("#grade_4")[0][1].value;
//Selected subject
var subSelected = d3.selectAll("#subject_4")[0][1].value;

//Queue up all data for the chart
		queue()
			  .defer(d3.csv, "data/adjusted naep gaps fitted - 1.28.2015.csv")
              .defer(d3.csv, "data/state naep gaps w ci - 1.28.2015.csv")
              .defer(d3.csv, "data/adjusted naep gaps actual - 1.28.2015.csv")
			  .await(ready);

/*###################################################
Initialize map with data
#####################################################*/
function ready(error, fitted, ci, actual){

if(error){
	console.log(error);
				}
else{

    //Format dates and numbers for each csv set
	var dateFormat = d3.time.format("%Y").parse;
    //Fitted lines
	fitted.forEach(function(d){
        d.year = dateFormat(d.year);
        d.displayYear = dateFormat(d.displayYear);

    });
    //Actual lines
    actual.forEach(function(d){
        d.year = dateFormat(d.year)

    });
    //Confidence interval points
    ci.forEach(function(d){
        d.year = dateFormat(d.year);
        d.trueV = parseFloat(d.trueV);
        d.cihi = parseFloat(d.cihi);
        d.cilo = parseFloat(d.cilo);
    });

	//Filter data by grade, group, and subject
	var data = fitted.filter(function(row){
			  			return row['group']==gapSelected && row['grade'] == gradeSelected && row['sub'] == subSelected;
			  		});

    var points = ci.filter(function(row){
                        return row['group']==gapSelected && row['grade'] == gradeSelected && row['sub'] == subSelected;
                    });

    var raw_data = actual.filter(function(row){
        return row['group']==gapSelected && row['grade'] == gradeSelected && row['sub'] == subSelected;
    });
 /*##############################################################
Bar chart
###############################################################*/

//Set inital dimensions of chart
	var w = 800,
      h = 600,
      padding_bottom=50,
      padding_left = 50,
      padding_right = 100;

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

var line = d3.svg.line()
	.interpolate("basis")
	.defined(function(d) { return d.vgap!=9999; })
    .x(function(d) { return xScale(d.year); })
    .y(function(d) { return yScale(d.vgap); });

var raw_line = d3.svg.line()
    .interpolate("linear")
    .defined(function(d) { return d.vgap!=9999; })
    .x(function(d) { return xScale(d.year); })
    .y(function(d) { return yScale(d.vgap); });


    /*####################################################################
    #Set up data for time series
    ######################################################################*/

color.domain(d3.keys(data[0]).filter(function(key){
	return key!== "year" && key!=="grade" && key!=="sub" && key!=="group" && key!="displayYear"
}));


var states = color.domain().map(function(name){
	return{
		name: name,
		values: data.map(function(d){
			return{year: d.year, vgap: +d[name]};
		})
	};
});


var raw_states = color.domain().map(function(name){
    return{
        name: name,
        values: raw_data.map(function(d){
            return{year: d.year, vgap: +d[name]};
        })
    };
});

xScale.domain([d3.min(data, function(d){ return d.displayYear;}),
    d3.max(data, function(d){ return d.year;})]);

    yScale.domain([
        d3.min(points, function(d){ return d.cilo;}),
        d3.max(points, function(d){ return d.cihi;})
    ]);
//Create x and y axes
	var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);
	var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);

//State menu
var highlight_4 = d3.selectAll("#highlight_4");

highlight_4.html("<span class='control-text'>Select state</span><br/>");

//Get unique list of states
var uniqueState = color.domain().map(function(name){
	return name.replace(/_/g, ' ');
});


//Add an "all" option
//var stateArray = ["All", "National"];
var stateArray = ["All"];

uniqueState.forEach(function(d){
	if(d!="National"){
			stateArray.push(d);
	}
});

//Push list to dropdown
var stateMenu = highlight_4
	.append("select")
    .attr("id", "highlight_4");

 stateMenu
	.selectAll("option")
    .data(stateArray)
    .enter()
    .append("option")
     .attr("index", function(d, i) { return i; })
      .attr("value", function(d){return d;})
      .attr("selected", function(d){ if(d=="All"){return "selected"}})
      .text(function(d){ return d});

/*#####################################################################
Draw chart
######################################################################*/

//Draw svg for scatterplot
var lineplot = d3.select("#state_trends")
				.append("svg")
				.attr("width", "100%")
				.attr("height", "100%")
				.attr("viewBox", "0 0 "+w+ " "+h)
				.attr("preserveAspectRatio", "xMidYMid")
                .attr("class", "svg-line-container")
				.append("g");

//Call x and y axes
lineplot.append("g")
		.attr("class", "x-axis")
		.attr("transform", "translate(0," + yScale(0) + ")")
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
	    .attr("x", -w/6)
	    .attr("dy", ".75em")
	    .attr("transform", "rotate(-90)");

y_label
	    .text("Achievement Gap in Standard Deviations");

var line_points = lineplot
    .selectAll(".state-points")
    .data(points, function(d){return d.unique})
    .enter()
    .append("g")
    .attr("class", "state-points")
    .attr("id", function(d){return d.fips});

    //Upper bound
    line_points
        .append("line")
        .attr("class", "upper-bound")
        .attr("x1", function(d) {
            return xScale(d.year)-10;
        })
        .attr("y1", function(d) {
            return yScale(d.cihi);
        })
        .attr("x2", function(d) {
            return xScale(d.year)+10;
        })
        .attr("y2", function(d) {
            return yScale(d.cihi);
        });

    //Lower bound
    line_points
        .append("line")
        .attr("class", "lower-bound")
        .attr("x1", function(d) {
            return xScale(d.year)-10;
        })
        .attr("y1", function(d) {
            return yScale(d.cilo);
        })
        .attr("x2", function(d) {
            return xScale(d.year)+10;
        })
        .attr("y2", function(d) {
            return yScale(d.cilo);
        });

    //Connecting line
    line_points
        .append("line")
        .attr("class", "connect-bound")
        .attr("x1", function(d) {
            return xScale(d.year);
        })
        .attr("y1", function(d) {
            return yScale(d.cilo);
        })
        .attr("x2", function(d) {
            return xScale(d.year);
        })
        .attr("y2", function(d) {
            return yScale(d.cihi);
        });

    //Point estimate
    line_points
        .append("circle")
        .attr("class", "point-estimate")
        .attr("cx", function(d){
            return xScale(d.year)
        })
        .attr("cy", function(d){
            return yScale(d.trueV)
        })
        .attr("r", 5);

    //Hide CI's initially
    d3.selectAll(".state-points").attr("opacity", 0);

//Raw data lines

var raw_state = lineplot
    .selectAll(".raw-state")
    .data(raw_states, function(d){ return d.name})
    .enter()
    .append("g")
    .attr("class", "raw-state")
    .attr("id", function(d){return d.name});

raw_state
        .append("path")
        .attr("class", "raw-line")
        .attr("id", function(d){return d.name})
        .attr("d", function(d){return raw_line(d.values)})
        .style("stroke", function(d){
            return d.name=="National" ? "rgb(0,0,0)" : color(d.name)
        })
        .style("fill", "none")
        .style("opacity", 0);

var state = lineplot
			  .selectAll(".state")
			  .data(states, function(d){ return d.name})
			  .enter()
			  .append("g")
			  .attr("class", "state")
			  .attr("id", function(d){return d.name});

                state
				  .append("path")
				  .attr("class", "line")
				  .attr("id", function(d){return d.name})
			      .attr("d", function(d){return line(d.values)})
			      .style("stroke", function(d){ 
				    	return d.name=="National" ? "rgb(0,0,0)" : color(d.name)
				    })
			      .style("fill", "none");

//Line text
state
	.append("text")
	 .attr("class", "line-label")
	 .datum(function(d) { 
	 	for(i=1; i<9; i++){
		 	if(d.values[d.values.length - i].vgap!=9999){
		 	return {name: d.name, value: d.values[d.values.length - i]};
		 	break; 	
		 	}
	 	}
	 })
      .attr("transform", function(d,i) { return "translate(" + xScale(d.value.year) + "," + yScale(d.value.vgap) + ")"; })
      .attr("x", 8)
      .attr("dy", ".35em")
      .attr("font-size", "10px")
      .attr("id", function(d){return d.name})
      .style("opacity", 0)
      .text(function(d) { return d.name.replace(/_/g, ' '); });


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
		var stateSelected = d3.selectAll("#highlight_4")[0][1].value;

		var x = d3.mouse(this)[0],
  		y = d3.mouse(this)[1];

	    var xScale0 = xScale.invert(x);
	    var yScale0 = yScale.invert(y);

	    if(stateSelected=="All") {
            if (x >= xScale.range()[0] && x <= xScale.range()[1]) {
                focus.attr("transform", "translate(" + x + "," + y + ")").style("display", "inline");
                focus.select("text").text(d3.round(yScale0, 2));

                d3.selectAll('.line').style('opacity', function () {
                    return (this.id == id) ? 1.0 : 0.1;
                });
                d3.selectAll('.line-label').style('opacity', function () {
                    return (this.id == id) ? 1.0 : 0;
                });
                d3.selectAll('.state-points').style('opacity', function () {
                    return (this.id == id) ? 1.0 : 0;
                });
                d3.selectAll('.raw-line').style('opacity', function () {
                    return (this.id == id) ? 1.0 : 0;
                });
            }
            else{
                focus.style("display", "none");
                d3.selectAll('.line').style('opacity', 1);
                d3.selectAll('.line-label').style('opacity', 0);
                d3.selectAll('.state-points').style('opacity', 0);
                d3.selectAll('.raw-line').style('opacity', 0);
            }
        }
	  else {
                if (x >= xScale.range()[0] && x <= xScale.range()[1]) {
                    focus
                        .attr("transform", "translate(" + x + "," + y + ")")
                        .style("display", function () {
                            return (id == stateSelected.replace(/_/g, ' ')) ? "inline" : "none";
                        });

                    focus.select("text").text(d3.round(yScale0, 2));
                }
            else{
                    focus.style("display", "none");
                }
            }
	};

    function lineOut(){
        var x = d3.mouse(this)[0],
            y = d3.mouse(this)[1];
        var stateSelected = d3.selectAll("#highlight_4")[0][1].value;
        if(stateSelected=="All"){
        focus.style("display", "none");

        if(x<xScale.range()[0] || x>xScale.range()[1]) {
            d3.selectAll('.line').style('opacity', 1);
            d3.selectAll('.line-label').style('opacity', 0);
            d3.selectAll('.state-points').style('opacity', 0);
            d3.selectAll('.raw-line').style('opacity', 0);
        }
        }

    }

    //Mouseover
    state
        .on("mouseover", lineOn)
        .on("mousemove", lineOn)
        .on("mouseout", lineOut);



/*###################################################
Change data based on user inputs
#####################################################*/

//Data filtering function
function transitionData(){

	/*################################################################
	#Filter data for map and scatterplot and updates values
	###################################################################*/

	//Selected gap
	var gapSelected = d3.selectAll("#gap_4")[0][1].value;
	//Selected grade
	var gradeSelected = d3.selectAll("#grade_4")[0][1].value;
	//Selected subject
	var subSelected = d3.selectAll("#subject_4")[0][1].value;
	//Selected state
	var stateSelected = d3.selectAll("#highlight_4")[0][1].value;

		//Filter data by grade, group, and subject
		var data = fitted.filter(function(row){
			  			return row['group']==gapSelected && row['grade'] == gradeSelected && row['sub'] == subSelected;
			  		});

        var points = ci.filter(function(row){
        return row['group']==gapSelected && row['grade'] == gradeSelected && row['sub'] == subSelected;
        });

        var raw_data = actual.filter(function(row){
            return row['group']==gapSelected && row['grade'] == gradeSelected && row['sub'] == subSelected;
        });

	/*####################################################################
	#Set up data for time series
	######################################################################*/

	color.domain(d3.keys(data[0]).filter(function(key){
		return key!== "year" && key!=="grade" && key!=="sub" && key!=="group" && key!="displayYear"
	}));

	var states = color.domain().map(function(name){
		return{
			name: name,
			values: data.map(function(d){
				return{year: d.year, vgap: +d[name]};
			})
		};
	});

    var raw_states = color.domain().map(function(name){
        return{
            name: name,
            values: raw_data.map(function(d){
                return{year: d.year, vgap: +d[name]};
            })
        };
    });


    xScale.domain([d3.min(data, function(d){ return d.displayYear;}),
        d3.max(data, function(d){ return d.year;})]);

    yScale.domain([
        d3.min(points, function(d){ return d.cilo;}),
        d3.max(points, function(d){ return d.cihi;})
    ]);

	//Create x and y axes
	var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);
	var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);

	//Remove focus dot
	focus.style("display", "none");
	/*####################################################################
	#Update lines on chart
	######################################################################*/

	//Delay for transitions
	var delay = function(d, i){return i*5;};

    //Select points for update
    var line_update = lineplot.selectAll(".state-points")
        .data(points, function(d){return d.unique});

    line_update.exit().remove();

    //Update data
    var line_points_enter = line_update
        .enter().append("g")
        .attr("class", "state-points")
        .attr("id", function(d){return d.fips});

    //Select elements with updated data
    line_points_enter.append("line").attr("class", "upper-bound");
    line_points_enter.append("line").attr("class", "lower-bound");
    line_points_enter.append("line").attr("class", "connect-bound");
    line_points_enter.append("circle").attr("class", "point-estimate");

    var upper_bound = line_update.select(".upper-bound");
    var lower_bound = line_update.select(".lower-bound");
    var connect_bound = line_update.select(".connect-bound");
    var point_estimate = line_update.select(".point-estimate");

    //Transition confidence interval positions
    upper_bound
        .style("opacity", 0)
        .style("display", "block")
        .transition()
        .duration(750)
        .ease("linear")
        .attr("x1", function(d) {
            return xScale(d.year)-10;
        })
        .attr("y1", function(d) {
            return yScale(d.cihi);
        })
        .attr("x2", function(d) {
            return xScale(d.year)+10;
        })
        .attr("y2", function(d) {
            return yScale(d.cihi);
        })
        .style("opacity", 1);

    lower_bound
        .style("opacity", 0)
        .style("display", "block")
        .transition()
        .duration(750)
        .ease("linear")
        .attr("x1", function(d) {
            return xScale(d.year)-10;
        })
        .attr("y1", function(d) {
            return yScale(d.cilo);
        })
        .attr("x2", function(d) {
            return xScale(d.year)+10;
        })
        .attr("y2", function(d) {
            return yScale(d.cilo);
        })
        .style("opacity", 1);

    connect_bound
        .style("opacity", 0)
        .style("display", "block")
        .transition()
        .duration(750)
        .ease("linear")
        .attr("x1", function(d) {
            return xScale(d.year);
        })
        .attr("y1", function(d) {
            return yScale(d.cilo);
        })
        .attr("x2", function(d) {
            return xScale(d.year);
        })
        .attr("y2", function(d) {
            return yScale(d.cihi);
        })
        .style("opacity", 1);

    point_estimate
        .style("opacity", 0)
        .style("display", "block")
        .transition()
        .duration(750)
        .ease("linear")
        .attr("cx", function(d){
            return xScale(d.year)
        })
        .attr("cy", function(d){
            return yScale(d.trueV)
        })
        .attr("r", 5)
        .style("opacity", 1);

   //Select actual lines for update
    var raw_state = lineplot
        .selectAll(".raw-state")
        .data(raw_states, function(d){ return d.name});

    //Enter statement for update
    var raw_state_enter = raw_state
                            .enter()
                            .append("g")
                            .attr("class", "raw-state")
                            .attr("id", function(d){return d.name});

    //Exit statement for update
    raw_state.exit().remove();

    //Append line
    raw_state_enter.append("path")
        .attr("class", "raw-line")
        .attr("id", function(d){return d.name});

    var raw_lines = raw_state.select(".raw-line");

    raw_lines
        .attr("id", function(d){return d.name});

    raw_lines
        .transition()
        .duration(750)
        .delay(delay)
        .ease("linear")
        .attr("d", function(d){return raw_line(d.values)})
        .style("stroke", function(d){
            return d.name=="National" ? "rgb(0,0,0)" : color(d.name)
        })
        .style("fill", "none");

	//Select lines for update
	var state = lineplot
			  .selectAll(".state")
			  .data(states, function(d){ return d.name});

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
	  .attr("class", "line")
        .attr("id", function(d){return d.name});

	var lines = state.select(".line");

	lines
	.attr("id", function(d){return d.name});

	lines
		.transition()
		.duration(750)
		.delay(delay)
		.ease("linear")
		.attr("d", function(d){return line(d.values)})
        .style("stroke", function(d){
	    	return d.name=="National" ? "rgb(0,0,0)" : color(d.name)
	    })
	    .style("fill", "none");

	//Text transition
	state
	.select(".line-label")
	.datum(function(d) {
		 	for(i=1; i<d.values.length; i++){
			 	if(d.values[d.values.length - i].vgap!=9999){
			 	return {name: d.name, value: d.values[d.values.length - i]};
			 	}
            }
            console.log(d);
		 })  
	  .attr("id", function(d){if(d){return d.name}})
	  .transition()
	  .duration(750)
	  .delay(delay)
	  .ease("linear")
      .attr("transform", function(d) { if(d){return "translate(" + xScale(d.value.year) + "," + yScale(d.value.vgap) + ")"; }})
      .attr("x", 8)
      .attr("dy", ".35em")
      .attr("font-size", "10px")
      .text(function(d) { if(d){return d.name.replace(/_/g, ' '); }});

		 //Axis transitions
	var axisTransition = lineplot.transition().duration(750);

	var xaxisText=	axisTransition
					.select(".x-axis")
					.attr("transform", "translate(0," + yScale(0) + ")")
					.call(xAxis)
					.selectAll("text")
                    .attr("class", "state_label")
                    .attr("x", 10)
                    .style("text-anchor", "end");

    var yaxisText=	axisTransition
        .select(".y-axis")
        .attr("transform", "translate(" + padding_left + ",0)")
        .call(yAxis);


    //Make sure correct state is highlighted

		if(stateSelected=="All"){
			d3.selectAll('.line').style('opacity', 1);
			d3.selectAll('.line-label').style('opacity', 0);
            d3.selectAll('.state-points').style('opacity', 0);
            d3.selectAll('.raw-line').style('opacity', 0);

        }
		else{
			
			var id = stateSelected.replace(/\s+/g, '_');

			d3.selectAll('.line').style('opacity',function () {
		        return (this.id == id) ? 1.0 : 0.1;
		    });
		    d3.selectAll('.line-label').style('opacity',function () {
		        return (this.id == id) ? 1.0 : 0;
		    });
            d3.selectAll('.state-points').style('opacity',function () {
                return (this.id == id) ? 1.0 : 0;
            });
            d3.selectAll('.raw-line').style('opacity',function () {
                return (this.id == id) ? 1.0 : 0;
            });

		}

    //Mouseover
	state
	.on("mouseover", lineOn)
	.on("mousemove", lineOn)
    .on("mouseout", lineOut);

};

//Current Gap
		gap_4.on("change", transitionData);

		//Current Grade
		grade_4.on("change", transitionData);

		//Current subject
		subject_4.on("change", transitionData);

//Highlight state

	highlight_4.on("change", function(){

		var stateSelected = d3.selectAll("#highlight_4")[0][1].value;
		focus.style("display", "none");

		if(stateSelected=="All"){
			d3.selectAll('.line').style('opacity', 1);
			d3.selectAll('.line-label').style('opacity', 0);
            d3.selectAll('.state-points').style('opacity', 0);
            d3.selectAll('.raw-line').style('opacity', 0);
		}
		else{
				var id = stateSelected.replace(/\s+/g, '_');

			d3.selectAll('.line')
                .transition()
                .duration(500)
                .ease("linear")
                .style('opacity',function () {
		        return (this.id == id) ? 1.0 : 0.1;
		    });
		    d3.selectAll('.line-label')
                .transition()
                .duration(500)
                .ease("linear")
                .style('opacity',function () {
		        return (this.id == id) ? 1.0 : 0;
		    });

            d3.selectAll('.state-points')
                .transition()
                .duration(500)
                .ease("linear")
                .style('opacity',function () {
                return (this.id == id) ? 1.0 : 0;
            });
            d3.selectAll('.raw-line')
                .transition()
                .duration(500)
                .ease("linear")
                .style('opacity',function () {
                return (this.id == id) ? 1.0 : 0;
            });

		   if(isIE==0){
		   	lineplot.selectAll("#"+id).moveToFront();
		    focus.moveToFront();
		   }


		}
	});

	}	
}

