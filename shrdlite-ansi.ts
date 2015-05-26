///<reference path="Shrdlite.ts"/>
///<reference path="ANSIWorld.ts"/>
///<reference path="ExampleWorlds.ts"/>

// Extract command line arguments:
var nodename = process.argv[0];
var jsfile = process.argv[1].replace(/^.*\//, "");
var worldname = process.argv[2];
var searchStrat = process.argv[3];

var usage = "Usage: " + nodename + " " + jsfile + 
    " (" + Object.keys(ExampleWorlds).join(" | ") + ")";

if (process.argv.length != 3 || !ExampleWorlds[worldname]) {
    console.error(usage);
    process.exit(1);
} 

var world = new ANSIWorld(ExampleWorlds[worldname]);

Shrdlite.interactive(world, searchStrat);
