/// <reference path="../typescript-collections/collections.ts" />
/// <reference path="../astar-example/graph.ts" />

module aStar {
    export function aStar(graph : Graph, fromNode : GraphNode, toNode : GraphNode) : StarNode {
        if(!graph.contains(fromNode) && !graph.contains(toNode)) {
            // ERROR, nodes are not in graph.
        }
        
        var evaluatedNodes = new collections.Set<StarNode>(n => n.getId().toString()); 
        var nodesToEvaluate = new collections.PriorityQueue<StarNode>();
        var startingPath = new collections.LinkedList<Edge>();

        var sFrom = new StarNode(fromNode, 0, fromNode.distanceTo(toNode), startingPath);

        nodesToEvaluate.add(sFrom);

        while(!nodesToEvaluate.isEmpty()) {
            var currentNode = nodesToEvaluate.dequeue();
            
            evaluatedNodes.add(currentNode);

            if(currentNode.equals(toNode)) {
                return currentNode;
            }
  
            var neighborArr = graph.getNeighborsTo(currentNode);
            for (var i = 0; i < neighborArr.length; i++) {
                var starNeighbor = new StarNode(neighborArr[i], currentNode.getDistance(), neighborArr[i].distanceTo(toNode), currentNode.getPath());

                if(!evaluatedNodes.contains(starNeighbor)) {
                    var newDistance = currentNode.getDistance() + graph.getCostForEdge(currentNode, starNeighbor);
                    starNeighbor.setDistance(newDistance);
                    starNeighbor.updatePath(graph.getEdgeBetween(currentNode, starNeighbor));
                    nodesToEvaluate.add(starNeighbor);
                } else {
                    console.log(currentNode.getName());
                    console.log(starNeighbor.getName());
                    console.log(" ");
                }
            }
        }

        nodesToEvaluate.clear();
        return null;
    }

    class StarNode extends GraphNode {
        distanceSoFar : number;
        heuristicDistance : number;
        pathTo = new collections.LinkedList<Edge>();

        constructor(node : GraphNode, distance : number, heuristic : number, path : collections.LinkedList<Edge>) {
            super(node.getId(), node.getX(), node.getY(), node.getName());
            this.distanceSoFar = distance;
            this.heuristicDistance = heuristic;
            this.pathTo = path;
        }

        updatePath(newEdge : Edge) {
            this.pathTo.add(newEdge);
        }

        getPath() : collections.LinkedList<Edge> {
            return this.pathTo;   
        }

        equals(otherNode : GraphNode) : boolean {
            return this.getId() == otherNode.getId();
        }

        StarNodeToString() : string {
            return this.getId.toString();
        }

        getDistance() : number {
            return this.distanceSoFar;
        }

        setDistance(newDistance : number) {
            this.distanceSoFar = newDistance;
        }

        getTotalDistance() : number {
            return this.distanceSoFar+this.heuristicDistance;
        }

        compareTo(otherNode : StarNode) : number {
            return this.getTotalDistance()-otherNode.getTotalDistance();
        }
    }
}
