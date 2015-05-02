/// <reference path="astar.ts" />
///<reference path="World.ts"/>
///<reference path="deepCopy.ts"/>

module planner_astar {

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
                return new PlannerNode(newState, direction>0 ? "r":"l", newMessage);
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