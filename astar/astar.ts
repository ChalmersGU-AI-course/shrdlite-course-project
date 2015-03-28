/// <reference path="collections.ts" />

module astar {

    export interface INodeData {}

    export class Node {
        private neighbors: Neighbor[] = [];
        private data: INodeData = null;

        constructor (data: INodeData) {
            if (data === null) {
                console.log("Invalid argument!");
            }

            this.data = data;
        }

        getData(): INodeData {
            return this.data;
        }

        getNeighbors(): Neighbor[] {
            return this.neighbors;
        }

        addNeighborNode(node: Node, distance: number) {
            if (node === null || distance === 0) {
                console.log("Invalid argument!");
                return;
            }

            this.neighbors.push(new Neighbor(node, distance));
        }
    }

    export class Neighbor {
        node: Node = null;
        distance: number = 0;

        constructor (node: Node, distance: number) {
            this.node = node;
            this.distance = distance;
        }
    }

    class QueueElement {
        path: Node[] = [];
        cost: number = 0;
        priority: number = 0;

        constructor (path: Node[], cost: number, priority: number) {
            if (path === null) {
                console.log("Invalid argument!");
            }

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
            if (node === null) {
                console.log("Invalid argument!");
                return;
            }

            this.nodes.push(node);
        }

        searchPath(start: Node, end: Node): Node[] {

            var queue = new collections.PriorityQueue<QueueElement>(entryCompare);
            var visited = [];

            queue.enqueue(new QueueElement([start],0,this.heuristic.get(start,end)));
            visited.push(start);

            var iteration = 0;

            while (queue.peek()) {
                var currentElement = queue.dequeue();
                var path = currentElement.path;
                var currentNode = path[path.length-1];

                if (currentNode === end) {
                    return path;
                } else {
                    var neighbors = currentNode.getNeighbors();

                    for (var i = 0; i < neighbors.length; i++) {

                        var neighbor = neighbors[i];
                        var newCost = currentElement.cost + neighbor.distance;

                        if (visited.indexOf(neighbor.node) === -1)
                        {
                            var newPriority = newCost + this.heuristic.get(neighbor.node, end);
                            var newPath = currentElement.path.concat(neighbor.node);
                            
                            queue.enqueue(new QueueElement(newPath, newCost, newPriority));
                            visited.push(neighbor.node);
                        }
                    }
                }

                iteration++;
            }

            return [];
        }
    }
}