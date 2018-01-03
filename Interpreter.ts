
import {WorldState} from "./World";

import {
    ShrdliteResult,
    Command, TakeCommand, DropCommand, MoveCommand,
    /*
    // Here's an example of a new command
    // Don't forget to add it to Grammar.ne and Types.ts
    WhereisCommand,
    */
    Location, Entity,
    Object, RelativeObject, SimpleObject,
    DNFFormula, Conjunction, Literal,
} from "./Types";

/********************************************************************************
** Interpreter

The goal of the Interpreter module is to interpret a sentence
written by the user in the context of the current world state. 
In particular, it must figure out which objects in the world,
i.e. which elements in the 'objects' field of WorldState, correspond
to the ones referred to in the sentence. 

Moreover, it has to derive what the intended goal state is and
return it as a logical formula described in terms of literals, where
each literal represents a relation among objects that should
hold. For example, assuming a world state where "a" is a ball and
"b" is a table, the command "put the ball on the table" can be
interpreted as the literal ontop(a,b). More complex goals can be
written using conjunctions and disjunctions of these literals.
 
In general, the module can take a list of possible parses and return
a list of possible interpretations, but the code to handle this has
already been written for you. The only part you need to implement is
the core interpretation function, namely 'interpretCommand', which 
produces a single interpretation for a single command.

You should implement the function 'interpretCommand'. 
********************************************************************************/

//////////////////////////////////////////////////////////////////////
// exported functions, classes and interfaces/types

/* Top-level function for the Interpreter. 
 * It calls 'interpretCommand' for each possible parse of the command. 
 * You don't have to change this function.
 *
 * @param parses: List of parses produced by the Parser.
 * @param currentState: The current state of the world.
 * @returns: List of interpretation results, which are the parse results augmented 
 *           with interpretations. Each interpretation is represented by a DNFFormula.
 *           If there's an interpretation error, it returns a string with a description of the error.
 */

export function interpret(parses : ShrdliteResult[], currentState : WorldState) : ShrdliteResult[] | string {
    var errors : string[] = [];
    var interpretations : ShrdliteResult[] = [];
    parses.forEach((result) => {
        var intp : string | DNFFormula = interpretCommand(result.parse, currentState);
        if (typeof(intp) === "string") {
            errors.push(intp);
        } else {
            result.interpretation = intp;
            interpretations.push(result);
        }
    });
    if (interpretations.length > 0) {
        return interpretations;
    } else {
        // merge all errors into one
        return errors.join(" ; ");
    }
}


/* The core interpretation function. 
 * The code here is just a template; you should rewrite this function entirely. 
 * In this template, the code produces a dummy interpretation which is 
 * not connected to the input 'cmd'. Your version of the function should
 * analyse 'cmd' in order to figure out what interpretation to return.
 * 
 * Note that you should not change the API (type) of this function, only its body.
 *
 * @param cmd: An object of type 'Command'.
 * @param state: The current state of the world.
 * @returns: A DNFFormula representing the interpretation of the user's command.
 *           If there's an interpretation error, it returns a string with a description of the error.
 */

function interpretCommand(cmd : Command, state : WorldState) : string | DNFFormula {
    // This returns a dummy interpretation involving two random objects in the world
    var objects : string[] = Array.prototype.concat.apply([], state.stacks);
    var a : string = objects[Math.floor(Math.random() * objects.length)];
    var b : string = objects[Math.floor(Math.random() * objects.length)];
    var interpretation = new DNFFormula([
        new Conjunction([
            // ontop(a, floor) & holding(b)
            new Literal("ontop", [a,"floor"], true),
            new Literal("holding", [b], true),
        ])
    ]);
    return interpretation;
}

