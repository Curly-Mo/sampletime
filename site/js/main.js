
var	audioContext = new AudioContext();
var gainNode = audioContext.createGain();

var dot;
var thedata     = [];
var theclasses  = [];
var trackUrls  = [];
var trackUrls2  = [];
var trackList = [];
var returnedSounds = [];
var returnedAnalysis = [];
var spreads = [];
var energies = [];
var globalSounds = [];

var SCALE_FLAG = 0;
var NUM_TAGS = 3;
var TRANSLATE_Y = 0;
var TRANSLATE_X = 0;
var ZOOM_FLAG = 0;


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
    .attr("height", height - 150)
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
var container = svg.append("g");
var container2 = svg.append("g");

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

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
    //Load sounds/circles on pageload
    /*startTextSearch('');
    window.setTimeout(function(){
        loadTracks(trackList,1);
    },5000);*/
};

$("#search").keydown(function(event){
    if(event.keyCode == 13){
      var terms = document.getElementById("search").value.split(/[ ,]+/);
      var query = terms[0];
      var searchTags = [];
      for(i=0; i< terms.length; i++){
        if(i == 0){
          query = terms[i];
        }else {
          searchTags.push(terms[i]);
        }
      }
      startTextSearch(query, searchTags);
    }
});

// ==============================================================================
// This function handles text search
function startTextSearch(query, searchTags){

  container.selectAll("circle").remove();    // remove old search nodes
  container.selectAll("text").remove();    // remove old search nodes
  console.log("startTextSearch ",query, "tags ", searchTags)
  var filter = "duration:[0 TO 3], tag:"

  if(searchTags.length > 0){
    console.log("some tags")
    for(i = 0; i < searchTags.length; i++){
      console.log(searchTags[i]);
      filter += searchTags[i];
    }
  }else if (searchTags.length == 0) {
    filter += "percussion";
  }

  // Duncan's key
  token = "6111dd7939cc531db688360f2d70e96661531292";
  // Colin's key
  //token = "741cbb4dfc84a58ab97e1321a1ea7628e40ddc5f";
  freesound.setToken(token);

  var fields = 'id,name,url,tags';
  var duration = 0.01
  var loop = 0;
  var page = 1;
  var page_size = 5;
  // var filter = "percussion"
  // var filter = "duration:[0 TO 3], tag:" + snd.id + ": " + snd.url + "</li>"
  var sort = "score"
  var group = 1;

  freesound.textSearch(query, {duration:duration, loop:loop, page:page, group_by_pack:group, page_size:page_size, filter:filter, sort:sort, fields:fields},
      function(sounds){                                         // for each sound returned from search
        var msg = "";
        // globalSounds = sounds;  //DEBUG
        returnedSounds = sounds.results;
        circleInit(returnedSounds);

        returnedAnalysis = [];
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
                    //console.log("analysis ",analysis);
                  });
              });
          }
        }
      });
}

// ==============================================================================
// Add audio to bufferlist
function loadTracks(data, overwrite_flag) {
    console.log("load - ", data);
    if(overwrite_flag == 1){
      // console.log("loading tracks - overwrite");
      trackUrls = [];
      for (var i = 0; i < data.length; i++) {
         trackUrls.push(data[i]);
      };
      bufferLoader = new BufferLoader(audioContext, trackUrls, bufferLoadCompleted);
      bufferLoader.load(false);
    }else{
      // console.log("loading tracks - add");
      for (var i = 0; i < NUM_SIMILAR; i++) {
        trackUrls2.push(data[i]);
      };
      bufferLoader2 = new BufferLoader(audioContext, data, bufferLoadCompleted);
      bufferLoader2.load(false);
    }
 }

// ==============================================================================
// After tracks are loaded
function bufferLoadCompleted() {
  // console.log("bufferLoadCompleted");
}

// ==============================================================================
// Play audio -- Web audio
function playSound(buffer, time) {

    // console.log("sampletime")
    var source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    // gainNode.connect(audioContext.destination);
    source.start(time);

}

// ==============================================================================
// Stop audio -- Web audio
function stopSound(buffer, time) {
    audioContext.close();
    audioContext = new AudioContext();
}

// // separate function to set these
// var keyCodeOne = 97;
// var keyCodeTwo = 115;
// var keyCodeThree = 100;
// var keyCodeFour = 102;
//
// // ==============================================================================
// // triggers samples in regions
// function triggerSamples(id){
//   var offsets = $(id).offset();
//   var top = offsets.top - 45;
//   var left = offsets.left;
//   var bottom = offsets;
//   for(i = 0; i < dot.size(); i++){
//     if((dot[0][i].cy.baseVal.value+TRANSLATE_Y > top) && (dot[0][i].cy.baseVal.value+TRANSLATE_Y < top+80)){
//       if((dot[0][i].cx.baseVal.value+TRANSLATE_X > left) && (dot[0][i].cx.baseVal.value+TRANSLATE_X < left+80)){
//
//         console.log("base x,y ",dot[0][i].cx.baseVal.value, dot[0][i].cy.baseVal.value)
//         console.log("with translate ",dot[0][i].cx.baseVal.value+TRANSLATE_X, dot[0][i].cy.baseVal.value+TRANSLATE_Y);
//
//         var samp = bufferLoader.bufferList[dot[0][i].id];
//         playSound(samp,audioContext.currentTime);
//       }    // hack.. this defined in css
//     }
//   }
// }


// ==============================================================================
// handles the key detection for triggering samples from keyboard
/*document.onkeypress = function (e) {
    e = e || window.event;
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
};*/


// ==============================================================================
// following 3 are hack buttons for functionality
function hackButton2(){
    if(SIMILAR_FLAG == 1){
      SIMILAR_FLAG = 0;
    }else if (SIMILAR_FLAG == 0){
      SIMILAR_FLAG = 1;
    }
}

function hackButton1(){
  for(i=0; i < bufferLoader.bufferList.length; i++){
    samp = bufferLoader.bufferList[dot[0][i].id];
    stopSound(samp);
  }
}

function hackButton(){
  loadTracks(trackList,1);
  circleUpdate();
}

// ==============================================================================
// update coordiantes after zoom or drag
function updateCoords(){

    // The magic function - converts node positions into positions on screen.
    function getScreenCoords(x, y, r, translate, scale) {
        // if(typeof(translate) != "undefined"){
          var xn = translate[0] + x*scale;
          var yn = translate[1] + y*scale;
          var rn = r*scale;
        // }else{
        //   var xn = x;
        //   var yn = y;
        //   var rn = r;
        // }

        return { x: xn, y: yn, r: rn};
    }

    dot[0].forEach(function(entry) {
      // console.log(entry)

      cx = entry.cx.baseVal.value;
      cy = entry.cy.baseVal.value;
      cr = entry.r.baseVal.value;
      coords = getScreenCoords(cx, cy, cr, d3.event.translate, d3.event.scale);
      entry.currx = coords.x;
      entry.curry = coords.y;
      entry.currr = coords.r;
    });
}

function zoomed() {
  ZOOM_FLAG = 1;
  TRANSLATE_Y = d3.event.translate[0];
  TRANSLATE_X = d3.event.translate[1];
  if(d3.event.scale > 1.5){
    SCALE_FLAG = 1;
  }else{
    SCALE_FLAG = 0;
  }
  container2.selectAll("circle").remove();    // remove old search nodes
  updateCoords();
  container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function dragstarted(d) {
  // crr_x = d.x;l
  d3.event.sourceEvent.stopPropagation();
  d3.select(this).classed("dragging", true);
}

function dragged(d) {
  d3.select(this)
      .attr("cx", d.x = parseInt(d3.select(this).attr("cx")) + parseInt(d3.event.dx))
      .attr("cy", d.y = parseInt(d3.select(this).attr("cy")) + parseInt(d3.event.dy));
  d3.select(this)[0][0].currx = d3.select(this)[0][0].currx + d3.event.dx;
  d3.select(this)[0][0].curry = d3.select(this)[0][0].curry + d3.event.dy;
  // this.currx = d3.event.dx;
  // this.curry = d3.event.dy;
}

function dragended(d) {
  d3.select(this).classed("dragging", false);
}
