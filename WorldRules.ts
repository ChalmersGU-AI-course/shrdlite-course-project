///<reference path="World.ts"/>

module WorldRules {

    export function canBeOntop(topObject: ObjectDefinition, bottomObject: ObjectDefinition) : boolean {
        var okBallRules = ballRules(topObject, bottomObject);
        var okSmallRules = smallObjectRules(topObject, bottomObject);
        var okBoxRules = boxRules(topObject, bottomObject);
        return (okBallRules && okSmallRules && okBoxRules);
    }

    function ballRules(topObject: ObjectDefinition, bottomObject: ObjectDefinition) : boolean {
        if(topObject.form == "ball"){
            if(bottomObject.form != "box"){
                //Balls must be in boxes or on the floor, otherwise they roll away.
                return false;
            }
        }
        else if(bottomObject.form == "ball"){
            //Balls cannot support anything.
            return false;
        }
        return true;
    }

    function smallObjectRules(topObject: ObjectDefinition, bottomObject: ObjectDefinition): boolean {
        //Small objects cannot support large objects.
        if(topObject.size == "large" && bottomObject.size == "small"){
            return false;
        }
        else{
            return true;
        }
    }

    function boxRules(topObject: ObjectDefinition, bottomObject: ObjectDefinition): boolean {
        if(bottomObject.form == "box")
        {
            //Boxes cannot contain pyramids, planks or boxes of the same size.
            if(topObject.form == "pyramid" || topObject.form == "plank"){
                return false;
            }
            else if(topObject.form == "box" && topObject.size == bottomObject.size){
                return false;
            }
        }
        if(topObject.form == "box"){
            if(topObject.size == "small"){
                //Small boxes cannot be supported by small bricks or pyramids.
                var isSmallBrick = (bottomObject.form == "brick" && bottomObject.size == "small");
                var isPyramid = (bottomObject.form == "pyramid");
                if(isSmallBrick||isPyramid){
                    return false;
                }
            }
            else if(topObject.size == "large"){
                //Large boxes cannot be supported by large pyramids.*/
                if(bottomObject.form == "pyramid" && bottomObject.size == "large"){
                    return false;
                }
            }
        }
        return true;
    }
}