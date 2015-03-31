/// <reference path="../typescript-collections/collections.ts" />
/// <reference path="../astar-example/graph.ts" />

module aStar {
    export function aStar(graph : Graph, fromNode : GraphNode, toNode : GraphNode) : number {
        if(!graph.existsInGraph(fromNode) && !graph.existsInGraph(toNode)) {
            // ERROR, nodes are not in graph.
        }

        /*  A*
        put the starting node on the open list (you can leave its f at zero)

        while the open list is not empty
            generate q's 8 successors and set their parents to q
            for each successor
                if successor is the goal, stop the search
                successor.g = q.g + distance between successor and q
                successor.h = distance from goal to successor
                successor.f = successor.g + successor.h

                if a node with the same position as successor is in the OPEN list \
                    which has a lower f than successor, skip this successor
                if a node with the same position as successor is in the CLOSED list \ 
                    which has a lower f than successor, skip this successor
                otherwise, add the node to the open list
            end
            push q on the closed list
        end
        */

        var evaluatedNodes = new collections.Set<StarNode>(); 
        var nodesToEvaluate = new collections.PriorityQueue<StarNode>()
        
        var sFrom = new StarNode(fromNode);
        var sTo = new StarNode(toNode);

        nodesToEvaluate.add(sFrom); // Should be a StarNode
        
        while(!nodesToEvaluate.isEmpty()) {
            var currentNode = nodesToEvaluate.dequeue();
            for(n in graph.getNeighborsTo(currentNode)) {
                if(n == toNode) {
                    // We're done.
                } else {
                    // var starN = new StarNode(n);

                    if(nodesToEvaluate.contains(starN)) {

                    }
                }
            }
        }

        return 1;
    }

    class StarNode extends GraphNode{
        distanceSoFar : number;
        heuristicDistance : number;
        pathTo : Edge[];

        constructor(node : GraphNode) {
            this.id = node.id;
            this.xPos = node.xPos;
            this.yPos = node.yPos;
        }
        
        StarNodeToString() {
            return this.id;
        }
    }
}
