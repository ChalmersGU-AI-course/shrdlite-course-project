///<reference path="lib/node.d.ts"/>

import {Edge, Graph, SearchResult, aStarSearch} from "./Graph";
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

function checkPath<Node>(graph: Graph<Node>, startnode: Node, path: Node[]) : number | null
{
    function getNeighbor(node: Node, next: Node) : Edge<Node> | null {
        for (var edge of graph.outgoingEdges(node)) {
            if (graph.compareNodes(next, edge.to) == 0)
                return edge;
        }
        return null;
    }
    if (path.length == 0)
        return null;
    if (graph.compareNodes(path[0], startnode) !== 0)
        path = [startnode].concat(path);
    var cost = 0;
    for (var i = 1; i < path.length; i++) {
        var edge = getNeighbor(path[i-1], path[i]);
        if (!edge) return null;
        cost += edge.cost;
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
    var goalpath = testcase.path.map(([x,y]) => new GridNode(x,y));
    var isgoal = (n: GridNode) => graph.compareNodes(n, goalnode) == 0;
    var heuristicsCtr : number;
    function manhattanHeuristics(n: GridNode) : number {
        heuristicsCtr++;
        return Math.abs(n.x - goalnode.x) + Math.abs(n.y - goalnode.y);
    }
    var noHeuristics = (n: GridNode) => 0;
    var h = useHeuristics ? manhattanHeuristics : noHeuristics;

    function showResultPath(pathtitle : string, path : GridNode[]) {
        if (path.length > 30) {
            console.log(pathtitle, path.slice(0,25).join(" ") + " ... " + path[path.length-1]);
        } else {
            console.log(pathtitle, path.join(" "));
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
        {failed:1, time:Date.now()-startTime, nodes:result.frontier+result.visited, calls:heuristicsCtr};
    if (!result.path) {
        console.log((result.timeout ? "Timeout! " : "Test failed! ") +
                    "No path found from " + startnode + " to " + goalnode + "!");
        console.log("Expected cost:", testcase.cost);
        showResultPath("Expected path:", goalpath);
        return returnvalue;
    }
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
    if (!isgoal(result.path[result.path.length-1])) {
        console.log("The result is not a path to the goal!");
        showResultPath("Result path:", result.path);
        return returnvalue;
    }
    if (result.cost !== testcase.cost) {
        console.log("The result is not a path of optimal length from " + startnode + " to " + goalnode + "!");
        console.log("Result cost:", result.cost);
        showResultPath("Result path:", result.path);
        console.log("Expected cost:", testcase.cost);
        showResultPath("Expected path:", goalpath);
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
            var faster = Math.round(100.0 * (result[noHeuristics].time - result[manhattan].time) / result[noHeuristics].time);
            var lessNodes = Math.round(100.0 * (result[noHeuristics].nodes - result[manhattan].nodes) / result[noHeuristics].nodes);
            var lessCalls = Math.round(100.0 * (result[manhattan].nodes - result[manhattan].calls) / result[manhattan].nodes);
            console.log(manhattan + ":  " +
                        Math.abs(faster) + (faster >= 0 ? "% faster" : "% SLOWER") + ",  " +
                        "creates " + Math.abs(lessNodes) + (lessNodes >= 0 ? "% less" : "% MORE") + " nodes,  " +
                        "heuristic is called " + Math.abs(lessCalls) + (lessCalls >= 0 ? "% less" : "% MORE") +
                        " than the number of nodes created"
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
        var faster = Math.round(100.0 * (total[noHeuristics].time - total[manhattan].time) / total[noHeuristics].time);
        var lessNodes = Math.round(100.0 * (total[noHeuristics].nodes - total[manhattan].nodes) / total[noHeuristics].nodes);
        var lessCalls = Math.round(100.0 * (total[manhattan].nodes - total[manhattan].calls) / total[manhattan].nodes);
        console.log(manhattan + ":  " +
                    Math.abs(faster) + (faster >= 0 ? "% faster" : "% SLOWER") + ",  " +
                    "creates " + Math.abs(lessNodes) + (lessNodes >= 0 ? "% less" : "% MORE") + " nodes,  " +
                    "heuristic is called " + Math.abs(lessCalls) + (lessCalls >= 0 ? "% less" : "% MORE") +
                    " than the number of nodes created"
                   );
        console.log();

        if (total[manhattan].failed || total[noHeuristics].failed) {
            console.log("==>  PROBLEM: A* does not find the optimal path in all cases");
        }
        if (faster < 0) {
            console.log("==>  PROBLEM: Manhattan is " + (-faster) + "% slower");
        } else if (faster < 15) {
            console.log("==>  PROBLEM: Manhattan is only " + faster + "% faster");
        }
        if (lessNodes < 0) {
            console.log("==>  PROBLEM: Manhattan creates " + (-lessNodes) + "% more nodes");
        }
        if (lessCalls < 0) {
            console.log("==>  PROBLEM: The heuristic function is called " + (-lessCalls) + "% more than the number of nodes created");
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

