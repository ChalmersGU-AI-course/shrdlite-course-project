/// <reference path="../../lib/typescript-collections/collections.ts" />
/// <reference path="../graph.ts" />
/// <reference path="../astar.ts" />
/// <reference path="../../World.ts"/>
/// <reference path="../permutate.ts"/>
/// <reference path="../../heuristic/Heuristic.ts"/>
/// <reference path="../../Utils.ts" />

/** A graph which has a worldstate as data for the nodes */
class StateGraph{
    graph: graphmodule.Graph<string[][]>;
    
    startState: string[][] = [["e"],["g","l"],[],["k","m","f"],[]];
    
    endWorld: WorldState;

    constructor() {
        this.graph = new graphmodule.Graph<string[][]>();
        
        this.endWorld = { 
            "stacks": [[],["g","l"],[],["m","f"],["k","e"]],
            "holding": null,
            "arm": 0,
            "objects": {
                "a": { "form":"brick",   "size":"large",  "color":"green" },
                "b": { "form":"brick",   "size":"small",  "color":"white" },
                "c": { "form":"plank",   "size":"large",  "color":"red"   },
                "d": { "form":"plank",   "size":"small",  "color":"green" },
                "e": { "form":"ball",    "size":"large",  "color":"white" },
                "f": { "form":"ball",    "size":"small",  "color":"black" },
                "g": { "form":"table",   "size":"large",  "color":"blue"  },
                "h": { "form":"table",   "size":"small",  "color":"red"   },
                "i": { "form":"pyramid", "size":"large",  "color":"yellow"},
                "j": { "form":"pyramid", "size":"small",  "color":"red"   },
                "k": { "form":"box",     "size":"large",  "color":"yellow"},
                "l": { "form":"box",     "size":"large",  "color":"red"   },
                "m": { "form":"box",     "size":"small",  "color":"blue"  }
            },
            "examples": [
                "put the brick that is to the left of a pyramid in a box",
                "put the white ball in a box on the floor",
                "move the large ball inside a yellow box on the floor",
                "move the large ball inside a red box on the floor",
                "take a red object",
                "take the white ball",
                "put all boxes on the floor",
                "put the large plank under the blue brick",
                "move all bricks on a table",
                "move all balls inside a large box"
            ]
        };
    }
    
    
    computePath(startPos: string, hFun: graphmodule.HeuristicFunction<string[][]>) {
        //console.log("Start av computePath");
        return astar.compute(this.graph, startPos, (currentNode: graphmodule.GraphNode<string[][]>) => {
            
            return this.matrixEquality(currentNode.data, this.endWorld.stacks);
        }, hFun, (baseOn: graphmodule.GraphNode<string[][]>) => {
            //console.log("Generate next state");
            return permutateBasedOn(baseOn, this.endWorld.objects);
        }
        );
    }

    heuristicFunction(startNode: string[][]): number{
        return heuristics.worldHeuristics(startNode, [[],["g","l"],[],["m","f"],["k","e"]]);
    }
    
    
    matrixEquality(first: string[][], second: string[][]):boolean{
        for(var i = 0; i < first.length; i++){
            if(first[i].length != second[i].length){
                return false;
            }
            for(var j = 0; j < first[i].length; j++){
                if(first[i][j] != second[i][j]){
                    return false;
                }
            }
        }
        return true;
    }
    
    
    
}
        
function runExample(element: HTMLElement) {
    var stateGraph = new StateGraph();
    
    element.innerHTML += "Graph used (stateGraph):";
    element.innerHTML += "<br><br>";
    
    var startID = generateID(stateGraph.startState);
    var startNode = new graphmodule.GraphNode<string[][]>(startID, stateGraph.startState);
    stateGraph.graph.addNode(startNode);
    
    element.innerHTML += stateGraph.graph.toString();
    element.innerHTML += "<br>";
    
    var result = stateGraph.computePath(startID, stateGraph.heuristicFunction);
    
    element.innerHTML += "KLAR<br>";
    element.innerHTML += "<br>Result:";
    
    if(result != undefined){
        element.innerHTML += result.toString();
    } else {
        element.innerHTML += "Result undefined, no path found... sucky AI";
    }
    
    element.innerHTML += "<br>End of result<br>";
    //console.log("Everything is DONE");
}

window.onload = () => {
    var el = document.getElementById('content');
    runExample(el);
};
