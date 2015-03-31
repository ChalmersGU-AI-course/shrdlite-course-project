/**
 * Created by Niklas on 2015-03-27.
 */
///<reference path="../lib/collections.ts"/>
///<reference path="../lib/lodash.d.ts"/>


module AStar {

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Types

    export class Node  {
        label: string;
        neighbours: Edge[];
        cost:number;
        heuristic:number;
        previous: Node;
        constructor (label : string, neighbours : Edge[],
                     heuristic: number=0, cost:number=Infinity, previous:Node=null) {
            this.label = label;
            this.neighbours = neighbours;
            this.cost = cost;
            this.heuristic = heuristic;
            this.previous = previous;
        }

        // Convenience function for creating many nodes.
        // Sets all neighbour lists to []
        public static createNodes(data : [[string,number]]) : Node[] {
            var nodes = [];
            for (var key in data) {
                nodes.push(new Node(data[key][0], [], data[key][1]));
            }
            return nodes;
        }
    }

    export class Edge {
        start : Node;
        end : Node;
        cost: number;
        constructor (start : Node, end : Node, cost : number) {
            this.start = start;
            this.end   = end;
            this.cost  = cost;
        }

        // Creates a new edge which goes in the opposite direction of this one.
        // If no cost is given, the new edge recieves the same cost as this one
        public complement(cost? : number) : Edge {
            if (!(_.isFinite(cost))) cost = 1;
            return new Edge(this.end, this.start, this.cost);
        }

        // Convenience function for creating many edges
        public static createEdges(data : [[Node,Node,number]]) : Edge[] {
            var edges = [];
            for (var key in data) {
                var e = new Edge(data[key][0], data[key][1], data[key][2]);
                edges.push(e);
            }
            return edges;
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // A* algorithm

    export function astar(s: Node, t : Node, nodes : Node[]) : Node[] {

        /*
        function getBest() : Node {
            // Return Node in todo-list with minimum cost
            return todo.reduce((currMin : Node, v : Node) => {
                var vVal    = v.cost       + v.heuristic;
                var minVal  = currMin.cost + currMin.heuristic;
                return (vVal<=minVal)?v:currMin;
            }, new Node(null,null,null,Infinity));
        }
        */

        var compFunc : collections.ICompareFunction<Node> = function(a:Node, b: Node){
            return (b.cost+b.heuristic)-(a.cost+a.heuristic);
        };

        var frontier : collections.PriorityQueue<Node> = new collections.PriorityQueue<Node>(compFunc);

        frontier.add(s);

        var done     : Node[]   = [];
        // Start node's cost from start node is 0
        s.cost = 0;
        s.previous = null;

        while (!frontier.isEmpty()) {
            var v = frontier.dequeue();

            if(v.label === "f") {
                console.log("nej!"+v.cost+v.heuristic);
                console.log(frontier.peek());
            }

            //TODO the prio queue is never updated when a nodes cost is updated

            // Possibly update neighbours of node we're visiting now
            for (var eKey in v.neighbours) {
                var edge : Edge = v.neighbours[eKey]
                 ,  n    : Node = edge.end;

                // Add to frontier if not already visited
                if (done.indexOf(n) === -1)
                    frontier.add(n);

                // Update if path through v is better
                var newCost = edge.cost + v.cost;
                if (newCost<=n.cost) {
                    n.cost     = newCost;
                    n.previous = v;
                }
            }

            // When we remove t from the frontier, we're done
            if (v === t) {
                frontier.clear();
                console.log("done!"+!frontier.isEmpty());
            } else {
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

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Test cases

    // Creates an example graph and runs AStar on it
    export function testCase1() {

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
        var nodes = [a,b,c,d,e,f,g,h];
        var edges = Edge.createEdges([[a,b,1], [b,c,1], [c,d,1], [a,e,1], [e,d,4], // Right side
                                            [a,f,0.5], [f,g,1], [g,h,1], [h,f,1]]); // Left side

        initGraph(nodes, edges); // Updates node objects to be a proper graph

        console.log("Running astar correctness test ... ");
        var path = astar(a, d, nodes);
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
    function initGraph(nodes : Node[], edges : Edge[]) {
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
