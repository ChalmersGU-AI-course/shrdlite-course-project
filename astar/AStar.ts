/**
 * Created by Niklas on 2015-03-27.
 */
///<reference path="../lib/collections.ts"/>


module AStar {

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Types

    export class Node  {
        label: string;
        neighbours: Node[];
        neighbourCosts: number[];
        cost:number;
        heuristic:number;
        previous: Node;
        constructor (label : string, neighbours : Node[], neighbourCosts : number[],
                     heuristic: number=0, cost:number=Infinity, previous:Node=null) {
            this.label = label;
            this.neighbours = neighbours;
            this.neighbourCosts = neighbourCosts;
            this.cost = cost;
            this.heuristic = heuristic;
            this.previous = previous;
        }
    }

    class Edge {
        start : Node;
        end : Node;
        constructor (start : Node, end : Node) {
            this.start = start;
            this.end = end;
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // A* algorithm

    export function astar(s: Node, t : Node) : Node[] {

        function getBest() : Node {
            // Return Node in todo-list with minimum cost
            return todo.reduce((currMin : Node, v : Node) => {
                var vVal    = v.cost       + v.heuristic;
                var minVal  = currMin.cost + currMin.heuristic;
                if (v.label === "g" || v.label === "h") {
                    console.log("checking if to return ",v.label);
                    console.log("cost:",v.cost,"heuristic:",v.heuristic,"vVal:",vVal,"minVal:",minVal);
                }
                return (vVal<=minVal)?v:currMin;
            }, new Node(null,null,null,Infinity));
        }

        var todo     : Node[]   = [s]
          , done     : Node[]   = []
          ;
        // Start node's cost from start node is 0
        s.cost = 0;
        s.previous = null;

        while (todo.length > 0) {
            var v = getBest();

            // Possibly update neighbours of node we're visiting now
            for (var nKey in v.neighbours) {
                var n = v.neighbours[nKey];

                // Add to todo if not already visited
                if (done.indexOf(n) === -1)
                    todo.push(n);

                // Update if path through v is better
                var newCost = v.neighbourCosts[nKey] + v.cost;
                if (newCost<=n.cost) {
                    n.cost     = newCost;
                    n.previous = v;
                }
            }

            // When we remove t from the frontier, we're done
            if (v === t) {
                todo = [];
            } else {
                // Mark node v as visited
                todo.splice(todo.indexOf(v),1);
                done.push(v);
            }

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

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Test cases

    // Creates an example graph and runs AStar on it
    export function testCase1() {

        // Define graph, with perfect heuristics
        // Right side (should be visited)
        var a = new Node("a", [], [], 3);
        var b = new Node("b", [], [], 2);
        var c = new Node("c", [], [], 1);
        var d = new Node("d", [], [], 0);
        var e = new Node("e", [], [], 4);
        // Left side (should not be visited, due to heuristics)
        var f = new Node("f", [], [], 3.5);
        var g = new Node("g", [], [], 4.5);
        var h = new Node("h", [], [], 4.5);
        var nodes = [a,b,c,d,e];
        var edges : [[Node,Node,number]] = [[a,b,1], [b,c,1], [c,d,1], [a,e,1], [e,d,4], // Right side
                                            [a,f,0.5], [f,g,1], [g,h,1], [h,f,1]]; // Left side

        initGraph(nodes, edges); // Updates node objects to be a proper graph

        console.log("Running astar correctness test ... ");
        var path = astar(a, d);
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

    function test(test: boolean) : boolean {
        console.log(test? "... passed!" : "... FAILED!");
        return test;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Utility functions

    // Creates a graph from a list of blank nodes and edges.
    // More specifically, updates all nodes by adding the neighbour references/costs specified in edges
    function initGraph(nodes : Node[], edges : [[Node,Node,number]]) {
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
