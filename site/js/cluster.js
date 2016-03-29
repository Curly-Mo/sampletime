require(["js/clusterfck/clusterfck"], function(clusterfck) {

$('#clusterButton').click(function() {
    cluster('dmean2');
});
function cluster(feature_name){
	var samples = {};
	var features = [];
    for(var i=0;i<returnedAnalysis.length;i++){
        var analysis = returnedAnalysis[i];
        var sound = returnedSounds[i];
		var feature = analysis.lowlevel.mfcc.dmean2;
		feature.id = sound.id;
		features.push(feature);
		samples[sound.id] = {};
		samples[sound.id].sound = sound
		samples[sound.id].analysis = analysis
    }   
	//console.log(features);
	//console.log(samples);
	var num_clusters = 4;
	var clusters = clusterfck.kmeans(features, num_clusters);
    var centers = [];
    //var cluster_tags = [];
	var colors = generate_colors(num_clusters);
    //set colors and cluster centers
    for(var i=0;i<Object.keys(clusters).length;i++){
        var cluster = clusters[i];
        centers[i] = average.apply(null, cluster);
        //cluster_tags[i] = [];
        for(var j=0;j<cluster.length;j++){
            var id = cluster[j].id;
            var elem = $('circle[data-id=' + id + ']');
            elem.css({ fill: 'rgb('+colors[i]+')'});
            //cluster_tags[i].push.apply(cluster_tags[i], samples[id].sound.tags.map(function(item){return item.toLowerCase()}));
        }
	}
    var sounds = flatten(clusters);
    var max_distance = 0;
    //compute distance from each center
    for(var i=0;i<sounds.length;i++){
        sounds[i].distances = [];
        for(var j=0;j<centers.length;j++){
            var d = clusterfck.distance.euclidean(sounds[i], centers[j]);
            sounds[i].distances[j] = d;
            if (d > max_distance) {
                max_distance = d;
            }
        }
	}
    //position based on center distances
    var positions = [50, $('svg').innerWidth() - 50, 50, $('svg').innerHeight() - 50]
    // Position center tags
    /*console.log(cluster_tags);
    cluster_tags = uniqify(cluster_tags);
    console.log(cluster_tags);
    container.selectAll('text').remove();
    for(var i=0;i<centers.length;i++){
        centers[i].tag = most_common(cluster_tags[i]);
        if(i<2){
            var x = positions[i];
            var y = (positions[2]+positions[3])/2;
        }else{
            var x = (positions[0]+positions[1])/2;
            var y = positions[i];
        }
        container.append('text').text(centers[i].tag)
                .attr('x', x)
                .attr('y', y)
                .attr('fill', 'black')
    }*/
    //console.log(centers);
    
    // Position each sound
    for(var i=0;i<sounds.length;i++){
        //normalize distances
        sounds[i].distances = sounds[i].distances.map(function(element){
           return element / max_distance;
        });
        var d1 = Math.min.apply(null, sounds[i].distances.slice(0,2));
        var d2 = Math.min.apply(null, sounds[i].distances.slice(2,4));
        var d1_index = sounds[i].distances.indexOf(d1);
        var d2_index = sounds[i].distances.indexOf(d2);
        var x = positions[d1_index] + positions[1]*(d1 * Math.pow(-1, d1_index % 2))/1.5;
        var y = positions[d2_index] + positions[3]*(d2 * Math.pow(-1, d2_index % 2))/1.5;
        var id = sounds[i].id;
        var elem = $('circle[data-id=' + id + ']');
        elem.attr('cx', x);
        elem.attr('cy', y);
    }
}

});

/**
 * Element-wise average of multiple arrays
 * (unknown number of arrays passed to 'arguments'
 */
function average(){
    var result = [];
    for (var i = 0; i < arguments[0].length; i++) {
        var sum = 0;
        for(var a = 0; a < arguments.length; a++) {
            sum += arguments[a][i];
        }
        result.push(sum/arguments.length);
    }
    return result;
}

/**
 * Flatten a nested array
 */
function flatten(arr) {
    var flattened = arr.reduce(function(a, b) {
        return a.concat(b);
    }, []);
    return flattened;
}

/**
 * Generate n distance random colors
 */
function generate_colors(n){
	var colors = []
	for(i = 0; i < 360; i += 360 / n) {
		var hue = i;
		var saturation = 90 + Math.random() * 10;
		var lightness = 50 + Math.random() * 10;
		colors.push(hsvToRgb(hue, saturation, lightness));
	}
	return colors;
}

/**
 * HSV to RGB color conversion
 *
 * H runs from 0 to 360 degrees
 * S and V run from 0 to 100
 * 
 * Ported from the excellent java algorithm by Eugene Vishnevsky at:
 * http://www.cs.rit.edu/~ncs/color/t_convert.html
 */
function hsvToRgb(h, s, v) {
    var r, g, b;
    var i;
    var f, p, q, t;
    // Make sure our arguments stay in-range
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));
    // We accept saturation and value arguments from 0 to 100 because that's
    // how Photoshop represents those values. Internally, however, the
    // saturation and value are calculated from a range of 0 to 1. We make
    // That conversion here.
    s /= 100;
    v /= 100;
    if(s == 0) {
        // Achromatic (grey)
        r = g = b = v;
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));
    switch(i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        default: // case 5:
            r = v;
            g = p;
            b = q;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function most_common(list){
    var counts = {}, max = 0, result;
    for (var v in list) {
        counts[list[v]] = (counts[list[v]] || 0) + 1;
        if (counts[list[v]] > max) { 
            max = counts[list[v]];
            result = list[v];
        }
    }
    return result;
}

function uniqify(lists){
    for(var i=0;i<lists.length;i++){
        for(var k=lists[i].length;k--;){
            var item = lists[i][k];
            if(lists.every(function(arr){return arr.indexOf(item)!=-1})){
                for(var j=0;j<lists.length;j++){
                    lists[j].splice(lists[j].indexOf(item),1);
                }
            }
        }
        
    }
    return lists;
}
