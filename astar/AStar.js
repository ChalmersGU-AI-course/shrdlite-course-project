/**
 * Created by Niklas on 2015-03-27.
 */
///<reference path="../lib/collections.ts"/>
var AStar;
(function (AStar) {
    var Node = (function () {
        function Node(label, neighbours, neighbourCosts, heuristic, cost, previous) {
            if (heuristic === void 0) { heuristic = 0; }
            if (cost === void 0) { cost = Infinity; }
            if (previous === void 0) { previous = null; }
            this.label = label;
            this.neighbours = neighbours;
            this.neighbourCosts = neighbourCosts;
            this.cost = cost;
            this.heuristic = heuristic;
            this.previous = previous;
        }
        return Node;
    })();
    AStar.Node = Node;
    var Edge = (function () {
        function Edge(start, end) {
            this.start = start;
            this.end = end;
        }
        return Edge;
    })();
    function astar(s, t) {
        function getBest() {
            return todo.reduce(function (currMin, v) {
                var vVal = v.cost + v.heuristic;
                var minVal = currMin.cost + currMin.heuristic;
                if (v.label === "g" || v.label === "h") {
                    console.log("checking if to return ", v.label);
                    console.log("cost:", v.cost, "heuristic:", v.heuristic, "vVal:", vVal, "minVal:", minVal);
                }
                return (vVal <= minVal) ? v : currMin;
            }, new Node(null, null, null, Infinity));
        }
        var todo = [
            s
        ], done = [];
        s.cost = 0;
        s.previous = null;
        while (todo.length > 0) {
            var v = getBest();
            for (var nKey in v.neighbours) {
                var n = v.neighbours[nKey];
                if (done.indexOf(n) === -1)
                    todo.push(n);
                var newCost = v.neighbourCosts[nKey] + v.cost;
                if (newCost <= n.cost) {
                    n.cost = newCost;
                    n.previous = v;
                }
            }
            if (v === t) {
                todo = [];
            }
            else {
                todo.splice(todo.indexOf(v), 1);
                done.push(v);
            }
        }
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
    function testCase1() {
        var a = new Node("a", [], [], 3);
        var b = new Node("b", [], [], 2);
        var c = new Node("c", [], [], 1);
        var d = new Node("d", [], [], 0);
        var e = new Node("e", [], [], 4);
        var f = new Node("f", [], [], 3.5);
        var g = new Node("g", [], [], 4.5);
        var h = new Node("h", [], [], 4.5);
        var nodes = [
            a,
            b,
            c,
            d,
            e
        ];
        var edges = [
            [
                a,
                b,
                1
            ],
            [
                b,
                c,
                1
            ],
            [
                c,
                d,
                1
            ],
            [
                a,
                e,
                1
            ],
            [
                e,
                d,
                4
            ],
            [
                a,
                f,
                0.5
            ],
            [
                f,
                g,
                1
            ],
            [
                g,
                h,
                1
            ],
            [
                h,
                f,
                1
            ]
        ];
        initGraph(nodes, edges);
        console.log("Running astar correctness test ... ");
        var path = astar(a, d);
        var correctPath = [
            a,
            b,
            c,
            d
        ];
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
    function listMinus(a, b) {
        var newA = a.slice(0);
        return newA.filter(function (o) {
            return b.indexOf(o) !== -1;
        });
    }
})(AStar || (AStar = {}));
