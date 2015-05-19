///<reference path="../../Interpreter.ts"/>

class WorldStateNode{
    state : WorldState;

    constructor(state : WorldState) {
        this.state = state;
    }

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
            heuristic += Math.abs(this.state.arm - this.state.getLowestStackNumber());

            // Remove each object from lowest stack.
            heuristic += this.state.stackHeight(this.state.getLowestStackNumber()) * 4;
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

        // Move each object on top of fstObj;
		heuristic += this.state.objectsOnTop(fstObj) * 4;

		heuristic += 2 + this.state.getDistance(fstObj,sndObj);

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

    isSatisfied(goals : Interpreter.Literal[][]) : boolean {
        var result = false;

        goals.forEach((intrprt) => {
            if(this.state.satisifiesConditions(intrprt)) {
                result = true;
            }
        });

        return result;
    }

    toString() : string {
        return this.state.toString();
    }
}