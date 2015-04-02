/// <reference path="../lib/typescript-collections/collections.d.ts" />
declare module graphmodule {
    /** A node that has a string ID and holds some arbitrary data.
     * Also holds a map containing the heuristic to every other node (in a graph) */
    class GraphNode<T> {
        id: string;
        data: T;
        heuristics: collections.Dictionary<GraphNode<T>, number>;
        constructor(id: string, data?: T);
        toString(): string;
    }
    /** An edge holds its two end-nodes and has a cost */
    class Edge<T> {
        from: GraphNode<T>;
        to: GraphNode<T>;
        cost: number;
        constructor(from: GraphNode<T>, to: GraphNode<T>, cost: number);
        toString(): string;
    }
    /** Holds a node and all the edges going out from it */
    class Adjacency<T> {
        node: GraphNode<T>;
        neighbours: collections.Set<Edge<T>>;
        constructor(node: GraphNode<T>);
        toString(): string;
    }
    /** A Path is a list of edges. It also has a cost */
    class Path<T> {
        path: collections.LinkedList<Edge<T>>;
        cost: number;
        constructor(newEdge?: Edge<T>, oldPath?: Path<T>);
        toString(): string;
    }
    /** Function to compare two paths. Needs to know the goal node in order to use heuristics */
    function comparePath<T>(first: Path<T>, second: Path<T>, goal: GraphNode<T>): number;
    /** Graph holding nodes and edges */
    class Graph<T> {
        adjacencyMap: collections.Dictionary<string, Adjacency<T>>;
        nodes: collections.Set<GraphNode<T>>;
        edges: collections.Set<Edge<T>>;
        constructor();
        addNode(node: GraphNode<T>): void;
        addEdge(startId: string, endId: string, cost: number, bidirectional?: boolean): boolean;
        setHeuristicsFun(callback: collections.ILoopFunction<GraphNode<T>>): void;
        toString(): string;
    }
}
