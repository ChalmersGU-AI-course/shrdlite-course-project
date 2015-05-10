///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="WorldRules.ts"/>
///<reference path="LiteralHelpers.ts"/>

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
        console.log(intprt);

        var plan: string[] = [];

        var graphGoal = new MultipleGoals(intprt);
        var graph = new astar.Graph(new SimpleHeuristic(intprt[0]), graphGoal);
        var graphStart = new PlannerNode(state, null, null);
        var result = graph.searchPath(graphStart);

        if (result.found) {
            for (var i = 1; i < result.path.length; i++) {
                var current = <PlannerNode> result.path[i];
                plan.push(current.actionMessage);
                plan.push(current.lastAction);
            }
            plan.push("Taddaaa");
            console.log(state);
        } else {
            plan.push("Could not find a way to do that. Timed out.");
        }

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
                    var newState = owl.deepCopy(this.state, 3);
                    newState.holding = currentStack[topItemIndex];
                    newState.stacks[this.state.arm].splice(topItemIndex, 1);
                    var newMessage = "Picking up the " + newState.objects[newState.holding].form;
                    return new PlannerNode(newState, "p", newMessage);
                }
            } else { // holding something at the moment
                var newState = owl.deepCopy(this.state, 3);
                //always legal if on top of floor, else check world rules
                if (currentStack.length == 0 || WorldRules.canBeOntop(newState.objects[newState.holding],
                            newState.objects[currentStack[currentStack.length - 1]])) {
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
                var newState = owl.deepCopy(this.state, 3);
                newState.arm = targetPos;
                var newMessage = "Moving " + (direction > 0 ? "right" : "left");
                return new PlannerNode(newState, direction > 0 ? "r" : "l", newMessage);
            }
            return null;
        }
    }

    export class MultipleGoals implements astar.IGoal {
        targets: Interpreter.Literal[][] = null;

        constructor(targetLiterals: Interpreter.Literal[][]) {
            this.targets = targetLiterals;
        }

        isReached(node: astar.INode): boolean {
            var n = <PlannerNode> node;

            for (var iOrLiteral = 0; iOrLiteral < this.targets.length; iOrLiteral++) {
                var currentOrLiteral = this.targets[iOrLiteral];
                var goalReachable = true;
                for (var i = 0; i < currentOrLiteral.length; i++) {
                    var currentLiteral = currentOrLiteral[i];

                    if (!LiteralHelpers.isLiteralFullfilled(currentLiteral, n.state)) {
                        goalReachable = false;
                    }
                }
                if (goalReachable) {
                    return true;
                }
            }
            return false;
        }
    }

    export class DijkstraHeuristic implements astar.IHeuristic {
        get(node: astar.INode, goal: astar.IGoal): number {
            return 0;
        }
    }

    export class SimpleHeuristic implements astar.IHeuristic {
        targets: Interpreter.Literal[][] = null;

        constructor (targets) {
            this.targets = targets;
        }

        get(node: astar.INode, goal: astar.IGoal): number {
            var n = <PlannerNode> node;
            var minEstimate = Number.MAX_VALUE;

            for (var j = 0; j < this.targets.length; j++) {
                var currentTargetsList = this.targets[j];

                var localMaxEstimate = 0;

                for (var i = 0; i < currentTargetsList.length; i++) {
                    var currentLiteral = currentTargetsList[i];

                    var currentEstimate = this.getEstimateForLiteral(currentLiteral, n.state);
                    localMaxEstimate = Math.max(localMaxEstimate, currentEstimate);
                }

                minEstimate = Math.min(minEstimate, localMaxEstimate);
            }
            return minEstimate;
        }

        getEstimateForLiteral(lit: Interpreter.Literal, state: WorldState): number {
            if (lit.rel == "ontop") {
                if (LiteralHelpers.checkHoldingLiteral(lit, state)) {
                    return 0;
                }
                return this.getOntopEstimate(lit, state);
            }
            if (lit.rel == "holding") {
                if (LiteralHelpers.checkHoldingLiteral(lit, state)) {
                    return 0;
                }
                return this.getHoldingEstimate(lit, state);
            }
            return 0;
        }

        getHoldingEstimate(lit: Interpreter.Literal, state: WorldState): number {
            var position = LiteralHelpers.getPositionOfObject(lit.args[0], state);
            if (position) {
                var depth = state.stacks[position[0]].length - position[1] - 1;
                var distance = Math.abs(position[0] - state.arm);
                // to get away an object on top requires four actions
                // we need to move to the according stack
                // we need to pick up the desired object
                return depth * 4 + distance + 1;
            }
            return 0;
        }

        getOntopEstimate(lit: Interpreter.Literal, state: WorldState): number {
            var on = lit.args[0];
            var position = LiteralHelpers.getPositionOfObject(on, state);

            if (position) {
                var depth = state.stacks[position[0]].length - position[1] - 1;
                var distance = Math.abs(position[0] - state.arm);
                // to get away an object on top requires four actions
                // we need to move to the according stack
                // we need to pick up the desired object, move it, drop it
                return depth * 4 + distance + 3;
            }
            return 0;
        }

        getBesideEstimate(lit: Interpreter.Literal, state: WorldState): number {
            var on = lit.args[0];
            var position = LiteralHelpers.getPositionOfObject(on, state);

            if (position) {
                var depth = state.stacks[position[0]].length - position[1] - 1;
                var distance = Math.abs(position[0] - state.arm);
                // to get away an object on top requires four actions
                // we need to move to the according stack
                // we need to pick up the desired object, move it, drop it
                return depth * 4 + distance + 3;
            }
            return 0;
        }
    }
}
