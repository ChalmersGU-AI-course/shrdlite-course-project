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

import forEach = collections.arrays.forEach;
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
    iterations: number;
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

    var startTime = Date.now();

    var mheuristicMap = new collections.Dictionary<Node,number>();

    var mheuristics = function(n:Node) {
        var res = mheuristicMap.getValue(n);
        if(res !== undefined){
            return res;
        } else {
            res = heuristics(n);
            mheuristicMap.setValue(n, res);
            return res;
        }
    };

    var closedSet = new collections.Set<Node>();

    var openSetP = new collections.PriorityQueue((n1:Node, n2:Node) => {
        return lookupWithDefaultInfinity(n2, fScore) - lookupWithDefaultInfinity(n1, fScore);
    });

    openSetP.add(start);
    var cameFrom = new collections.Dictionary<Node,Node>();
    var gScore = new collections.Dictionary<Node, number>();
    gScore.setValue(start, 0);
    var fScore = new collections.Dictionary<Node, number>();
    fScore.setValue(start, mheuristics(start));
    var count = 0;

    function updateScores(neighbor:Node, tentativeScore:number) : void {
        gScore.setValue(neighbor, tentativeScore);
        fScore.setValue(neighbor, gScore.getValue(neighbor) + mheuristics(neighbor));
    }

    while (!openSetP.isEmpty()){
        count++;
        var current = openSetP.dequeue();

        if(goal(current)){
            return {
                path: reconstructPath(cameFrom, current).reverse(),
                cost: gScore.getValue(current),
                iterations: count,
            };
        }

        closedSet.add(current);

        var outgoing = graph.outgoingEdges(current);

        for (var ei in outgoing){
            var e = outgoing[ei];
            var neighbor = e.to;
            if(closedSet.contains(neighbor)){
                continue;
            }

            var tentativeScore = lookupWithDefaultInfinity(current, gScore) + e.cost;
            if (!openSetP.contains(neighbor)){
                updateScores(neighbor, tentativeScore);
                openSetP.add(neighbor);
            } else if (tentativeScore >= lookupWithDefaultInfinity(neighbor, gScore)){
                continue;
            } else {
                updateScores(neighbor, tentativeScore);
            }

            cameFrom.setValue(neighbor, current);
        }

        var now = Date.now();

        if(now - startTime > (timeout*1000)){
            throw "Timeout reached";
        }

    }

    throw "No path found";
}



function reconstructPath<Node>(cameFrom: collections.Dictionary<Node, Node>, current: Node) : Node[] {
    var totalPath = [current];
    while(cameFrom.containsKey(current)){
        current = cameFrom.getValue(current);
        totalPath.push(current);
    }
    return totalPath;
}

function findLowestScore<Node>(
    nodes: collections.Set<Node>,
    map: collections.Dictionary<Node, number>
) : Node {

    var startAcc : NodeValueAcc<Node> = {
        value: Infinity,
        node: undefined
    };
    var nodeArray = nodes.toArray();
    var res = nodeArray.reduce(function(acc, curr) {
        var currVal = lookupWithDefaultInfinity(curr, map);
        if(!acc.node || currVal < acc.value){
            acc.node = curr;
            acc.value = currVal;
        }
        return acc;
    }, startAcc);

    return res.node;

}

function lookupWithDefault<Node>(
    key: Node,
    map: collections.Dictionary<Node, number>,
    def: number
): number {
    var res = map.getValue(key);
    //console.log("Map: ", map, "Key: ", key, "res: ", res);
    if (res !== undefined) {
        return res;
    } else {
        return def;
    }
}

function lookupWithDefaultInfinity<Node>(key: Node, map: collections.Dictionary<Node, number>) : number {
    return lookupWithDefault(key, map, Infinity)
}

interface NodeValueAcc<Node> {
    value: number; 
    node: Node;
}

