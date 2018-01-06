
/********************************************************************************
** Graph

This module contains types for generic graphs.
You should not edit this file.
********************************************************************************/


// An edge in a directed weighted graph

export class Successor<Node> {
    action : string;
    child  : Node;
    cost   : number;
}


// The minimal interface for a directed weighted graph

export interface Graph<Node> {
    successors(node : Node) : Successor<Node>[];
    compareNodes : CompareFunction<Node>;
}


// Comparing two elements:
// if a<b then the result should be <0, if a>b then the result should be >0

export interface CompareFunction<T> {
    (a: T, b: T): number;
}


// The class for search results: this is what the function 'aStarSearch' should return
// If the search fails: 'status' should be 'failure' or 'timeout'; 'path' should be [] and 'cost' should be negative
// If the search succeeds: 'status' should be 'success'; 'path' should include the goal node, but not the start node
// Note: 'visited' should count all nodes that have been added to the frontier, not only the size of the frontier at return time

export class SearchResult<Node> {
    constructor(
        public status  : 'success' | 'failure' | 'timeout',
        public path    : Successor<Node>[], // the path found by the search algorithm
        public cost    : number,            // the total cost of the path
        public visited : number,            // the total number of nodes that have been added to the frontier
    ) {};
}

