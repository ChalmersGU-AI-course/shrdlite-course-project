
// Interface definitions for worlds

interface ObjectDefinition {
    form: string; 
    size: string; 
    color: string;
}

interface WorldState {
    stacks: string[][];
    holding: string;
    arm: number;
    objects: { [s:string]: ObjectDefinition; };
    examples: string[];
}

interface World {
    currentState : WorldState;

    printWorld(callback? : () => void) : void;
    performPlan(plan: string[], callback? : () => void) : void;

    readUserInput(prompt : string, callback : (string) => void) : void;
    printSystemOutput(output : string, participant? : string) : void;
    printDebugInfo(info : string) : void;
    printError(error : string, message? : string) : void;

}

function CanPutObjectOntop(object: ObjectDefinition, baseObject: ObjectDefinition): boolean {
    if (!baseObject) {
        baseObject = {
            form: "floor",
            size: null,
            color: null,
        };
    }
    //Balls cannot support anything.
    if (baseObject.form == "ball") {
        return false;
    }
    //Small objects cannot support large objects.
    if(baseObject.size == "small" && object.size =="large"){
        return false;
    }
    //Balls must be in boxes or on the floor, otherwise they roll away.
    //TODO check if baseobject is floor
    if(object.form == "ball" && !(baseObject.form == "box" || baseObject.form == "floor")){
            return false;
    }
    //Boxes cannot contain pyramids, planks or boxes of the same size.
    if(baseObject.form == "box" && 
      (object.form == "pyramid" || object.form =="plank" ||
      (object.form == "box" && baseObject.size == object.size))){
        return false;
    }
    //Small boxes cannot be supported by small bricks or pyramids.
    if(object.size == "small" && object.form == "box" && 
      (baseObject.form == "brick" ||baseObject.form == "pyramid")){
        return false
    }

    //Large boxes cannot be supported by large pyramids.
    if(baseObject.form == "pyramid" && baseObject.size == "large" &&
       object.form == "box" && object.size == "large"){
        return false;
    }
    return true;
}
