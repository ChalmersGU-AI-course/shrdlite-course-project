///<reference path="Astar.ts"/>
///<reference path="SVGPuzzle.ts"/>
///<reference path="ExamplePuzzles.ts"/>
///<reference path="lib/jquery.d.ts" />

var defaultPuzzle = '8queens';

$(function(){
    var current = getURLParameter('puzzle');
    if (!(current in ExamplePuzzles)) {
        current = defaultPuzzle;
    }

    $('#currentpuzzle').text(current);
    $('<a>').text('reset')
        .attr('href', '?puzzle=' + current)
        .appendTo($('#resetpuzzle'));
    $('#otherpuzzles').empty();
    for (var wname in ExamplePuzzles) {
        if (wname !== current) {
            $('<a>').text(wname)
                .attr('href', '?puzzle=' + wname)
                .appendTo($('#otherpuzzles'))
                .after(' ');
        }
    }

    var puzzle = new SVGPuzzle(ExamplePuzzles[current]);
    Astar.interactive(puzzle);
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
window.onbeforeunload = goodbye;


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
