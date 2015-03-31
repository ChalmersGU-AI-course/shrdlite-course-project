///<reference path="World.ts"/>

module Heuristics{

	export function simple(start : WorldState, end : WorldState) : number{
		var totChange = 0;
		for (var stacknr=0; stacknr < start.stacks.length; stacknr++) {
            for (var objectnr=0; objectnr < start.stacks[stacknr].length; objectnr++) {
                var objectId = start.stacks[stacknr][objectnr];
                var endStack = stackSearch(objectId, end);
                var dStack = stacknr-endStack;
                if(endStack == -1){
                	throw "Incompatible states, object not found."
                }
                if(dStack < 0){
                	dStack = -dStack;
                }
                totChange = dStack + 2; 
            }
        }
		return totChange;
	}

	export function stackSearch(objectId, state : WorldState) : number {
		for (var stacknr=0; stacknr < state.stacks.length; stacknr++) {
            for (var objectnr=0; objectnr < state.stacks[stacknr].length; objectnr++) {
            	if(state.stacks[stacknr][objectnr] == objectId){
            		return stacknr;
            	}
            }
        }

        return -1;
	}


}