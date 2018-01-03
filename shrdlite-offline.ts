///<reference path="lib/node.d.ts"/>

import {TextWorld} from "./TextWorld";
import {ExampleWorlds} from "./ExampleWorlds";
import {parseUtteranceIntoPlan, splitStringIntoPlan} from "./Shrdlite";

/********************************************************************************
** shrdlite-offline

This is the main file for the command-line version.
You don't have to edit this file.
********************************************************************************/


// Extract command line arguments.

var nodename = process.argv[0];
var jsfile = process.argv[1].replace(/^.*\//, "");
var worldname = process.argv[2];
var utterances = process.argv.slice(3);


// Print command usage and exit if necessary.

var usage = "Usage: " + nodename + " " + jsfile + 
    " (" + Object.keys(ExampleWorlds).join(" | ") + ")" +
    " (utterance | example no. | plan)*";
if (utterances.length == 0 || !ExampleWorlds[worldname]) {
    console.error(usage);
    process.exit(1);
} 


// Loop through all example utterances, updating the world state

var world = new TextWorld(ExampleWorlds[worldname]);
world.printWorld();
for (var utter of utterances) {
    var example : number = parseInt(utter);
    if (!isNaN(example)) {
        utter = world.currentState.examples[example];
        if (!utter) {
            console.error("ERROR: Cannot find example no. " + example);
            process.exit(1);
        }
    }
    console.log();
    console.log("############################################################" +
                "############################################################");
    console.log("#####", utter);
    console.log("############################################################" +
                "############################################################");
    console.log();
    var theplan : string[] | null = splitStringIntoPlan(utter);
    if (!theplan) {
        theplan = parseUtteranceIntoPlan(world, utter);
    }
    if (!theplan) {
        console.error("ERROR: Couldn't find a plan for utterance '" + utter + "'")
        process.exit(1);
    } else {
        console.log();
        world.performPlan(theplan);
        world.printWorld();
    }
}
