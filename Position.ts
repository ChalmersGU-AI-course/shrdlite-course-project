
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
