/// <reference path="collections.ts" />
/// <reference path="Interpreter.ts"/>
// Interface definitions for worlds

interface ObjectDefinition {
    form: string; 
    size: string; 
    color: string;
}

/*interface Literal{
    pol: boolean;
	rel: string; //ontopof
	args: string[];
}*/

interface WorldState {
    stacks: string[][];
    pddl: collections.Set<Interpreter.Literal>;
    holding: string;
    arm: number;
    objects: { [s:string]: ObjectDefinition; };
    examples: string[];
    planAction: string; // l, r, p, d(the possible actions that got us into this state)
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
