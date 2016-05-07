///<reference path="lib/node.d.ts"/>

import Dict = collections.Dictionary;
import Set  = collections.BSTree;
import PQ   = collections.PriorityQueue;


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
* A\* search implementation, parameterised by a `Node` type.
*
* @param graph The graph on which to perform A\* search.
* @param start The initial node.
* @param goal A function that returns true when given a goal node. Used to determine if the algorithm has reached the goal.
* @param heuristics The heuristic function. Used to estimate the cost of reaching the goal from a given Node.
* @param timeout Maximum time (in seconds) to spend performing A\* search.
* @returns A search result, which contains the path from `start` to a node satisfying `goal` and the cost of this path.
*/
function aStarSearch<Node> (
    graph      : Graph<Node>,
    start      : Node,
    goal       : (n:Node) => boolean,
    heuristics : (n:Node) => number,
    timeout    : number
) : SearchResult<Node> {
    const cameFrom: Dict<Node, [Node, number]> = new Dict<Node, [Node, number]>(),
          gScore  : Dict<Node, number> = new Dict<Node, number>(),
          fScore  : Dict<Node, number> = new Dict<Node, number>(),
          lowestFScore = (a: Node, b: Node) : number => {
              return fScore.getValue(b) - fScore.getValue(a);
          };

    let visited: Set<Node> = new Set<Node>(graph.compareNodes),
        toVisit: PQ<Node>  = new PQ<Node>(lowestFScore);

    gScore.setValue(start, 0);
    fScore.setValue(start, heuristics(start));
    toVisit.add(start);

    const perfStart = Date.now();
    while ( !toVisit.isEmpty() ) {
        if ((Date.now() - perfStart) / 1000 > timeout) return null;

        const current = toVisit.dequeue();
        if ( goal( current ) ) {
            let path = [current], cost = 0, curr = current;
            while (cameFrom.containsKey(curr)) {
                const [from, ecost] = cameFrom.getValue(curr);
                cost += ecost;
                path.unshift(curr = from);
            }
            return { path, cost };
        }

        for (let {to, cost} of graph.outgoingEdges(current)) {
            const tvc = toVisit.contains(to), currG = gScore.getValue(current);
            if (tvc && (currG + cost < gScore.getValue(to))
            || !tvc && !visited.contains(to)) {
                const toG = gScore.getValue(current) + cost;
                cameFrom.setValue(to, [current, cost]);
                gScore.setValue(to, toG);
                fScore.setValue(to, toG + heuristics(to));
                toVisit.add(to);
            }
        }

        visited.add(current);
    }

    return null;
}