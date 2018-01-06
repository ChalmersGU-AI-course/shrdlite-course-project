///<reference path="lib/node.d.ts"/>

import {Successor, Graph, SearchResult} from "./Graph";
import {aStarSearch} from "./AStarSearch";
import {Coordinate, GridNode, GridGraph} from "./GridGraph";
import {TestCase, testCases} from "./AStarTestCases";

/********************************************************************************
** test-astar

This is the main file for testing the A* implementation in Graph.ts.
It tests against a 2d grid graph defined in GridGraph.ts, 
and the test cases defined in AStarTestCases.ts

You should not edit this file.
********************************************************************************/


const AStarTimeout = 10; // This is the timeout used when calling the AStar function


// This function chekcs that a solution path is correct, and returns its cost.

function checkPath<Node>(graph: Graph<Node>, startnode: Node, path: Successor<Node>[]) : number | null
{
    function getNeighbor(node: Node, next: Node) : Successor<Node> | null {
        for (var suc of graph.successors(node)) {
            if (graph.compareNodes(next, suc.child) == 0)
                return suc;
        }
        return null;
    }
    if (path.length == 0)
        return null;
    // if (graph.compareNodes(path[0], startnode) !== 0)
    //     path = [startnode].concat(path);
    var cost = 0;
    var node = startnode;
    for (var i = 0; i < path.length; i++) {
        var suc = getNeighbor(node, path[i].child);
        if (!suc) return null;
        node = path[i].child;
        cost += suc.cost;
    }
    return cost;
}


interface TestResult {
    failed : number;
    time   : number;
    nodes  : number;
    calls  : number;
}


// Run one test, with or without using the Manhattan heuristics.

function runTest(testcase: TestCase, useHeuristics: boolean) : TestResult {
    var graph = new GridGraph(testcase.xsize, testcase.ysize, testcase.walls);
    var startnode = new GridNode(0, 0);
    var goalnode = new GridNode(graph.xsize-1, graph.ysize-1);
    var goalpath : Successor<GridNode>[] = [];
    var n = startnode;
    for (var p = 0; p < testcase.path.length; p++) {
        var [x,y] = testcase.path[p];
        var a = (x > n.x ? "R" :
                 x < n.x ? "L" :
                 y > n.y ? "U" :
                 y < n.y ? "D" :
                 "+");
        n = new GridNode(x,y);
        goalpath.push({action: a, child: n, cost: 1});
    }
    var isgoal = (n: GridNode) => graph.compareNodes(n, goalnode) == 0;
    var heuristicsCtr : number;
    function manhattanHeuristics(n: GridNode) : number {
        heuristicsCtr++;
        return Math.abs(n.x - goalnode.x) + Math.abs(n.y - goalnode.y);
    }
    var noHeuristics = (n: GridNode) => 0;
    var h = useHeuristics ? manhattanHeuristics : noHeuristics;

    function showResultPath(pathtitle : string, path : Successor<GridNode>[]) {
        if (path.length > 150) {
            console.log(pathtitle, path.slice(0,145).map((suc) => suc.action).join("") + "..." + path[path.length-1].action);
        } else if (path.length > 30) {
            console.log(pathtitle, path.map((suc) => suc.action).join(""));
        } else {
            console.log(pathtitle, path.map((suc) => suc.action+suc.child).join(" "));
        }
        if (graph.xsize > 30 || graph.ysize > 30) {
            console.log("Grid is too large to show!");
        } else {
            console.log(graph.toString(startnode, isgoal, path));
        }
    }

    heuristicsCtr = 0;
    var startTime = Date.now();
    var result : SearchResult<GridNode> = aStarSearch(graph, startnode, isgoal, h, AStarTimeout);
    var returnvalue : TestResult =
        {failed:1, time:Date.now()-startTime, nodes:result.visited, calls:heuristicsCtr};
    if (result.status !== 'success') {
        console.log((result.status === 'timeout' ? "Timeout! " : "Test failed! ") +
                    "No path found from " + startnode + " to " + goalnode + "!");
        console.log("Expect cost:", testcase.cost);
        showResultPath("Expect path:", goalpath);
        return returnvalue;
    }
    var resultpath = [startnode].concat(result.path.map((suc) => suc.child));
    var cost = checkPath(graph, startnode, result.path);
    if (!cost) {
        console.log("The result is not a correct path!");
        showResultPath("Result path:", result.path);
        return returnvalue;
    }
    if (cost !== result.cost) {
        console.log("The returned cost is not the calculated cost of the path!");
        console.log("Returned cost:", result.cost, "; Calculated cost:", cost);
        showResultPath("Result path:", result.path);
        return returnvalue;
    }
    if (!isgoal(result.path[result.path.length-1].child)) {
        console.log("The result is not a path to the goal!");
        showResultPath("Result path:", result.path);
        return returnvalue;
    }
    if (result.cost !== testcase.cost) {
        console.log("The result is not a path of optimal length from " + startnode + " to " + goalnode + "!");
        console.log("Result cost:", result.cost);
        showResultPath("Result path:", result.path);
        console.log("Expect cost:", testcase.cost);
        showResultPath("Expect path:", goalpath);
        return returnvalue;
    }
    if (result.visited < result.path.length) {
        console.log("The number of visited nodes (" + result.visited + ") " +
                    "is less than the length of the path (" + result.path.length + ") " +
                    "to " + goalnode + "!");
        return returnvalue;
    }

    returnvalue.failed = 0;
    return returnvalue;
}


// Run all tests, colleting and reporting the results.

function runAllTests(argv : string[]) : void {
    var tests : number[] = [];
    if (argv.length == 0) {
        throw "Missing command-line arguments";
    } else if (argv[0] == "all") {
        for (var n = 0; n < testCases.length; n++) tests.push(n);
    } else {
        tests = argv.map((n) => parseInt(n));
    }

    var manhattan = "Manhattan"; var noHeuristics = "ConstZero";
    var allHeuristics = [manhattan, noHeuristics];
    var total : {[h:string]: TestResult} = {};
    for (var heur of allHeuristics) {
        total[heur] = {failed: 0, time: 0, nodes: 0, calls: 0};
    }

    for (var n of tests) {
        var testcase : TestCase = testCases[n];
        console.log("===================================================================================");
        console.log("Test " + n + ": size " + testcase.xsize + "x" + testcase.ysize + ", " +
                    "walls " + testcase.walls.length + ", cost " + testcase.cost);
        console.log();
        var result : {[h:string]: TestResult} = {};
        for (var heur of allHeuristics) {
            result[heur] = runTest(testcase, heur == manhattan);
            total[heur].failed += result[heur].failed;
            total[heur].time   += result[heur].time;
            total[heur].nodes  += result[heur].nodes;
            total[heur].calls  += result[heur].calls;
            console.log(heur + ":  " + (result[heur].failed ? "FAIL" : " ok ") + "  --->  " +
                        "Time: " + result[heur].time/1000 + " s,  " +
                        "Nodes: " + result[heur].nodes + ",  " +
                        "Heuristic calls: " + result[heur].calls);
        }
        console.log();

        if (result[noHeuristics] && result[manhattan]) {
            var timesQ = result[manhattan].time  / result[noHeuristics].time;
            var nodesQ = result[manhattan].nodes / result[noHeuristics].nodes;
            var callsQ = result[manhattan].calls / result[manhattan].nodes;
            console.log("Summary:  " + manhattan + " is " +
                        (timesQ < 0.9 ? Math.round(10/timesQ)/10 + "x faster than " :
                         timesQ > 1.1 ? Math.round(10*timesQ)/10 + "x SLOWER than " :
                         "about as slow as ") + noHeuristics +
                        ".  " + manhattan + " creates " +
                        (nodesQ < 0.9 ? Math.round(10/nodesQ)/10 + "x less nodes than " :
                         nodesQ > 1.1 ? Math.round(10*nodesQ)/10 + "x MORE nodes than " :
                         "about the same number of nodes as ") + noHeuristics +
                        ".  " + manhattan + " heuristic is called " + 
                        (callsQ < 0.9 ? Math.round(10/callsQ)/10 + "x less than" :
                         callsQ > 1.1 ? Math.round(10*callsQ)/10 + "x more than" : "about as often as") +
                        " the number of nodes created."
                       );
            console.log();
        }
    }

    console.log("===================================================================================");
    console.log("== Summary, out of " + tests.length + " tests:");
    console.log();
    for (var heur of allHeuristics) {
        console.log(heur + ":  " + total[heur].failed + " failed,  " +
                    "Time: " + total[heur].time/1000 + " s,  " +
                    "Nodes: " + total[heur].nodes + ",  " +
                    "Heuristic calls: " + total[heur].calls);
    }
    console.log();

    if (total[noHeuristics] && total[manhattan]) {
        var timesQ = total[manhattan].time  / total[noHeuristics].time;
        var nodesQ = total[manhattan].nodes / total[noHeuristics].nodes;
        var callsQ = total[manhattan].calls / total[manhattan].nodes;
        console.log(manhattan + " is " +
                    (timesQ < 0.9 ? Math.round(10/timesQ)/10 + "x faster than " :
                     timesQ > 1.1 ? Math.round(10*timesQ)/10 + "x SLOWER than " :
                     "about as slow as ") + noHeuristics);
        console.log(manhattan + " creates " +
                    (nodesQ < 0.9 ? Math.round(10/nodesQ)/10 + "x less nodes than " :
                     nodesQ > 1.1 ? Math.round(10*nodesQ)/10 + "x MORE nodes than " :
                     "about the same number of nodes as ") + noHeuristics);
        console.log(manhattan + " heuristic is called " + 
                    (callsQ < 0.9 ? Math.round(10/callsQ)/10 + "x less than" :
                     callsQ > 1.1 ? Math.round(10*callsQ)/10 + "x more than" : "about as often as") +
                    " the number of nodes created.");
        console.log();

        if (total[manhattan].failed || total[noHeuristics].failed) {
            console.log("==>  PROBLEM: A* does not find the optimal path in all cases");
        }
        if (timesQ > 1.1) {
            console.log("==>  PROBLEM: " + manhattan + " is " + Math.round(10*timesQ)/10 + "x slower than " + noHeuristics);
        } else if (timesQ >= 0.9) {
            console.log("==>  PROBLEM: " + manhattan + " is not significantly faster than " + noHeuristics);
        }
        if (nodesQ > 1.1) {
            console.log("==>  PROBLEM: " + manhattan + " creates " + Math.round(10*nodesQ)/10 + "x more nodes than " + noHeuristics);
        } else if (nodesQ >= 0.9) {
            console.log("==>  PROBLEM: " + manhattan + " does not create significantly less nodes than " + noHeuristics);
        }
        if (callsQ > 1.5) {
            console.log("==>  PROBLEM: The " + manhattan + " heuristic function is called " + Math.round(10*callsQ)/10 + "x more than the number of nodes created");
        }
        console.log();
    }
}


try {
    runAllTests(process.argv.slice(2));
} catch(err) {
    console.log();
    console.log("ERROR: " + err);
    console.log();
    console.log("Please give at least one argument:");
    console.log("- either a number (0.." + (testCases.length-1) + ") for each test you want to run,");
    console.log("- or 'all' for running all tests.");
    console.log();
} 

