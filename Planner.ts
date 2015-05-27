///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Graph.ts"/>
///<reference path="lib/collections.ts"/>
///<reference path="ShrdliteNode.ts"/>
///<reference path="ShrdliteNodeFilter.ts"/>

module Planner {


    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretations: Interpreter.Result[], currentState: WorldState): Result[] {
        var plans: Result[] = [];
        interpretations.forEach((intprt) => {
            var plan: Result = <Result>intprt;
            plan.plan = planInterpretation(plan.intp, currentState);
            plans.push(plan);
        });
        if (plans.length) {
            return plans;
        } else {
            throw new Planner.Error("Found no plans");
        }
    }

    export interface Result extends Interpreter.Result { plan: string[]; }


    export function planToString(res: Result): string {
        return res.plan.join(", ");
    }


    export class Error implements Error {
        public name = "Planner.Error";
        constructor(public message?: string) { }
        public toString() { return this.name + ": " + this.message }
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    function planInterpretation(intprt: Interpreter.Literal[][], state: WorldState): Array<string> {
        //Add my amazing code here!
        var currentNode: ShrdliteNode = new ShrdliteNode(state);

        var targetFilter: ShrdliteNodeFilter = new ShrdliteNodeFilter(intprt[0][0]);

        //var targetNode: ShrdliteNode = new ShrdliteNode(intprt);

        var g: Graph<ShrdliteNode, number> = new Graph<ShrdliteNode, number>([currentNode], null);
        var picks: { node: ShrdliteNode; edge: number }[] = <{ node: ShrdliteNode; edge: number }[]>g.fintPathToFilter<ShrdliteNodeFilter>(currentNode, targetFilter);

        // Overhead med noder... borde kanske edgen vara 'l', 'r', 'p', 'd' direkt? och bara returnera den?
        // This function returns a dummy plan involving a random stack
        var plan: Array<string> = [];

        //TODO: maybe empty
        if (picks == undefined)
            throw new Error('That is an impossible move');


        while (picks.length > 0) {
            var pick = picks.pop();
            var currentNode = pick.node;
            var pickstack = pick.edge;


            //Move arm!
            var arm_row = Math.floor(currentNode.state.arm / currentNode.state.rowLength);
            var pick_row = Math.floor(pickstack / currentNode.state.rowLength);
            var arm_col = currentNode.state.arm % currentNode.state.rowLength;
            var pick_col = pickstack % currentNode.state.rowLength;

            if (pick_row < arm_row) {
                plan.push("Moving forward");
                for (var i = arm_row; i > pick_row; --i) {
                    plan.push("f");
                }
            }
            if (pick_row > arm_row) {
                plan.push("Moving backward");
                for (var i = arm_row; i < pick_row; ++i) {
                    plan.push("b");
                }
            }

            if (pick_col < arm_col) {
                plan.push("Moving left");
                for (var i = arm_col; i > pick_col; --i) {
                    plan.push("l");
                }
            } else if (pick_col > arm_col) {
                plan.push("Moving right");
                for (var i = arm_col; i < pick_col; ++i) {
                    plan.push("r");
                }
            }

            if (currentNode.state.holding == null) {
                var obj = currentNode.state.stacks[pickstack][currentNode.state.stacks[pickstack].length - 1];
                plan.push("Picking up the " + currentNode.state.objects[obj].form, "p");
            } else {
                var obj = currentNode.state.holding;
                plan.push("Dropping the " + currentNode.state.objects[obj].form, "d");
            }
        }

        return plan;
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
