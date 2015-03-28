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
        path: Node[] = []; // should maybe include predecessor list?
        cost: number = 0;
        priority: number = 0;

        constructor (path, cost, priority) {
            this.path = path;
            this.cost = cost;
            this.priority = priority;
        }
    }

    function entryCompare(a: QueueElement, b: QueueElement): number {
        if (a.priority > b.priority) {
            return -1;
        } else if (a.priority === b.priority) {
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
            //var visited = new collections.Set<Node>();
            var path = [];
            queue.enqueue(new QueueElement([start],0,this.heuristic.get(start,end)));

            while (queue.peek()) {
                var currentElement = queue.dequeue();
                path = currentElement.path;
                var currentNode = path[path.length-1];

                if (currentNode === end) {
                    break;
                }
                else {
                    var neighbors = currentNode.getNeighbors();
                    for (var i = 0; i < neighbors.length; i++) {
                        var currentNeighbor = neighbors[i];
                        var newCost = currentElement.cost + currentNeighbor.distance;
                        var newPriority = newCost + this.heuristic.get(currentNeighbor.node,end);
                        var newPath = currentElement.path.concat(currentNeighbor.node);
                        queue.enqueue(new QueueElement(newPath, newCost, newPriority));
                    }
                }
            }

            return path;
        }
    }
}