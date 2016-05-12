///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

/**
* Interpreter module
*
* The goal of the Interpreter module is to interpret a sentence
* written by the user in the context of the current world state. In
* particular, it must figure out which objects in the world,
* i.e. which elements in the `objects` field of WorldState, correspond
* to the ones referred to in the sentence.
*
* Moreover, it has to derive what the intended goal state is and
* return it as a logical formula described in terms of literals, where
* each literal represents a relation among objects that should
* hold. For example, assuming a world state where "a" is a ball and
* "b" is a table, the command "put the ball on the table" can be
* interpreted as the literal ontop(a,b). More complex goals can be
* written using conjunctions and disjunctions of these literals.
*
* In general, the module can take a list of possible parses and return
* a list of possible interpretations, but the code to handle this has
* already been written for you. The only part you need to implement is
* the core interpretation function, namely `interpretCommand`, which produces a
* single interpretation for a single command.
*/
module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

/**
Top-level function for the Interpreter. It calls `interpretCommand` for each possible parse of the command. No need to change this one.
* @param parses List of parses produced by the Parser.
* @param currentState The current state of the world.
* @returns Augments ParseResult with a list of interpretations. Each interpretation is represented by a list of Literals.
*/
    export function interpret(parses : Parser.ParseResult[], currentState : WorldState) : InterpretationResult[] {
        var errors : Error[] = [];
        var interpretations : InterpretationResult[] = [];
        parses.forEach((parseresult) => {
            try {
                var result : InterpretationResult = <InterpretationResult>parseresult;
                result.interpretation = interpretCommand(result.parse, currentState);
                interpretations.push(result);
            } catch(err) {
                errors.push(err);
            }
        });
        if (interpretations.length) {
            return interpretations;
        } else {
            // only throw the first error found
            throw errors[0];
        }
    }

    export interface InterpretationResult extends Parser.ParseResult {
        interpretation : DNFFormula;
    }

    export type DNFFormula = Conjunction[];
    type Conjunction = Literal[];

    /**
    * A Literal represents a relation that is intended to
    * hold among some objects.
    */
    export interface Literal {
	/** Whether this literal asserts the relation should hold
	 * (true polarity) or not (false polarity). For example, we
	 * can specify that "a" should *not* be on top of "b" by the
	 * literal {polarity: false, relation: "ontop", args:
	 * ["a","b"]}.
	 */
        polarity : boolean;
	/** The name of the relation in question. */
        relation : string;
	/** The arguments to the relation. Usually these will be either objects
     * or special strings such as "floor" or "floor-N" (where N is a column) */
        args : string[];
    }

    export function stringify(result : InterpretationResult) : string {
        return result.interpretation.map((literals) => {
            return literals.map((lit) => stringifyLiteral(lit)).join(" & ");
            // return literals.map(stringifyLiteral).join(" & ");
        }).join(" | ");
    }

    export function stringifyLiteral(lit : Literal) : string {
        return (lit.polarity ? "" : "-") + lit.relation + "(" + lit.args.join(",") + ")";
    }

    //////////////////////////////////////////////////////////////////////
    // private functions
    /**
     * The core interpretation function. The code here is just a
     * template; you should rewrite this function entirely. In this
     * template, the code produces a dummy interpretation which is not
     * connected to `cmd`, but your version of the function should
     * analyse cmd in order to figure out what interpretation to
     * return.
     * @param cmd The actual command. Note that it is *not* a string, but rather an object of type `Command` (as it has been parsed by the parser).
     * @param state The current state of the world. Useful to look up objects in the world.
     * @returns A list of list of Literal, representing a formula in disjunctive normal form (disjunction of conjunctions). See the dummy interpetation returned in the code for an example, which means ontop(a,floor) AND holding(b).
     */
    function interpretCommand(cmd : Parser.Command, state : WorldState) : DNFFormula {
        var objects : string[] = Array.prototype.concat.apply([], state.stacks);
        var interpretation : DNFFormula = [];

        if (cmd.command === 'take') {
            getEntities(state, cmd.entity.object).forEach(function(entity : string) {
                interpretation.push([{polarity: true, relation: 'holding', args: [entity]}]);
            });
        } else if (cmd.command === 'move') {
            var from : string[] = getEntities(state, cmd.entity.object);
            var to : string[] = getEntities(state, cmd.location.entity.object);

            for (var fKey in from) {
                var _from = from[fKey];

                for (var tKey in to) {
                    var _to = to[tKey];

                    if (_from === _to) continue;

                    var sameStackCheck = true, ontopStackCheck = true, floorCheck = true;

                    if (_to !== 'floor') {
                        sameStackCheck = ['inside', 'ontop', 'above'].indexOf(cmd.location.relation) > -1 ? (state.objects[_from].size !== 'large' || state.objects[_from].size === state.objects[_to].size) : true;
                        ontopStackCheck = cmd.location.relation === 'ontop' ? state.stacks[getStackIndex(_to)].indexOf(_to) === state.stacks[getStackIndex(_to)].length - 1 : true;
                    } else {
                        floorCheck = state.stacks.some(function(stack) {return stack.length === 0});
                    }

                    if (sameStackCheck && ontopStackCheck && floorCheck) {
                        interpretation.push([{polarity: true, relation: cmd.location.relation, args: [_from, _to]}]);
                    }
                }
            }
        }

        return interpretation.length > 0 ? interpretation : null;

        function getStackIndex(entity : string) : number {
            var stackIndex : number;
            for (var i = 0; i < state.stacks.length; i++) {
                if (state.stacks[i].indexOf(entity) > -1) {
                    stackIndex = i;
                    break;
                }
            }

            return stackIndex;
        }

        function getEntities(state : WorldState, condition : Parser.Object) : string[] {
            var existing : string[] = Array.prototype.concat.apply([], state.stacks);
            var result : Array<string> = new Array<string>();

            if (condition.form === 'floor') {
                result.push('floor');
                return result;
            }

            if ('location' in condition) {
                var first : string[] = getEntities(state, condition.object);
                var second : string[] = getEntities(state, condition.location.entity.object);

                first.forEach(function(entity : string) {
                    var stackIndex : number = getStackIndex(entity);

                    if (condition.location.relation === 'leftof') {
                        var neighbours : Array<string> = new Array<string>();

                        if (stackIndex > 0) neighbours = neighbours.concat(state.stacks[stackIndex - 1]);

                        second.some(function(e : string) {
                            return neighbours.indexOf(e) ? result.push(entity) && true : false;
                        });
                    } else if (condition.location.relation === 'rightof') {
                        var neighbours : Array<string> = new Array<string>();

                        if (stackIndex < state.stacks.length - 1) neighbours = neighbours.concat(state.stacks[stackIndex + 1]);

                        second.some(function(e : string) {
                            return neighbours.indexOf(e) ? result.push(entity) && true : false;
                        });
                    } else if (condition.location.relation === 'beside') {
                        var neighbours : Array<string> = new Array<string>();

                        if (stackIndex > 0) neighbours = neighbours.concat(state.stacks[stackIndex - 1]);
                        if (stackIndex < state.stacks.length - 1) neighbours = neighbours.concat(state.stacks[stackIndex + 1]);

                        second.some(function(e : string) {
                            return neighbours.indexOf(e) ? result.push(entity) && true : false;
                        });
                    } else if (condition.location.relation === 'inside') {
                        second.some(function(e : string) {
                            return state.stacks[stackIndex].indexOf(e) > -1 && state.stacks[stackIndex].indexOf(entity) === state.stacks[stackIndex].indexOf(e) + 1 && state.objects[e].form === 'box' ? result.push(entity) && true : false;
                        });
                    } else if (condition.location.relation === 'ontop') {
                        if (condition.location.entity.object.form === 'floor') {
                            if (state.stacks[stackIndex].indexOf(entity) === 0) result.push(entity);
                        } else {
                            second.some(function(e : string) {
                                return state.stacks[stackIndex].indexOf(e) > -1 && state.stacks[stackIndex].indexOf(entity) === state.stacks[stackIndex].indexOf(e) + 1 && state.objects[e].form !== 'box' ? result.push(entity) && true : false;
                            });
                        }
                    } else if (condition.location.relation === 'above') {
                        if (condition.location.entity.object.form === 'floor') {
                            result.push(entity);
                        } else {
                          second.some(function(e : string) {
                              return state.stacks[stackIndex].indexOf(e) > -1 && state.stacks[stackIndex].indexOf(entity) > state.stacks[stackIndex].indexOf(e) ? result.push(entity) && true : false;
                          });
                        }
                    } else if (condition.location.relation === 'under') {
                        second.some(function(e : string) {
                            return state.stacks[stackIndex].indexOf(e) > -1 && state.stacks[stackIndex].indexOf(entity) < state.stacks[stackIndex].indexOf(e) ? result.push(entity) && true : false;
                        });
                    }
                });
            } else {
                for (var key in existing) {
                    var value = existing[key];

                    if (
                      (condition.size === null || condition.size === state.objects[value].size) &&
                      (condition.color === null || condition.color === state.objects[value].color) &&
                      (condition.form === 'anyform' || condition.form === state.objects[value].form)
                    ) {
                      result.push(value);
                    }
                }
            }

            return result;
        }
    }
}
