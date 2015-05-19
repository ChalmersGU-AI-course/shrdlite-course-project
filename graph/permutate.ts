/// <reference path="../World.ts" />
/// <reference path="graph.ts" />
/// <reference path="../Utils.ts" />

/*
function permutate(initWorld: WorldState):graphmodule.Graph<string[][]>{

    var stack :string[][][] = [][][];
    var graph = new graphmodule.Graph<string[][]>();
    
    graph.addNode(new graphmodule.GraphNode(initWorld.stacks.toString(), initWorld.stacks));
    stack.push(initWorld.stacks);
    
    var columns = initWorld.stacks.length;
    var initState = stack.pop();
    var initStateID = initState.toString();
    while(initState != undefiend){
        for(var i = 0; i < columns; i++){
            
            var newState = copyStack(initState);
            
            if(newState[i].length > 0){
                var topObject = newState[i].pop();
            
                for(var j = 0; j < columns; j++){
                    if(j != i){
                        var newState2 = copyStack(newState);
                        
                        var lastElementInStack = newState2[i][newState[i].length-1];
                        if(newState2[j].length == 0 || objectAllowedOnTop(topObject, lastElementInStack, newState2[j])){
                            newState2[j].push(topObject);
                        
                            //Add the state to the graph
                            //Add the new state
                            var id = newState2.toString();
                            if(graph.addNode(new graphmodule.GraphNode(id, newState2))){
                                stack.push(newState2);
                            }
                            //Add an edge between the initState and the newState2
                            graph.addEdge(initStateID, id, Math.abs(j-i), true);

                                
                        }
                        
                    }
                }
            }
            
        }
        initState = stack.pop();
        initStateID = initState.toString();
    }

}
*/

function permutateBasedOn(baseOn: graphmodule.GraphNode<string[][]>, objects: { [s:string]: ObjectDefinition; }):graphmodule.GraphNode<string[][]>[]{
    //Get the data that the given node contains
    var baseOnState = baseOn.data;
    
    //Get the number of columns within this world
    var columns = baseOnState.length;
    
    //Initialize a return list
    var returnList: graphmodule.GraphNode<string[][]>[] = [];
    
    console.log("permutate.permutateBasedOn starting permutation----------------------------");
    //console.log("permutate.permutateBasedOn startState: " + prettyMat(baseOnState));
    
    //For each column...
    for(var i = 0; i < columns; i++){
        
        //Copy the given state (given)
        var newState = copyStack(baseOnState);
        
        //If this column in the new state has any data, work on it
        // otherwise this column does not have any data, so continue
        // with the next column
        if(newState[i].length > 0){
        
            //Get the top object from the current
            // column and remove it from the state
            var topObject = newState[i].pop();
        
            //For each column (again) ...
            for(var j = 0; j < columns; j++){
                ////console.log("permutate.permutateBasedOn.forloop J, j=" + j + ", i=" + i);
            
                //Only if the two columns are different, we do not
                // want to put the picked up object (topObject) back
                // to the same column that we took it from
                if(j != i){
                
                    //Copy the newState (which now does not have the topObject)
                    var newState2 = copyStack(newState);
                    //console.log("permutate.permutateBasedOn.newState:   " + newState);
                    //console.log("permutate.permutateBasedOn.newState2:   " + newState2);
                    ////console.log("permutate.permutateBasedOn.stateSame1:   " + (newState2==newState));
                    ////console.log("permutate.permutateBasedOn.stateSame2:   " + (newState2===newState));
                    
                    //Get the last (next top) object from the newState2, which
                    // is the state where the topObject is gone
                    var lastElementInStack = newState2[j][newState[j].length-1];
                    //console.log("permutate.permutateBasedOn.newState2 l: " + lastElementInStack);
                    
                    //In case that lastElementInStack is undefined, it means that the stack j
                    // is empty and the topObject should be able to be put to that column.
                    //This is also checked by the length == 0
                    if(newState2[j].length == 0 || validPlacement(topObject, lastElementInStack, objects)){
                    
                        //Push the topObject to the column (putting it there)
                        newState2[j].push(topObject);
                    
                        //Add the state to the return list as a new valid state
                        var newId = generateID(newState2);
                        var newNode = new graphmodule.GraphNode(newId, newState2)
                        
                        returnList.push(newNode);
                        //console.log("permutate.permutateBasedOn added State: " + prettyMat(newState2));
                    }
                    
                }
            }
        }
        
    }
    
    return returnList;
}


