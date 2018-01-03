
import Set from "./lib/typescript-collections/src/lib/Set";
import PriorityQueue from "./lib/typescript-collections/src/lib/PriorityQueue";

/********************************************************************************
** Graph

This module contains types for generic graphs, and
an implementation of the A* algorithm.

You should change the function 'aStarSearch'. 
Everything else can be leaved as they are.
********************************************************************************/


// An edge in a directed weighted graph

export class Edge<Node> {
    from : Node;
    to   : Node;
    cost : number;
}


// The minimal interface for a directed weighted graph

export interface Graph<Node> {
    outgoingEdges(node : Node) : Edge<Node>[];
    compareNodes : CompareFunction<Node>;
}


// Comparing two elements:
// if a<b then the result should be <0, if a>b then the result should be >0

interface CompareFunction<T> {
    (a: T, b: T): number;
}


// The class for search results. This is what the function 'aStarSearch' should return.
// If the search fails, then the 'path' should be 'null'.
// The 'path' should include both the start and the goal nodes.

export class SearchResult<Node> {
    constructor(
        public path : Node[] | null, // The path found by the search algorithm.
        public cost : number | null, // The total cost of the path.
        public frontier : number,    // The number of nodes in the frontier at return time
        public visited  : number,    // The number of nodes that have been removed from the frontier
        public timeout  : boolean,   // True if the search fails because of timeout
    ) {};
}

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
    // A dummy search result: it returns a random walk
    var cost = 0;
    var visited = 0;
    var frontier = 0;
    var path : Node[] = [start];
    var currentnode : Node = start;
    while (path.length < 10) {
        var outgoing : Edge<Node>[] = graph.outgoingEdges(currentnode);
        if (outgoing.length == 0) break;
        var randomedge : Edge<Node> = outgoing[Math.floor(Math.random() * outgoing.length)];
        currentnode = randomedge.to;
        path.push(currentnode);
        cost += randomedge.cost;
        visited += 1;
        frontier = outgoing.length;
    }
    return new SearchResult<Node>(path, cost, frontier, visited, false);
}

