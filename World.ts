
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
