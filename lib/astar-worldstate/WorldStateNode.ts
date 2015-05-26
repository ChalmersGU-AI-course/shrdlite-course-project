///<reference path="../../Interpreter.ts"/>

class WorldStateNode{
    state : WorldState;

    /**
     * This class represents a single WorldState in a searching algorithm, it handles functions such as:
     *  - Calculating the heuristic of a move depending on a goal.
     *  - Verifying if a goal is satisfied in the state.
     *  - Generating possible new states that can be reached from this state.
     *
     * @param state Current state.
     */
    constructor(state : WorldState) {
        this.state = state;
    }

    /**
     * Calculates the heuristic from this state to a particular goal, if there are several goals
     * it returns the smallest possible heuristic.
     *
     * @param goal Goal to base heuristic on.
     * @returns {number} Smallest heuristic possible based on the goals.
     */
    heuristicTo(goal : Interpreter.Literal[][]) {
        var returnValue = 100000;
        goal.forEach((intrprt) => {
            var newHeuristic = 0;

            intrprt.forEach((goal) => {
                var fstObj = goal.args[0];
                var sndObj = goal.args[1];

                switch (goal.rel) {
                    case "ontop":
                    case "inside":
                        newHeuristic += this.onTopHeuristic(fstObj, sndObj);
                        break;
                    case "above":
                        newHeuristic += this.aboveHeuristic(fstObj, sndObj);
                        break;
                    case "under":
                        newHeuristic += this.aboveHeuristic(sndObj, fstObj);
                        break;
                    case "beside":
                        newHeuristic += this.besideHeuristic(fstObj, sndObj, "either");
                        break;
                    case "left":
                        newHeuristic += this.besideHeuristic(fstObj, sndObj, "left");
                        break;
                    case "right":
                        newHeuristic += this.besideHeuristic(fstObj, sndObj, "right");
                        break;
                    case "holding":
                        newHeuristic += this.holdingHeuristic(fstObj);
                        break;
                }
            });

            returnValue = newHeuristic < returnValue ? newHeuristic : returnValue;
        });

        return returnValue;
    }

	private onTopHeuristic(fstObj : string, sndObj : string) : number {
		var heuristic = 0;

        if(sndObj === "floor") {
            // TODO: Not completed, needs to be thought through.

            // Remove each object on top of the first object.
            heuristic += this.state.objectsOnTop(fstObj) * 4;

            // Move to lowest stack.
            heuristic += Math.abs(this.state.arm - this.state.getLowestStackIndex());

            // Remove each object from lowest stack.
            heuristic += this.state.stackHeight(this.state.getLowestStackIndex()) * 4;
        } else {
            var distance = this.state.getDistance(fstObj,sndObj);

            // If they arent in the same stack, remove each object on top of fstObj (min 4 moves per).
            if (distance != 0) {
                heuristic += this.state.objectsOnTop(fstObj) * 4;
            }

            // Remove each object on top of sndObj (min 4 moves per).
            heuristic += this.state.objectsOnTop(sndObj) * 4;

            heuristic += 2 + distance;
        }

		return heuristic;
	}

    private aboveHeuristic(fstObj : string, sndObj : string) : number {
		var heuristic = 0;

        var distance = this.state.getDistance(fstObj,sndObj);

        // If they are in the same pile.
        if(distance != 0) {
            if(this.state.holding === fstObj) {
                // Move arm between its place and sndObj stack
                heuristic += Math.abs(this.state.getStackIndex(sndObj) - this.state.arm);

                // Drop fstObj
                heuristic += 1;
            } else if(this.state.holding === sndObj) {
                // Drop sndObj
                heuristic += 1;

                // Move arm between its place and fstObj stack
                heuristic += Math.abs(this.state.getStackIndex(fstObj) - this.state.arm);

                // Move all objects on top of fstObj
                heuristic += this.state.objectsOnTop(fstObj) * 4;

                // Move arm between fstObj stack and where we dropped sndObj
                heuristic += Math.abs(this.state.getStackIndex(fstObj) - this.state.arm);
            } else {
                // Move all objects on top of fstObj
                heuristic += this.state.objectsOnTop(fstObj) * 4;

                // Pick up fstObj
                heuristic += 1;

                // Move first object on top of sndObj (min sndObj is on top of another pile)
                heuristic += Math.abs(this.state.getStackIndex(fstObj) - this.state.getStackIndex(sndObj));

                // Drop fstObj on top of sndObj stack
                heuristic += 1;
            }
        } else {
            var fstObjIx = this.state.stacks[this.state.getStackIndex(fstObj)].indexOf(fstObj);
            var sndObjIx = this.state.stacks[this.state.getStackIndex(sndObj)].indexOf(sndObj);

            if(fstObjIx < sndObjIx) {
                // Move all objects on top of fstObj
                heuristic += this.state.objectsOnTop(fstObj) * 4;
                // Move first object on top of sndObj (min sndObj is on top of another pile)
                heuristic += 2;
            }

        }

		return heuristic;
	}

	private besideHeuristic(fstObj : string, sndObj : string, side : string) : number {
		var heuristic = 0;
		var chosenObj = this.state.objectsOnTop(fstObj) < this.state.objectsOnTop(sndObj) ? fstObj : sndObj;

        // Move each object on top of the choosen object.
		heuristic += this.state.objectsOnTop(chosenObj) * 4;
		heuristic += 2;

		if (side === "either") {
			heuristic += this.state.getDistance(fstObj,sndObj) - 1;
		} else {
			heuristic += this.state.getDistance(fstObj,sndObj) + 1;
		}

		return heuristic;
	}

    private holdingHeuristic(fstObj : string) : number {
        var heuristic = 0;

        // - move to the objects stack.
        heuristic += Math.abs(this.state.arm - this.state.getStackIndex(fstObj));
        // - remove each object that is on top of the object (min. 4 moves per obj)
        heuristic += this.state.objectsOnTop(fstObj) * 4;
        // - pick up the object.
        heuristic++;


        return heuristic;
    }

    /**
     * Returns a collection of possible new states we can reach from this state. Will not return states are not
     * illegal in the world with regards to physics.
     *
     * @returns {collections.Dictionary<string, WorldStateNode>} Possible new states reachable from this state.
     */
	getNeighbors() : collections.Dictionary<string,WorldStateNode> {
		var neighbors = new collections.Dictionary<string,WorldStateNode>(wsn => wsn.toString());
		var newStates = this.state.getNewStates();

		newStates.forEach((command, state) => {
            neighbors.setValue(command,new WorldStateNode(state));
		});

		return neighbors;
	}

    equals(otherNode : WorldStateNode) : boolean{
        return this.state.equals(otherNode.state);
    }

    /**
     * Verifies if this state fulfils any of the possible goals provided.
     *
     * @param goals         Different goals in disjunctive normal form.
     * @returns {boolean}   True if this state satisfies at least one of the goals provided.
     */
    isSatisfied(goals : Interpreter.Literal[][]) : boolean {
        var result = false;

        goals.forEach((intrprt) => {
            if(this.state.satisfiesConditions(intrprt)) {
                result = true;
            }
        });

        return result;
    }

    toString() : string {
        return this.state.toString();
    }
}