/// <reference path="../typescript-collections/collections.ts" />
/// <reference path="WorldStateNode.ts" />
/// <reference path="../../Interpreter.ts" />
/// <reference path="WorldStateEdge.ts" />
/// <reference path="../utils.ts" />

module search {

    /**
     *
     * @param start
     * @param goals
     * @param compareStrategy
     * @returns {any}
     */
    export function search(start : WorldStateNode,
                           goals : Interpreter.Literal[][],
                           compareStrategy : (p1 : Path, p2 : Path) => number,
                           cycleChecking : boolean = true) : Path {
        var evaluatedPaths = new collections.Set<Path>(p => p.getNode().toString() + p.getNode().state.arm);
        var pathsToEvaluate = new collections.PriorityQueue<Path>(compareStrategy);

        pathsToEvaluate.add(new Path(start, 0, start.heuristicTo(goals), new collections.LinkedList<WorldStateEdge>()));

        while(!pathsToEvaluate.isEmpty()) {
            var currentPath : Path = pathsToEvaluate.dequeue();

            evaluatedPaths.add(currentPath);

            if(currentPath.getNode().isSatisfied(goals)) {
                return currentPath;
            }

            currentPath.getEdges().forEach((edge) => {
                var newPath = currentPath.newPath(edge,goals);

                if(cycleChecking) {
                    if(!evaluatedPaths.contains(newPath)) {
                        pathsToEvaluate.add(newPath);
                    }
                } else {
                    pathsToEvaluate.add(newPath);
                }

            });
        }
        return null;
    }

    /**
     *
     * @returns {number} Always return 1.
     */
    export function compareDFS(fst : Path , snd : Path){
        return -1;
    }

    /**
     *
     * @returns {number} Always return -1.
     */
    export function compareBFS(fst: Path, snd: Path) {
        return 1;
    }

    /**
     *
     * @param fst
     * @param snd
     * @returns {number}
     */
    export function compareBestFirst(fst : Path , snd : Path){
        return snd.getHeuristicDistance() - fst.getHeuristicDistance();
    }

    /**
     *
     * @param fst
     * @param snd
     * @returns {number}
     */
    export function compareStar(fst : Path , snd : Path){
        return snd.getTotalDistance() - fst.getTotalDistance();
    }

    export function DFS(start : WorldStateNode, goals : Interpreter.Literal[][]) : Path {
        var evaluatedPaths = new collections.Set<Path>(p => p.getNode().toString() + p.getNode().state.arm);
        var pathsToEvaluate = new collections.Stack<Path>();

        pathsToEvaluate.add(new Path(start, 0, start.heuristicTo(goals), new collections.LinkedList<WorldStateEdge>()));

        while(!pathsToEvaluate.isEmpty()) {
            var currentPath : Path = pathsToEvaluate.pop();

            evaluatedPaths.add(currentPath);

            if(currentPath.getNode().isSatisfied(goals)) {
                return currentPath;
            }

            currentPath.getEdges().forEach((edge) => {
                var newPath = currentPath.newPath(edge,goals);

                if(!evaluatedPaths.contains(newPath)) {
                    pathsToEvaluate.push(newPath);
                }
            });
        }

        return null;
    }

    class Path {
        private distanceSoFar:number;
        private heuristicDistance:number;
        private endNode:WorldStateNode;
        private pathTo = new collections.LinkedList<WorldStateEdge>();

        constructor(node:WorldStateNode, distance:number, heuristic:number, path:collections.LinkedList<WorldStateEdge>) {
            this.endNode = node;
            this.distanceSoFar = distance;
            this.heuristicDistance = heuristic;
            path.forEach(p => this.pathTo.add(p));
        }

        toString():string {
            return this.endNode.toString() + this.heuristicDistance.toString() + this.distanceSoFar.toString();
        }

        getNode():WorldStateNode {
            return this.endNode;
        }

        private addEdge(newEdge:WorldStateEdge) {
            this.pathTo.add(newEdge);
        }

        newPath(newEdge:WorldStateEdge, goals:Interpreter.Literal[][]):Path {
            var newEndNode = newEdge.getEndNode();
            var newDistance = this.distanceSoFar + newEdge.getCost();

            if (newEdge.getFromNode().equals(this.endNode)) {
                var newPath = new Path(newEndNode, newDistance, newEndNode.heuristicTo(goals), this.pathTo);
                newPath.addEdge(newEdge);
                return newPath;
            } else {
                throw "Edge must start where path ends.";
            }
        }

        getPath():collections.LinkedList<WorldStateEdge> {
            return this.pathTo;
        }

        getEdges():WorldStateEdge[] {
            var neighbors = this.endNode.getNeighbors();
            var edges:WorldStateEdge[] = [];
            neighbors.forEach((command, neighbor) => {
                edges.push(new WorldStateEdge(1, this.endNode, neighbor, command));
            });

            return edges;

      }

        getDistance():number {
            return this.distanceSoFar;
        }

        getHeuristicDistance():number {
            return this.heuristicDistance;
        }

        getTotalDistance():number {
          return  this.getDistance() + this.getHeuristicDistance();
        }
    }
}
