///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="lib/astar-worldstate/astar.ts"/>
///<reference path="lib/utils.ts" />

module Planner {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretations : Interpreter.Result[], currentState : WorldState) : Result[] {
        var plans : Result[] = [];
        interpretations.forEach((intprt) => {
            var plan : Result = <Result>intprt;
            plan.plan = planInterpretation(plan.intp, currentState);
            plans.push(plan);
        });
        if (plans.length) {
            return plans;
        } else {
            throw new Planner.Error("Found no plans");
        }
    }


    export interface Result extends Interpreter.Result {plan:string[];}


    export function planToString(res : Result) : string {
        return res.plan.join(", ");
    }


    export class Error {
        public name = "Planner.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {

        var solution = aStar.aStar(new WorldStateNode(state), intprt);

        if(solution !== null ) {
            var moves = [];
            var path = solution.getPath();

            for(var moveIx = 0; moveIx < path.size(); moveIx++) {
                var currentMove = path.elementAtIndex(moveIx);
                moves.push(explainMove(path, moveIx));
                moves.push(currentMove.getCommand());
            }

            return moves;
        } else {
            throw new Planner.Error("Could not plan a path that fulfills the goals.")
        }
    }

    function explainMove(path, moveIndex) : string {
        var move = path.elementAtIndex(moveIndex);

        var returnString = "";

        switch (move.getCommand()) {
            case "p":
                if (move.getEndNode().state.isHolding()) {
                    var pickObj        = move.getEndNode().state.getHoldingObj();
                    var nrSameForm     = move.getEndNode().state.getNrOfObjects(pickObj.form, "any", "any");
                    var nrSameFormSize = move.getEndNode().state.getNrOfObjects(pickObj.form, pickObj.size, "any");

                    for (var i = moveIndex; i < path.size(); i++) {
                        // If this is last move, we wont drop it.
                        if (i === path.size()-1) {
                            returnString += "Picking up the "
                            if (nrSameForm === 1) {
                                returnString += pickObj.form;
                            } if (nrSameFormSize === 1) {
                                returnString += pickObj.size + " " + pickObj.form;
                            } else {
                                returnString += pickObj.size + " " + pickObj.color + " " + pickObj.form;
                            }
                        } else {
                            if (path.elementAtIndex(i).getCommand() == "d") {
                                returnString += "Moving the ";
                                if (nrSameForm === 1) {
                                    returnString += pickObj.form;
                                } else if (nrSameFormSize === 1) {
                                    returnString += pickObj.size + " " + pickObj.form;
                                } else {
                                    returnString += pickObj.size + " " + pickObj.color + " " + pickObj.form;
                                }

                                var stackHeightDropIndex = path.elementAtIndex(i).getFromNode().state.stackHeight(path.elementAtIndex(i).getFromNode().state.arm);

                                if (stackHeightDropIndex > 0) {
                                    returnString += " on top of the ";

                                    var dropOnObjName = path.elementAtIndex(i).getFromNode().state.stacks[path.elementAtIndex(i).getFromNode().state.arm][stackHeightDropIndex-1];
                                    var dropOnObj = path.elementAtIndex(i).getFromNode().state.objects[dropOnObjName];

                                    var nrSameFormDropObj     = move.getFromNode().state.getNrOfObjects(dropOnObj.form, "any", "any");
                                    var nrSameFormSizeDropObj = move.getFromNode().state.getNrOfObjects(dropOnObj.form, dropOnObj.size, "any");

                                    if(nrSameFormDropObj === 1) {
                                        returnString += dropOnObj.form;
                                    } else if(nrSameFormSizeDropObj === 1) {
                                        returnString += dropOnObj.size + " " + dropOnObj.form;
                                    } else {
                                        returnString += dropOnObj.size + " " + dropOnObj.color + " " + dropOnObj.form;
                                    }
                                } else {
                                    returnString += " to the floor";
                                }
                                break;
                            }
                        }
                    }


                }
                break;
        }
        if(returnString.length > 0) {
            returnString += ".";
        }
        return returnString.toString();
    }
}
