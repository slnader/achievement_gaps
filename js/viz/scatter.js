/*############################map#######################
Set up the controls for the 
#####################################################*/
//Thousands separator formattor
	var commaFormat = d3.format(",");

//Create dropdown for inequality measures
var inequality_5 = d3.selectAll("#inequality_5");

inequality_5.html("<span class='control-text'>Socioeconomic Disparity Measure</span><br/>");

inequality_5
	.append("select")
    .attr("id", "inequality_5")
    .selectAll("option")
    .data([
        ["sesgap", "Socioeconomic Disparities Index"],
        ["incV", "Income Gap"], ["edV", "Parent Education Gap"],
        ["povrat", "Poverty Ratio"],
    	["unemprat", "Unemployment Ratio"]])
    .enter()
    .append("option")
      .attr("value", function(d){return d[0];})
    .attr("name", function(d){return d[1];})
      .text(function(d){ 
      	return d[1];
      });

//Create dropdown menus to select gap, grade, and subject
//Gap
var gap_5 = d3.selectAll("#gap_5");

gap_5.html("<span class='control-text'>Group</span><br/>");

gap_5
	.append("select")
    .attr("id", "gap_5")
    .selectAll("option")
    .data(["blk", "hsp"])
    .enter()
    .append("option")
      .attr("value", function(d){return d;})
      .text(function(d){ return d=="blk" ? "Black-White" : "Hispanic-White";});

  var gapTitle = d3.selectAll("#gap_title") 
        .append("span") 
        .text("Black-White Achievement Gap"); 

//Grade
var grade_5 = d3.selectAll("#grade_5");

grade_5.html("<span class='control-text'>Grade</span><br/>");

grade_5
	.append("select")
    .attr("id", "grade_5")
    .selectAll("option")
    .data(["4", "8"])
    .enter()
    .append("option")
      .attr("value", function(d){return d;})
      .text(function(d){ return d=="4" ? "Grade Four" : "Grade Eight";});

//Subject
var subject_5 = d3.selectAll("#subject_5");

subject_5.html("<span class='control-text'>Subject</span><br/>");

subject_5
	.append("select")
    .attr("id", "subject_5")
    .selectAll("option")
    .data(["math", "read"])
    .enter()
    .append("option")
      .attr("value", function(d){return d;})
      .text(function(d){ return d=="math" ? "Math" : "Reading";});


//Tooltip
var tooltip_5 = d3.select("body")
				.append("div")   
  				.attr("class", "info-window")               
  				.style("opacity", 0);

/*###################################################
Define all current inputs
#####################################################*/
//Selected gap
var gapSelected = d3.selectAll("#gap_5")[0][1].value;
//Selected grade
var gradeSelected = d3.selectAll("#grade_5")[0][1].value;
//Selected subject
var subSelected = d3.selectAll("#subject_5")[0][1].value;
//Select inequality
var eqSelected = d3.selectAll("#inequality_5")[0][1].value;


/*###################################################
Prep the map container and data
#####################################################*/

//Queue up all data for the map
		queue()
			  .defer(d3.csv, "data/adjusted naep gaps with cps covariates - 2.1.2015.csv")
			  .await(ready);


/*###################################################
Initialize map with data
#####################################################*/
function ready(error, csv){

if(error){
	console.log(error);
				}
else{

    //Change data types
    csv.forEach(function(d){

        d.enrl = parseFloat(d.enrl);
        d.vgap = parseFloat(d.vgap);
        d.edV = parseFloat(d.edV);
        d.incV = parseFloat(d.incV);
        d.povrat = parseFloat(d.povrat);
        d.unemprat = parseFloat(d.unemprat);
        d.x1edV = parseFloat(d.x1edV);
        d.x1incV = parseFloat(d.x1incV);
        d.x1povrat = parseFloat(d.x1povrat);
        d.x1unemprat = parseFloat(d.x1unemprat);
        d.x2edV = parseFloat(d.x2edV);
        d.x2incV = parseFloat(d.x2incV);
        d.x2povrat = parseFloat(d.x2povrat);
        d.x2unemprat = parseFloat(d.x2unemprat);
        d.y1edV = parseFloat(d.y1edV);
        d.y1incV = parseFloat(d.y1incV);
        d.y1povrat = parseFloat(d.y1povrat);
        d.y1unemprat = parseFloat(d.y1unemprat);
        d.y2edV = parseFloat(d.y2edV);
        d.y2incV = parseFloat(d.y2incV);
        d.y2povrat = parseFloat(d.y2povrat);
        d.y2unemprat = parseFloat(d.y2unemprat);

    });

	//Filter data by grade, year, and subject
		var data = csv.filter(function(row){
			  			return row['vgap']!=9999 && row['incV']!=9999 && row['group']==gapSelected && row['grade'] == gradeSelected && row['sub'] == subSelected;
			  		});


//State menu
var highlight_5 = d3.selectAll("#highlight_5");

highlight_5.html("<span class='control-text'>Select state</span><br/>");

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
var stateMenu = highlight_5
	.append("select")
    .attr("id", "highlight_5")
	.selectAll("option")
    .data(stateArray)
    .enter()
    .append("option")
     .attr("index", function(d, i) { return i; })
      .attr("value", function(d){return d;})
      .text(function(d){ return d});

    //Sort state dropdown alphabetically
    var sortList = d3.selectAll("#highlight_5 option")
        .datum(function() { return this.dataset; });

/*##############################################################
Scatterplot
###############################################################*/

//Set inital dimensions of chart
	var w = 900,
      h = 600,
      padding_right=60,
      padding_bottom=50;

/*#################################################################
#Set up x and y axes
##################################################################*/
//Scale for x-value
var xScale = d3.scale.linear()
		.domain([-0.1, 1.6])
		.range([padding_right, w-padding_right]);

//Scale for y-value
var yScale = d3.scale.linear()
				.domain([-0.5, 2])
				.range([h-padding_bottom, padding_bottom]);


//Axis labels
	var x_axis_label = "Black-White Socioeconomic Disparities Index";
	var y_axis_label = "Black-White Achievement Gap";

//Create x and y axes
	var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);

	var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);

//Create scale for circles to size by number of black/hispanic students
var rScale = d3.scale.sqrt()
  	.domain([ 
  		d3.min(data, function(d){return d.enrl}),
  		d3.max(data, function(d){return d.enrl})
  		])
  	.range([6, 12]).nice();

/*########################################################################
#Initialize scatterplot
#########################################################################*/
//Draw svg for scatterplot
var scatterplot = d3.select("#scatterplot_5")
				.append("svg")
				.attr("width", "100%")
				.attr("height", "100%")
				.attr("id", "scatter-container")
				.attr("viewBox", "0 0 "+w+ " "+h)
				.attr("preserveAspectRatio", "xMidYMid")
                .attr("class", "svg-line-container");


//Call x and y axes
scatterplot.append("g")
		.attr("class", "x-axis")
		.attr("transform", "translate(0," + yScale(0) + ")")
		.call(xAxis)
        .selectAll("text")
        .attr("x", 7)
        .style("text-anchor", "end");

scatterplot.append("g")
		.attr("class", "y-axis")
		.attr("transform", "translate(" + xScale(0) + ",0)")
		.call(yAxis);

//Draw circles for state data points
var circles = scatterplot.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("class", "state-circles")
		.attr("id", function(d){return d.fips.replace(/\s+/g, '');})
		.attr("cx", function(d) {
			 return xScale(d.sesgap);
			})
		.attr("cy", function(d) {
			return yScale(d.vgap);
			})
		.attr("r", function(d){
			return rScale(d.enrl);
		});

    var x1 = d3.max(data, function(d){return d.x1sesgap});
    var x2 = d3.max(data, function(d){return d.x2sesgap});
    var y1 = d3.max(data, function(d){return d.y1sesgap});
    var y2 = d3.max(data, function(d){return d.y2sesgap});

//Draw fitted regression line
var reg_line = scatterplot
                .append("line")
                .attr("class", "fitted-line")
                .attr("x1", xScale(x1))
                .attr("y1", yScale(y1))
                .attr("x2", xScale(x2))
                .attr("y2", yScale(y2));


//Draw labels for x and y axes.
var y_label = scatterplot.append("text")
	    .attr("class", "y_label")
	    .attr("text-anchor", "end")
	    .attr("y", 0)
	    .attr("x", -w/10)
	    .attr("dy", ".75em")
	    .attr("transform", "rotate(-90)");

y_label
	    .text(y_axis_label);

var x_label = scatterplot.append("text")
	    .attr("class", "x_label")
	    .attr("text-anchor", "end")
	    .attr("x", w-w/3)
	    .attr("y", h - h/30);

x_label
	    .text(x_axis_label);

//No data text placeholder
scatterplot
			.append("text")
			.attr("x", w/2-padding_right)
			.attr("y", h/2-padding_bottom)
			.attr("id", "nodata_5")
			.attr("font-size", "20px");

//Create legend for circle size

var scatter_legend = d3.select('#scatter-legend_5')
						.append("svg")
                        .attr("width", "100%")
                        .attr("height", "100%")
                        .attr("viewBox", "0 0 "+w/4+ " "+h)
                        .attr("preserveAspectRatio", "xMidYMid")
                        .attr("class", "svg-line-container")
                        .append("g");

var scatter_legend_text = "Bubbles sized by Black enrollment";

var circle_legend = scatter_legend
	.selectAll("circle")
	.data([1000,10000,50000,100000])
	.enter()
	.append("circle")
	.attr("r", function(d){return rScale(d)})
	.attr("class", "legend-circles")
	.attr("transform", function(d, i) { return "translate(25," + (25+(i * 40)) + ")"; });

var circle_text = scatter_legend
	.selectAll("text")
	.data([1000,10000,50000,100000])
	.enter()
	.append("text")
	 .attr("x", 40)
     .attr("y", function(d,i){return 25+(i * 40) })
     .text(function(d){
     	return commaFormat(d)
     })
     .attr("font-size", "10px");

var circle_label = scatter_legend.append("text")
	 .attr("x", 0)
     .attr("y", 10)
     .text(scatter_legend_text)
     .attr("font-size", "10px");


/*###################################################################
#Mouse on and out events
####################################################################*/

function circleOn(d){

	//Grab ids of object and parent object to identify which svg the mouse is over	
	var id = this.id;
	var idString = "#"+id;

	//Get current value of gap
	var gapSelected = d3.selectAll("#gap_5")[0][1].value;

	var group = gapSelected=="blk" ? "Black" : "Hispanic";

	//Get state selected
	var stateSelected = d3.selectAll("#highlight_5")[0][1].value;

    //Get current covariate
    var select = d3.selectAll("#inequality_5")[0][1];
	var eqSelected = select.value;
    var eqText = select.options[select.selectedIndex].text;

	//Correct plural for sd
	var sd = d3.round(d.vgap,2)==1 ? " standard devation" : " standard deviations";

    //Get state selected
    var stateSelected = d3.selectAll("#highlight_5")[0][1].value.replace(/\s+/g, '');

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

	//Content of tooltip
	var htmlBody = "<br/><b>"+d.fips+"</b><br/>"+group+
	"-White Achievement Gap: " + d3.round(d.vgap,2) + sd + "<br/>"+group+
	"-White " + eqText + ": "+ d3.round(d[eqSelected],2);

	var htmlBody = (eqSelected=="incV" | eqSelected=="edV" | eqSelected=="sesgap") ? htmlBody + sd : htmlBody;

	//Show tooltip
			tooltip_5
					.style("left", (d3.event.pageX+30) + "px")
					.style("top", (d3.event.pageY-30) + "px")
                    .style("opacity", function() {
                    if (stateSelected == "All") {
                        return 1;
                    }
                    else {
                        return (id == stateSelected) ? 1.0 : 0;
                    }
                })
					.html(htmlBody);
	}

function circleOut(d){
	var id = this.id;
	var idString = "#"+id

	d3.selectAll(idString).classed("selected", false);

	if(isIE==0){
			d3.selectAll(idString).moveToBack();	
		}

	tooltip_5
		.style("opacity", 0);
}

	circles.on("mouseover", circleOn).on("mouseout", circleOut);
/*
	//Initialize help tooltips 
		$(function () {

		$('#inequality_5').tooltip({
		        'placement': 'bottom',
		        'title': "Use this menu to change the x-axis to different inequality measures.",
		        'trigger' : 'hover'
		});

		});*/
//Initialize state menu selection value
 var thisState_5 = "All";

/*###################################################
Change data based on user inputs
#####################################################*/
//Data filtering function
function transitionData(){

	/*##################################################
	#Update menus based on what's available for that year
	#####################################################*/

	//Get current value of gap
	var gapSelected = d3.selectAll("#gap_5")[0][1].value;
	
	//Get current value of grade
	var gradeSelected = d3.selectAll("#grade_5")[0][1].value;

	//Selected subject
	var subSelected = d3.selectAll("#subject_5")[0][1].value;

	//Save group of gap selected for text updates
	if(gapSelected=="blk"){var gap_title="Black-White"; var gap_group="Black"}
	else{var gap_title="Hispanic-White"; var gap_group="Hispanic"}

	//Select inequality
    var select = d3.selectAll("#inequality_5")[0][1];
    var eqSelected = select.value;
    var eqText = select.options[select.selectedIndex].text;

	/*################################################################
	#Filter data for map and scatterplot and updates values
	###################################################################*/

	//Filter data by grade, year, and subject
		var data = csv.filter(function(row){
			  return row['vgap']!=9999 && row[eqSelected]!=9999 && row['group']==gapSelected &&  row['grade'] == gradeSelected && row['sub'] == subSelected;
			  		});

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
			if(thisState_5==stateArray[i]){
				var stateAvailable = true;
				var index = i;
			}
		}


	var stateMenu = d3.selectAll("#highlight_5").select("select").selectAll("option")
					.data(stateArray, function(d){return d;});

	var stateMenuEnter = stateMenu
					    .enter()
					    .append("option")
					      .attr("index", function(d, i) { return i; })
					      .attr("value", function(d){return d;})
					      .text(function(d){ return d;});

		stateMenu.exit().remove();

	 	//Sort state dropdown alphabetically
	var sortList = d3.selectAll("#highlight_5 option")
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


	//Set scatterplot x-axis values depending on inequality measure selected

        var x1 = d3.max(data, function(d){return d["x1"+eqSelected]});
        var x2 = d3.max(data, function(d){return d["x2"+eqSelected]});
        var y1 = d3.max(data, function(d){return d["y1"+eqSelected]});
        var y2 = d3.max(data, function(d){return d["y2"+eqSelected]});

        var cx_value = function(d){return xScale(d[eqSelected])};
        var x_axis_label = gap_group + "-White " + eqText;

    //Update x-axis scale and tick labels depending on x-axis selections
   
    if(eqSelected=="incV"){
    	xScale.domain([-1, 2]);
		var x_offset = xScale(0);
        var x_anchor = 7;
    }
    else if(eqSelected=="edV"){
        xScale.domain([-0.5, 2.5]);
        var x_offset = xScale(0);
        var x_anchor = 7;
    }
    else if(eqSelected=="sesgap"){
        xScale.domain([-0.1, 1.6]);
        var x_offset = xScale(0);
        var x_anchor = 7;
    }
    else if(eqSelected=="unemprat"){
    	xScale.domain([0, 10]);
		var x_offset = xScale(1);
        var x_anchor = 3;
    }
    else{
        xScale.domain([0, 11]);
        var x_offset = xScale(1);
        var x_anchor = 3;
    };

    //X-axis transition
    var axisTransition = scatterplot.transition().duration(750);

    axisTransition
					.select(".x-axis")
					.attr("transform", "translate(0," + yScale(0) + ")")
					.call(xAxis)
                    .selectAll("text")
                    .attr("x", x_anchor)
                    .style("text-anchor", "end");

	axisTransition
					.select(".y-axis")
					.attr("transform", "translate(" + x_offset + ",0)")
					.call(yAxis);


	//Scatterplot transition

	var circles = scatterplot.selectAll("circle")
				.data(data, function(d){ return d.fips});
		circles
				.enter()
				.append("circle")
				.attr("class", "state-circles")
				.attr("id", function(d){return d.fips.replace(/\s+/g, '');});

		circles.exit().remove();
		
		circles
				.transition()
				.duration(1000)
				.delay(function(d,i){ return i*10})
				.ease("linear")
				.attr("cx", cx_value)
				.attr("cy", function(d) {
					if(cx_value!=null){
						var vgap = d.vgap > 2 ? Math.min(d.vgap,2) : Math.max(d.vgap, -0.5);
						return yScale(vgap);
					}
					})
				.attr("r", function(d){
					if(cx_value!=null){
						return rScale(d.enrl);
					}
				});

    //Regression line
    scatterplot
        .selectAll(".fitted-line")
        .style("opacity", 0)
        .style("display", "block")
        .transition()
        .duration(1000)
        .ease("linear")
        .attr("x1", xScale(x1))
        .attr("y1", yScale(y1))
        .attr("x2", xScale(x2))
        .attr("y2", yScale(y2))
        .style("opacity", 0.8);


	var y_axis_label = gap_group + "-White Achievement Gap";
	
	//Update circle legend
	var scatter_legend_text = "Bubbles sized by " + gap_group+ " enrollment";

	circle_label
	     .text(scatter_legend_text)
	     .attr("font-size", "10px");

	//Update x-axis
	
	x_label
	    .text(x_axis_label);

	y_label
	    .text(y_axis_label);

	//Update mouseover events
	circles.on("mouseover", circleOn).on("mouseout", circleOut);

	//Make sure state selected is highlighted
         var stateSelected = d3.selectAll("#highlight_5")[0][1].value;
         var id = stateSelected.replace(/\s+/g, '');

		if(stateSelected=="All"){
			d3.selectAll('.state-circles').style('opacity', 1);
		}
		else{
			d3.selectAll('.state-circles').style('opacity',function () {
		        return (this.id === id) ? 1.0 : 0.1;
		    });
		}
}
		//Current Gap
		gap_5.on("change", transitionData);

		//Current Grade
		grade_5.on("change", transitionData);

		//Current subject
		subject_5.on("change", transitionData);

		//Current inequality measure
		inequality_5.on("change", transitionData);


	//Highlight state

	highlight_5.on("change", function(){
		var stateSelected = d3.selectAll("#highlight_5")[0][1].value;
		var id = stateSelected.replace(/\s+/g, '');

		if(stateSelected=="All"){
			d3.selectAll('.state-circles').style('opacity', 1);

		}
		else{

			d3.selectAll('.state-circles').style('opacity',function () {
		        return (this.id === id) ? 1.0 : 0.1;
		    });
		}
		thisState_5 = stateSelected;

		if(isIE==0){
			scatterplot.selectAll("#"+id).moveToFront();	
		}
		

	});

	}
}

