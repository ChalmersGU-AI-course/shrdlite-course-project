///<reference path="Shrdlite.ts"/>
///<reference path="TextWorld.ts"/>
///<reference path="ExampleWorlds.ts"/>
///<reference path="deepCopy.ts"/>


// start with
// tsc --out treetest.js searchTreeTest.ts && node treetest.js medium

// Extract command line arguments:
var nodename = process.argv[0];
var jsfile = process.argv[1].replace(/^.*\//, "");
var worldname = process.argv[2];

var usage = "Usage: " + nodename + " " + jsfile +
    " (" + Object.keys(ExampleWorlds).join(" | ") + ")";

if (process.argv.length != 3 || !ExampleWorlds[worldname]) {
    console.error(usage);
    process.exit(1);
}

var origState = ExampleWorlds[worldname];
console.log(origState.holding);
var world = new TextWorld(origState);

origState.arm = 2;
origState.holding = "e";
world.printWorld();

console.log("Neighbors")

var states = getNeighbors(origState);
for (var i = states.length - 1; i >= 0; i--) {
    new TextWorld(states[i]).printWorld();
}


function getNeighbors(state: WorldState): WorldState[]
{

    console.log(state.holding);
    var newStates = [];

    var useArmState = useArm(state);
    if (useArmState) {
        newStates.push(useArmState);
    }

    var moveLeftState = moveArm(state, -1);
    if (moveLeftState) {
        newStates.push(moveLeftState);
    }

    var moveRightState = moveArm(state, 1);
    if (moveRightState) {
        newStates.push(moveRightState);
    }
    return newStates;
}

function useArm(state: WorldState): WorldState
{
    if (state.holding === null) {
        console.log(state.holding);
        console.log("picking object up");
        var currentStack = state.stacks[state.arm];
        if (currentStack.length > 0) {
            var topItemIndex = currentStack.length - 1;
            var newState = owl.deepCopy(state, 5);
            newState.holding = currentStack[topItemIndex];
            newState.stacks[state.arm].splice(topItemIndex, 1);
            return newState;
        }
    } else { // holding something at the moment
        console.log("putting object down");
        var newState = owl.deepCopy(state, 5);
        //TODO: check if legal move
        newState.stacks[newState.arm].push(newState.holding);
        newState.holding = null;
        return newState;
    }
    return null;
}

function moveArm(state: WorldState, direction: number): WorldState
{
    var numberOfStacks = state.stacks.length;
    var targetPos = state.arm + direction;
    if (targetPos >= 0 && targetPos < numberOfStacks) {
        var newState = owl.deepCopy(state, 5);
        newState.arm = targetPos;
        return newState;
    }
    return null;
}