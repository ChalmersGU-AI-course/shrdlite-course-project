///<reference path="World.ts"/>

module Auxiliary { 

	export function listNeighbours(currentState : WorldState) : WorldState[] {
		var nlist : WorldState[]=[];

		if(currentState.holding==null && !currentState.stacks[currentState.arm].length){
			var n : WorldState = copyObject(currentState);
			n.holding = n.stacks[n.arm].pop();
			nlist.push(n);
		}else if(currentState.holding){ //TODO: Check if the object can be dropped
			var n : WorldState = copyObject(currentState);
			n.stacks[n.arm].push(n.holding);
			n.holding=null;
			nlist.push(n);
		}
		if(currentState.arm > 0){
			var n : WorldState = copyObject(currentState);
			n.arm = n.arm-1;
			nlist.push(n);
		}		
		if(currentState.arm < 4){
			var n : WorldState = copyObject(currentState);
			n.arm = n.arm-1;
			nlist.push(n);
		}

		return nlist;
	}

	function copyObject<T> (object:T): T {
    var objectCopy = <T>{};

    for (var key in object)
    {
        if (object.hasOwnProperty(key))
        {
            objectCopy[key] = object[key];
        }
    }

    return objectCopy;
	}

}