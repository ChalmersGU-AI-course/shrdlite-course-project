///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>

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

        var plan: string[] = [];

        var graphGoal = new MultipleGoals();
        var graph = new astar.Graph(new DijkstraHeuristic(), graphGoal);
        var graphStart = new PlannerNode(state, null, null);
        var result = graph.searchPath(graphStart);

        for (var i = 1; i < result.path.length; i++) {
            var current = <PlannerNode> result.path[i];
            plan.push(current.actionMessage);
            plan.push(current.lastAction);
        }
        plan.push("Taddaaa");

        return plan
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
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
            if (this.state.holding === null) {
                console.log(this.state.holding);
                console.log("picking object up");
                var currentStack = this.state.stacks[this.state.arm];
                if (currentStack.length > 0) {
                    var topItemIndex = currentStack.length - 1;
                    var newState = owl.deepCopy(this.state, 5);
                    newState.holding = currentStack[topItemIndex];
                    newState.stacks[this.state.arm].splice(topItemIndex, 1);
                    var newMessage = "Picking up the " + newState.objects[newState.holding].form;
                    return new PlannerNode(newState, "p", newMessage);
                }
            } else { // holding something at the moment
                console.log("putting object down");
                var newState = owl.deepCopy(this.state, 5);
                //TODO: check if legal move
                newState.stacks[newState.arm].push(newState.holding);
                var newMessage = "Dropping the " + newState.objects[newState.holding].form;
                newState.holding = null;
                return new PlannerNode(newState, "d", newMessage);
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

        constructor() {
        }

        isReached(node: astar.INode): boolean {
            var n = <PlannerNode> node;

            //return n.state.arm === 2;
            return n.state.stacks[1].length === 0;
        }
    }

    export class DijkstraHeuristic implements astar.IHeuristic {
        get(node: astar.INode, goal: astar.IGoal): number {
            return 0;
        }
    }
}
