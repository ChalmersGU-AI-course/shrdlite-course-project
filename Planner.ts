///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Astar.ts"/>

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

    class WorldNode implements INode<WorldNode> {
        constructor(
            public State: WorldState
            ) {}
        
        Neighbours() : Neighbour<WorldNode>[] {
            var neighbours: Neighbour<WorldNode>[] = [];

            if (this.CanDrop()) {
                neighbours.push(this.Drop());
            }

            if (this.CanPickUp()) {
                neighbours.push(this.PickUp());
            }

            if (this.CanGoLeft()) {
                neighbours.push(this.GoLeft());
            }

            if (this.CanGoRight()) {
                neighbours.push(this.GoRight());
            }
            return neighbours;
        }

        CanDrop(): boolean {
            if (!this.State.holding) {
                return false;
            }
            var topObject = this.GetTopObjectInColumn(this.State.arm);
            var heldObject = this.State.objects[this.State.holding];
            return this.CanPutObjectOntop(heldObject, topObject);
        }

        CanGoLeft(): boolean {
            return this.State.arm > 0;
        }

        CanGoRight(): boolean {
            return this.State.arm < this.State.stacks.length - 1;
        }

        CanPickUp(): boolean {
            if (this.State.holding) {
                return false;
            }
            var topObject = this.GetTopObjectInColumn(this.State.arm);
            return (topObject != null);
        }

        Drop(): Neighbour<WorldNode> {
            var newStacks = this.CopyStacks();
            newStacks[this.State.arm].push(this.State.holding);
            var newWorld = this.Copy(newStacks);
            newWorld.State.holding = null;
            return new Neighbour<WorldNode>(newWorld, 1, "d");
        }

        GoLeft(): Neighbour<WorldNode> {
            var newWorld = this.Copy(this.State.stacks);
            newWorld.State.arm -= 1;
            return new Neighbour<WorldNode>(newWorld, 1, "l");
        }

        GoRight(): Neighbour<WorldNode> {
            var newWorld = this.Copy(this.State.stacks);
            newWorld.State.arm += 1;
            return new Neighbour<WorldNode>(newWorld, 1, "r");
        }

        PickUp(): Neighbour<WorldNode> {
            var newStacks = this.CopyStacks();
            var holding = newStacks[this.State.arm].pop();
            var newWorld = this.Copy(newStacks);
            newWorld.State.holding = holding;
            return new Neighbour<WorldNode>(newWorld, 1, "p");
        }

        CopyStacks(): string[][] {
            return this.State.stacks.map(function(stack) {
                return stack.slice();
                });
        }

        Copy(stacks: string[][]): WorldNode {
            var state: WorldState = {
                stacks: stacks,
                holding: this.State.holding,
                arm: this.State.arm,
                objects: this.State.objects,
                examples: this.State.examples,
            };

            return new WorldNode(state);
        }

        GetTopObjectInColumn(column: number): ObjectDefinition {
            var stack = this.State.stacks[column];

            for (var i = stack.length - 1; i >= 0; --i) {
                if (stack[i]) {
                    return this.State.objects[i];
                }
            }
            return null;
        }

        CanPutObjectOntop(object: ObjectDefinition, baseObject: ObjectDefinition): boolean {
            if (baseObject.form == "circle") {
                return false;
            }
            return true;
        }
    }

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
        // This function returns a dummy plan involving a random stack
        do {
            var pickstack = getRandomInt(state.stacks.length);
        } while (state.stacks[pickstack].length == 0);
        var plan : string[] = [];

        // First move the arm to the leftmost nonempty stack
        if (pickstack < state.arm) {
            plan.push("Moving left");
            for (var i = state.arm; i > pickstack; i--) {
                plan.push("l");
            }
        } else if (pickstack > state.arm) {
            plan.push("Moving right");
            for (var i = state.arm; i < pickstack; i++) {
                plan.push("r");
            }
        }

        // Then pick up the object
        var obj = state.stacks[pickstack][state.stacks[pickstack].length-1];
        plan.push("Picking up the " + state.objects[obj].form,
                  "p");

        if (pickstack < state.stacks.length-1) {
            // Then move to the rightmost stack
            plan.push("Moving as far right as possible");
            for (var i = pickstack; i < state.stacks.length-1; i++) {
                plan.push("r");
            }

            // Then move back
            plan.push("Moving back");
            for (var i = state.stacks.length-1; i > pickstack; i--) {
                plan.push("l");
            }
        }

        // Finally put it down again
        plan.push("Dropping the " + state.objects[obj].form,
                  "d");

        return plan;
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
