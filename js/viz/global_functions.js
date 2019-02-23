/*Trigger responsive sizing function
d3.select(window)
    .on("resize", sizeChange);


//Define responsive sizing function (requires ajax jquery)
function sizeChange() {
    //Resize all svgs
    d3.selectAll("#state_levels_container").attr("width", $(window).width() + "px").attr("height", $(window).height() + "px");
};*/

// This function returns Internet Explorer's major version number,
         // or 0 for others. It works by finding the "MSIE " string and
         // extracting the version number following the space, up to the decimal
         // point, ignoring the minor version number (http://support.microsoft.com/kb/167820)

      function msieversion()
         {
            var ua = window.navigator.userAgent
            var msie = ua.indexOf ( "MSIE " )

            if ( msie > 0 )      // If Internet Explorer, return version number
               return parseInt (ua.substring (msie+5, ua.indexOf (".", msie )))
            else                 // If another browser, return 0
               return 0

         }

      //Global IE information
          isIE = msieversion();

/*###############################################################
#Function to move objects to the foreground and background
#################################################################*/
//Move to front
	d3.selection.prototype.moveToFront = function() {
		  return this.each(function(){
		    this.parentNode.appendChild(this);
		  });
		};

//Move to back
	d3.selection.prototype.moveToBack = function() { 
    	return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    }); 
	};