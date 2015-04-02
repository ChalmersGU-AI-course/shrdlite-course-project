/// <reference path="../typescript-collections/collections.ts" />
/// <reference path="../astar-example/graph.ts" />

var logging = true;

module aStar {
    export function aStar(graph : Graph, fromNode : GraphNode, toNode : GraphNode) : StarNode {
        if(!graph.contains(fromNode) && !graph.contains(toNode)) {
            // ERROR, nodes are not in graph.
        }
        
        var evaluatedNodes = new collections.Set<StarNode>(n => /*n.getId().toString()*/ n.getName()); 
        var nodesToEvaluate = new collections.PriorityQueue<StarNode>(compareNodes);
        var startingPath = new collections.LinkedList<Edge>();

        var sFrom = new StarNode(fromNode, 0, fromNode.distanceTo(toNode), startingPath);

        nodesToEvaluate.add(sFrom);
        if(logging) {
            console.log("======== Starting ========");
        }

        while(!nodesToEvaluate.isEmpty()) {
            var currentNode = nodesToEvaluate.dequeue();

            if(logging) {
                console.log("evaluating " + currentNode.getName());
                console.log("Distance is " + currentNode.getTotalDistance());
            }
            
            evaluatedNodes.add(currentNode);
            if(logging)
                console.log("Evaluated nodes: " + evaluatedNodes.size() + "/" + graph.getNumberOfNodes());

            if(currentNode.equals(toNode)) {
                if(logging)
                    console.log("found goal! " + currentNode.getName());
                return currentNode;
            }
            if(logging)
                console.log("======== Adding edges ========");
  			var edgesN = graph.getEdgesTo(currentNode);
  			for (var i = 0; i < edgesN.length; i++) {
  				var e = edgesN[i];
  				var n = e.getFromNode().equals(currentNode) ? 
  					e.getEndNode() 
  					: e.getFromNode();
  				var dist = currentNode.getDistance() + e.getCost();
  				var starNeighbor = new StarNode(n, dist, n.distanceTo(toNode), currentNode.getPath());
  				if(!evaluatedNodes.contains(starNeighbor)) {
  					starNeighbor.updatePath(e);
  					nodesToEvaluate.add(starNeighbor);
                    if(logging)
                        console.log("Adding node " + starNeighbor.getName() + " to frontier. Distance is: " + starNeighbor.getTotalDistance());
  				}
  			}
            if(logging)
                console.log("======= Evaluating next node ========");
        }

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
            path.forEach(p => this.pathTo.add(p));
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

        getDistance() : number {
            return this.distanceSoFar;
        }

        getTotalDistance() : number {
            return this.distanceSoFar+this.heuristicDistance;
        }
    }
}
