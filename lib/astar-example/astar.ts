/// <reference path="../typescript-collections/collections.ts" />
/// <reference path="../astar-example/graph.ts" />

module aStar {
    export function aStar(graph : Graph, fromNode : GraphNode, toNode : GraphNode) : StarNode {
        if(!graph.contains(fromNode) && !graph.contains(toNode)) {
            // ERROR, nodes are not in graph.
        }
        
        var evaluatedNodes = new collections.Set<StarNode>(n => n.getId().toString()); 
        var nodesToEvaluate = new collections.PriorityQueue<StarNode>(compareNodes);
        var startingPath = new collections.LinkedList<Edge>();

        var sFrom = new StarNode(fromNode, 0, fromNode.distanceTo(toNode), startingPath);

        nodesToEvaluate.add(sFrom);

        while(!nodesToEvaluate.isEmpty()) {
            var currentNode = nodesToEvaluate.dequeue();
            
            evaluatedNodes.add(currentNode);

            if(currentNode.equals(toNode)) {
                return currentNode;
            }
  			var edgesN = graph.getEdgesTo(currentNode);
  			for (var i = 0; i < edgesN.length; i++) {
  				var n;
  				if(edgesN[i].getFromNode().equals(currentNode)){
  					n = edgesN[i].getEndNode();
  				}
  				else{
  					n = edgesN[i].getFromNode();
  				}
  				var dist = currentNode.getDistance() + edgesN[i].getCost();
  				var starNeighbor = new StarNode(n, dist, n.distanceTo(toNode), currentNode.getPath());
  				if(!evaluatedNodes.contains(starNeighbor)) {
  					console.log(currentNode.getName());
                    console.log(starNeighbor.getName());
                    console.log(" ");
  					starNeighbor.updatePath(edgesN[i]);
  					nodesToEvaluate.add(starNeighbor);
  				} else{
  					
  				}
  			}
            /*var neighborArr = graph.getNeighborsTo(currentNode);
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
            }*/
        }

        nodesToEvaluate.clear();
        return null;
    }

    function compareNodes(a : StarNode , b : StarNode){
    	var aVal = a.getTotalDistance(); 
    	var bVal = b.getTotalDistance();
    	if (aVal == bVal) {
    		return 0;
    	}
    	else if(aVal > bVal){
    		return -1;
    	}
    	else{
    		return 1;
    	}
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
