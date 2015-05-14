/// <reference path="../typescript-collections/collections.ts" />
/// <reference path="WorldStateNode.ts" />
/// <reference path="../../Interpreter.ts" />
/// <reference path="WorldStateEdge.ts" />

var logging = true;

module aStar {
    export function aStar(start : WorldStateNode, goals : Interpreter.Literal[][]) : WorldStateEdge[] {
        var evaluatedPaths = new collections.Set<Path>(p => p.toString());
        var pathsToEvaluate = new collections.PriorityQueue<Path>(comparePaths);

        pathsToEvaluate.add(new Path(start, 0, start.heuristicTo(goals), new collections.LinkedList<WorldStateEdge>()));
        if(logging) {
            console.log("======== Starting ========");
        }

        while(!pathsToEvaluate.isEmpty()) {
            var currentPath : Path = pathsToEvaluate.dequeue();

            if(logging) {
                console.log("evaluating " + currentPath.toString());
                console.log("Distance is  " + currentPath.getDistance());
                console.log("Heuristic is " + currentPath.getHeuristicDistance());
                console.log("Their sum is " + currentPath.getTotalDistance());
            }
            
            evaluatedPaths.add(currentPath);
            if(logging)
                console.log("Evaluated nodes: " + evaluatedPaths.size());

            if(currentPath.getNode().isSatisfied(goals)) {
                if(logging)
                    console.log("found goal! " + currentPath.toString());
                return currentPath.getEdges();
            }

            if(logging)
                console.log("======== Adding neighbors to frontier ========");

            currentPath.getEdges().forEach((edge) => {
                var newPath = currentPath.newPath(edge,goals);

                if(!evaluatedPaths.contains(newPath)) {
                    pathsToEvaluate.add(newPath);
                    if(logging)
                        console.log("Adding " + newPath.toString() + " to frontier. Distance+heuristic is: " + newPath.getTotalDistance());
                }
            });

            if(logging)
                console.log("======= Evaluating next node ========");
        }

        return null;
    }

    function comparePaths(fst : Path , snd : Path){
    	return snd.getTotalDistance() - fst.getTotalDistance();
    }

    class Path {
        private distanceSoFar : number;
        private heuristicDistance : number;
        private endNode : WorldStateNode;
        private pathTo = new collections.LinkedList<WorldStateEdge>();

        constructor(node : WorldStateNode, distance : number, heuristic : number, path : collections.LinkedList<WorldStateEdge>) {
            this.endNode = node;
            this.distanceSoFar = distance;
            this.heuristicDistance = heuristic;
            path.forEach(p => this.pathTo.add(p));
        }

        toString() : string{
            return this.endNode.toString() + this.heuristicDistance.toString() + this.distanceSoFar.toString();
        }

        getNode() : WorldStateNode {
            return this.endNode;
        }

        heuristicTo(goals : Interpreter.Literal[][] ) : number {
            return this.endNode.heuristicTo(goals);
        }

        private addEdge(newEdge : WorldStateEdge) {
            this.pathTo.add(newEdge);
        }

        newPath(newEdge : WorldStateEdge, goals : Interpreter.Literal[][]) : Path {
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

        getPath() : collections.LinkedList<WorldStateEdge> {
            return this.pathTo;   
        }

        getEdges() : WorldStateEdge[] {
            var neighbors = this.endNode.getNeighbors();
            var edges : WorldStateEdge[] = [];
            neighbors.forEach((command, neighbor) => {
                edges.push(new WorldStateEdge(1, this.endNode, neighbor, command));
            });

            return edges;
        }

        getDistance() : number {
            return this.distanceSoFar;
        }

        getHeuristicDistance() : number {
            return this.heuristicDistance;
        }

        getTotalDistance() : number {
            return this.distanceSoFar+this.heuristicDistance;
        }
    }
}
