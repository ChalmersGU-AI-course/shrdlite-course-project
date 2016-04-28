///<reference path="lib/collections.ts"/>
///<reference path="lib/node.d.ts"/>

/** Graph module
*
*  Types for generic A\* implementation.
*
*  *NB.* The only part of this module
*  that you should change is the `aStarSearch` function. Everything
*  else should be used as-is.
*/

/** An edge in a graph. */
class Edge<Node> {
    from : Node;
    to   : Node;
    cost : number;
}

/** A directed graph. */
interface Graph<Node> {
    /** Computes the edges that leave from a node. */
    outgoingEdges(node : Node) : Edge<Node>[];
    /** A function that compares nodes. */
    compareNodes : collections.ICompareFunction<Node>;
}

/** Type that reports the result of a search. */
class SearchResult<Node> {
    /** The path (sequence of Nodes) found by the search algorithm. */
    path : Node[];
    /** The total cost of the path. */
    cost : number;
}

/**
* A\* search implementation, parameterised by a `Node` type. The code
* here is just a template; you should rewrite this function
* entirely. In this template, the code produces a dummy search result
* which just picks the first possible neighbour.
*
* Note that you should not change the API (type) of this function,
* only its body.
* @param graph The graph on which to perform A\* search.
* @param start The initial node.
* @param goal A function that returns true when given a goal node. Used to determine if the algorithm has reached the goal.
* @param heuristics The heuristic function. Used to estimate the cost of reaching the goal from a given Node.
* @param timeout Maximum time (in seconds) to spend performing A\* search.
* @returns A search result, which contains the path from `start` to a node satisfying `goal` and the cost of this path.
*/
function aStarSearch<Node> (
    graph : Graph<Node>,
    start : Node,
    goal : (n:Node) => boolean,
    heuristics : (n:Node) => number,
    timeout : number
) : SearchResult<Node> {
    // A dummy search result: it just picks the first possible neighbour
    var result : SearchResult<Node> = {
        path: [],
        cost: 0
    };

    // Set up data structures
    var visited = new collections.Set<Node>();
    var cost = new collections.Dictionary<Node, number>();
    var predecessor = new collections.Dictionary<Node, Node>();
    var costFromPre = new collections.Dictionary<Node, number>();
    var frontier = new collections.Heap<Node>(
        function(n1: Node, n2: Node): number {
            var cost1 = cost.getValue(n1) + heuristics(n1);
            var cost2 = cost.getValue(n2) + heuristics(n2);
            if (cost1 < cost2) return -1;
            if (cost1 == cost2) return 0;
            return 1;
        }
    );

    // Add start node to frontier
    cost.setValue(start, 0);
    frontier.add(start);

    var endTime = Date.now() + timeout * 1000;

    while(!frontier.isEmpty()){
        if(Date.now() >= endTime){
            break;
        }

        var current = frontier.removeRoot();
        //frontier might contain nodes already visited since it cannot be updated once a shorter path has been found
        if(visited.contains(current)){
            continue;
        }
        visited.add(current);

        if(goal(current)){
            //console.log("Met goal");
            // reconstruct path
            var cr : Node;
            cr = current;
            while(cr != start){
                result.path.unshift(cr);
                result.cost += costFromPre.getValue(cr);
                cr = predecessor.getValue(cr);
            }
            result.path.unshift(start);
        }

        var costOfCurrent = cost.getValue(current);
        for(var edge of graph.outgoingEdges(current)){
            var neighbour = edge.to;
            if(visited.contains(neighbour)){
                continue;
            }

            var costTillNeighbour = costOfCurrent + edge.cost;
            if(!cost.containsKey(neighbour)){
                // This is a new node
                //console.log("adding " + neighbour.toString());
                cost.setValue(neighbour, costTillNeighbour);
                frontier.add(neighbour);
            } else if(costTillNeighbour >= cost.getValue(neighbour)) {
                continue;
            } else {
                cost.setValue(neighbour, costTillNeighbour);
            }
            predecessor.setValue(neighbour, current);
            costFromPre.setValue(neighbour, edge.cost);
        }
    }
    return result;
}
