/// <reference path="../typescript-collections/collections.ts" />
/// <reference path="../astar-example/graph.ts" />

var logging = true;

module aStar {
    export function aStar(graph : Graph<EucliNode>, fromNode : EucliNode, toNode : EucliNode) : StarNode {
        if(!graph.contains(fromNode) || !graph.contains(toNode)) {
            throw "ERROR, nodes are not in graph.";
        }
        
        var evaluatedNodes = new collections.Set<StarNode>(n => n.getName());
        var nodesToEvaluate = new collections.PriorityQueue<StarNode>(compareNodes);
        var startingPath = new collections.LinkedList<Edge<EucliNode>>();

        var sFrom = new StarNode(fromNode, 0, fromNode.distanceTo(toNode), startingPath);

        nodesToEvaluate.add(sFrom);
        if(logging) {
            console.log("======== Starting ========");
        }

        while(!nodesToEvaluate.isEmpty()) {
            var currentNode = nodesToEvaluate.dequeue();

            if(logging) {
                console.log("evaluating " + currentNode.getName());
                console.log("Distance is  " + currentNode.getDistance());
                console.log("Heuristic is " + currentNode.getHeuristicDistance());
                console.log("Their sum is " + currentNode.getTotalDistance());
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
                console.log("======== Adding neighbors to frontier ========");
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
                        console.log("Adding " + starNeighbor.getName() + " to frontier. Distance+heuristic is: " + starNeighbor.getTotalDistance());
  				}
  			}
            if(logging)
                console.log("======= Evaluating next node ========");
        }

        return null;
    }

    function compareNodes(a : StarNode , b : StarNode){
    	return b.getTotalDistance() - a.getTotalDistance();
    }

    class StarNode extends EucliNode {
        distanceSoFar : number;
        heuristicDistance : number;
        pathTo = new collections.LinkedList<Edge<EucliNode>>();

        constructor(node : EucliNode, distance : number, heuristic : number, path : collections.LinkedList<Edge<EucliNode>>) {
            super(node.getId(), node.getX(), node.getY(), node.getName());
            this.distanceSoFar = distance;
            this.heuristicDistance = heuristic;
            path.forEach(p => this.pathTo.add(p));
        }

        updatePath(newEdge : Edge<EucliNode>) {
            this.pathTo.add(newEdge);
        }

        getPath() : collections.LinkedList<Edge<EucliNode>> {
            return this.pathTo;   
        }

        equals(otherNode : EucliNode) : boolean {
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
