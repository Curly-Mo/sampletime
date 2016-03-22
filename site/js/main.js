
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
    // .style("z-index",-1);
//
var rect = svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .style("z-index", -1);

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var container = svg.append("g")
var	audioContext = new AudioContext();
var thedata     = [];
var theclasses  = [];
var trackUrls  = [];
var xRandOffset = 200;
var SCALE_FLAG = 0;
var trackUrls = [];

var trackList = [];
var returnedSounds = [];
var returnedAnalysis = [];
var spreads = [];
var energies = [];
var globalSounds = [];

// -----------------------------------------------------------------------------

window.onload = function(){
  console.log("init - test")
	// Display a loading icon in our display element
	// $('#feed').html('<span><img src="images/lightbox-ico-loading.gif" /></span>');

	console.log("audio context is built");
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

  token = "6111dd7939cc531db688360f2d70e96661531292";
  freesound.setToken(token);

  var fields = 'id,name,url';
  var query = "kick"
  var page = 1
  var page_size = 5;
  var filter = "percussion"
  var sort = "score"

  freesound.textSearch(query, {page:page, page_size: page_size, filter:filter, sort:sort, fields:fields},
      function(sounds){                                         // for each sound returned from search
        var msg = ""
        // globalSounds = sounds;  //DEBUG
        console.log(sounds)
        returnedSounds = sounds.results;
        circleInit(returnedSounds);

        for (i = 0; i <= returnedSounds.length-1; i++){
          // console.log(returnedSounds)
          if (typeof sounds.getSound(i).id != "undefined") {
            freesound.getSound(sounds.getSound(i).id,
                function(sound){
                  globalSounds.push(sound);
                  trackList.push(sound.previews['preview-hq-mp3']);

                  sound.getAnalysis(null,function(analysis){
                    returnedAnalysis.push(analysis);
                    spreads.push(analysis.lowlevel.spectral_spread.dmean);
                    energies.push(analysis.lowlevel.spectral_energy.dmean);
                    console.log("analysis ",analysis);
                  });
              });
          }
        }
      });
  // waitRoutine();
};


//
// ======== I LOAD THE AUDIO FOR EVERY TRACK IN THE JSON FILE ============================
//

function loadTracks(data) {
    console.log("loading tracks")
    // console.log(data)
    for (var i = 0; i < data.length; i++) {
       trackUrls.push(data[i]);
    };
    bufferLoader = new BufferLoader(audioContext, trackUrls, bufferLoadCompleted);
    bufferLoader.load(false);

    // return loaderDefered.promise;
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

function circleUpdate(){
  // console.log("circle init data = ",data)
  // console.log(data)
 dot = container.selectAll("circle")
     .attr("id", function(d,i) {
      //  console.log("-- ",d," - ",i);
       return i;
     })
     .attr("cx", function(d,i) {
       if (typeof(returnedAnalysis[i] != "undefined")){
        //  console.log(returnedAnalysis[i])
        console.log("xx ",Math.floor(returnedAnalysis[i].lowlevel.spectral_spread.dmean/math.max(spreads)*500));
        x = Math.floor(returnedAnalysis[i].lowlevel.spectral_spread.dmean/math.max(spreads)*500);
         return x;
       }else{
         return 500;
       }

     })
     .attr("cy", function(d,i) {
      // console.log(returnedAnalysis[i].lowlevel.spectral_rms.dmean, )
      console.log("yy ", returnedAnalysis[i].lowlevel.spectral_energy.dmean/math.max(energies)*100);
      y = Math.floor(returnedAnalysis[i].lowlevel.spectral_energy.dmean/math.max(energies)*100);

       return 500;
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
        if(returnedSounds){
          // console.log(this.id)
          // console.log("r ",-2*Math.log(returnedAnalysis[i].lowlevel.average_loudness));
          // console.log(returnedAnalysis[this.id])
          r = -2*Math.log(returnedAnalysis[i].lowlevel.average_loudness);

        }else{
          r = 10;
        }
        // d.getAnalysis();
        return r;

     })
     .on("click", function(d,i){

        // console.log(Math.floor(returnedAnalysis[i].lowlevel.spectral_centroid.dmean))
       var samp = bufferLoader.bufferList[this.id];
       // console.log(samp)
       playSound(samp,audioContext.currentTime);

       returnedSounds[i].getComments(function(comments){
         console.log(comments)

       });

     });
   }


   function circleInit(data){
     // console.log("circle init data = ",data)
     // console.log(data)
    dot = container.append("g")
        .attr("class", "dot")
      .selectAll("circle")
        .data(data)
      .enter().append("circle")
        .attr("id", function(d,i) {
         //  console.log("-- ",d," - ",i);
          return i;
        })
        .attr("cx", function(d,i) {
         //  var clientWidth = document.getElementById('svgDiv').offsetWidth;
          var clientWidth = window.innerWidth;
          x = (clientWidth/2 -clientWidth/16)+ Math.floor(Math.random()*xRandOffset);
          return x;
        })
        .on("mouseover", function(d) {
          if(SCALE_FLAG == 1){
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div .html("duncan" + "<br/>"  + d.close)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
          }
        })
        .attr("cy", function(d,i) {
         //  var clientHeight = document.getElementById('svgDiv').offsetHeight;
          var clientHeight = window.innerHeight;
          clientHeight = clientHeight - 200;
          y = clientHeight/2 + Math.floor(Math.random()*xRandOffset);
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
        .attr("r", function(d){
            var str1;
            var radius;
           if(returnedSounds){
             console.log("radius! ",returnedAnalysis.length)
             r = 15;
           }else{
             r = 20;
           }
           // d.getAnalysis();
           return r;

        })
        .on("click", function(d){
          var samp = bufferLoader.bufferList[this.id];
          // console.log(samp)
          // playSound(samp,audioContext.currentTime);

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


// separate function to set these
var keyCodeOne = 97;
var keyCodeTwo = 115;
var keyCodeThree = 100;
var keyCodeFour = 102;


// handles the key detection for triggering samples from keyboard
document.onkeypress = function (e) {
    e = e || window.event;
    // console.log(e.keyCode)

    switch (e.keyCode) {
      case keyCodeOne:
        triggerSamples("#one");
        break;
      case keyCodeTwo:
        triggerSamples("#two");
        break;
      case keyCodeThree:
        triggerSamples("#three");
        break;
      case keyCodeFour:
        triggerSamples("#four");
        break;
      default:
    }
};

// triggers samples in regions
function triggerSamples(id){
  var offsets = $(id).offset();
  var top = offsets.top - 45;
  var left = offsets.left;
  var bottom = offsets;

  console.log("id ",id)
  // console.log("bottom = ",bottom);
  // console.log("width = ",$(id).width());
  //
  // console.log("top = ",top);
  console.log("left = ",left);

  console.log(dot)

  for(i = 0; i < dot.size(); i++){
    if((dot[0][i].cy.baseVal.value+TRANSLATE_Y > top) && (dot[0][i].cy.baseVal.value+TRANSLATE_Y < top+80)){
      if((dot[0][i].cx.baseVal.value+TRANSLATE_X > left) && (dot[0][i].cx.baseVal.value+TRANSLATE_X < left+80)){

        console.log("base x,y ",dot[0][i].cx.baseVal.value, dot[0][i].cy.baseVal.value)
        console.log("with translate ",dot[0][i].cx.baseVal.value+TRANSLATE_X, dot[0][i].cy.baseVal.value+TRANSLATE_Y);

        var samp = bufferLoader.bufferList[dot[0][i].id];
        playSound(samp,audioContext.currentTime);
        playSound(samp,audioContext.currentTime);
      }    // hack.. this defined in css
    }
  }
}


function hackButton(){
  loadTracks(trackList);
  circleUpdate();
}
//
// ======== THESE HANDLE THE DRAGGING OF CIRCLES ========================================
//

function dottype(d) {
  d.x = +d.x;
  d.y = +d.y;
  return d;
}

TRANSLATE_Y = 0;
TRANSLATE_X = 0;

function zoomed() {
  // console.log("x = ",d3.event.translate[0])
  TRANSLATE_Y = d3.event.translate[0];
  TRANSLATE_X = d3.event.translate[1];
  if(d3.event.scale > 1.5){
    SCALE_FLAG = 1;
  }else{
    SCALE_FLAG = 0;
  }

  container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function dragstarted(d) {
  d3.event.sourceEvent.stopPropagation();
  d3.select(this).classed("dragging", true);
}

function dragged(d) {
  d3.select(this)
      .attr("cx", d.x = parseInt(d3.select(this).attr("cx")) + parseInt(d3.event.dx))
      .attr("cy", d.y = parseInt(d3.select(this).attr("cy")) + parseInt(d3.event.dy));

  console.log("drag x y ", this.cx.baseVal.value, this.cy.baseVal.value)
}

function dragended(d) {
  d3.select(this).classed("dragging", false);
}
