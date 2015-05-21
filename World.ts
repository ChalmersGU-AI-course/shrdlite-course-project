
// Interface definitions for worlds

interface ObjectDefinition {
    form: string;
    size: string;
    color: string;
}

interface WorldState {
    stacks: string[][];
    holding1: string;
    arm1: number;
    holding2: string;
    arm2: number;
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

function getWorldCloneShallow(world: WorldState): WorldState {
    var clone = {
        stacks: world.stacks,
        holding1: world.holding1,
        arm1: world.arm1,
        holding2: world.holding2,
        arm2: world.arm2,
        objects: world.objects,
        examples: world.examples
    };

    return clone;
}

function getWorldCloneDeep(world: WorldState, stack1ToDeepCopy: number, stack2ToDeepCopy: number): WorldState {
    var clone = getWorldCloneShallow(world);

    clone.stacks = clone.stacks.slice(0);
    clone.stacks[stack1ToDeepCopy] = clone.stacks[stack1ToDeepCopy].slice(0);
    clone.stacks[stack2ToDeepCopy] = clone.stacks[stack2ToDeepCopy].slice(0);

    return clone;
}