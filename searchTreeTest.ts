///<reference path="Shrdlite.ts"/>
///<reference path="TextWorld.ts"/>
///<reference path="ExampleWorlds.ts"/>
///<reference path="deepCopy.ts"/>

// Extract command line arguments:
var nodename = process.argv[0];
var jsfile = process.argv[1].replace(/^.*\//, "");
var worldname = process.argv[2];

var usage = "Usage: " + nodename + " " + jsfile +
    " (" + Object.keys(ExampleWorlds).join(" | ") + ")";

if (process.argv.length != 3 || !ExampleWorlds[worldname]) {
    console.error(usage);
    process.exit(1);
}

var world = new TextWorld(ExampleWorlds[worldname]);
world.printWorld();

var origState = world.currentState;
var copyDepth = 5; // 3 should be enough, lets be sure
var copyState = owl.deepCopy(origState, copyDepth);
new TextWorld(ExampleWorlds[worldname]).printWorld();