/// <reference path="../typescript-collections/collections.ts" />
/// <reference path="WorldStateNode.ts" />
/// <reference path="../../Interpreter.ts" />
/// <reference path="WorldStateEdge.ts" />
/// <reference path="../utils.ts" />

module search {

    /**
     * A general search algorithm for a WorldState that fulfills the goals provided.
     *
     * @param start             Starting WorldState in the WorldStateNode representation form.
     * @param goals             A list of disjunctive goals, one of which needs to be fulfilled in a goal state.
     * @param compareStrategy   Method used for comparison in the priority queue for the frontier,
     *                          decides what strategy to use when searching.
     * @param cycleChecking     Whether to cycle check or not, defaults to true.
     * @returns {any}           A Path consisting of all the intermediate states between {start} and the end-state where
     *                          the goals are fulfilled.
     */
    export function search(start : WorldStateNode,
                           goals : Interpreter.Literal[][],
                           compareStrategy : (p1 : Path, p2 : Path) => number,
                           cycleChecking : boolean = true) : Path {
        var evaluatedPaths = new collections.Set<Path>(p => p.getNode().toString() + p.getNode().state.arm);
        var pathsToEvaluate = new collections.PriorityQueue<Path>(compareStrategy);

        var highestSoFar : number = 0;

        pathsToEvaluate.add(new Path(start, 0, start.heuristicTo(goals), new collections.LinkedList<WorldStateEdge>()));

        while(!pathsToEvaluate.isEmpty()) {
            var currentPath : Path = pathsToEvaluate.dequeue();

            evaluatedPaths.add(currentPath);

            if(currentPath.getNode().isSatisfied(goals)) {
                console.log("Goal: " + goals.toString() + "\n Search complete. \n Evaluated paths: " + evaluatedPaths.size() + " \t Longest path evaluated: " + highestSoFar);
                return currentPath;
            }

            currentPath.getEdges().forEach((edge) => {
                var newPath = currentPath.newPath(edge,goals);

                if(cycleChecking) {
                    if(!evaluatedPaths.contains(newPath)) {
                        if(newPath.getPath().size() > highestSoFar) {
                            highestSoFar = newPath.getPath().size();
                        }
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
     * Compare method used when the preferred search strategy is Deapth First Search.
     * @returns {number} Always return 1.
     */
    export function compareDFS(fst : Path , snd : Path){
        return -1;
    }

    /**
     * Compare method used when the preferred search strategy is Breadth First Search.
     * @returns {number} Always return -1.
     */
    export function compareBFS(fst: Path, snd: Path) {
        return 1;
    }

    /**
     * Compare method used when the preferred search strategy is Best First Search.
     * @returns {number}
     */
    export function compareBestFirst(fst : Path , snd : Path){
        return snd.getHeuristicDistance() - fst.getHeuristicDistance();
    }

    /**
     * Compare method used when the prefered search strategy is A*-Search.
     * @returns {number}
     */
    export function compareStar(fst : Path , snd : Path){
        return snd.getTotalDistance() - fst.getTotalDistance();
    }

    class Path {
        private distanceSoFar:number;
        private heuristicDistance:number;
        private endNode:WorldStateNode;
        private pathTo = new collections.LinkedList<WorldStateEdge>();

        /**
         *  A path represents a path moved in the state space, which includes information on heuristic to
         *  a goal (not included in this class) as well as the distance moved so far.
         * @param node         The ending node of the path.
         * @param distance     The distance moved so far in the state space.
         * @param heuristic    The heuristic from the endNode to the goal.
         * @param path         A linked list of the moves performed in the path.
         */
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

        /**
         * Creates a new path starting at the end of the current Path.
         * @param newEdge           New edge to add to the path.
         * @param goals             The goals to calculate the new heuristic from.
         * @returns {search.Path}   A new path, with the added node.
         */
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

        /**
         * Returns the new Edges possible from the Paths end node.
         * @returns {WorldStateEdge[]}  Array of new Edges.
         */
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
