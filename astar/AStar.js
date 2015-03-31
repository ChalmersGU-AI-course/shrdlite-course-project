/**
 * Created by Niklas on 2015-03-27.
 */
///<reference path="../lib/collections.ts"/>
///<reference path="../lib/lodash.d.ts"/>
var AStar;
(function (AStar) {
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Types
    var Node = (function () {
        function Node(label, neighbours, heuristic, cost, previous) {
            if (heuristic === void 0) { heuristic = 0; }
            if (cost === void 0) { cost = Infinity; }
            if (previous === void 0) { previous = null; }
            this.label = label;
            this.neighbours = neighbours;
            this.cost = cost;
            this.heuristic = heuristic;
            this.previous = previous;
        }
        // Convenience function for creating many nodes.
        // Sets all neighbour lists to []
        Node.createNodes = function (data) {
            var nodes = [];
            for (var key in data) {
                nodes.push(new Node(data[key][0], [], data[key][1]));
            }
            return nodes;
        };
        return Node;
    })();
    AStar.Node = Node;
    var Edge = (function () {
        function Edge(start, end, cost) {
            this.start = start;
            this.end = end;
            this.cost = cost;
        }
        // Creates a new edge which goes in the opposite direction of this one.
        // If no cost is given, the new edge recieves the same cost as this one
        Edge.prototype.complement = function (cost) {
            if (!(_.isFinite(cost)))
                cost = 1;
            return new Edge(this.end, this.start, this.cost);
        };
        // Convenience function for creating many edges
        Edge.createEdges = function (data) {
            var edges = [];
            for (var key in data) {
                var e = new Edge(data[key][0], data[key][1], data[key][2]);
                edges.push(e);
            }
            return edges;
        };
        return Edge;
    })();
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // A* algorithm
    function astar(s, t, nodes) {
        function getBest() {
            // Return Node in todo-list with minimum cost
            return todo.reduce(function (currMin, v) {
                var vVal = v.cost + v.heuristic;
                var minVal = currMin.cost + currMin.heuristic;
                return (vVal <= minVal) ? v : currMin;
            }, new Node(null, null, null, Infinity));
        }
        var todo = [s], done = [];
        // Start node's cost from start node is 0
        s.cost = 0;
        s.previous = null;
        while (todo.length > 0) {
            var v = getBest();
            for (var eKey in v.neighbours) {
                var edge = v.neighbours[eKey], n = edge.end;
                // Add to todo if not already visited
                if (done.indexOf(n) === -1)
                    todo.push(n);
                // Update if path through v is better
                var newCost = edge.cost + v.cost;
                if (newCost <= n.cost) {
                    n.cost = newCost;
                    n.previous = v;
                }
            }
            // When we remove t from the frontier, we're done
            if (v === t) {
                todo = [];
            }
            else {
                // Mark node v as visited
                todo.splice(todo.indexOf(v), 1);
                done.push(v);
            }
        }
        // Retrieve path
        var path = [];
        var v = t;
        while (v !== s) {
            path.unshift(v);
            if (!v.previous) {
                console.log(v);
            }
            v = v.previous;
        }
        path.unshift(s);
        return path;
    }
    AStar.astar = astar;
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Test cases
    // Creates an example graph and runs AStar on it
    function testCase1() {
        // Define graph, with perfect heuristics
        // Right side (should be visited)
        var a = new Node("a", [], 3);
        var b = new Node("b", [], 2);
        var c = new Node("c", [], 1);
        var d = new Node("d", [], 0);
        var e = new Node("e", [], 4);
        // Left side (should not be visited, due to heuristics)
        var f = new Node("f", [], 3.5);
        var g = new Node("g", [], 4.5);
        var h = new Node("h", [], 4.5);
        var nodes = [a, b, c, d, e, f, g, h];
        var edges = Edge.createEdges([[a, b, 1], [b, c, 1], [c, d, 1], [a, e, 1], [e, d, 4], [a, f, 0.5], [f, g, 1], [g, h, 1], [h, f, 1]]); // Left side
        initGraph(nodes, edges); // Updates node objects to be a proper graph
        console.log("Running astar correctness test ... ");
        var path = astar(a, d, nodes);
        var correctPath = [a, b, c, d];
        if (!test(arrayEquals(path, correctPath)))
            console.log("nodes: ", nodes);
        console.log("Running astar heuristics test ... ");
        if (!test(g.previous === null && h.previous === null)) {
            console.log("nodes: ", nodes);
            console.log("g.previous:", g.previous);
            console.log("h.previous:", h.previous);
        }
    }
    AStar.testCase1 = testCase1;
    function test(test) {
        console.log(test ? "... passed!" : "... FAILED!");
        return test;
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Utility functions
    // Creates a graph from a list of blank nodes and edges.
    // More specifically, updates all nodes by adding the neighbour references/costs specified in edges
    function initGraph(nodes, edges) {
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
    function arrayEquals(first, second) {
        if (!first || !second)
            return false;
        if (first.length !== second.length)
            return false;
        for (var i = 0; i < first.length; i++) {
            if (first[i] !== second[i])
                return false;
        }
        return true;
    }
    // (Not used)
    function listMinus(a, b) {
        var newA = a.slice(0);
        return newA.filter(function (o) {
            return b.indexOf(o) !== -1;
        });
    }
})(AStar || (AStar = {}));
//# sourceMappingURL=AStar.js.map