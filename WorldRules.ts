
//Determines if object can be put ontop of baseObject
function canPutObjectOntop(object: ObjectDefinition, baseObject: ObjectDefinition): boolean {
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

function isRelativeMatch(firstObject: string, relation: string, secondObject: string, world: WorldState): boolean {
    if (firstObject === "floor" && relation !== "under") {
        return false;
    }

    var firstPosition = getObjectPosition(firstObject, world);
    if (!firstPosition){
        return false;
    }
    var secondPosition: ObjectPosition;
    if (secondObject === "floor") {
        secondPosition = new ObjectPosition(firstPosition.Column, -1);
    } else {
        secondPosition = getObjectPosition(secondObject, world);
    }

    if (!secondPosition) {
        return false;
    }

    switch (relation) {
        case "leftof":
            return firstPosition.Column < secondPosition.Column;
        case "rightof":
            return firstPosition.Column > secondPosition.Column;
        case "beside":
            return Math.abs(firstPosition.Column - secondPosition.Column) === 1;
        case "containing":
        case "under":
            return firstPosition.Column === secondPosition.Column && 
                   firstPosition.Row + 1 === secondPosition.Row;
        case "inside":
        case "ontop":
            return firstPosition.Column === secondPosition.Column && 
                   firstPosition.Row === secondPosition.Row + 1;
        case "below":
            return firstPosition.Column === secondPosition.Column && 
                   firstPosition.Row < secondPosition.Row;
        case "above":
            return firstPosition.Column === secondPosition.Column && 
                   firstPosition.Row > secondPosition.Row;
    }
    throw "Invalid relation '" + relation + "'";
}