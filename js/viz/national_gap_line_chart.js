//Queue up all data for the chart
		queue()
			  .defer(d3.csv, "data/ltt naep gaps w ci - 1.20.2015.csv")
              .defer(d3.csv, "data/ltt naep gaps fitted - 1.20.2015.csv")
              .defer(d3.csv, "data/ltt naep gaps actual - 1.20.2015.csv")
			  .await(ready);

/*###################################################
Initialize map with data
#####################################################*/
function ready(error, data, fitted, actual){

if(error){
	console.log(error);
				}
else{

		var dateFormat = d3.time.format("%Y").parse;

		data.forEach(function(d){
			d.year = dateFormat(d.year);
            d.trueV = parseFloat(d.trueV);
            d.cihi = parseFloat(d.cihi);
            d.cilo = parseFloat(d.cilo);
		});

        fitted.forEach(function(d){
            d.year = dateFormat(d.year);
        });

    actual.forEach(function(d){
        d.year = dateFormat(d.year);
    });

 /*##############################################################
Bar chart
###############################################################*/

//Set inital dimensions of chart
	var w = 800,
      h = 600,
      padding_bottom=50,
      padding_right = 200,
      padding_left = 70;

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
	var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);
	var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

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

color.domain(d3.keys(fitted[0]).filter(function(key){
	return key!== "year"
}));

var fitted_data = color.domain().map(function(name){
	return{
		name: name,
		values: fitted.map(function(d){
			return{year: d.year, vgap: +d[name]};
		})
	};
});

var actual_data = color.domain().map(function(name){
    return{
        name: name,
        values: actual.map(function(d){
            return{year: d.year, vgap: +d[name]};
        })
    };
});

xScale.domain([dateFormat("1973"), dateFormat("2012")]);

yScale.domain([0.4, 1.5]);

/*#####################################################################
Draw chart
######################################################################*/

//Draw svg for scatterplot
var lineplot = d3.select("#national_gap_container")
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
		.attr("transform", "translate(0," + yScale(0.4) + ")")
		.call(xAxis)
		.selectAll("text")
		.attr("class", "state_label")
		.attr("x", 10)
        .style("text-anchor", "end");

lineplot.append("g")
		.attr("class", "y-axis")
		.attr("transform", "translate(" + xScale(dateFormat("1973")) + ",0)")
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


var points = lineplot
        .selectAll(".points")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "points")
        .attr("id", function(d){return d.id});

    //Upper bound
    points
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
    points
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
    points
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
    points
        .append("circle")
        .attr("class", "point-estimate")
        .attr("cx", function(d){
            return xScale(d.year)
        })
        .attr("cy", function(d){
            return yScale(d.trueV)
        })
        .attr("r", 5);

    //Actual line
    var actual_line = lineplot
        .selectAll(".raw-line")
        .data(actual_data)
        .enter()
        .append("g")
        .attr("class", "raw-line")
        .attr("id", function(d){return d.name});

    actual_line
        .append("path")
        .attr("class", "raw-line")
        .attr("id", function(d){return d.name})
        .attr("d", function(d){return raw_line(d.values)})
        .style("stroke", function(d){
            return color(d.name)
        })
        .style("fill", "none")
        .style("opacity", 0);

    //Fitted line
    var fitted_line = lineplot
                  .selectAll(".national-fitted-line")
                  .data(fitted_data)
                  .enter()
                  .append("g")
                  .attr("class", "national-fitted-line")
                  .attr("id", function(d){return d.name});

    fitted_line
          .append("path")
          .attr("class", "national-line")
          .attr("id", function(d){return d.name})
          .attr("d", function(d){return line(d.values)})
          .style("stroke", function(d){
                return color(d.name)
            })
          .style("fill", "none");

    //Line labels
    fitted_line
        .append("text")
         .attr("class", "national-line-label")
         .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
          .attr("transform", function(d,i) {
              if(d.name=="Black_White_8th_Grade_Reading"){var vgap = d.value.vgap+0.008;}
              else if(d.name=="Black_White_4th_Grade_Reading"){var vgap = d.value.vgap-0.01;}
              else if(d.name=="Hispanic_White_4th_Grade_Reading"){var vgap = d.value.vgap-0.008}
              //else if(d.name=="Hispanic_White_8th_Grade_Math"){var vgap = d.value.vgap+0.008}
              else if(d.name=="Black_White_12th_Grade_Reading"){var vgap = d.value.vgap+0.008}
              else if(d.name=="Hispanic_White_8th_Grade_Reading"){var vgap = d.value.vgap-0.008}
              else{ var vgap = d.value.vgap;}
              return "translate(" + xScale(d.value.year) + "," + yScale(vgap) + ")"; })
          .attr("x", 10)
          .attr("dy", ".35em")
          .attr("font-size", "10px")
          .attr("id", function(d){return d.name})
          .style("opacity", 1)
          .text(function(d) { return d.name.replace(/_/g, ' '); });

//Call help tooltips on dropdowns
$(function () {
$('[data-toggle="tooltip"]').tooltip({'placement': 'top'});

$('#anchor').tooltip({
        'placement': 'right',
        'title': "Hover over the lines to explore.",
        'trigger' : 'hover'
});
});

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

    if(x >= xScale.range()[0] && x <= xScale.range()[1]){
			focus.attr("transform", "translate(" + x + "," + y + ")").style("display", "inline");
	    	focus.select("text").text(d3.round(yScale0,2));	 

	    	d3.selectAll('.national-line').style('opacity',function () {
		        return (this.id == id) ? 1.0 : 0.1;
		    });
		    d3.selectAll('.national-line-label').style('opacity',function () {
		        return (this.id == id) ? 1.0 : 0;
		    });
            d3.selectAll('.points').style('opacity', function(){
                return (this.id == id) ? 1.0 : 0;
            });
            d3.selectAll('.raw-line').style('opacity', function(){
                return (this.id == id) ? 1.0 : 0;
            });
	    }
}   

function lineOut(){
		var x = d3.mouse(this)[0],
  		y = d3.mouse(this)[1];

		if(x<xScale.range()[0] || x>xScale.range()[1]) {
				focus.style("display", "none");
				d3.selectAll('.national-line').style('opacity',1);
		    	d3.selectAll('.national-line-label').style('opacity',1);
                d3.selectAll('.points').style('opacity',0);
                d3.selectAll('.raw-line').style('opacity',0);
		}



	}

fitted_line
	.on("mouseover", lineOn)
	.on("mousemove", lineOn)
	.on("mouseout", lineOut);



	}	
}
