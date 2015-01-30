///<reference path="Shrdlite.ts"/>
///<reference path="SVGWorld.ts"/>
///<reference path="ExampleWorlds.ts"/>
///<reference path="lib/jquery.d.ts" />

var defaultWorld = 'small';
var useSpeech = true;

$(function(){
    $('#exampleworlds').empty();
    for (var wname in ExampleWorlds) {
        $('<input type="submit">').val(wname)
            .click(changeCurrentWorld)
            .appendTo($('#exampleworlds'));
    }

    var name = getURLParameter('world');
    if (!(name in ExampleWorlds)) {
        name = defaultWorld;
    }

    var world = new SVGWorld(ExampleWorlds[name], useSpeech);
    Shrdlite.interactive(world);
});


function changeCurrentWorld() : void {
    var name = this.value;
    if (confirm("Do you want to reset to the " + name + " world?")) {
        var url = window.location.href.split('?')[0];
        window.location.href = url + '?world=' + name;
    }
}


// Borrowed from:
// http://www.jquerybyexample.net/2012/06/get-url-parameters-using-jquery.html

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
