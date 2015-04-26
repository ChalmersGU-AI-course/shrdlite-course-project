///<reference path="../World.ts"/>


/*
We do not have a goal worldstate, but want to have a function which takes the current
worldstate and this (below) and checks if it is true.
Example: "put the white ball that is in a box on the floor"
Gives:
{cmd: "move",
  ent: {quant: "the",
        obj: {obj: {size: null, color: "white", form: "ball"},
              loc: {rel: "inside",
                    ent: {quant: "any",
                          obj: {size: null, color: null, form: "box"}}}}},
  loc: {rel: "ontop",
        ent: {quant: "the",
              obj: {size: null, color: null, form: "floor"}}}}

*/

module heuristics {

    /** Takes two stacks (world states) and calculates and returns the heuristic */
    export function worldHeuristics(state1: WorldState, state2: WorldState): number{
        var heuristic = 0;
        
        //Check the stacks if they differ
        for (var i = 0; i < state1.stacks.length; i++) {
            var stack1 = state1.stacks[i];
            var stack2 = state2.stacks[i];
            
            for (var j = 0; j < stack1.length; j++){
                var elem1 = stack1[j];
                
                //Check if the second stack has any elements at the current position
                if(j < stack2.length){
                    
                    var elem2 = stack2[j];
                    
                    if(elem1 != elem2){
                        heuristic++;
                    }
                } else {
                    //We know that the elements does not match at the current index
                    heuristic++;
                }
            }
        }
        
        return heuristic;
    }


}