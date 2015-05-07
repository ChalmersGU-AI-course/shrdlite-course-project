///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="WorldRules.ts"/>

///<reference path="astar.ts" />
///<reference path="deepCopy.ts"/>

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


    export class Error implements Error {
        public name = "Planner.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
        // This function returns a dummy plan involving a random stack
        // do {
        //     var pickstack = getRandomInt(state.stacks.length);
        // } while (state.stacks[pickstack].length == 0);
        // var plan : string[] = [];

        // // First move the arm to the leftmost nonempty stack
        // if (pickstack < state.arm) {
        //     plan.push("Moving left");
        //     for (var i = state.arm; i > pickstack; i--) {
        //         plan.push("l");
        //     }
        // } else if (pickstack > state.arm) {
        //     plan.push("Moving right");
        //     for (var i = state.arm; i < pickstack; i++) {
        //         plan.push("r");
        //     }
        // }

        // // Then pick up the object
        // var obj = state.stacks[pickstack][state.stacks[pickstack].length-1];
        // plan.push("Picking up the " + state.objects[obj].form,
        //           "p");

        // if (pickstack < state.stacks.length-1) {
        //     // Then move to the rightmost stack
        //     plan.push("Moving as far right as possible");
        //     for (var i = pickstack; i < state.stacks.length-1; i++) {
        //         plan.push("r");
        //     }

        //     // Then move back
        //     plan.push("Moving back");
        //     for (var i = state.stacks.length-1; i > pickstack; i--) {
        //         plan.push("l");
        //     }
        // }

        // // Finally put it down again
        // plan.push("Dropping the " + state.objects[obj].form,
        //           "d");

        // return plan;

        console.log(intprt);
        console.log(intprt[1]);

        var plan: string[] = [];

        var graphGoal = new MultipleGoals(intprt);
        var graph = new astar.Graph(new DijkstraHeuristic(), graphGoal);
        var graphStart = new PlannerNode(state, null, null);
        var result = graph.searchPath(graphStart);

        for (var i = 1; i < result.path.length; i++) {
            var current = <PlannerNode> result.path[i];
            plan.push(current.actionMessage);
            plan.push(current.lastAction);
        }
        plan.push("Taddaaa");
        console.log(state);

        return plan;
    }

    export class PlannerNode implements astar.INode {
        state: WorldState;
        lastAction: string; //l, r , d or p
        actionMessage: string;

        constructor(state, lastAction, actionMessage) {
            this.state = state;
            this.lastAction = lastAction;
            this.actionMessage = actionMessage;
        }

        getUniqueId(): string {
            return JSON.stringify(this.state);
        }

        getNeighbors(): astar.Neighbor[] {
            var n: astar.Neighbor[] = [];

            var useArmState = this.useArm();
            if (useArmState) {
                n.push(
                    new astar.Neighbor(useArmState, 1));
            }

            var moveLeftState = this.moveArm(-1);
            if (moveLeftState) {
                n.push(
                    new astar.Neighbor(moveLeftState, 1));
            }

            var moveRightState = this.moveArm(1);
            if (moveRightState) {
                n.push(
                    new astar.Neighbor(moveRightState, 1));
            }
            return n;
        }

        useArm(): PlannerNode {
            var currentStack = this.state.stacks[this.state.arm];
            if (this.state.holding === null) {
                if (currentStack.length > 0) {
                    var topItemIndex = currentStack.length - 1;
                    var newState = owl.deepCopy(this.state, 5);
                    newState.holding = currentStack[topItemIndex];
                    newState.stacks[this.state.arm].splice(topItemIndex, 1);
                    var newMessage = "Picking up the " + newState.objects[newState.holding].form;
                    return new PlannerNode(newState, "p", newMessage);
                }
            } else { // holding something at the moment
                var newState = owl.deepCopy(this.state, 5);
                //always legal if on top of floor, else check world rules
                if (currentStack.length == 0 || WorldRules.canBeOntop(newState.holding, newState.objects[currentStack[currentStack.length - 1]])) {
                    newState.stacks[newState.arm].push(newState.holding);
                    var newMessage = "Dropping the " + newState.objects[newState.holding].form;
                    newState.holding = null;
                    return new PlannerNode(newState, "d", newMessage);
                }
            }
            return null;
        }

        moveArm(direction: number): PlannerNode {
            var numberOfStacks = this.state.stacks.length;
            var targetPos = this.state.arm + direction;
            if (targetPos >= 0 && targetPos < numberOfStacks) {
                var newState = owl.deepCopy(this.state, 5);
                newState.arm = targetPos;
                var newMessage = "Moving " + (direction > 0 ? "right" : "left");
                return new PlannerNode(newState, direction > 0 ? "r" : "l", newMessage);
            }
            return null;
        }
    }

    export class MultipleGoals implements astar.IGoal {
        targets: Interpreter.Literal[] = null;

        constructor(targetLiterals: Interpreter.Literal[][]) {
            this.targets = targetLiterals[0];
        }

        isReached(node: astar.INode): boolean {
            var n = <PlannerNode> node;

            for (var i = 0; i < this.targets.length; i++) {
                var currentLiteral = this.targets[i];

                if (!this.isLiteralFullfilled(currentLiteral, n.state)) {
                    return false;
                }
            }

            return true;
        }

        isLiteralFullfilled(lit: Interpreter.Literal, state: WorldState): boolean {
            if (lit.rel == "ontop") {
                return this.checkOntopLiteral(lit, state);
            }
            if (lit.rel == "holding") {
                return this.checkHoldingLiteral(lit, state);
            }
            return false;
        }

        checkOntopLiteral(lit: Interpreter.Literal, state: WorldState): boolean {
            var on = lit.args[0];
            var under = lit.args[1];

            // check all stacks
            for (var i = 0; i < state.stacks.length; ++i) {
                var stack = state.stacks[i];

                // if stack contains items
                if (stack) {
                    var position = stack.indexOf(on);
                    // item on floor
                    if (position == 0 && under == "floor") {
                        return true;
                    }
                    // item on top of other item
                    if (position > 0) {
                        var positionUnder = stack.indexOf(under);
                        if (positionUnder == position - 1) {
                            return true;
                        }
                    }
                }
            }

            return false;
        }

        checkHoldingLiteral(lit: Interpreter.Literal, state: WorldState): boolean {
            return state.holding == lit.args[0];
        }
    }

    export class DijkstraHeuristic implements astar.IHeuristic {
        get(node: astar.INode, goal: astar.IGoal): number {
            return 0;
        }
    }
}
