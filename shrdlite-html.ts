///<reference path="Shrdlite.ts"/>
///<reference path="SVGWorld.ts"/>
///<reference path="ExampleWorlds.ts"/>
///<reference path="lib/jquery.d.ts" />

var defaultWorld = 'small';
var defaultSpeech = false;

$(function(){
    var current : string = getURLParameter('world');
    if (!(current in ExampleWorlds)) {
        current = defaultWorld;
    }
    var speech : string = (getURLParameter('speech') || "").toLowerCase();
    var useSpeech : boolean = (speech == 'true' || speech == '1' || defaultSpeech);

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

    var world : World = new SVGWorld(ExampleWorlds[current], useSpeech);
    Shrdlite.interactive(world);
});


// Adapted from: http://www.openjs.com/scripts/events/exit_confirmation.php
function goodbye(e : any) {
    // Note: the type of 'e' is really 'Event', but its interface says that
    // 'e.returnValue' is a boolean, which is not the case, so we set the type to 'any'

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
function getURLParameter(sParam : string) : string {
    var sPageURL = window.location.search.slice(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
    return "";
}​
