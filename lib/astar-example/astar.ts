/// <reference path="../typescript-collections/collections.ts" />
/// <reference path="../astar-example/graph.ts" />

var logging = true;

module aStar {
    export function aStar<T extends GraphNode>(graph : Graph<T>, fromNode : T, toNode : T) : Path<T> {
        if(!graph.contains(fromNode) || !graph.contains(toNode)) {
            throw "ERROR, nodes are not in graph.";
        }
        
        var evaluatedNodes = new collections.Set<Path<T>>(n => n.getId().toString());
        var nodesToEvaluate = new collections.PriorityQueue<Path<T>>(compareNodes);
        var startingPath = new collections.LinkedList<Edge<T>>();

        var sFrom = new Path<T>(fromNode, 0, fromNode.distanceTo(toNode), startingPath);

        nodesToEvaluate.add(sFrom);
        if(logging) {
            console.log("======== Starting ========");
        }

        while(!nodesToEvaluate.isEmpty()) {
            var currentNode = nodesToEvaluate.dequeue();

            if(logging) {
                console.log("evaluating " + currentNode.toString());
                console.log("Distance is  " + currentNode.getDistance());
                console.log("Heuristic is " + currentNode.getHeuristicDistance());
                console.log("Their sum is " + currentNode.getTotalDistance());
            }
            
            evaluatedNodes.add(currentNode);
            if(logging)
                console.log("Evaluated nodes: " + evaluatedNodes.size() + "/" + graph.getNumberOfNodes());

            if(currentNode.equals(toNode)) {
                if(logging)
                    console.log("found goal! " + currentNode.toString());
                return currentNode;
            }
            if(logging)
                console.log("======== Adding neighbors to frontier ========");
  			var edgesN = graph.getEdgesTo(currentNode.getNode());
  			for (var i = 0; i < edgesN.length; i++) {
  				var e = edgesN[i];
  				var n = e.getFromNode().equals(currentNode) ? 
  					e.getEndNode() 
  					: e.getFromNode();
  				var dist = currentNode.getDistance() + e.getCost();
  				var starNeighbor = new Path(n, dist, n.distanceTo(toNode), currentNode.getPath());
  				if(!evaluatedNodes.contains(starNeighbor)) {
  					starNeighbor.updatePath(e);
  					nodesToEvaluate.add(starNeighbor);
                    if(logging)
                        console.log("Adding " + starNeighbor.toString() + " to frontier. Distance+heuristic is: " + starNeighbor.getTotalDistance());
  				}
  			}
            if(logging)
                console.log("======= Evaluating next node ========");
        }

        return null;
    }

    function compareNodes<T extends GraphNode>(a : Path<T> , b : Path<T>){
    	return b.getTotalDistance() - a.getTotalDistance();
    }

    class Path<T extends GraphNode> {
        distanceSoFar : number;
        heuristicDistance : number;
        id : number; 
        finalNode : T;
        pathTo = new collections.LinkedList<Edge<T>>();

        constructor(node : T, distance : number, heuristic : number, path : collections.LinkedList<Edge<T>>) {
            this.finalNode = node;
            this.distanceSoFar = distance;
            this.heuristicDistance = heuristic;
            path.forEach(p => this.pathTo.add(p));
        }

        getId() : number{
            return this.finalNode.getId();
        }
        toString() : string{
            return this.finalNode.toString();
        }
        getNode() : T {
            return this.finalNode;
        }

        distanceTo(toNode : T ) : number {
            return this.finalNode.distanceTo(toNode);
        }

        updatePath(newEdge : Edge<T>) {
            this.pathTo.add(newEdge);
        }

        getPath() : collections.LinkedList<Edge<T>> {
            return this.pathTo;   
        }

        equals(otherNode : T) : boolean {
            return this.getId() == otherNode.getId();
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
