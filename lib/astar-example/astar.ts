/// <reference path="../typescript-collections/collections.ts" />
/// <reference path="../astar-example/graph.ts" />

module aStar {
    export function aStar(graph : Graph, fromNode : GraphNode, toNode : GraphNode) : Edge[] {
        if(!graph.contains(fromNode) && !graph.contains(toNode)) {
            // ERROR, nodes are not in graph.
        }
        
        var evaluatedNodes = new collections.Set<StarNode>(); 
        var nodesToEvaluate = new collections.PriorityQueue<StarNode>()

        //var cameFromNodeMap = new collections.dictonary<StarNode, StarNode>();
        
        var sFrom = new StarNode(fromNode, 0, fromNode.distanceTo(toNode));

        nodesToEvaluate.add(sFrom);
        while(!nodesToEvaluate.isEmpty()) {
            var currentNode = nodesToEvaluate.dequeue();
            evaluatedNodes.add(currentNode);

            if(currentNode.equals(toNode)) {
                return currentNode.getPath();
            }

            for(var currentNeighbor in graph.getNeighborsTo(currentNode)) {
                if(!evaluatedNodes.contains(currentNeighbor)) {
                    var newDistance = currentNode.getDistance() + graph.getCostForEdge(currentNode, currentNeighbor);
                    var starNeighbor = new StarNode(currentNeighbor, newDistance, currentNeighbor.distanceTo(toNode));
                    nodesToEvaluate.add(starNeighbor);
                }
            }
        }

        return null;
    }

    class StarNode extends GraphNode {
        distanceSoFar : number;
        heuristicDistance : number;
        pathTo : Edge[];

        constructor(node : GraphNode, distance : number, heuristic : number) {
            super(node.getId(), node.getX(), node.getY(), "");
            this.distanceSoFar = distance;
            this.heuristicDistance = heuristic;

        }

        getPath() : Edge[] {
            return this.pathTo.slice();   
        }

       /* equals(otherNode : GraphNode) : boolean {
            return this.getId() == otherNode.getId();
        }*/

        StarNodeToString() : string {
            return this.getId.toString();
        }

        getDistance() : number {
            return this.distanceSoFar;
        }

        getTotalDistance() : number {
            return this.distanceSoFar+this.heuristicDistance;
        }

        distanceTo(node : StarNode) : number{
        	return super.distanceTo(node);
        }

        compareTo(otherNode : StarNode) : number {
            return this.getTotalDistance()-otherNode.getTotalDistance();
        }
    }
}
