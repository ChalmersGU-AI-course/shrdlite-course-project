///<reference path="../../Interpreter.ts"/>

class WorldStateNode{
    state : WorldState;

    constructor(state : WorldState) {
        this.state = state;
    }

    heuristicTo(goal : Interpreter.Literal[][]) {
        var returnValue = 100000;
        goal.forEach((intrprt) => {
            var intrprtHeuristic = 0;

            intrprt.forEach((goal) => {
                var fstObj = goal.args[0];
                var sndObj = goal.args[1];

                switch (goal.rel) {
                    case "ontop":
                    case "inside":
                        intrprtHeuristic += this.onTopHeuristic(fstObj, sndObj);
                        break;
                    case "above":
                        intrprtHeuristic += this.aboveHeuristic(fstObj, sndObj);
                        break;
                    case "under":
                        intrprtHeuristic += this.aboveHeuristic(sndObj, fstObj);
                        break;
                    case "beside":
                        intrprtHeuristic += this.besideHeuristic(fstObj, sndObj, "either");
                        break;
                    case "left":
                        intrprtHeuristic += this.besideHeuristic(fstObj, sndObj, "left");
                        break;
                    case "right":
                        intrprtHeuristic += this.besideHeuristic(fstObj, sndObj, "right");
                        break;
                }
            });

            returnValue = intrprtHeuristic < returnValue ? intrprtHeuristic : returnValue;
        });

        return returnValue;
    }

	private onTopHeuristic(fstObj : string, sndObj : string) : number {
		var heuristic = 0;
		var distance = this.state.getDistance(fstObj,sndObj);

		heuristic += this.state.objectsOnTop(sndObj);

		if (distance != 0) {
			heuristic += this.state.objectsOnTop(fstObj);
		}

		heuristic += 2 + distance;

		return heuristic;
	}

    private aboveHeuristic(fstObj : string, sndObj : string) : number {
		var heuristic = 0;

		heuristic += this.state.objectsOnTop(fstObj);
		heuristic += 2 + this.state.getDistance(fstObj,sndObj);

		return heuristic;
	}

	private besideHeuristic(fstObj : string, sndObj : string, side : string) : number {
		var heuristic = 0;
		var chosenObj = this.state.objectsOnTop(fstObj) < this.state.objectsOnTop(sndObj) ? fstObj : sndObj;

		heuristic += this.state.objectsOnTop(chosenObj);
		heuristic += 2;

		if (side === "either") {
			heuristic += this.state.getDistance(fstObj,sndObj) - 1;
		} else {
			heuristic += this.state.getDistance(fstObj,sndObj) + 1;
		}

		return heuristic;
	}

	getNeighbors() : collections.Dictionary<string,WorldStateNode> {
		var neighbors = new collections.Dictionary<string,WorldStateNode>(wsn => wsn.toString());
		var newStates = this.state.getNewStates();

		newStates.forEach((value, state) => {
            neighbors[value] = new WorldStateNode(state);
		});

		return neighbors;
	}

    equals(otherNode : WorldStateNode) : boolean{
        return this.state.equals(otherNode.state);
    }

    isSatisfied(goals : Interpreter.Literal[][]) : boolean {
        goals.forEach((intrprt) => {
            if(this.state.satisifiesConditions(intrprt)) {
                return true;
            }
        });

        return false;
    }
}