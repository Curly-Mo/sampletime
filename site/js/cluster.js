require(["js/clusterfck/clusterfck"], function(clusterfck) {

$('#clusterButton').click(function() {
	var samples = {};
	var mfccs = [];
    for(var i=0;i<returnedAnalysis.length;i++){
        var analysis = returnedAnalysis[i];
        var sound = returnedSounds[i];
		var mfcc = analysis.lowlevel.mfcc.dmean2;
		mfcc.id = sound.id;
		mfccs.push(mfcc);
		samples[sound.id] = {};
		samples[sound.id].sound = sound
		samples[sound.id].analysis = analysis
    }   
	//console.log(mfccs);
	//console.log(samples);
	var num_clusters = 4;
	var clusters = clusterfck.kmeans(mfccs, num_clusters);
    var centers = [];
	var colors = generate_colors(num_clusters);
    //set colors and cluster centers
    for(var i=0;i<clusters.length;i++){
        var cluster = clusters[i];
        centers[i] = average.apply(null, cluster);
        for(var j=0;j<cluster.length;j++){
            var id = cluster[j].id;
            var elem = $('circle').filter('#'+id);
            elem.css({ fill: 'rgb('+colors[i]+')'});
        }
	}
    var sounds = flatten(clusters);
    //compute distance from each center
    for(var i=0;i<sounds.length;i++){
        sounds[i].distances = [];
        for(var j=0;j<centers.length;j++){
            var d = clusterfck.distance.euclidean(sounds[i], centers[j]);
            sounds[i].distances[j] = d;
        }
	}
    //position based on center distances
    for(var i=0;i<sounds.length;i++){
        console.log(sounds[i]);
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

});

