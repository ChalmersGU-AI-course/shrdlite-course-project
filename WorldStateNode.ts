///<reference path="lib/astar-worldstate/graphnode.ts"/>
///<reference path="Interpreter.ts"/>

class WorldStateNode implements GraphNode{
    state : WorldState;

    constructor(state : WorldState) {
        this.state = state;
    }

    private heuristicTo(goalConditions : Literal[][]) {
        var returnValue = 100000;
        goalConditions.forEach((intrprt) => {
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

	isGoalSatisfied(goal : Goal<WorldStateNode>) : boolean {
		goal.forEach((intrprt) => {
			if(this.state.satisifiesConditions(intrprt)) {
                return true;
            }
		});

        return false;
	}

	distanceTo(to : Goal<WorldStateNode>) : number {
        return this.heuristicTo(to);
    }

	getNeighbors() : WorldStateNode[] {
		var neighbors : WorldStateNode[] = [];
		var newStates = this.state.getNewStates();

		newStates.forEach((state) => {
			neighbors.push(new WorldStateNode(state));
		});

		return neighbors;
	}

    equals(otherNode : GraphNode) : boolean{
        if (otherNode instanceof WorldStateNode) {
            return this.state.equals(otherNode.state);
        }

        return false;
    }
}