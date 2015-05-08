/// <reference path="collections.ts" />
// Interface definitions for worlds

interface ObjectDefinition {
    form: string; 
    size: string; 
    color: string;
}

interface predicate{
	rel: string; //ontopof
	args: string[];
}

interface WorldState {
    stacks: string[][];
    pddl: collections.Set<predicate>;
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
