/// <reference path="collections.ts" />

module astar {

    export interface INodeData {}

    export class Node {
        private neighbors: Neighbor[] = [];
        private data: INodeData = null;

        constructor (data: INodeData) {
            this.data = data;
        }

        getData(): INodeData {
            return this.data;
        }

        getNeighbors(): Neighbor[] {
            return this.neighbors;
        }

        addNeighborNode(node: Node, distance: number) {
            this.neighbors.push(new Neighbor(node, distance));
        }
    }

    export class Neighbor {
        node: Node = null;
        distance: number = 0;

        constructor (node, distance) {
            this.node = node;
            this.distance = distance;
        }
    }

    class QueueElement {
        node: Node = null; // should maybe include predecessor list?
        cost: number = 0;

        constructor (node, cost) {
            this.node = node;
            this.cost = cost;
        }
    }

    function entryCompare(a: QueueElement, b: QueueElement): number {
        if (a.cost < b.cost) {
            return -1;
        } else if (a.cost === b.cost) {
            return 0;
        } else {
            return 1;
        }
    }

    export interface IHeuristic {
        get(a: Node, b: Node): number;
    }

    export class Graph {
        private heuristic: IHeuristic = null;
        private nodes: Node[] = [];

        constructor(heuristic: IHeuristic) {
            this.heuristic = heuristic;
        }

        addNode(node: Node) {
            this.nodes.push(node);
        }

        searchPath(start: Node, end: Node): Node[] {

            var queue = new collections.PriorityQueue<QueueElement>(entryCompare);
            var visited = new collections.Set<Node>();

            queue.enqueue(new QueueElement(start, 0));

            while (queue.peek()) {
                var current = queue.dequeue();

                var neighbors = current.node.getNeighbors();
                for (var i = 0; i < neighbors.length; i++) {
                    console.log(neighbors[i]);
                }
            }

            return [];
        }
    }
}