/// <reference path="lib/typescript-collections/collections.ts" />
/// <reference path="../World.ts" />

// A-Star A-team implementation by Team Dandelion

module aStar {
    export function aStar(fromNode : Node, toNode : Node) : number {
        var evaluatedNodes = new collections.Set<Nodes>(); 
        var nodesToEvaluate = new collections.PriorityQueue<Node>();
        var pathToState = new collections.Dictionary<Node, Node>();
        var g_score = new collections.Dictionary<Node, number>();
        var f_score = new collections.Dictionary<Node, number>();
        //var costToState : int[];
        //var optimalCost : int = getDistance(fromState, toState);
        //costToState[0] = 0;
        statesToEvalute.add(fromState);
        g_score.setValue(fromState, 0);
        f_score.setValue(fromState, g_score.getValue(fromState) + getDistance(fromState, toState));


        while(!statesToEvalute.isEmpty()) {
            var currentState = statesToEvalute.dequeue();
            if(currentState == toState) {

            }
        }
        // (Check that worlds are compatible.)

        // Populate set with states reachable from from-state.
        // 

        // Do search with heuristic

        // Return path found with search
        return -1;
    }

    interface StarNode extends Node {
        distanceTo : int;
        pathTo : Edge[];
        
    }

    interface Node {
        id : int;
        xPos : int;
        yPos : int;

        function distanceTo(to: Node) : double {
            return Math.sqrt(Math.pow(this.xPos-to.xPos, 2)+Math.pow(this.yPos-to.yPos, 2));
        }
    }

    interface Edge {
        cost : int;
        fromNode : int;
        endNode : int

        function int compareTo(otherEdge : Edge) {
            return this.cost-otherEdge.cost;
        }
    }
}