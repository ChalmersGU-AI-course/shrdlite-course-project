///<reference path="Shrdlite.ts"/>
///<reference path="TextWorld.ts"/>
///<reference path="ExampleWorlds.ts"/>
///<reference path="deepCopy.ts"/>
///<reference path="Planner.ts"/>

///<reference path="Interpreter.ts"/>


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
var world = new TextWorld(origState);

// origState.arm = 2;
// origState.holding = "e";
world.printWorld();

// console.log("Neighbors")

// var states = getNeighbors(origState);
// for (var i = states.length - 1; i >= 0; i--) {
//     new TextWorld(states[i]).printWorld();
// }
var tar: Interpreter.Literal[][] = [[
    { pol: true, rel: "ontop", args: ["l", "floor"] },
    { pol: true, rel: "holding", args: ["b"] }
]];
var graphGoal = new Planner.MultipleGoals(tar);
var graph = new astar.Graph(new Planner.DijkstraHeuristic(), graphGoal);
var graphStart = new Planner.PlannerNode(origState, null, null);
var result = graph.searchPath(graphStart);
