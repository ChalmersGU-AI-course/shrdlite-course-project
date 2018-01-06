
import {WorldState} from "./World";

import {
    ShrdliteResult,
    Command, TakeCommand, DropCommand, MoveCommand,
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
 * @param world: The current state of the world.
 * @returns: List of interpretation results, which are the parse results augmented 
 *           with interpretations. Each interpretation is represented by a DNFFormula.
 *           If there's an interpretation error, it throws an error with a string description.
 */

export function interpret(parses : ShrdliteResult[], world : WorldState) : ShrdliteResult[] {
    var errors : string[] = [];
    var interpretations : ShrdliteResult[] = [];
    var interpreter : Interpreter = new Interpreter(world);
    for (var result of parses) {
        try {
            var intp : DNFFormula = interpreter.interpretCommand(result.parse);
        } catch(err) {
            errors.push(err);
            continue;
        }
        result.interpretation = intp;
        interpretations.push(result);
    };
    if (interpretations.length == 0) {
        // merge all errors into one
        throw errors.join(" ; ");
    }
    return interpretations;
}


/* The core interpretation class. 
 * The code here are just templates; you should rewrite this class entirely. 
 * In this template, the code produces a dummy interpretation which is 
 * not connected to the input 'cmd'. Your version of the class should
 * analyse 'cmd' in order to figure out what interpretation to return.
 */

class Interpreter {
    constructor(
        private world : WorldState
    ) {}

    /* The main interpretation method.
     * Note that you should not change the API (type) of this method, only its body.
     * This method should call the mutually recursive methods 
     * 'interpretEntity', 'interpretLocation' and 'interpretObject'
     *
     * @param cmd: An object of type 'Command'.
     * @returns: A DNFFormula representing the interpretation of the user's command.
     *           If there's an interpretation error, it throws an error with a string description.
     */

    public interpretCommand(cmd : Command) : CommandSemantics {
        // This currently returns a dummy interpretation involving one or two random objects in the world.
        // Instead it should call the other interpretation methods for
        // each of its arguments (cmd.entity and/or cmd.location).
        var interpretation : CommandSemantics;

        var all_objects : string[] = Array.prototype.concat.apply([], this.world.stacks);
        if (this.world.holding) {
            all_objects.push(this.world.holding);
        }

        if (cmd instanceof MoveCommand) {
            var a = all_objects[Math.floor(Math.random() * all_objects.length)];
            var b = all_objects[Math.floor(Math.random() * all_objects.length)];
            if (a == b) {
                throw "Cannot put an object ontop of itself";
            }
            interpretation = new DNFFormula([
                new Conjunction([ // ontop(a, b) & ontop(b, floor)
                    new Literal("ontop", [a, b]),
                    new Literal("ontop", [b, "floor"])
                ])
            ]);
        }

        else if (cmd instanceof TakeCommand) {
            var a = all_objects[Math.floor(Math.random() * all_objects.length)];
            interpretation = new DNFFormula([
                new Conjunction([ // holding(a)
                    new Literal("holding", [a])
                ])
            ]);
        }

        else if (cmd instanceof DropCommand) {
            if (!this.world.holding) {
                throw "I'm not holding anything";
            }
            var a = this.world.holding;
            var b = all_objects[Math.floor(Math.random() * all_objects.length)];
            if (a == b) {
                throw "Cannot put an object ontop of itself";
            }
            interpretation = new DNFFormula([
                new Conjunction([ // ontop(a, b)
                    new Literal("ontop", [a, b])
                ])
            ]);
        }

        else {
            throw "Unknown command";
        }

        return interpretation;
    }

    interpretEntity(ent : Entity) : EntitySemantics {
        throw "Not implemented";
    }

    interpretLocation(loc : Location) : LocationSemantics {
        throw "Not implemented";
    }

    interpretObject(obj : Object) : ObjectSemantics {
        throw "Not implemented";
    }

}


//////////////////////////////////////////////////////////////////////
// These are suggestions for semantic representations 
// of the different parse result classes.

// This is the main interpretation result, a DNF formula
type CommandSemantics  = DNFFormula

// The semantics of an object description is a collection of
// the objects that match the description
type ObjectSemantics   = string[]

// The semantics of an Entity or a Location is just a wrapper
// around the semantics of its children
type EntitySemantics   = {quantifier : string; object : ObjectSemantics}
type LocationSemantics = {relation : string; entity : EntitySemantics}

