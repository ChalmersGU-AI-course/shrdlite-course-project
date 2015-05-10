/// <reference path="collections.ts" />

module astar {

    export interface INode {
        getUniqueId(): string;
        getNeighbors(): Neighbor[];
    }

    export class Neighbor {
        node: INode = null;
        distance: number = 0;

        constructor(node: INode, distance: number) {
            if (node === null) {
                throw new Error("Invalid argument!");
            }

            this.node = node;
            this.distance = distance;
        }
    }

    class QueueElement {
        path: INode[] = [];
        cost: number = 0;
        priority: number = 0;

        constructor (path: INode[], cost: number, priority: number) {
            if (path === null) {
                throw new Error("Invalid argument!");
            }

            this.path = path;
            this.cost = cost;
            this.priority = priority;
        }
    }

    function entryCompare(a: QueueElement, b: QueueElement): number {
	    return b.priority - a.priority;
    }

    export interface IHeuristic {
        get(node: INode,goal: IGoal): number;
    }

    export interface IGoal {
        isReached(node: INode): boolean;
    }

    export class Result {
        found: boolean = false;
        path: INode[] = [];
        visited: INode[] = [];

        constructor(found: boolean, path: INode[], visited: INode[]) {
            this.found = found;
            this.path = path;
            this.visited = visited;
        }
    }

    export class Graph {
        private heuristic: IHeuristic = null;
        private goal: IGoal = null;

        constructor(heuristic: IHeuristic, goal: IGoal) {
            this.heuristic = heuristic;
            this.goal = goal;
        }

        searchPath(start: INode): Result {
            var TIMEOUT = 5000;

            var queue = new collections.PriorityQueue<QueueElement>(entryCompare);
            var visited = new collections.Dictionary<INode,number>(function(node: INode) { return node.getUniqueId(); });

            queue.enqueue(new QueueElement([start],0,this.heuristic.get(start,this.goal)));
            visited.setValue(start,0);

            while (queue.peek() && visited.size() < TIMEOUT) {
                var currentElement = queue.dequeue();
                var currentNode = currentElement.path[currentElement.path.length-1];

                if (this.goal.isReached(currentNode)) {
                    return new Result(true, currentElement.path, visited.keys());
                } else {
                    var neighbors = currentNode.getNeighbors();

                    for (var i = 0; i < neighbors.length; i++) {

                        var neighbor = neighbors[i];
                        var newCost = currentElement.cost + neighbor.distance;

                        if (!visited.containsKey(neighbor.node) || newCost < visited.getValue(neighbor.node))
                        {
                            var newPriority = newCost + this.heuristic.get(neighbor.node,this.goal);
                            var newPath = currentElement.path.concat(neighbor.node);

                            queue.enqueue(new QueueElement(newPath, newCost, newPriority));
                            visited.setValue(neighbor.node,newCost);
                        }
                    }
                }
            }

            return new Result(false, [], visited.keys());
        }
    }
}
