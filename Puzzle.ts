
// Interface definitions for Puzzles

interface ObjectDefinition {
    form: string;
    size: string;
    color: string;
}

interface PuzzleState {
    InitialCost: number;
    stacks: string[][];
    holding: string;
    arm: number;
    objects: { [s:string]: ObjectDefinition; };
    examples: string[];
}

interface Puzzle {
    currentState : PuzzleState;

    printPuzzle(callback? : () => void) : void;
    performPlan(plan: string[], callback? : () => void) : void;

    readUserInput(prompt : string, callback : (string) => void) : void;
    printSystemOutput(output : string, participant? : string) : void;
    printDebugInfo(info : string) : void;
    printError(error : string, message? : string) : void;
}
