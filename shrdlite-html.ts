///<reference path="Shrdlite.ts"/>
///<reference path="SVGWorld.ts"/>
///<reference path="ExampleWorlds.ts"/>
///<reference path="lib/jquery.d.ts" />

const example = require('./ExampleWorlds.js')
const svg = require('./SVGWorld.js')
const shrd = require('./Shrdlite.js')


var defaultWorld = 'small';
var defaultSpeech = false;

function set_current_world() {
    var current = getURLParameter('world');
    if (!(current in example.ExampleWorlds)) {
        current = defaultWorld;
    }
    var speech;// = (getURLParameter('speech') || "").toLowerCase();
    var useSpeech;// = (speech == 'true' || speech == '1' || defaultSpeech);

    $('#currentworld').text(current);
    $('<a>').text('reset')
        .attr('href', '?world=' + current + '&speech=' + useSpeech)
        .appendTo($('#resetworld'));
    $('#otherworlds').empty();
    for (var wname in example.ExampleWorlds) {
        if (wname !== current) {
            $('<a>').text(wname)
                .attr('href', '?world=' + wname + '&speech=' + useSpeech)
                .appendTo($('#otherworlds'))
                .after(' ');
        }
    }
    $('<a>').text(useSpeech ? 'turn off' : 'turn on')
        .attr('href', '?world=' + current + '&speech=' + (!useSpeech))
        .appendTo($('#togglespeech'));

    var world = new svg.SVGWorld(example.ExampleWorlds[current], useSpeech);
    shrd.Shrdlite.interactive(world);
}


// Adapted from: http://www.jquerybyexample.net/2012/06/get-url-parameters-using-jquery.html
function getURLParameter(sParam) : string {
    var sPageURL = window.location.search.slice(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}​

module.exports.set_current_world = set_current_world;
