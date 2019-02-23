/*###################################################
Set up the controls for the map
#####################################################*/

//Thousands separator formattor
	var commaFormat = d3.format(",");

//Sort
var sort_6 = d3.selectAll("#sort_6");

sort_6.html("<b>Sort bar chart</b><br/>");

sort_6
  .append("select")
  .attr("id", "sort_6")
  .selectAll("option")
  .data(["name", "gap","residual"])
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
      else{
        return "Difference";
      }
    });


//Create dropdown menus to select gap, grade, and subject
//Gap
var gap_6 = d3.selectAll("#gap_6");

gap_6.html("<b>Group</b><br/>");

gap_6
	.append("select")
    .attr("id", "gap_6")
    .selectAll("option")
    .data(["blk", "hsp"])
    .enter()
    .append("option")
      .attr("value", function(d){return d;})
      .text(function(d){ return d=="blk" ? "Black-White" : "Hispanic-White";});

//Grade
var grade_6 = d3.selectAll("#grade_6");

grade_6.html("<b>Grade</b><br/>");

grade_6
	.append("select")
    .attr("id", "grade_6")
    .selectAll("option")
    .data(["4", "8"])
    .enter()
    .append("option")
      .attr("value", function(d){return d;})
      .text(function(d){ return d=="4" ? "Grade Four" : "Grade Eight";});

//Subject
var subject_6 = d3.selectAll("#subject_6");

subject_6.html("<b>Subject</b><br/>");

subject_6
	.append("select")
    .attr("id", "subject_6")
    .selectAll("option")
    .data(["math", "read"])
    .enter()
    .append("option")
      .attr("value", function(d){return d;})
      .text(function(d){ return d=="math" ? "Math" : "Reading";});


//Tooltip
var tooltip_6 = d3.select("body")
        .append("div")   
          .attr("class", "info-window-6")
          .style("opacity", 0);

var gap_legend_title = d3.select('#gap_legend_6')
    .append("p")
    .attr("class", "legend-label")
    .text("Difference between Actual and Predicted Achievement Gap in Standard Deviations");


//Map color legend
var gap_legend = d3.select('#gap_legend_6')
  					.append("div")
  					.attr("id", "gap_legend_6")
			  		.append('ul')
			    	.attr('class', 'list-inline');

/*###################################################
Define all current inputs
#####################################################*/
//Selected gap
var gapSelected = d3.selectAll("#gap_6")[0][1].value;
//Selected grade
var gradeSelected = d3.selectAll("#grade_6")[0][1].value;
//Selected subject
var subSelected = d3.selectAll("#subject_6")[0][1].value;
//Year selected
var firstYearSelected = 1992;

/*###################################################
Prep the map container and data
#####################################################*/

//Queue up all data for the map
    queue()
        .defer(d3.json, "data/states.js")
        .defer(d3.csv, "data/adjusted naep gaps with cps covariates - 2.1.2015.csv")
        .await(ready);

/*###################################################
Initialize map with data
#####################################################*/
function ready(error, json, csv){

if(error){
  console.log(error);
        }
else{

    //Dimensions
    //Width and height
    var w = 550,
        h = w*.7;

//Convert data types
    csv.forEach(function(d){
        d.resid = parseFloat(d.resid);
        d.vgap = parseFloat(d.vgap);
    });



  //Filter data by grade, year, and subject
    var data = csv.filter(function(row){
              return row['resid']!=9999 && row['group']==gapSelected && row['grade'] == gradeSelected && row['sub'] == subSelected;
            });

    //Index csv data on fips and convert string gaps to numbers
    mapdata_6 = window.data = _(data).chain().map(function(d) {
            d.vgap = parseFloat(d.vgap);
            d.resid = parseFloat(d.resid);
            return [d.fips, d];
        }).object().value();


    //Choose color scale for map

    var gap_color = d3.scale.threshold().domain([-.45,-.35, -.25, -.15, -.05, .05,.15,.25,.35,.45])
                    .range(["#2b8cbe","#045a8d","#74a9cf", "#bdc9e1","#f1eef6","#FFFFCC",
                                "#fef0d9","#fdcc8a","#fc8d59","#e34a33","#b30000"]);

  //Shading function for choropleth based on residuals
    var gap_shading = function(d){
        var name = d.properties.STATE_NAME;
        var value = mapdata_6[name] ? mapdata_6[name].resid : null;
          if(value){
              return gap_color(value);
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
    var gap_container = d3.select("#gap_container_6")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", "0 0 "+w+ " "+h)
        .attr("preserveAspectRatio", "xMidYMid")
        .attr("class", "svg-map-container")
        .append("g")
        .attr("id", "gap-container_6");

    var gapmap = gap_container.selectAll("gap-states-6")
         .data(json.features)
         .enter()
         .append("path")
         .attr("class", "gap-states-6")
         .attr("id", function(d){return d.properties.STATE_NAME.replace(/\s+/g, '');})
         .attr("fill", gap_shading)
         .attr("d", path);

    //Set colors for legend

    var colors = ["#045a8d","#74a9cf", "#bdc9e1","#f1eef6","#FFFFCC",
        "#fef0d9","#fdcc8a","#fc8d59","#e34a33"];

    var gap_keys = gap_legend.selectAll('li.key')
                .data(colors)
                .enter().append('li')
                .attr('class', 'key')
                .style('border-top-color', String);

    //Set legend text
      gap_keys.text(function(d,i) {
            var r = gap_color.invertExtent(d);
              return d3.round((r[1]+r[0])/2,2);

        }); 

    //Set legend text explanation
    var gap_explanation_better = d3.select('#gap_legend_6')
            .append("span")
            .attr("id", "better")
            .attr("width", "50%")
            .html("Better than predicted");

    var gap_explanation_worse =d3.select('#gap_legend_6')
            .append("span")
            .attr("id", "worse")
            .attr("width", "50%")
            .html("Worse than predicted");

/*##############################################################
Bar chart
###############################################################*/

  //Index for data
  var stateName = function(d) { return d.fips; };
  var stateResid = function(d){ return d.resid; };
  var stateGap = function(d){ return d.vgap; };

   // sort by state name
  var sortedData = data.sort(function(a, b) {
      return d3.ascending(stateName(a), stateName(b));    
  }); 

//Set inital dimensions of chart
  var w = 500,
      h = w*1,
      padding_bottom=50,
      padding_right = 100,
      padding_left = 10,
      padding_top =20;

    //State menu
    var highlight_6 = d3.selectAll("#highlight_6");

    highlight_6.html("<span class='control-text'>Select state</span><br/>");

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

//Push list to dropdown
    var stateMenu = highlight_6
        .append("select")
        .attr("id", "highlight_6")
        .selectAll("option")
        .data(stateArray)
        .enter()
        .append("option")
        .attr("index", function(d, i) { return i; })
        .attr("value", function(d){return d;})
        .text(function(d){ return d});

    //Sort state dropdown alphabetically
    var sortList = d3.selectAll("#highlight_6 option")
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
          .domain([-0.45, 0.45])
          .range([padding_right,w-padding_left]);


  //Create x and y axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(10);

    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);

/*#####################################################################
Draw chart
######################################################################*/

//Draw svg for scatterplot
var barplot = d3.select("#bar_chart_6")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("id", "bar-container_6")
        .attr("viewBox", "0 0 "+w+ " "+h)
        .attr("preserveAspectRatio", "xMidYMid")
        .attr("class", "svg-container");

//Call x and y axes
barplot.append("g")
    .attr("class", "y-axis")
    .attr("transform", "translate(" + padding_right + ",0)")
    .call(yAxis)
    .selectAll("text")
    .attr("class", "state_label")
    .attr("x", -7)
    .attr("y",0)
    .style("text-anchor", "end");

barplot.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + (h - padding_bottom) + ")")
    .call(xAxis)
    .selectAll("text")
    .attr("class", "state_label")
    .attr("x", 5)
    .attr("y",7)
    .style("text-anchor", "end");

 var worse_label =  barplot
     .append("text")
     .attr("x",w-padding_right-10)
     .attr("y", h-25)
     .attr("font-size", "10px")
     .text("Worse than predicted");

 var predicted_label = barplot
     .append("text")
     .attr("x", xScale(-0.05))
     .attr("y", h-25)
     .attr("font-size", "10px")
     .text("Predicted");

 var better_label =  barplot
        .append("text")
        .attr("x", padding_right)
        .attr("y", h-25)
        .attr("font-size", "10px")
        .text("Better than predicted");

var x_label = barplot.append("text")
        .attr("text-anchor", "end")
        .attr("x", w-padding_right)
        .attr("y", h-10)
        .attr("font-size", "10.5px")
        .attr("font-weight", "bold");

    x_label
        .text("Difference between actual gap and predicted gap");


var bars = barplot.selectAll("rect")
      .data(data, function(d){return d.fips})
      .enter()
      .append("rect")
      .attr("class", "state_bar")
      .attr("id", function(d){return d.fips.replace(/\s+/g, '');})
        .attr({
            x: function(d){
                return xScale(Math.min(0, d.resid));
            },
            y: function(d){
                return yScale(d.fips);
            },
            height: yScale.rangeBand(),
            width: function(d){
                return Math.abs(xScale(d.resid) - xScale(0));
            }
        })
        .style("fill", function(d){
            var value = d.resid;
            if(value){
                return gap_color(value);
            }
            else{return '#D3D3C9'}
        });

  bars.on("mouseover", barOn).on("mouseout", barOut);
  gapmap.on("mouseover", barOn).on("mouseout", barOut);

/*###################################################
Change data based on user inputs
#####################################################*/
    

//Sort data function
function sortData(){

      var sorted = d3.selectAll("#sort_6")[0][1].value;

      //Sorting value
      if(sorted=="name"){  
        var sortedData = function(a, b) {
            return d3.ascending(stateName(a), stateName(b));    
        };
      }
      else if(sorted=="gap"){
        var sortedData = function(a, b) {
            return d3.ascending(stateGap(a), stateGap(b));    
        };  
      }
      else{
        var sortedData = function(a, b) {
            return d3.ascending(stateResid(a), stateResid(b));    
        };  
      }

      return sortedData;
};

    //Initialize state menu selection value
    var thisState_6 = "All";

//Data filtering function
function transitionData(){

  /*##################################################
  #Update menus based on what's available for that year
  #####################################################*/
  //Get current value of gap
  var gapSelected = d3.selectAll("#gap_6")[0][1].value;
  
  //Get current value of grade
  var gradeSelected = d3.selectAll("#grade_6")[0][1].value;

  //Selected subject
  var subSelected = d3.selectAll("#subject_6")[0][1].value;

  /*################################################################
  #Filter data for map and barplot and updates values
  ###################################################################*/
  //Delay for transitions
  var delay = function(d, i){return i*5;};


  //Filter data by grade, year, and subject
    var data = csv.filter(function(row){
              return row['resid']!=9999 && row['group']==gapSelected && row['grade'] == gradeSelected && row['sub'] == subSelected;
            });

    //Index csv data on fips and convert string gaps to numbers
    mapdata_6 = window.data = _(data).chain().map(function(d) {
            d.vgap = parseFloat(d.vgap);
            d.resid = parseFloat(d.resid);
            return [d.fips, d];
        }).object().value();

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
        if(thisState_6==stateArray[i]){
            var stateAvailable = true;
            var index = i;
        }
    }

    var stateMenu = d3.selectAll("#highlight_6").select("select").selectAll("option")
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
    var sortList = d3.selectAll("#highlight_6 option")
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

    var sortedData = data.sort(sortData());

  /*################################################################
  #Map updates
  ###################################################################*/

  //Shading function for choropleth based on residuals
    var gap_shading = function(d){
        var name = d.properties.STATE_NAME;
        var value = mapdata_6[name] ? mapdata_6[name].resid : null;
          if(value){
              return gap_color(value);  
            }
          else{return '#D3D3C9'}
    };

  //Map transition 
      gap_container.selectAll(".gap-states-6")
            .transition()
          .duration(750)
            .ease("linear")
            .attr("fill", gap_shading);

  /*################################################################
  #Barplot updates
  ###################################################################*/

    //Scale for y-value
    var yScale = d3.scale.ordinal()
        .domain(sortedData.map(function(d){ return d.fips;}))
        .rangeRoundBands([h-padding_bottom, padding_top], 0.5, 0.5);

    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    var axisTransition = barplot.transition().duration(750);
    
    axisTransition
        .select(".y-axis")
        .call(yAxis)
        .selectAll("g")
        .selectAll("text")
        .attr("class", "state_label")
        .attr("x", -7)
        .attr("y",-5)
        .style("text-anchor", "end");

   var bars = barplot.selectAll("rect") 
        .data(data, function(d){ return d.fips});

    bars
        .enter()
        .append("rect")
        .attr("class", "state_bar")
        .attr("id", function(d){return d.fips.replace(/\s+/g, '');});

    bars.exit().remove();

    bars
      .transition()
      .duration(750)
      .delay(delay)
      .ease("linear")
        .attr({
            x: function(d){
                return xScale(Math.min(0, d.resid));
            },
            y: function(d){
                return yScale(d.fips);
            },
            height: yScale.rangeBand(),
            width: function(d){
                return Math.abs(xScale(d.resid) - xScale(0));
            }
        })
        .style("fill", function(d){
            var value = d.resid;
            if(value){
                    return gap_color(value);
                }
            else{return '#D3D3C9'}
        });


    bars.on("mouseover", barOn).on("mouseout", barOut);
          gapmap.on("mouseover", barOn).on("mouseout", barOut);

    //Make sure state remains highlighted
    var stateSelected = d3.selectAll("#highlight_6")[0][1].value;
    var id = stateSelected.replace(/\s+/g, '');

    if(stateSelected=="All"){
        d3.selectAll('.state_bar').style('opacity', 1);
        d3.selectAll('.gap-states-6').style('opacity', 1);
    }
    else{

        d3.selectAll('.state_bar').style('opacity',function () {
            return (this.id == id) ? 1.0 : 0.1;
        });

        d3.selectAll('.gap-states-6').style('opacity',function () {
            return (this.id == id) ? 1.0 : 0.1;
        });
    }

  return data;
  }


  //Current Gap
    gap_6.on("change", transitionData);

    //Current Grade
    grade_6.on("change", transitionData);

    //Current subject
    subject_6.on("change", transitionData);

    //Sort data based on selection
    sort_6.on("change", function(){
      var data = transitionData();
      var sortedData = data.sort(sortData()); 

      var y0 = d3.scale.ordinal()
          .domain(sortedData.map(function(d){ return d.fips;}))
          .rangeRoundBands([h-padding_bottom, padding_top], 0.5, 0.5).copy();

      var y = function(d) { return y0(d.fips); };
      var yAxis = d3.svg.axis().scale(y0).orient("left");

      var barTransition = barplot.selectAll("rect").transition().duration(750);
      var axisTransition = barplot.transition().duration(750);

      var delay = function(d, i){return i*10;};
     
      barTransition
          .delay(delay)
          .attr("y", y);

      axisTransition
        .select(".y-axis")
        .call(yAxis)
        .selectAll("g")
        .delay(delay)
        .selectAll("text")
        .attr("class", "state_label")
        .attr("x", -7)
        .attr("y",-5)
        .style("text-anchor", "end");
    });


    //Highlight state

    highlight_6.on("change", function(){

        var stateSelected = d3.selectAll("#highlight_6")[0][1].value;
        var id = stateSelected.replace(/\s+/g, '');

        if(stateSelected=="All"){
            d3.selectAll('.state_bar').style('opacity', 1);
            d3.selectAll('.gap-states-6').style('opacity', 1);
        }
        else{

            d3.selectAll('.state_bar').style('opacity',function () {
                return (this.id == id) ? 1.0 : 0.1;
            });
            d3.selectAll('.gap-states-6').style('opacity',function () {
                return (this.id == id) ? 1.0 : 0.1;
            });
        }

        thisState_6 = stateSelected;

        if(isIE==0){
            barplot.selectAll("#"+id).moveToFront();
        }

    });
}
}

function barOn(d){

//Grab ids of object and parent object to identify which svg the mouse is over  
  var id = this.id;
  var idString = "#"+id;
  var parentid = this.parentNode.id;
  var nullcolor = this.getAttribute("fill");

  //Get current value of gap
  var gapSelected = d3.selectAll("#gap_6")[0][1].value;
  var group = gapSelected=="blk" ? "Black" : "Hispanic";

   //Get state selected
   var stateSelected = d3.selectAll("#highlight_6")[0][1].value.replace(/\s+/g, '');

    //Highlight selection
    d3.selectAll(idString).classed("selected", function(){
        if (stateSelected == "All") {
            return true;
        }
        else {
            return (this.id == stateSelected);
        }
    });

    if(isIE==0) {
        d3.selectAll(idString).moveToFront();
    }

    if(parentid=="gap-container_6" && nullcolor.toLowerCase()=="#d3d3c9"){ //if no achievement gap data for state
      var htmlBody="No data for this state available with current selections."
    }
    else{

    if(parentid=="bar-container_6"){

      var compare = d.resid>=0 ? " worse " : " better ";
      //Content of tooltip
      var htmlBody = "<br/><b>"+d.fips+"</b><br/>Achievement gap: <b>"+
              d3.round(d.vgap,2)+ "</b><br/>Predicted achievement gap: <b>"+d3.round(d.vgap-d.resid,2)+
              "</b><br/>Difference: <b>"+ Math.abs(d3.round(d.resid,2)) + " standard deviations" + compare + "than predicted";
    }
    else{
      var name = d.properties.STATE_NAME;
       var compare = mapdata_6[name].resid>=0 ? " worse " : " better ";
      //Content of tooltip
      var htmlBody = "<br/><b>"+name+"</b><br/>Achievement gap: <b>"+
              d3.round(mapdata_6[name].vgap,2)+ "</b><br/>Predicted achievement gap: <b>"+d3.round(mapdata_6[name].vgap-mapdata_6[name].resid,2)+
              "</b><br/>Difference: <b>"+ Math.abs(d3.round(mapdata_6[name].resid,2)) + " standard deviations" + compare + "than predicted";
    }
    }

    //var left_offset = d3.event.pageX+280 > $(window).width() ? -280 : 30;

//Show tooltip
      tooltip_6
          .attr("id", id)
          .style("left", (d3.event.pageX+30) + "px")
          .style("top", (d3.event.pageY-30) + "px")
          .style("opacity", function(){
              if(stateSelected=="All"){ return 1;}
              else{
                  return (this.id == stateSelected) ? 1.0 : 0;
              }
          })
          .html(htmlBody)
          .moveToFront();


};

function barOut(d){

  var id = this.id;
  var idString = "#"+id

  d3.selectAll(idString).classed("selected", false)//.moveToBack();

  tooltip_6
    .style("opacity", 0);

}
