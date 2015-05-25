///<reference path="../Planner.ts"/>
///<reference path="../ExampleWorlds.ts"/>

/////////////////////////////////////////////////////////////////////////////////////////////////////
/*  
    TTTTTTT   EEEEE      sSSSs   tTTTTTt
       T      E         sS   ss      T
       T      EEEe        Ss        T
       T      E        ss   Ss       T
       T      EEEEE     sSSSs        T
*/
/////////////////////////////////////////////////////////////////////////////////////////////////////

function testCloning(state: WorldState) {
    console.log("------------TEST FOR CLONING------------");
    var cloned: WorldState = Planner.cloneWorldstate(state);
    if (cloned.arm == state.arm)
        console.log("STATES ARMS ARE EQUAL");
    if (cloned.holding == state.holding)
        console.log("STATES HOLDING ARE EQUAL");

    state.stacks = null;
    if (state.stacks === null)
        console.log("STACKS ARE NOW NULL " + state.stacks);

    state.objects = null;
    if (state.objects === null)
        console.log("OBJECTS ARE NOW " + state.objects);

    console.log("Cloned state: " + cloned.objects);
    console.log("Cloned state: " + cloned.stacks);

    console.log("Cloning back to original");
    state.stacks = Planner.cloneObject(cloned.stacks);
    state.objects = Planner.cloneObject(cloned.objects);
    console.log("Original state: " + state.objects);
    console.log("Original state: " + state.stacks);

    //Testing the equality for the stacks
    var equal = true;
    for (var i = 0; i < state.stacks.length; i++) {
        for (var j = 0; j < state.stacks[i].length; j++) {
            if (!(state.stacks[i][j] === cloned.stacks[i][j])) {
                equal = false;
            }
        }
    }

    //Testing the equality for objects
    var l: string;
    for (l in state.objects) {
        if (!(cloned.objects[l].color === state.objects[l].color))
            equal = false;
        if (!(cloned.objects[l].form === state.objects[l].form))
            equal = false;
        if (!(cloned.objects[l].size === state.objects[l].size))
            equal = false;
    }


    console.log("Success of cloning is " + equal);
    console.log("---------------TEST DONE----------------");
}

testCloning(ExampleWorlds["small"]);