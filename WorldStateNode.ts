///<reference path="lib/astar-example/graph.ts"/>
///<reference path="Interpreter.ts"/>
class WorldStateNode implements GraphNode{
	goalConditions : Interpreter.Result;
	state : WorldState;
	heuristic : number;

	constructor(thisState : WorldState, goalState : Interpreter.Result){
		this.state = thisState;
		this.goalConditions = goalState;

		//Setting heuristic value.
		this.heuristic = 100000;
		this.goalConditions.intp.forEach((intrprt) => {
			var intrprtHeuristic = 0;

			intrprt.forEach((goal) => {
				var fstObj = goal.args[0];
				var sndObj = goal.args[1];

				switch (goal.rel) {
					case "ontop":
					case "inside":
						intrprtHeuristic += this.onTopHeuristic(fstObj,sndObj);
						break;
					case "above":
						intrprtHeuristic += this.aboveHeuristic(fstObj,sndObj);
						break;
					case "under":
						intrprtHeuristic += this.aboveHeuristic(sndObj,fstObj);
						break;
					case "beside":
						intrprtHeuristic += this.besideHeuristic(fstObj,sndObj,"either");
						break;
					case "left":
						intrprtHeuristic += this.besideHeuristic(fstObj,sndObj,"left");
						break;
					case "right":
						intrprtHeuristic += this.besideHeuristic(fstObj,sndObj,"right");
						break;
				}
			});

			this.heuristic = intrprtHeuristic < this.heuristic ? intrprtHeuristic : this.heuristic;
		}); 
		//end of Setting heuristic value.
	}

    toString() : string {
        return this.state.toString() + this.heuristic.toString() + this.goalConditions.toString();
    }

	onTopHeuristic(fstObj : string, sndObj : string) : number {
		var heuristic = 0;
		var distance = this.state.getDistance(fstObj,sndObj);

		heuristic += this.state.objectsOnTop(sndObj);

		if (distance != 0) {
			heuristic += this.state.objectsOnTop(fstObj);
		}

		heuristic += 2 + distance;

		return heuristic;
	}

	aboveHeuristic(fstObj : string, sndObj : string) : number {
		var heuristic = 0;

		heuristic += this.state.objectsOnTop(fstObj);
		heuristic += 2 + this.state.getDistance(fstObj,sndObj);

		return heuristic;
	}

	besideHeuristic(fstObj : string, sndObj : string, side : string) : number {
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

    // TODO: Needs to be implemented.
    // Maybe stack1stack2stackN mod heuristic
	getId() : number{

        return -1;
	}

	isGoalSatisfied() : boolean {
		this.goalConditions.intp.forEach((intrprt) => {
			var result = true;

			intrprt.forEach((goal) => {
				var fstObj = goal.args[0];
				var sndObj = goal.args[1];

				switch (goal.rel) {
					case "ontop":
					case "inside":
						result = result && this.state.isOnTopOf(fstObj,sndObj);
						break;
					case "above":
						result = result && this.state.isAbove(fstObj,sndObj);
						break;
					case "under":
						result = result && this.state.isAbove(sndObj,fstObj);
						break;
					case "beside":
						result = result && this.state.isBeside(fstObj,sndObj);
						break;
					case "left":
						result = result && this.state.isLeftOf(fstObj,sndObj);
						break;
					case "right":
						result = result && this.state.isRightOf(fstObj,sndObj);
						break;
				}
			});

			if (result) {
				return true;
			}
		});
		return false;
	}

	equals(otherNode : GraphNode) : boolean{
		if (otherNode instanceof WorldStateNode) {
			return this.goalConditions === otherNode.goalConditions
				&& this.heuristic == this.heuristic
				&& this.state.equals(otherNode.state);
		}

		return false;
	}

    // TODO: Needs to be implemented.
	distanceTo(to : GraphNode) : number {
		return this.heuristic;
	}

	getNeighbors() : GraphNode[] {
		var neighbors : WorldStateNode[] = [];
		var newStates = this.state.getNewStates();

		newStates.forEach((state) => {
			neighbors.push(new WorldStateNode(state,this.goalConditions));
		});

		return neighbors;
	}

}