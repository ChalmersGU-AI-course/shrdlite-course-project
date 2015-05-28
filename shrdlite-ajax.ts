///<reference path="Parser.ts"/>
///<reference path="SVGWorld.ts"/>
///<reference path="ExampleWorlds.ts"/>
///<reference path="lib/jquery.d.ts" />

// Replace this with the URL to your CGI script:
var ajaxScript = "cgi-bin/shrdlite_cgi.py";

var defaultWorld = 'small';
var defaultSpeech = false;

$(function(){
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

    var world = new SVGWorld(ExampleWorlds[current], useSpeech);
    ajaxInteractive(world);
});


function ajaxInteractive(world : World) : void {
    function endlessLoop(utterance : string = "") : void {
        var inputPrompt = "What can I do for you today? ";
        var nextInput = () => world.readUserInput(inputPrompt, endlessLoop);
        if (utterance.trim()) {
            var plan = ajaxParseUtteranceIntoPlan(world, utterance);
            if (plan) {
                world.printDebugInfo("Plan: " + plan.join(", "));
                world.performPlan(plan, nextInput);
                return;
            }
        }
        nextInput();
    }
    world.printWorld(endlessLoop);
}


function ajaxParseUtteranceIntoPlan(world : World, utterance : string) : string[] {
    world.printDebugInfo('Parsing utterance: "' + utterance + '"');
    try {
        var parses : Parser.Result[] = Parser.parse(utterance);
    } catch(err) {
        if (err instanceof Parser.Error) {
            world.printError("Parsing error: " + err.message);
            return;
        } else {
            throw err;
        }
    }
    world.printDebugInfo("Found " + parses.length + " parses");
    parses.forEach((res, n) => {
        world.printDebugInfo("  (" + n + ") " + JSON.stringify(res.prs));
    });

    world.printDebugInfo('Calling interpreter/planner using AJAX');
    var ajaxData = JSON.stringify(
        {stacks: world.currentState.stacks,
         holding: world.currentState.holding,
         arm: world.currentState.arm,
         objects: world.currentState.objects,
         utterance: utterance,
         parses: parses,
        });

    var xhReq = new XMLHttpRequest();
    xhReq.open("GET", ajaxScript + "?data=" + encodeURIComponent(ajaxData), false);
    xhReq.send();
    var response : string = xhReq.responseText;
    world.printDebugInfo("AJAX response: " + response);
    try {
        var result = JSON.parse(response);
    } catch(err) {
        world.printError("JSON error:" + err);
        return;
    }
    if (result.plan) {
        return result.plan;
    } else {
        return result;
    };
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
}
