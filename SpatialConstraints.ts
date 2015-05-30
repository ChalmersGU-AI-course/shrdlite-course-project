
module Spatial {

    //Ensures that it is possible to perform a specific PDDL goal in the current world.
    //Returns the string "ok" if the goal is valid. Otherwise it returns
    //the an error string.
    export function validatePDDLGoal(pddl, state : WorldState) : string
    {
        console.log(pddl.rel);

        if(pddl.rel === "ontop" ||
           pddl.rel == "inside" ||
           pddl.rel == "under")
        {
            var objA = pddl.args[0];
            var objB = pddl.args[1];

            if(objA === objB)
                return "Can't put an object on itself.";

            if(pddl.rel == "under")
            {
                var tmp = objA;
                objA = objB;
                objB = tmp;
            }

            //Some things cannot be placed ontop of other things.
            //But everything can be placed on the floor.
            if(pddl.args[1] !== "floor")
            {
                var a =  state.objects[objA];
                var b =  state.objects[objB];
                if(!canBeOntop(a, b) )
                    return ontopError(a, b);
            }
        }
        else if (pddl.rel === "leftof")
        {
            var left = pddl.args[1];
            var lPos = objPos(left, state);

            //The left object can't be right next to the left wall.
            if(lPos == 0)
            {
                var lObj = state.objects[left];
                var rObj = state.objects[pddl.args[0]];
                return "Cannot move to the " + rObj.color + " " + rObj.form + " to left of the " +
                    lObj.color + " " + lObj.form + " since the " + lObj.color +
                    " " + lObj.form + " is located at the left wall.";
            }
        }
        else if (pddl.rel === "rightof")
        {
            var right = pddl.args[1];
            var rPos = objPos(right, state);

            //The right object can't be right next to the right wall.
            if(rPos == state.stacks.length - 1)
            {
                var rObj = state.objects[right];
                var lObj = state.objects[pddl.args[0]];
                return "Cannot move to the " + lObj.color + " " + lObj.form + " to right of the " +
                    rObj.color + " " + rObj.form + " since the " + rObj.color + " " + rObj.form + " is located at the right wall.";
            }
        }

        return "ok";
    }


    //Compares the sizes of "large" and "small" objects.
    //Returns 1 if a is bigger, -1 if b is bigger, 0 if the objects are of the same size.
    function sizeCmp(a : string, b :string) {
        if(a === "large")
        {
            return b === "large" ? 0 : 1;
        }
        else if(a === "small")
        {
            return b === "small" ? 0 : -1;
        }
        else
        {
            throw "Can't compare that size!";
        }
    }

    //checks if an object can bo ontop of another object.
    export function canBeOntop(over, under)
    {
        //Balls must be in boxes or on the floor.
        if(over.form === "ball" &&
           under.form !== "box")
            return false;

        //Balls cannot support anything
        if(under.form === "ball")
            return false;

        //Small objects cannot support large objects.
        if(over.size  === "large" && under.size === "small")
            return false;

        //Boxes cannot contain pyramids, planks or boxes of the same size
        if(under.form === "box" &&
           sizeCmp(under.size, over.size) == 0 &&
           (over.form === "box" ||
            over.form === "pyramids" ||
            over.form === "plank"))
            return false;

        //Small boxes cannot be supported by small bricks or pyramids.
        if(over.size  === "small" &&
           under.size === "small" &&
          (under.form === "brick" ||
           under.form === "pyramid") &&
           over.form  === "box")
            return false;

        //Large boxes cannot be supported by large pyramids.
        if(over.size === "large" &&
           under.size === "large" &&
           under.form === "pyramid" &&
           over.form === "box")
            return false;

        return true;
    }

    //Error string incase over cannot bo ontop of under.
    function ontopError(over, under)
    {
        return "A " + over.size +
            " "  + over.form +
            " cannot be placed " +
            (under.form === "box" ? "inside a " : "ontop a ") +
            under.size + " " + under.form + ".";
    }

    //Returns the stack number of the object
    function objPos(obj : string, state : WorldState) : number
    {
        for(var i = 0; i < state.stacks.length; i++)
        {
            for(var j = 0; j < state.stacks[i].length; j++)
            {
                if(state.stacks[i][j] === obj)
                    return i;
            }
        }

        if(state.holding == obj)
            return state.stacks.length / 2;
    }
}
