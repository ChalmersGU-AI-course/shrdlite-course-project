/**
 * Created by Niklas on 2015-03-27.
 */
///<reference path="../lib/collections.ts"/>


module AStar {

    export class Node  {
        label: string;
        neighbours: Node[];
        neighbourCosts: number[];
        cost:number;
        previous: Node;
        constructor (label : string, neighbours : Node[], neighbourCosts : number[], cost:number=Infinity,previous:Node=null) {
            this.label = label;
            this.neighbours = neighbours;
            this.neighbourCosts = neighbourCosts;
            this.cost = cost;
            this.previous = previous;
        }
    }

    export function astar(s: Node, t : Node, nodes: Node[]) : Node[] {

        function getBest() : Node {
            // Return Node in todo-list with minimum cost
            return todo.reduce((currMin : Node, n : Node) => {
                console.log("reducing...");
                return (n.cost<=currMin.cost)?n:currMin;
            }, new Node(null,null,null,Infinity));
        }

        var todo     : Node[]   = [s]
          , done     : Node[]   = []
//          , distance : number[] = []
//          , previous : Node[]   = []
          ;

        while (todo.length > 0) {
            var v = getBest();
            console.log("-- now processing ",v.label);

            for (var nKey in v.neighbours) {
                var n = v.neighbours[nKey];
                console.log("neighbour:",n);

                // Add to todo if not already visited
                if (done.indexOf(n) === -1) {
                    console.log("adding neighbour to todo");
                    todo.push(n);
                    console.log("todo now:",todo);
                }


                // Update neighbour if the path through v is better
                var newCost = v.neighbourCosts[nKey] + v.cost;
                if (newCost<=n.cost) {
                    console.log("update cost");
                    n.cost     = newCost;
                    n.previous = v;
                }
            }

            // Mark node v as visited
            todo.splice(todo.indexOf(v),1);
            done.push(v);
            console.log("todo now:", todo);

            console.log("-- end processing ",v.label);
        }

        console.log("done???",nodes);

        // Retrieve path
        var path = [];
        var v = t;
        while (v.previous !== s) {
            path.unshift(v);
            v = v.previous;
        }
        path.unshift(s);
        return path;
    }


    export function testGraph() {

        var a = new Node("a", [], []);
        var b = new Node("b", [], []);
        var c = new Node("c", [], []);
        var d = new Node("d", [], []);
        var e = new Node("e", [], []);

        var edges : [[Node,Node,number]] = [[a,b,1], [b,c,1], [c,d,1], [a,e,1], [e,d,4]];

        var nodes = [a,b,c,d,e];
        updateNodes(nodes, edges);
        console.log(nodes);

        var path = astar(a, d, nodes);
        console.log(path);

    }

    function updateNodes(nodes : Node[], edges : [[Node,Node,number]]) {
        for (var eKey in edges) {
            var e = edges[eKey];
            var v1 = e[0], v2 = e[1], c = e[2];
            v1.neighbours.push(v2);
            v2.neighbours.push(v1);
            v1.neighbourCosts.push(c);
            v2.neighbourCosts.push(c);
        }
    }


    function listMinus(a : Object[], b : Object[]) : Object[] {
        var newA = a.slice(0);
        return newA.filter((o) => {
            return b.indexOf(o) !== -1;
        });
    }


}