/// <reference path="collections.ts" />

module astar {

    export class GraphNode<T> {
        neighbors: Neighbor<T>[] = [];
        data: T = null;

        constructor (data: T) {
            this.data = data;
        }

        addNeighborNode(node: GraphNode<T>, distance: number) {
            this.neighbors.push(new Neighbor<T>(node, distance));
        }

        getData(): T {
            return this.data;
        }
    }

    class Neighbor<T> {
        node: GraphNode<T> = null;
        distance: number = 0;

        constructor (node, distance) {
            this.node = node;
            this.distance = distance;
        }
    }

    class QueueElement<T> {
        node: GraphNode<T> = null;
        cost: number = 0;

        constructor (node, cost) {
            this.node = node;
            this.cost = cost;
        }
    }

    function entryCompare<T>(a: QueueElement<T>, b: QueueElement<T>): number {
        if (a.cost < b.cost) {
            return -1;
        } else if (a.cost === b.cost) {
            return 0;
        } else {
            return 1;
        }
    }

    export interface IGraphHeuristic<T> {
        getHeuristic(a: GraphNode<T>, b: GraphNode<T>): number;
    }

    export class Graph<T> {
        heuristic: IGraphHeuristic<T> = null;
        nodes: GraphNode<T>[] = [];

        constructor(heuristic: IGraphHeuristic<T>) {
            this.heuristic = heuristic;
        }

        createNode(data: T): GraphNode<T> {
            return new GraphNode<T>(data);
        }

        addNode(node: GraphNode<T>) {
            this.nodes.push(node);
        }

        searchPath(start: GraphNode<T>, end: GraphNode<T>): GraphNode<T>[] {

            var queue = new collections.PriorityQueue<QueueElement<T>>(entryCompare);
            var visited = new collections.Set<GraphNode<T>>();

            queue.enqueue(new QueueElement<T>(start, 0));

            while (queue.peek()) {
                var current = queue.dequeue();

                var nNeighbors = current.node.neighbors.length;
                for (var i = 0; i < nNeighbors; i++) {
                    console.log(current.node.neighbors[i]);
                }
            }

            return [];
        }
    }
}