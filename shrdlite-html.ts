///<reference path="Shrdlite.ts"/>
///<reference path="SVGWorld.ts"/>
///<reference path="GLWorld.ts"/>
///<reference path="ExampleWorlds.ts"/>
///<reference path="lib/jquery.d.ts" />

var defaultWorld = 'small';
var defaultSpeech = false;

//When document is ready
$(function () {

    
    var current = getURLParameter('world');

    if (!(current in ExampleWorlds)) {
        current = defaultWorld;
    }
    var speech = (getURLParameter('speech') || "").toLowerCase();
    var useSpeech = (speech == 'true' || speech == '1' || defaultSpeech);

    $('#currentworld').text(current);
    $('<a>').text('reset')
        .attr('href', '?world=' + current + '&speech=' + useSpeech)
        .appendTo($('#resetworld'));
    $('#otherworlds').empty();
    for (var wname in ExampleWorlds) {
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


    if (ExampleWorlds[current].rowLength == ExampleWorlds[current].stacks.length)
        $('#theworld3d').hide();
    else
        $('#theworld').hide();

    var world = new SVGWorld(ExampleWorlds[current], useSpeech);
    var glworld = new GLGWorld(ExampleWorlds[current], <HTMLCanvasElement> document.getElementById('glcanvas'));



    Shrdlite.interactive(world, glworld);

});


// Adapted from: http://www.openjs.com/scripts/events/exit_confirmation.php
function goodbye(e) {
	if(!e) e = window.event;
	// e.cancelBubble is supported by IE - this will kill the bubbling process.
	e.cancelBubble = true;

    // This is displayed in the dialog:
	e.returnValue = 'Are you certain?\nYou cannot undo this, you know.'; 

	// e.stopPropagation works in Firefox.
	if (e.stopPropagation) {
		e.stopPropagation();
		e.preventDefault();
	}
}
//window.onbeforeunload = goodbye; //NoNo!


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
