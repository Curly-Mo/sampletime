
var	audioContext = new AudioContext();
var thedata     = [];
var theclasses  = [];
var trackUrls  = [];
var xRandOffset = 200;
var margin = {top: -5, right: -5, bottom: -5, left: -5},
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight- margin.top - margin.bottom;

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

var drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
    .call(zoom);

var rect = svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all");

var container = svg.append("g");


//
// ======== I RUN CALLED ON LOAD, I READ THE JSON AND CALL THE INITS ===================

//

function init() {
  console.log("init")
	// Display a loading icon in our display element
	$('#feed').html('<span><img src="images/lightbox-ico-loading.gif" /></span>');

  $.getJSON( "filedata.json", function( data ) {
    wholedata = data;
    // console.log(data)
    $.each( data, function( key, val ) {
      $.each( val, function(key, val){
        theclasses.push(parseInt(val.class))
        // console.log(val.class)
        thedata.push(val.filepath)
      })
    });
    // console.log(thedata,"this is the data")
    loadTracks(thedata);
    circleInit(thedata);
  });
  // got all data, load files
	console.log("audio context is built, buffers loaded");

	MAX_SIZE = Math.max(4,Math.floor(audioContext.sampleRate/5000));	// corresponds to a 5kHz signal
	var request = new XMLHttpRequest();
	request.open("GET", "", true);
	request.responseType = "arraybuffer";
	request.onload = function() {
	  audioContext.decodeAudioData( request.response, function(buffer) {
	    	theBuffer = buffer;
		} );
	}
	request.send();
}

//
// ======== I LOAD THE AUDIO FOR EVERY TRACK IN THE JSON FILE ============================
//

function loadTracks(data) {
     for (var i = 0; i < data.length; i++) {
         trackUrls.push(data[i]);
        //  console.log(data[i])
        //  console.log(trackUrls[i])
     };
     bufferLoader = new BufferLoader(audioContext, trackUrls, bufferLoadCompleted);
     bufferLoader.load(false);
     //  return loaderDefered.promise;
 }

//
// ======== I RUN AFTER ALL THE BUFFERS ARE LOADED ========================================
//

function bufferLoadCompleted() {
  // console.log("bufferLoadCompleted");
}

//
// ======== I AM CALLED POST JSON, TO CREATE NDOES FOR EACH ELEM in DATA ==================
//

function circleInit(data){
 dot = container.append("g")
     .attr("class", "dot")
   .selectAll("circle")
     .data(data)
   .enter().append("circle")
     .attr("cx", function(d,i) {
      //  var clientWidth = document.getElementById('svgDiv').offsetWidth;
       var clientWidth = window.innerWidth;
       if(theclasses[i] % 2 == 0){
         x = clientWidth/4 - clientWidth/16+ Math.floor(Math.random()*xRandOffset);
       }
       else {
         x = clientWidth*3/4- clientWidth/8+ Math.floor(Math.random()*xRandOffset);
       }
       return x;
     })
     .attr("cy", function(d,i) {
      //  var clientHeight = document.getElementById('svgDiv').offsetHeight;
       var clientHeight = window.innerHeight;
       clientHeight = clientHeight - 200;
       if(theclasses[i] <= 2){
         y = clientHeight/4 - clientHeight/8 + Math.floor(Math.random()*xRandOffset);
       }
       else {
         y = clientHeight*3/4+ Math.floor(Math.random()*xRandOffset);
       }
       return y;
     })
     .call(drag)
     .style("fill", function(d,i) {
       // console.log(typeof(theclasses[i]),theclasses[i]);
       switch (theclasses[i]) {
         case 1:
           thecolour = "lightcoral";
           return thecolour;
         case 2:
           thecolour = "orange";
           return thecolour;
         case 3:
           thecolour = "red";
           return thecolour;
         case 4:
           thecolour = "blue";
           return thecolour;
           break;
         default:
           thecolour = "black";
           return thecolour;
       }
     })
     .attr("r", function(d,i){
         var str1;
         var radius;
         switch (theclasses[i]) {
           case 1:
             str1 = "wholedata.kick.k";
             str1 = str1.concat((i+1).toString());
             str1 = str1.concat(".zcr");
             radius = eval(str1)*20;
             return radius;

           case 2:
             str1 = "wholedata.snare.s";
             str1 = str1.concat((i-5).toString());
             str1 = str1.concat(".zcr");
             radius = eval(str1)*20;
             return radius;

           case 3:
             str1 = "wholedata.hihat.h";
             str1 = str1.concat((i-11).toString());
             str1 = str1.concat(".zcr");
             radius = eval(str1)*20;
             return radius;

           case 4:
             str1 = "wholedata.crash.c";
             str1 = str1.concat((i-17).toString());
             str1 = str1.concat(".zcr");
             radius = eval(str1)*20;
             return radius;

             break;
           default:
             return 10;
       }
     })
     .on("click", function(d){
       d.charAt(d.length-5)
       // HACK:
       if(d.substring(9,10) == "k"){
         var val = d.charAt(d.length-5)-1;
         // console.log("kick ",val);
       }else if (d.substring(9,10) == "s") {
         var val = d.charAt(d.length-5)-1 + 6
         // console.log("snare ",val);
       }else if (d.substring(9,10) == "h") {
         var val = d.charAt(d.length-5)-1 + 12;
         // console.log("hat ",val);
         }else if (d.substring(9,10) == "c") {
         var val = d.charAt(d.length-5)-1 + 18;
         // console.log("crash",val);
       }
       var samp = bufferLoader.bufferList[val];
       // console.log(samp)
       playSound(samp,audioContext.currentTime)
       // k 0 - 5
       // s 6 - 11
       // h 12 - 17
       // c 18 - 23
       ;
     });
   }

 //
 // ======== I PLAY SOUNDS - I AM WEB AUDIO ========================================
 //

function playSound(buffer, time) {
    // console.log("sampletime")
    var source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
   source.start(time);
}

//
// ======== THESE HANDLE THE DRAGGING OF CIRCLES ========================================
//

function dottype(d) {
  d.x = +d.x;
  d.y = +d.y;
  return d;
}

function zoomed() {
  container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function dragstarted(d) {
  d3.event.sourceEvent.stopPropagation();
  d3.select(this).classed("dragging", true);
}

function dragged(d) {
  // console.log(d3.event.dx, d3.select(this).attr("cx"))
  d3.select(this)
      .attr("cx", d.x = parseInt(d3.select(this).attr("cx")) + parseInt(d3.event.dx))
      .attr("cy", d.y = parseInt(d3.select(this).attr("cy")) + parseInt(d3.event.dy));
}

function dragended(d) {
  d3.select(this).classed("dragging", false);
}
