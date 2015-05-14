///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="AStar.ts"/>

module Planner {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretations : Interpreter.Result[], currentState : WorldState) : Result[] {
        var plans : Result[] = [];
        interpretations.forEach((intprt) => {
            var plan : Result = <Result>intprt;
            plan.plan = planInterpretation(plan.intp, currentState);
            plans.push(plan);
            console.log ("PPDLSTATE-----------------------",worldToPPDL(currentState));
            console.log ("Worldstate-----------------------",currentState);
            console.log ("parentState-----------------------",createMoves(currentState));
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
    
    
    //if(form == "box"){
	//				var b : Interpreter.Literal = {pol : true, rel : "inside", args : [state.stacks[i][j], goal[j].name ]};
	//			}
	
	//Adds nearby child nodes to current node
	export function addNearbyNodes(current : AStar.Nod){
		createNodes (current ,createMoves(current.getWorldState()));
	}

	function createNodes(current : AStar.Nod, parent: WorldState[]) : void{
		var nodeList : AStar.Arc[] = [];
		for(var x =0; x<parent.length; x++ ){
			if(parent[x] != null){
				if(x == 0){
					nodeList.push (new AStar.Arc (1, new AStar.Nod( "", parent[0], "r")));
				}else if(x == 1){
					nodeList.push (new AStar.Arc (1, new AStar.Nod( "", parent[1], "l")));
				}else if(x == 2){
					nodeList.push (new AStar.Arc (1, new AStar.Nod( "", parent[2], "p")));
				}else if(x == 3){
					nodeList.push (new AStar.Arc (1, new AStar.Nod( "", parent[3], "d")));
				}
			}	
		}
		//console.log("nodeList----------------------", nodeList);
		current.setArcList(nodeList);
	}

	function createMoves(parent: WorldState) : WorldState[]{
			
			var ans : WorldState[]=[];
			
			//
			var rState = copyParent(parent);
			var lState = copyParent(parent);
			var pState = copyParent(parent);
			var dState = copyParent(parent);
			
			//cant go right
			if(parent.arm == parent.stacks.length -1){
				rState = null;
			}else{
				rState.arm +=1;	
			}
			//cant go left
			if(parent.arm == 0){
				lState = null;
			}else{
				lState.arm -=1;	
			}
			// cant pick up if stack is empty or allready holdning
			if(parent.holding != null || parent.stacks[parent.arm].length == 0){
				pState = null;
			}else{
				pState.holding = pState.stacks[parent.arm].pop();
			}
			// can i drop here check if legal to move
			if(parent.holding == null || parent.stacks[parent.arm].length != 0 && !(Interpreter.checkValidPos (parent.objects[parent.holding],parent.objects[dState.stacks[parent.arm][dState.stacks[parent.arm].length-1] ]))){
				dState = null;
			}else{
				//dState.holding = dState.stacks[parent.arm].pop();
				dState.stacks[parent.arm][dState.stacks[parent.arm].length]=dState.holding
				dState.holding = null;
			}
			ans.push(rState, lState, pState, dState);
			//console.log("ans............", ans);
			return ans;
		}

	// copy parent PDDL to Create new object PDDL
	function copyParent (parent:WorldState) : WorldState{
		var lits : string [][]=[];
		for(var x =0; x<parent.stacks.length; x++ ){
			var lit : string[] = [];
			for(var y =0; y<parent.stacks[x].length; y++ ){
				lit.push(parent.stacks[x][y]);
			}
			lits.push(lit);
		}
		
		return {stacks : lits, holding : parent.holding, arm : parent.arm , objects : parent.objects ,examples : parent.examples };
	} 
	
	
//	function createMoves(parent:Interpreter.Literal[][]):[Interpreter.Literal[][]]{
//			
//			var ans:[Interpreter.Literal[][]]=[[]];
//			
//			var l1=copyParent(parent);
//			var l2=copyParent(parent);
//			var l3=copyParent(parent);
//			var l4=copyParent(parent);
//			
//			// arm position index as number
//			var arm:number = +parent[parent.length-2][0].args[0];
//			var armMaxPos : number = +parent[parent.length-2][0].args[1];
//			// is arm holding bool 
//			var holding:boolean = parent[parent.length-1][0].pol;
//			
//			//for(var x =0; x<parent.length; x++ ){
//				if(holding){
//					if(arm == 0){
//					//go right
//					 l1[l1.length-2][0].args[0]=(""+arm+1);	
//					//drop
//					l1[l1.length-1][0].pol = false;
//					l1[0][]
//					}else if(arm == armMaxPos){
//						
//					}
//				//	else
//					
//					//
//					//
//					//
//				}
//				else if(!holding){
//					//
//					//
//					//
//				} 
//			//}
//			
//			return;
//		}



//				if(parent.holding != null){
//					if(parent.arm == 0){
//						//go right
//						 rState.arm = 1;	
//						//drop
//						dState.stacks[0][dState.stacks[0].length] = dState.holding;
//						dState.holding = null;
//						ans.push(rState,null,null,dState);
//						
//					}else if(parent.arm == parent.stacks.length){
//	 					//go left
//						 lState.arm = parent.arm -1;	
//						//drop
//						dState.stacks[parent.stacks.length-1][dState.stacks[parent.stacks.length].length-1] = dState.holding;
//						dState.holding = null;
//						ans.push(null,lState,null,dState);
//					}else{
//						//go right 
//						 rState.arm = parent.arm +1;
//						//go left
//						lState.arm = parent.arm -1;	
//						//drop
//						dState.stacks[parent.arm][dState.stacks[parent.arm].length -1] = dState.holding;
//						dState.holding = null;
//						ans.push(rState,lState,null,dState);
//					}
//					
//				}else{
//					if(parent.arm == 0){
//						//go right
//						 rState.arm = 1;	
//						//take
//						pState.holding = pState.stacks[0][pState.stacks[0].length-1];
//						pState.stacks[0].splice(pState.stacks[0].length-1, 1);
//						ans.push(rState,null,pState,null);
//						
//					}else if(parent.arm == parent.stacks.length){
//	 					//go left
//						 lState.arm = parent.arm -1;
//						//take
//						pState.holding = pState.stacks[parent.arm][parent.stacks[parent.arm].length-1];
//						pState.stacks[parent.arm][pState.stacks[parent.arm].length-1] = null;
//						ans.push(null,lState,pState,null);
//					}else{
//						//go right 
//						 rState.arm = parent.arm +1;
//						//go left
//						lState.arm = parent.arm -1;	
//						//take
//						pState.holding = pState.stacks[parent.arm][pState.stacks[parent.arm].length-1];
//						pState.stacks[0].splice(pState.stacks[0].length-1, 1);
//						ans.push(rState,lState,pState, null);
//					}
//				} 



    
    //coverts worldstate to ppdl
    export function worldToPPDL (state : WorldState) : Interpreter.Literal[][] {
    	var lits : Interpreter.Literal[][] = [];
		for(var x =0; x<state.stacks.length; x++ ){
			for(var y =0; y<state.stacks[x].length; y++ ){
				if(y == 0){
					lits.push([{pol : true, rel : "ontop", args : [state.stacks[x][0], "floor"+x ]}]);
				}else{
					lits.push([{pol : true, rel : "ontop", args : [state.stacks[x][y], state.stacks[x][y-1] ]}]);
				}
			}
		}	
		
		lits.push([{pol : true, rel : "arm", args : ["" + state.arm, "" + state.stacks.length ]}]);
		if(state.holding == null){
			lits.push([{pol : false, rel : "holding", args : [state.holding] }]);
		}else{
			lits.push([{pol : true, rel : "holding", args : [state.holding] }]);
		}

    	return lits;
    }
    
    function heuristicFunc(x : string ) : number{
    	if(x == ""){
    		return 0;
    	}
    	return 0;
    }

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
		var plan : string[] = [];
		plan = AStar.runAStar([], new AStar.Nod("",state,""), intprt , heuristicFunc);
		console.log("plan-------------------------------------", plan);
		console.log("intprt-------------------------------------", intprt);
		
		return plan;
    }

//
//        do {
//            var pickstack = getRandomInt(state.stacks.length);
//        } while (state.stacks[pickstack].length == 0);
//        var plan : string[] = [];
//
//        // First move the arm to the leftmost nonempty stack
//        if (pickstack < state.arm) {
//            plan.push("Moving left");
//            for (var i = state.arm; i > pickstack; i--) {
//                plan.push("l");
//            }
//        } else if (pickstack > state.arm) {
//            plan.push("Moving right");
//            for (var i = state.arm; i < pickstack; i++) {
//                plan.push("r");
//            }
//        }
//
//        // Then pick up the object
//        var obj = state.stacks[pickstack][state.stacks[pickstack].length-1];
//        plan.push("Picking up the " + state.objects[obj].form,
//                  "p");
//
//        if (pickstack < state.stacks.length-1) {
//            // Then move to the rightmost stack
//            plan.push("Moving as far right as possible");
//            for (var i = pickstack; i < state.stacks.length-1; i++) {
//                plan.push("r");
//            }
//
//            // Then move back
//            plan.push("Moving back");
//            for (var i = state.stacks.length-1; i > pickstack; i--) {
//                plan.push("l");
//            }
//        }
//
//        // Finally put it down again
//        plan.push("Dropping the " + state.objects[obj].form,
//                  "d");




    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
