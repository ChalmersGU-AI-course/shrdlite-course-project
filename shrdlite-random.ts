
import {SimpleObject} from "./Types";
import {World, WorldState} from "./World";
import {SVGWorld} from "./SVGWorld";
import {ExampleWorlds} from "./ExampleWorlds";
import {parseUtteranceIntoPlan} from "./Shrdlite";
import "./lib/jquery";

/********************************************************************************
** shrdlite-random

This is the main file for the random browser-based version.
You don't have to edit this file.
********************************************************************************/

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

    var world = new SVGWorld(ExampleWorlds[current], useSpeech);
    randomInfiniteLoop(world);
});


// This is an alternative to the user interaction in Shrdlite.ts.
// The robot picks and drops objects at random, obeying the block world rules.

function randomInfiniteLoop(world : World) : void {
    function endlessLoop() : void {
        var state : WorldState = world.currentState;
        var allobjs : string[] = Array.prototype.concat.apply([], state.stacks);
        do {
            var obj1 = allobjs[Math.floor(Math.random() * allobjs.length)];
            do {
                var obj2 = allobjs[Math.floor(Math.random() * allobjs.length)];
            } while (obj1 == obj2);
            var obj1d = state.objects[obj1];
            var obj2d = state.objects[obj2];
        } while (!checkPhysics(obj1d, obj2d));
        var rel = obj2d.form == 'box' ? 'in' : 'on';
        var utterance = [
            'put', 'a', obj1d.size, obj1d.color, obj1d.form,
            rel, 'a', obj2d.size, obj2d.color, obj2d.form
        ].join(' ');
        world.printSystemOutput(utterance, "user");

        var plan : string[] = parseUtteranceIntoPlan(world, utterance);
        if (plan) {
            plan.push("What should I do now?");
            world.printDebugInfo("Plan: " + plan.join(", "));
            world.performPlan(plan, endlessLoop);
            return;
        }
        endlessLoop();
    }
    world.printWorld(endlessLoop);
}


// Very simplistic way to check the physics of a goal.

function checkPhysics(prop1 : SimpleObject, prop2 : SimpleObject) : boolean {
    if (prop2.form == 'ball') {
        return false;
    } else if (prop1.size == 'large' && prop2.size == 'small') {
        return false;
    } else if (prop1.form == 'ball') {
        return prop2.form == 'box';
    }
    return true;
}


// This function gets the URL parameter value for a given key all parameters in the URL string,
// i.e., if the URL is "http://..../....?x=3&y=42", then getURLParameter("y") == 42
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
