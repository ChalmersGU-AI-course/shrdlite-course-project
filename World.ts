
// Interface definitions for worlds

/**
* A reference to an object in the world, given as a combination of a
* form, a size and a color. Might be ambiguous.
*/
interface ObjectDefinition {
    /** "brick", "plank", "ball", "box", "table", etc. */
    form: string;
    /** "large", "small", etc. */
    size: string;
    /** "red", "black", "white", etc. */
    color: string;
}

/**
* The state of the world.
*/
interface WorldState {
    /** The stack of objects in each column, given as a list of
     * stacks. Each stack is a list of strings. The strings themselves
     * are keys into the `objects` map, i.e. identifiers. */
    stacks: Stack[];
    /** Which object the robot is currently holding. */
    holding: string;
    /** The column position of the robot arm. */
    arm: number;
    /** A mapping from strings to `ObjectDefinition`s. The strings are meant to be identifiers for the objects (see ExampleWorlds.ts for an example). */
    objects: { [s:string]: ObjectDefinition; };
    /** List of predefined example sentences/utterances that the user can choose from in the UI. */
    examples: string[];
}

type Stack = string[];

/**
* Interface for a world. Abstracts over the I/O required to read user
* input, print the world and perform a plan. This is needed to support
* several backends, e.g. the SVG backend that is used in the browser,
* and the text-based console backend.
*/
interface World {
    currentState : WorldState;

    printWorld(callback? : () => void) : void;
    performPlan(plan: string[], callback? : () => void) : void;

    readUserInput(prompt : string, callback : (input:string) => void) : void;
    printSystemOutput(output : string, participant? : string) : void;
    printDebugInfo(info : string) : void;
    printError(error : string, message? : string) : void;
}
