/**
 * Created by Niklas on 2015-03-27.
 */
///<reference path="../lib/collections.ts"/>
var AStar;
(function (AStar) {
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Types
    var Node = (function () {
        function Node(label, neighbours, neighbourCosts, cost, previous) {
            if (cost === void 0) { cost = Infinity; }
            if (previous === void 0) { previous = null; }
            this.label = label;
            this.neighbours = neighbours;
            this.neighbourCosts = neighbourCosts;
            this.cost = cost;
            this.previous = previous;
        }
        return Node;
    })();
    AStar.Node = Node;
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // A* algorithm
    function astar(s, t) {
        function getBest() {
            // Return Node in todo-list with minimum cost
            return todo.reduce(function (currMin, n) {
                return (n.cost <= currMin.cost) ? n : currMin;
            }, new Node(null, null, null, Infinity));
        }
        var todo = [s], done = [];
        // Start node's cost from start node is 0
        s.cost = 0;
        s.previous = null;
        while (todo.length > 0) {
            var v = getBest();
            for (var nKey in v.neighbours) {
                var n = v.neighbours[nKey];
                // Add to todo if not already visited
                if (done.indexOf(n) === -1)
                    todo.push(n);
                // Update if path through v is better
                var newCost = v.neighbourCosts[nKey] + v.cost;
                if (newCost <= n.cost) {
                    n.cost = newCost;
                    n.previous = v;
                }
            }
            // Mark node v as visited
            todo.splice(todo.indexOf(v), 1);
            done.push(v);
        }
        // Retrieve path
        var path = [];
        var v = t;
        while (v !== s) {
            path.unshift(v);
            v = v.previous;
        }
        path.unshift(s);
        return path;
    }
    AStar.astar = astar;
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Test cases
    // Creates an example graph and runs AStar on it
    function testGraph() {
        // Define graph
        var a = new Node("a", [], []);
        var b = new Node("b", [], []);
        var c = new Node("c", [], []);
        var d = new Node("d", [], []);
        var e = new Node("e", [], []);
        var nodes = [a, b, c, d, e];
        var edges = [[a, b, 1], [b, c, 1], [c, d, 1], [a, e, 1], [e, d, 4]];
        initGraph(nodes, edges); // Updates node objects to be a proper graph
        console.log("Running astar test ... ");
        var path = astar(a, d);
        var correctPath = [a, b, c, d];
        console.log(arrayEquals(path, correctPath) ? "... passed!" : "... FAILED!");
    }
    AStar.testGraph = testGraph;
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Utility functions
    // Creates a graph from a list of blank nodes and edges.
    // More specifically, updates all nodes by adding the neighbour references/costs specified in edges
    function initGraph(nodes, edges) {
        for (var eKey in edges) {
            var e = edges[eKey];
            var v1 = e[0], v2 = e[1], c = e[2];
            v1.neighbours.push(v2);
            v2.neighbours.push(v1);
            v1.neighbourCosts.push(c);
            v2.neighbourCosts.push(c);
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