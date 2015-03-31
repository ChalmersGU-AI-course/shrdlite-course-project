/// <reference path="../lib/typescript-collections/collections.ts" />
module graphmodule {

    /** A node that has a string ID and holds some arbitrary data.
     * Also holds a map containing the heuristic to every other node (in a graph) */
    export class GraphNode<T> {
        public id: string;
        public data: T;
        public heuristics: collections.Dictionary<GraphNode<T>, number>;

        constructor(id: string, data?: T) {
            this.id = id;
            if (data != undefined) {
                this.data = data
            }
            this.heuristics = new collections.Dictionary<GraphNode<T>, number>();
        }

        toString() {
            return this.id;
        }
    }

    /** An edge holds its two end-nodes and has a cost */
    export class Edge<T> {
        public from: GraphNode<T>;
        public to: GraphNode<T>;
        public cost: number;

        constructor(from: GraphNode<T>, to: GraphNode<T>, cost: number) {
            this.from = from;
            this.to = to;
            this.cost = cost;
        }

        toString() {
            return this.from.toString() + "-" + this.to.toString();
        }
    }

    /** Holds a node and all the edges going out from it */
    export class Adjacency<T> {
        public node: GraphNode<T>;
        public neighbours: collections.Set<Edge<T>>;

        constructor(node: GraphNode<T>) {
            this.node = node;
            this.neighbours = new collections.Set<Edge<T>>();
        }

        toString() {
            return "Node: " + this.node.toString() + ": " + this.neighbours.toString();
        }
    }

    /** A Path is a list of edges. It also has a cost */
    export class Path<T> {
        public path: collections.LinkedList<Edge<T>>;
        public cost: number;

        constructor(newEdge?: Edge<T>, oldPath?: Path<T>) {
            this.path = new collections.LinkedList<Edge<T>>();
            this.cost = 0;

            if (oldPath != undefined) {
                oldPath.path.forEach((item: Edge<T>) => { this.path.add(item); return true; });
                this.cost += oldPath.cost;
            }

            if (newEdge != undefined) {
                this.path.add(newEdge);
                this.cost += newEdge.cost;
            }
        }

        toString() {
            return "Path [" + this.cost + "] = " + this.path.toString();
        }
    }

    /** Function to compare two paths. Needs to know the goal node in order to use heuristics */
    export function comparePath<T>(first: Path<T>, second: Path<T>, goal: GraphNode<T>) {
        //returns cost of: second - first in regard of reaching the goal
        return (second.cost + second.path.last().to.heuristics.getValue(goal)) -
            (first.cost + first.path.last().to.heuristics.getValue(goal));
    }

    /** Graph holding nodes and edges */
    export class Graph<T> {
        public adjacencyMap: collections.Dictionary<string, Adjacency<T>>;
        public nodes: collections.Set<GraphNode<T>>;
        public edges: collections.Set<Edge<T>>;

        constructor() {
            this.adjacencyMap = new collections.Dictionary<string, Adjacency<T>>();
            this.nodes = new collections.Set<GraphNode<T>>();
            this.edges = new collections.Set<Edge<T>>();
        }

        addNode(node: GraphNode<T>) {
            this.nodes.add(node);
            this.adjacencyMap.setValue(node.id, new Adjacency<T>(node));
        }

        addEdge(startId: string, endId: string, cost: number, bidirectional = false) {

            //Get the Adjacency<T> object for each node
            var adjacencyNodeStart = this.adjacencyMap.getValue(startId);
            var adjacencyNodeEnd = this.adjacencyMap.getValue(endId);

            //If any of them are null, fail
            if (adjacencyNodeStart === undefined || adjacencyNodeEnd === undefined) {
                return false;
            }

            //Get the actual nodes
            var startNode = adjacencyNodeStart.node;
            var endNode = adjacencyNodeEnd.node;

            //Create an Edge<T> from start to end
            var newEdge = new Edge<T>(startNode, endNode, cost);

            //Add the Edge<T>
            this.edges.add(newEdge);
            this.adjacencyMap.getValue(startId).neighbours.add(newEdge);

            //In case the Edge<T> should be bidirectional, add an Edge<T>
            // in the other direction as well
            if (bidirectional) {
                var newEdge2 = new Edge<T>(endNode, startNode, cost);
                this.edges.add(newEdge2);
                this.adjacencyMap.getValue(endId).neighbours.add(newEdge2);
            }

            return true;

        }


        public setHeuristicsFun(callback: collections.ILoopFunction<GraphNode<T>>) {
            this.nodes.forEach(callback);
        }

        toString() {
            return "---Graph<T>---\nNodes: " + this.nodes.toString() + "\nEdges: " + this.edges.toString() + "\n----------"
        }
    }
}