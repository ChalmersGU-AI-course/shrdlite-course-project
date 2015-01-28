///<reference path="Shrdlite.ts"/>
///<reference path="SVGWorld.ts"/>
///<reference path="ExampleWorlds.ts"/>
///<reference path="lib/jquery.d.ts" />

$(function(){
    var startWorld = 'small';
    var useSpeech = false;
    var world = new SVGWorld(ExampleWorlds[startWorld], useSpeech);
    Shrdlite.interactive(world);
});

