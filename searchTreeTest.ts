///<reference path="Shrdlite.ts"/>
///<reference path="TextWorld.ts"/>
///<reference path="ExampleWorlds.ts"/>
///<reference path="deepCopy.ts"/>
///<reference path="planner_astar.ts"/>


// start with
// tsc --out treetest.js searchTreeTest.ts && node treetest.js medium

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

var origState = ExampleWorlds[worldname];
console.log(origState.holding);
var world = new TextWorld(origState);

// origState.arm = 2;
// origState.holding = "e";
world.printWorld();

// console.log("Neighbors")

// var states = getNeighbors(origState);
// for (var i = states.length - 1; i >= 0; i--) {
//     new TextWorld(states[i]).printWorld();
// }

var graphGoal = new planner_astar.MultipleGoals();
var graph = new astar.Graph(new planner_astar.DijkstraHeuristic(), graphGoal);
var graphStart = new planner_astar.PlannerNode(origState, null);
var result = graph.searchPath(graphStart);

console.log(result);