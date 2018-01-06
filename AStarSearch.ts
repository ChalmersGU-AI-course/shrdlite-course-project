
import {Successor, Graph, SearchResult} from "./Graph";

// You might want to use one of these:
import Set from "./lib/typescript-collections/src/lib/Set";
import Dictionary from "./lib/typescript-collections/src/lib/Dictionary";
import PriorityQueue from "./lib/typescript-collections/src/lib/PriorityQueue";

/********************************************************************************
** AStarSearch

This module contains an implementation of the A* algorithm.
You should change the function 'aStarSearch'. 
********************************************************************************/

/* A* search implementation, parameterised by a 'Node' type. 
 * The code here is just a template; you should rewrite this function entirely.
 * This template produces a dummy search result which is a random walk.
 *
 * Note that you should not change the API (type) of this function, only its body.
 *
 * @param graph: The graph on which to perform A* search.
 * @param start: The initial node.
 * @param goal: A function that returns true when given a goal node. Used to determine if the algorithm has reached the goal.
 * @param heuristics: The heuristic function. Used to estimate the cost of reaching the goal from a given Node.
 * @param timeout: Maximum time (in seconds) to spend performing A* search.
 * @returns: A search result, which contains the path from 'start' to a node satisfying 'goal', 
 *           the cost of this path, and some statistics.
 */

export function aStarSearch<Node> (
    graph : Graph<Node>,
    start : Node,
    goal : (n:Node) => boolean,
    heuristics : (n:Node) => number,
    timeout : number
) : SearchResult<Node> {
    
    // A dummy search implementation: it returns a random walk
    var cost = 0;
    var path : Successor<Node>[] = [];
    var currentnode : Node = start;
    var visited : Set<Node> = new Set();
    visited.add(currentnode);

    var endTime = Date.now() + timeout * 1000;
    while (Date.now() < endTime) {
        if (goal(currentnode)) {
            // We found a path to the goal!
            return new SearchResult<Node>('success', path, cost, visited.size());
        }
        var successors : Successor<Node>[] = graph.successors(currentnode);
        var next : Successor<Node> | null = null;
        while (!next && successors.length > 0) {
            var n = Math.floor(Math.random() * successors.length);
            if (visited.contains(successors[n].child)) {
                successors.splice(n, 1);
            } else {
                next = successors[n];
            }
        }
        if (!next) {
            // We reached a dead end, but we return the path anyway
            return new SearchResult<Node>('success', path, cost, visited.size());
        }
        path.push(next);
        currentnode = next.child;
        visited.add(currentnode);
        cost += next.cost;
    }
    return new SearchResult<Node>('timeout', [], -1, visited.size());
}

