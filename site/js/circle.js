

var RESULTS_TO_DISPLAY = 5;
var theResults = [];
var last_ID;
var curr_ID;
var trackListSimilar = [];
var SIMILAR_FLAG = 0;

// ==============================================================================
// This function inits the circles
function circleInit(data){

  var xRandOffset = 200;

    dot = container.append("g")
    .attr("currx",0)
    .attr("curry",0)
    .attr("class", "dot")
    .selectAll("circle")
     .data(data)
    .enter().append("circle")
     .attr("id", function(d,i) {
      //  console.log("-- ",d," - ",i);
       return i;
     })
     .on("mouseout", function(d){
       console.log(container2);
       div.transition()
           .duration(200)
           .style("opacity", 0)
     })
     .on("mouseover", function(d) {
       curr_ID = this.id;
       if(SCALE_FLAG == 1){
         var img = "<img id=\x22zoom_img\x22 src='" + globalSounds[this.id].images.spectral_l + "'>";
         var t = [];
         tags = globalSounds[this.id].tags

         for(i = 0; i < tags.length; i++){
           if(i >= NUM_TAGS){
             break;
           }
           t.push(" "+tags[i]+" ");
         }
         if(curr_ID != last_ID){
           container2.selectAll("circle").remove();    // remove old search nodes
           theResults = [];
         }

         if(theResults.length > 0){
           console.log("theResults to init ",theResults)
           zoomedCircleInit(theResults);
         }

         div.transition()
             .duration(200)
             .style("opacity", .9);
         div .html(returnedSounds[this.id].name.toUpperCase() + "<br/>" + img + "<br/>" +  t.join(''))
             .style("left", (dot[0][curr_ID].currx+dot[0][curr_ID].currr+10) + "px")
             .style("top", (d3.event.pageY - 28) + "px");
         }else{
            div.transition()
                .duration(200)
                .style("opacity", 0)
         }
         last_ID = this.id;             // update the id var
     })
     .attr("cx", function(d,i) {
      //  var clientWidth = document.getElementById('svgDiv').offsetWidth;
       var clientWidth = window.innerWidth;
       x = (clientWidth/2 -clientWidth/16)+ Math.floor(Math.random()*xRandOffset);
       return x;
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
          r = 15;
        }else{
          r = 20;
        }
        // d.getAnalysis();
        return r;

     })
     .on("click", function(d){
       var samp = bufferLoader.bufferList[this.id];
       playSound(samp,audioContext.currentTime);
     });

    dot[0].forEach(function(entry) {
      entry.curry = entry.cy.baseVal.value;
      entry.currx = entry.cx.baseVal.value;
      entry.currr = entry.r.baseVal.value;
    });
   }

// ==============================================================================
// This function updates the circles
function circleUpdate(){
     dot = container.selectAll("circle")
     .attr("id", function(d,i) {
       return i;
     })
     .attr("cx", function(d,i) {
       if (typeof(returnedAnalysis[i] != "undefined")){
        x = 200+Math.floor(returnedAnalysis[i].lowlevel.spectral_spread.dmean/math.max(spreads)*600);
         return x;
       }else{
         return 500;
       }
     })
     .attr("cy", function(d,i) {
      y = Math.floor(returnedAnalysis[i].lowlevel.spectral_energy.dmean/math.max(energies)*100);
      if(y < 200){
        y = y + 200;
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
        if(returnedSounds){
          r = -5*Math.log(returnedAnalysis[i].lowlevel.average_loudness);
        }else{
          r = 20;
        }
        return r;
     })
     .on("click", function(d,i){
       if(SIMILAR_FLAG == 1){
         theResults = [];                            // clear the results
         getSimilarHover(returnedSounds[this.id]);
       }
       var samp = bufferLoader.bufferList[this.id];
       playSound(samp,audioContext.currentTime);

     });
   }

// ==============================================================================
// This function returns the similar sounds of a zoomed and hovered returnedSound
function getSimilarHover(theSound){
  // console.log("ever")
  theSound.getSimilar(function(similar){
    for(i=1; i <= RESULTS_TO_DISPLAY; i++){
      theResults.push(similar.results[i]);

      freesound.getSound(similar.getSound(i).id,
          function(sound){
            trackListSimilar.push(sound.previews['preview-hq-mp3']);
        });
    }
  });
  NUM_SIMILAR = theResults.length;
}

// ==============================================================================
// This function inits similar sound circles
function zoomedCircleInit(data){
   container2.selectAll("circle").remove();    // remove old search nodes
   dot2 = container2.append("g")
   .attr("class", "dot")
   .selectAll("circle")
   .data(data)
   .enter().append("circle")
   .attr("id", function(d,i) {
     return i;
   })
   .attr("cx", function(d,i) {
    //  i = i+math.pi;
     var inc = 3/2*math.pi/theResults.length;
     var r = dot[0][curr_ID].r.baseVal.value;
     var h = dot[0][curr_ID].currx;
     return 3*r*math.cos(i*inc+math.pi) + h;
   })
   .attr("cy", function(d,i) {
    //  i = i+math.pi;
     var inc = 3/2*math.pi/theResults.length;
     var r = dot[0][curr_ID].r.baseVal.value;
     var k = dot[0][curr_ID].curry;
     return 3*r*math.sin(i*inc+math.pi) + k;
   })
   .call(drag)
   .style("fill","lightcoral")
   .attr("r", function(d){
    return dot[0][curr_ID].currr/4;
   })
   .on("click", function(d){
     var samp = bufferLoader2.bufferList[this.id];
     playSound(samp,audioContext.currentTime);
   });
 }
