
// Ducktyping subtype of WorldState :)
// should be sufficient.
class State{
    public constructor(public arm     : number,
                       public holding : string,
                       public stacks  : string[][]){}
    public toString(){
        return collections.makeString(this);
    }
}

class ObjectPosition {
    constructor(public stackNo      : number,
                public heightNo     : number,
                public objectsAbove : number,
                public isHeld       : boolean,
                public isFloor      : boolean){}
}

function isObjectInLocation(s : State, a : string, b : string, rel : string) : boolean{
    switch(rel){
        case "holding":
            return s.holding === a;
        case "inside": // Same as ontop.
        case "ontop":
            return heightDifference(s, a, b) === 1;

        case "above":   // Also incorporates "under"
            return heightDifference(s, a, b) > 0;

        case "beside": // In the stack directly to left or right
            return Math.abs(stackDifference(s, a, b)) === 1;

        case "leftof": // In the stack directly to left or right
            return stackDifference(s, a, b) === -1;

        case "rightof": // In the stack directly to left or right
            return stackDifference(s, a, b) === 1;

        default:
            throw new Planner.Error("!!! Unimplemented relation in testAtom: "+rel);
    }
}


function computeObjectPosition(s : State, objA : String) : ObjectPosition{
    var stackA  : number = -1;
    var heightA : number = -1;
    var aboveA  : number = -1;

    if(objA != "floor"){
        for(var stackNo in s.stacks){
            if(stackA > -1){
                break;
            }
            var stack = s.stacks[stackNo];
            for(var height in stack){
                if(stack[height] === objA){
                    stackA = stackNo;
                    heightA = height;
                }
            }
        }

        if(stackA > -1){
            aboveA = s.stacks[stackA].length -1 -heightA;
        }
    }

    if(s.holding === objA){
        stackA = s.arm;
        heightA = 0;
        aboveA = 0;
    }

    return new ObjectPosition(stackA, heightA, aboveA,
               s.holding === objA,
               objA === "floor");
}


/**
* Returns negative value if in different stacks.
* Otherwise, returns the number of objects in between.
* Is negative if b is above a.
*/
function heightDifference(s : State, above : String, below : String) : number {
    var a = computeObjectPosition(s, above);
    var b = computeObjectPosition(s, below);
    if(b.isHeld || a.isHeld){
        return -1;
    }

    if(a.isFloor){
        throw new Planner.Error("heightDiff: Floor cannot be above anything... "+
                                "Should never happen.");
    }

    if(b.isFloor){
        // Dont touch this line!!! Becomes string concatenation otherwise...
        return (+a.heightNo) + 1;
    }

    if(a.stackNo == b.stackNo){
        return a.heightNo - b.heightNo;
    }

    return -1;
}

/**
* Returns negative value if o2 is left of o1.
* Returns positive value if o2 is right of o1.
* Value is the difference in stacks (1 or -1 if in stacks beside each other, 0 if same stack).
*/
function stackDifference(s : State, o1 : String, o2 : String) : number {
    var a = computeObjectPosition(s, o1);
    var b = computeObjectPosition(s, o2);
    if(b.isHeld || a.isHeld){
        return 0;
    }

    if(b.isFloor || a.isFloor){
        // TODO Make sure that this never happens...
        throw new Planner.Error("Floor should not be tested as beside anything?, at least not in this manner...");
        return 0;
    }

    return a.stackNo - b.stackNo;
}
