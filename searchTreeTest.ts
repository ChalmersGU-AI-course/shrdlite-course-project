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

origState.arm1 = 1;
origState.arm2 = 7;
// origState.holding = "e";
world.printWorld();

// console.log("Neighbors")

// var states = getNeighbors(origState);
// for (var i = states.length - 1; i >= 0; i--) {
//     new TextWorld(states[i]).printWorld();
// }
var tar: Interpreter.Literal[][] = [[
    { pol: true, rel: "ontop", args: ["b", "floor"] },
    { pol: true, rel: "holding", args: ["a"] }
]];
var graphGoal = new Planner.MultipleGoals(tar);
var graphD = new astar.Graph(new Planner.DijkstraHeuristic(), graphGoal);
var graphStart = new Planner.PlannerNode(origState, null, null);
var n = graphStart.getNeighbors();

n.forEach(function(v) { console.log(v);})

console.log("Found neighbors: " + n.length);
// var startD = new Date().getTime();
// var resultD = graphD.searchPath(graphStart);
// var timeD = new Date().getTime() - startD;

// var graphH = new astar.Graph(new Planner.SimpleHeuristic(tar), graphGoal);
// var startH = new Date().getTime();
// var resultH = graphH.searchPath(graphStart);
// var timeH = new Date().getTime() - startH;
// // var heur = new Planner.SimpleHeuristic(tar[0]);
// // console.log("test heuristic")
// // console.log(heur.get(graphStart, null));

// console.log("Dijkstra path length: " + resultD.path.length);
// console.log("Heuristic path length: " + resultH.path.length);

// console.log("Dijkstra visited length: " + resultD.visited.length);
// console.log("Heuristic visited length: " + resultH.visited.length);


// console.log("Dijkstra runtime: " + timeD/1000 + "s");
// console.log("Heuristic runtime: " + timeH/1000 + "s");

// console.log("Dijkstra result: " + resultD.found);
// console.log("Heuristic result: " + resultH.found);
