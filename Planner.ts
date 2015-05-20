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

    function planInterpretation(intprt : Interpreter.Literal[][], state: WorldState) : string[][] {
        var plan: string[][] = [];

        var graphGoal = new MultipleGoals(intprt);
        var graph = new astar.Graph(new SimpleHeuristic(intprt), graphGoal);
        var graphStart = new PlannerNode(state, null, null);
        var result = graph.searchPath(graphStart);

        if (result.found) {
            for (var i = 1; i < result.path.length; i++) {
                var current = <PlannerNode> result.path[i];
                plan.push(current.actionMessage);
                plan.push(current.lastAction);
            }
            plan.push(["Taddaaa!"]);
        } else {
            plan.push(["Could not find a way to do that. Timed out."]);
        }

        return plan;
    }

    export class PlannerNode implements astar.INode {
        state: WorldState;
        lastAction: string[]; // l, r , d, p, n
        actionMessage: string[];

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


            // pure arm use
            var useArm1State = this.useArms(this.state, true, false);
            if (useArm1State) {
                n.push(
                    new astar.Neighbor(useArm1State, 1));
            }

            var useArm2State = this.useArms(this.state, false, true);
            if (useArm2State) {
                n.push(
                    new astar.Neighbor(useArm2State, 1));
            }
            var useArmsState = this.useArms(this.state, true, true);
            if (useArmsState) {
                n.push(
                    new astar.Neighbor(useArmsState, 1.5));
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

        useArms(state: WorldState, use1: boolean, use2: boolean): PlannerNode {
            var currentStackArm1 = state.stacks[state.arm1];
            var topItemIndexArm1 = currentStackArm1.length - 1;

            var invalidActionFlag = false;

            var newState = getWorldCloneDeep(state, state.arm1, state.arm2);
            var actions = ['n', 'n']; //by default don't do anything,change if needed
            var message = ["",""];

            // use arm 1
            if (use1) {
                // picking with arm 1
                if (state.holding1 === null) {
                    if (currentStackArm1.length > 0) {
                        newState.holding1 = currentStackArm1[topItemIndexArm1];
                        newState.stacks[state.arm1].splice(topItemIndexArm1, 1);

                        actions[0] = 'p';
                        message[0] = "Picking up the " + newState.objects[newState.holding1].form + ". ";
                    } else {
                        invalidActionFlag = true;
                    }
                }
                // dropping item from arm 1
                else {
                    // Always legal if on top of floor, else check world rules
                    var holdingObj = state.objects[state.holding1];
                    var topObj = state.objects[currentStackArm1[topItemIndexArm1]];

                    if (currentStackArm1.length == 0 || WorldRules.canBeOntop(holdingObj, topObj)) {
                        newState.stacks[newState.arm1].push(newState.holding1);
                        newState.holding1 = null;

                        actions[0] = 'd';
                        message[0] = "Dropping the " + holdingObj.form + ". ";
                    } else {
                        invalidActionFlag = true;
                    }
                }
            }

            var currentStackArm2 = state.stacks[state.arm2];
            var topItemIndexArm2 = currentStackArm2.length - 1;

            // use arm 2
            if (use2) {
                if (state.holding2 === null) {
                    if (currentStackArm2.length > 0) {
                        newState.holding2 = currentStackArm2[topItemIndexArm2];
                        newState.stacks[state.arm2].splice(topItemIndexArm2, 1);

                        actions[1] = 'p';
                        message[1] = "Picking up the " + newState.objects[newState.holding2].form + ". ";
                    } else {
                        invalidActionFlag = true;
                    }
                }
                else {
                    // Always legal if on top of floor, else check world rules
                    var holdingObj = state.objects[state.holding2];
                    var topObj = state.objects[currentStackArm2[topItemIndexArm2]];

                    if (currentStackArm2.length == 0 || WorldRules.canBeOntop(holdingObj, topObj)) {
                        newState.stacks[newState.arm2].push(newState.holding2);
                        newState.holding2 = null;

                        actions[1] = 'd';
                        message[1] = "Dropping the " + holdingObj.form + ". ";
                    } else {
                        invalidActionFlag = true;
                    }
                }
            }

            // only return if either use1 or use2
            if (use1 && use2 && invalidActionFlag) {
                return null;
            } else if (use1 || use2) {
                return new PlannerNode(newState, actions, message);
            } else {
                return null;
            }
        }

        moveArm(direction: number): PlannerNode {
            var numberOfStacks = this.state.stacks.length;
            var targetPos = this.state.arm1 + direction;

            if (targetPos >= 0 && targetPos < numberOfStacks) {
                // We can use copy here since we don't need a deep copy
                var newState = getWorldCloneShallow(this.state);

                newState.arm1 = targetPos;

                var msg = "Moving " + (direction > 0 ? "right" : "left");
                return new PlannerNode(newState, direction > 0 ? "r" : "l", msg);
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

            // TODO: Use LiteralHelpers
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

        constructor (targets: Interpreter.Literal[][]) {
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
                var distance = Math.abs(position[0] - state.arm1);
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
                var distance = Math.abs(position[0] - state.arm1);
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
                var distance = Math.abs(position[0] - state.arm1);
                // to get away an object on top requires four actions
                // we need to move to the according stack
                // we need to pick up the desired object, move it, drop it
                return depth * 4 + distance + 3;
            }
            return 0;
        }
    }
}
