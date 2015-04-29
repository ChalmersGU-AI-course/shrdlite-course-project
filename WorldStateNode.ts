///<reference path="lib/astar-example/graph.ts"/>
///<reference path="Interpreter.ts"/>
class WorldStateNode implements GraphNode{
	goalState : Interpreter.Result;
	thisState : WorldState; 
	heuristic : number;
	constructor(thisState : WorldState, goalState : Interpreter.Result){
		this.thisState = thisState;
		this.goalState = goalState;

		//Setting heuristic value.
		this.heuristic = 0;
		this.goalState.intp.forEach((intrprt) =>{ 
			var test : boolean = true;
			intrprt.forEach((goal) => {
				if(goal.rel === "onTop"){
					var a = goal.args[0];
					var b = goal.args[1];
					this.thisState.stacks.forEach((stack) => {
						var i = stack.indexOf(a);
						if(i>=0){
							this.heuristic = this.heuristic + (stack.length - 1) - i;
						}
						var i = stack.indexOf(b);
						if(i>=0){
							this.heuristic = this.heuristic + (stack.length - 1) - i;
						}
						//Might be problematic for "floor" object.
						
					});
				} else if(goal.rel === "beside"){
					//Carry on with more relations. 
				}
			});
		}); 
		//end of Setting heuristic value.
	}

	getId() : number{
		return -1;
	}

	equals(otherNode : GraphNode) : boolean{
		//Haxx. ignoring the other node. Comparing with the goalstate. 
		this.goalState.intp.forEach((intrprt) =>{ 
			var test : boolean = true;
			intrprt.forEach((goal) => {
				if(goal.rel === "onTop"){
					var a = goal.args[0];
					var b = goal.args[1];
					this.thisState.stacks.forEach((stack) => {
						var i = stack.indexOf(a);
						if(i>=0){
							test = test && (b ==="floor" || stack[i] === b);
						}
					});
				} else if(goal.rel === "beside"){
					//Carry on with more relations. 
				}
			});
			if(test){
				return true;
			}
		}); 	
		return false;
	}

	distanceTo(to : GraphNode) : number{
		return this.heuristic;
	}	
	toString() : string{
		return "";
	}
}