/// <reference path="../World.ts" />
/// <reference path="graph.ts" />


function permutate(initWorld: WorldState):graphmodule.Graph<string[][]>{

    var stack :string[][][] = [][][];
    var graph = new graphmodule.Graph<string[][]>();
    
    graph.addNode(new graphmodule.GraphNode(initWorld.stacks.toString(), initWorld.stacks);
    stack.push(initWorld.stacks);
    
    var columns = initWorld.stacks.length;
    var initState = stack.pop();
    var initStateID = initState.toString();
    while(initState != undefiend){
        for(int i = 0; i < columns; i++){
            
            var newState = copyStack(initState);
            
            if(newState[i].length > 0){
                var topObject = newState[i].pop();
            
                for(int j = 0; j < columns; j++){
                    if(j != i){
                        var newState2 = copyStack(newState);
                        
                        var lastElementInStack = newState2[i][newState[i].length-1];
                        if(newState2[j].length == 0 || objectAllowedOnTop(topObject, lastElementInStack, newState2[j]){
                            newState2[j].push(topObject);
                        
                            //Add the state to the graph
                            //Add the new state
                            var id = newState2.toString();
                            if(graph.addNode(new graphmodule.GraphNode(id, newState2)){
                                stack.push(newState2);
                            }
                            //Add an edge between the initState and the newState2
                            graph.addEdge(initStateID, id, 1, true);

                                
                        }
                        
                    }
                }
            }
            
        }
        initState = stack.pop();
        initStateID = initState.toString();
    }

}

function permutateBasedOn(baseOn: graphmodule.GraphNode<WorldState):graphmodule.GraphNode<WorldState>[]{
    var baseOnState = baseOn.data;
    
    var columns = baseOn.stacks.length;
    
    var returnList: graphmodule.GraphNode<WorldState>[] = [];
    
    for(int i = 0; i < columns; i++){
        
        var newState = copyStack(baseOnState);
        
        if(newState[i].length > 0){
            var topObject = newState[i].pop();
        
            for(int j = 0; j < columns; j++){
                if(j != i){
                    var newState2 = copyStack(newState);
                    
                    var lastElementInStack = newState2[i][newState[i].length-1];
                    
                    if(newState2[j].length == 0 || objectAllowedOnTop(topObject, lastElementInStack, newState2[j]){
                        newState2[j].push(topObject);
                    
                        //Add the state to the return list
                        var id = newState2.toString();
                        returnList.push(new graphmodule.GraphNode(id, newState2));
                    }
                    
                }
            }
        }
        
    }
    
    return returnList;
}


function alreadyInGraph(graph: graphmodule.Graph<string[][]>, state: string[][]){
    var returnValue = false;
    graph.forEach(
        (node: graphmodule.GraphNode<string[][]>) => {
        
            if(node.data == state){
                returnValue = true;
                return false;
            }
            
            return true;
        }
    );
}

function objectAllowedOnTop(topObject: string, bottomObject: string, objects: { [s:string]: ObjectDefinition; }){
    return true;
}

function copyStack(original: string[][]):string[][]{'

    var newStack: string[][] = [][];

    for(int i = 0; i < original.length; i++){
        var stack = original[i];
        newStack.push(stack); 
    }
    
    return newStack;
}