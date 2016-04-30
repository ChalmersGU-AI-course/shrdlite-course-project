///<reference path="lib/collections.ts"/>
///<reference path="lib/node.d.ts"/>
///<reference path="Graph.ts"/>
///<reference path="GridGraph.ts"/>

var fs = require('fs');

interface TestCase {
    grid_size : number;
    walls : Coordinate[];
    path : GridNode[];
    cost : number
}


function checkPath<Node>(graph: Graph<Node>, startnode: Node, path: Node[]) : number
{
    function getNeighbor(node: Node, next: Node) : Edge<Node> {
        for (var edge of graph.outgoingEdges(node)) {
            if (graph.compareNodes(next, edge.to) == 0)
                return edge;
        }
        return;
    }
    if (path.length == 0)
        return;
    if (graph.compareNodes(path[0], startnode) !== 0)
        path = [startnode].concat(path);
    var cost = 0;
    for (var i = 1; i < path.length; i++) {
        var edge = getNeighbor(path[i-1], path[i]);
        if (!edge) return undefined;
        cost += edge.cost;
    }
    return cost;
}


function runTest(c: TestCase, useHeuristics: boolean) : boolean {
    var graph = new GridGraph({x:c.grid_size, y:c.grid_size}, c.walls);
    var startnode = new GridNode({x: 0, y: 0});
    var goalnode = new GridNode({x: graph.size.x-1, y: graph.size.y-1});
    var isgoal = (n: GridNode) => graph.compareNodes(n, goalnode) == 0;
    var h = (n: GridNode) => 0;
    if (useHeuristics) {
        h = (n: GridNode) => Math.abs(n.pos.x - goalnode.pos.x) + Math.abs(n.pos.y - goalnode.pos.y);
    }

    try {
        var result = aStarSearch(graph, startnode, isgoal, h, 10);
        var cost = checkPath(graph, startnode, result.path);
        if (!cost) {
            console.log("The result is not a correct path!");
            console.log("Result: " + result.path);
            console.log(graph.toString(startnode, isgoal, result.path));
            return false;
        }
        if (cost !== result.cost) {
            console.log("The returned cost is not the correct cost of the path!");
            console.log("Result: " + result.path);
            console.log("Returned cost: " + result.cost + ", Correct cost: " + cost);
            console.log(graph.toString(startnode, isgoal, result.path));
            return false
        }
        if (!isgoal(result.path[result.path.length-1])) {
            console.log("The result is not a path to the goal!");
            console.log("Result: " + result.path);
            console.log(graph.toString(startnode, isgoal, result.path));
            return false
        }
        if (result.cost !== c.cost) {
            console.log("The result is not a path of optimal length from " + startnode + " to " + goalnode + "!");
            console.log("Result: " + result.path);
            console.log("Cost:   " + result.cost);
            console.log(graph.toString(startnode, isgoal, result.path));
            var goalpath : GridNode[] = c.path.map((i) => new GridNode(i.pos));
            console.log("Expected path: " + goalpath);
            console.log("Expected cost: " + c.cost);
            console.log(graph.toString(startnode, isgoal, goalpath));
            return false;
        }

    } catch (e) {
        console.log("Test failed! No path found from " + startnode + " to " + goalnode + "!");
        var goalpath : GridNode[] = c.path.map((i) => new GridNode(i.pos));
        console.log("Expected path: " + goalpath);
        console.log("Expected cost: " + c.cost);
        console.log(graph.toString(startnode, isgoal, goalpath));
        return false;
    }

    return true;
}


function runAllTests(argv : string[]) : void {
    var cases : TestCase[] = <TestCase[]>JSON.parse(fs.readFileSync('aStarTestCases.json','utf8'));
    var tests : number[] = [];
    if (argv[0] == "all") {
        for (var n = 0; n < cases.length; n++) tests.push(n);
    } else {
        tests = argv.map((n) => parseInt(n));
    }
    var manhattanTime = 0, noHeuristicsTime = 0;
    for (var manhattan of [true, false]) {
        console.log("===================================================================================");
        console.log("===== Running " + tests.length + " tests with " + (manhattan ? "Manhattan" : "no") + " heuristics");
        console.log();
        var totalTime = 0;
        var failed = 0;
        for (var n of tests) {
            var c : TestCase = cases[n];
            console.log("Test " + n + ": size " + c.grid_size + ", walls " + c.walls.length + ", cost " + c.cost);
            var time = -Date.now();
            var success = runTest(c, manhattan);
            time += Date.now();
            totalTime += time;
            if (success) {
                console.log("    OK ---> Time: " + time + " ms");
            } else {
                failed++;
                console.log("    FAILURE ---> Time: " + time + " ms");
                console.log("\n===================================================================================\n");
            }
        }
        console.log("\nSummary: " + failed + " tests failed out of " + tests.length);
        console.log("Total time: " + (totalTime/1000) + " s");
        console.log();
        if (failed)
            return;
        if (manhattan) manhattanTime = totalTime
        else noHeuristicsTime = totalTime;
    }
    console.log("===================================================================================");
    var faster = Math.round(100.0 * (noHeuristicsTime - manhattanTime) / noHeuristicsTime);
    console.log("Manhattan is " + faster + "% faster than using no heuristics");
    if (faster < 10) {
        console.log("\n    HEURISTICS PROBLEM! Manhattan should be much faster than using no heuristics");
    }
    console.log();
}


if (process.argv.length > 2) {
    runAllTests(process.argv.slice(2));
} else {
    console.log("Please give at least one argument:");
    console.log("- either a number>=0 for each test you want to run,");
    console.log("- or 'all' for running all tests.");
} 
