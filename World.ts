
// Interface definitions for worlds

interface ObjectDefinition {
    form: string; 
    size: string; 
    color: string;
}

class ObjectPosition {
    constructor (
        public Column: number,
        public Row: number
    ){}
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

//Returns a deep copy of the stacks which can be edited without the original being changed
function copyStacks(stacks: string[][]): string[][] {
    return stacks.slice().map(function(stack) { return stack.slice()});
}

//Searched for the specified object and returns its position, null if object not found
function getObjectPosition(object: string, world: WorldState): ObjectPosition {
    for (var i = 0; i < world.stacks.length; ++i) {
        var stack = world.stacks[i];
        for (var j = 0; j < stack.length; ++j) {
            if (stack[j] == object) {
                return new ObjectPosition(i, j);
            }
        }
    }
    return null;
}

//Returns the column of the object
function getObjectColumn(object: string, world: WorldState): number {
    var position = getObjectPosition(object, world);
    if (position) {
        return position.Column;
    }
    if (world.holding == object) {
        return world.arm;
    }
    return null;
}

//Returns all objects that are above the specified object in its stack
function getBlockingObjects(object: string, world: WorldState): string[] {
    var position = getObjectPosition(object, world);
    if (position === null) {
        return [];
    }

    var stack = world.stacks[position.Column];
    var blocking = [];
    for (var i = position.Row + 1; i < stack.length; ++i) {
        blocking.push(stack[i]);
    }
    return blocking;
}

//Returns the topmost object in the specified column, null if the stack is empty
function getTopObjectInColumn(column: number, world: WorldState): ObjectDefinition {
    var stack = world.stacks[column];

    for (var i = stack.length - 1; i >= 0; --i) {
        if (stack[i]) {
            var retObject = world.objects[stack[i]];
            return retObject;
        }
    }
    return null;
}

//Returns true if the specified state satisfies the specified literal
function stateSatisfiesLiteral(state: WorldState, literal: Interpreter.Literal) : boolean {
    if (literal.rel === "holding") {
        return state.holding === literal.args[0];
    }

    var firstObject : string = literal.args[0];
    var secondObject : string = literal.args[1];
    return isRelativeMatch(firstObject, literal.rel, secondObject, state);
}

//Returns a subset of literals that are not satisfied by the current state
function getUnsatisfiedLiterals(literals: Interpreter.Literal[], world: WorldState): Interpreter.Literal[] {
    var unsatisfiedLiterals = literals.filter(function(l) {
        return !stateSatisfiesLiteral(world, l);
    });
    return unsatisfiedLiterals;
}