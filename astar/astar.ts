/// <reference path="collections.ts" />

module astar {

    export interface INodeData {}

    export class Node {
        private neighbors: Neighbor[] = [];
        private data: INodeData = null;

        constructor (data: INodeData) {
            if (data === null) {
                throw new Error("Invalid argument!");
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
                throw new Error("Invalid argument!");
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
                throw new Error("Invalid argument!");
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
        get(a: Node, b: Node[]): number;
    }

    export class Result {
        found: boolean = false;
        path: Node[] = [];
        visited: Node[] = [];

        constructor(found: boolean, path: Node[], visited: Node[]) {
            this.found = found;
            this.path = path;
            this.visited = visited;
        }
    }

    export class Graph {
        private heuristic: IHeuristic = null;
        private nodes: Node[] = [];

        constructor(heuristic: IHeuristic) {
            this.heuristic = heuristic;
        }

        addNode(node: Node) {
            if (node === null) {
                throw new Error("Invalid argument!");
                return;
            }

            this.nodes.push(node);
        }

        searchPath(start: Node, goal: Node[]): Result {

            var queue = new collections.PriorityQueue<QueueElement>(entryCompare);
            var visited = [];
            var visitedCost = [];

            queue.enqueue(new QueueElement([start],0,this.heuristic.get(start,goal)));
            visited.push(start);
            visitedCost.push(0);

            while (queue.peek()) {
                var currentElement = queue.dequeue();
                var currentNode = currentElement.path[currentElement.path.length-1];

                if (goal.indexOf(currentNode) > -1) {
                    return new Result(true, currentElement.path, visited);
                } else {
                    var neighbors = currentNode.getNeighbors();

                    for (var i = 0; i < neighbors.length; i++) {

                        var neighbor = neighbors[i];
                        var newCost = currentElement.cost + neighbor.distance;

                        var firstOccurance = visited.indexOf(neighbor.node);

                        if (firstOccurance === -1 || newCost < visitedCost[firstOccurance])
                        {
                            var newPriority = newCost + this.heuristic.get(neighbor.node, goal);
                            var newPath = currentElement.path.concat(neighbor.node);
                            
                            queue.enqueue(new QueueElement(newPath, newCost, newPriority));
                            visited.push(neighbor.node);
                            visitedCost.push(newCost);
                        }
                    }
                }
            }

            return new Result(false, [], visited);
        }
    }
}