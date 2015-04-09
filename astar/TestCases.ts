///<reference path="../lib/collections.ts"/>
///<reference path="../lib/lodash.d.ts"/>
///<reference path="AStar.ts"/>

module AStarTestCases {
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Test cases

    // Creates an example graph and runs AStar on it
    export function testCase1() {

        // Define graph, with perfect heuristics
        // Right side (should be visited)
        var a = new AStar.Node("a");
        var b = new AStar.Node("b");
        var c = new AStar.Node("c");
        var d = new AStar.Node("d");
        var e = new AStar.Node("e");
        // Left side (should not be visited, due to heuristics)
        var f = new AStar.Node("f");
        var g = new AStar.Node("g");
        var h = new AStar.Node("h");
        var nodes = [a,b,c,d,e,f,g,h];
        var edges = AStar.Edge.createEdges([[a,b,1], [b,c,1], [c,d,1], [a,e,1], [e,d,4], // Right side
            [a,f,0.5], [f,g,1], [g,h,1], [h,f,1]]); // Left side

        initGraph(nodes, edges); // Updates node objects to be a proper graph

        //A simple heuristic function that simply returns the exakt cost of the shortest path of the node
        var heuristic = function(node) {
            if(node.label === "a") return 3
            if(node.label === "b") return 2
            if(node.label === "c") return 1
            if(node.label === "d") return 0
            if(node.label === "e") return 4
            if(node.label === "f") return 3.5
            if(node.label === "g") return 4.5
            if(node.label === "h") return 4.5
        }

        console.log("Running astar correctness test ... ");
        var path = AStar.astar(a, d, nodes, heuristic);
        var correctPath = [a,b,c,d];
        if (!test(arrayEquals(path, correctPath)))
            console.log("nodes: ",nodes);

        console.log("Running astar heuristics test ... ");
        if (!test(g.previous===null && h.previous===null)) {
            console.log("nodes: ",nodes);
            console.log("g.previous:", g.previous);
            console.log("h.previous:", h.previous);
        }

    }

    // Creates an example graph and runs AStar on it
    export function testCase2() {

        // Define graph
        var a = new AStar.Node("a");
        var b = new AStar.Node("b");
        var c = new AStar.Node("c");
        var d = new AStar.Node("d");
        var e = new AStar.Node("e");
        var f = new AStar.Node("f");
        var g = new AStar.Node("g");
        var h = new AStar.Node("h");
        var h = new AStar.Node("i");
        var nodes = [a,b,c,d,e,f,g,h,i];
        var edges = AStar.Edge.createEdges([[a,b,5], [b,c,1], [c,d,1], [d,e,1], 
            [e,f,1], [f,g,1], [g,h,1], [g,c,2], [h,i,1], [a,i,1]);

        initGraph(nodes, edges); // Updates node objects to be a proper graph

        //A simple heuristic function that returns the number of edges from the goal to the given node
        var heuristic = function(node) {
            if(node.label === "a") return 2
            if(node.label === "b") return 1
            if(node.label === "c") return 0
            if(node.label === "d") return 1
            if(node.label === "e") return 2
            if(node.label === "f") return 2
            if(node.label === "g") return 1
            if(node.label === "h") return 2
            if(node.label === "i") return 3
        }

        console.log("Running astar correctness test ... ");
        var path = AStar.astar(a, d, nodes, heuristic);
        var correctPath = [a,i,h,g,c];
        if (!test(arrayEquals(path, correctPath)))
            console.log("nodes: ",nodes);

        console.log("Running astar heuristics test ... ");
        if (!test(d.previous===null && e.previous===null && f.previous===null)) {
            console.log("nodes: ",nodes);
            console.log("d.previous:", d.previous);
            console.log("e.previous:", e.previous);
            console.log("f.previous:", f.previous);
        }

    }

    function test(test: boolean) : boolean {
        console.log(test? "... passed!" : "... FAILED!");
        return test;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Utility functions

    // Creates a graph from a list of blank nodes and edges.
    // More specifically, updates all nodes by adding the neighbour references/costs specified in edges
    function initGraph(nodes : AStar.Node[], edges : AStar.Edge[]) {
        for (var eKey in edges) {
            var e1 = edges[eKey];
            var e2 = e1.complement(); // create opposite edge
            var v1 = e1.start, v2 = e1.end, c = e1.cost;
            v1.neighbours.push(e1);
            v2.neighbours.push(e2);
        }
    }

    // Can't extend prototype in typescript? :(
    //Array.prototype.shallowEquals = ...

    // Compares shallowly if two arrays are equal
    function arrayEquals<T>(first : Array<T>, second : Array<T>) : boolean {
        if (!first || !second)              return false;
        if (first.length !== second.length) return false;

        // Compare all refs in array
        for (var i=0;i<first.length;i++) {
            if (first[i] !== second[i]) return false;
        }
        return true;
    }

    // (Not used)
    function listMinus(a : Object[], b : Object[]) : Object[] {
        var newA = a.slice(0);
        return newA.filter((o) => {
            return b.indexOf(o) !== -1;
        });
    }
}