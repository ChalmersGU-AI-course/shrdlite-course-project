///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="collections.ts"/>
///<reference path="AStar.ts"/>
///<reference path="Interpreter.ts"/>


module Planner {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export class ShrdliteNode implements AStar.Node<Interpreter.Literal[]> {

        private pddl : Interpreter.Literal[]; 
	private heur : number;

        constructor(public state : WorldState, public lastAction : string, public goals : Interpreter.Literal[][]) {
	    this.pddl = stackToPddl(this.state);
	    this.heur = getHeur(this.goals, this.pddl);
	}

        getState(){
            return this.pddl;
        }

	getHeuristic() {
	    return this.heur;
	}

	getGoal() {
	    return this.goals;
	}

        getChildren(){
            return generateChildren(this.state, this.lastAction, this.goals);
        }
    } 

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

    export function checkGoal(goal : Interpreter.Literal[][]) : AStar.Goal<Interpreter.Literal[]>{
        return function(lits : Interpreter.Literal[]){
            var allFound : boolean = false;
            goal.forEach(function(and : Interpreter.Literal[]){
                var goalReached = true;
                and.forEach(function(lit : Interpreter.Literal){
                    var found : boolean = isElem2(lit, lits);
                    if(found != lit.pol) { goalReached = false; }
                })
                if(goalReached == true) { allFound = true; }
            })
            return allFound;
        }
    }

    function isElem2(elem : Interpreter.Literal, arr : Interpreter.Literal[]): boolean {
        for(var i = 0; i < arr.length; i++) {
	    var a = arr[i];
	    if(elem.rel == a.rel && elem.args.toString() == a.args.toString()) {
                return true;
	    }
        }
        return false;
    }



    export function generateChildren(state : WorldState, lastAction : string, goals : Interpreter.Literal[][]) : AStar.Edge<Interpreter.Literal[]>[] {
        
        var map : collections.Dictionary<string,WorldState> = new collections.Dictionary<string,WorldState>();
        map.setValue("r", moveRight(state, lastAction));
        map.setValue("l", moveLeft(state, lastAction));
        map.setValue("d", drop(state, lastAction));
        map.setValue("p", pickup(state, lastAction));

        var edges : AStar.Edge<Interpreter.Literal[]>[] = [];
        map.forEach(function(key:string, value:WorldState){
            if(value != null) { edges.push({cost:1, end: new ShrdliteNode(value, key, goals), label: key});}
        });

        return edges;
    }

    export function cloneWorldState(state : WorldState) : WorldState {
        var newStack : string[][] = []; 
        state.stacks.forEach(function(col: string[]){
            var temp : string[] = [];
            col.forEach(function(elem : string){
                temp.push(elem);
            })
            newStack.push(temp);
        })
        return {arm: state.arm, holding: state.holding, examples: state.examples, objects: state.objects, stacks: newStack};
    }

    export function moveRight(state : WorldState, lastAction : string) : WorldState {
        
        if(state.arm == state.stacks.length -1 || lastAction == "l") {return null;}

        var newState : WorldState = cloneWorldState(state);
        newState.arm += 1;

        return newState;
    }

    export function moveLeft(state : WorldState, lastAction : string) : WorldState {
        
        if(state.arm == 0 || lastAction == "r") {return null;}

        var newState : WorldState = cloneWorldState(state);
        newState.arm -= 1;

        return newState;
    }

    export function drop(state : WorldState, lastAction : string) : WorldState {
        var len = state.stacks[state.arm].length;
        if(state.holding == null || lastAction == "d" || lastAction == "p" || (state.stacks[state.arm].length != 0 && !Interpreter.checkSize(state.objects[state.holding], state.objects[state.stacks[state.arm][len - 1]]))){
            return null;
        }
        var newState : WorldState = cloneWorldState(state);
        newState.stacks[newState.arm].push(newState.holding);
        newState.holding = null;

        return newState;
    }

    export function pickup(state : WorldState, lastAction : string) : WorldState {
        
        if(state.holding != null || lastAction == "d" || lastAction == "p" || state.stacks[state.arm].length == 0) {return null;}

        var newState : WorldState = cloneWorldState(state);
	
        newState.holding = newState.stacks[newState.arm].pop();

        return newState;
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
    function stackToPddl(state :WorldState) : Interpreter.Literal[] {
    var pddl :Interpreter.Literal[] = [];
	if(state.holding != null) {
	    pddl.push({pol:true, rel: "holding", args: [state.holding]});
	} 

    pddl.push({pol:true, rel: "armpos", args: [state.arm + ""]})
    pddl.push({pol:true, rel: "maxcol", args: [state.stacks.length + ""]})

	for(var x = 0; x < state.stacks.length; x++) {
	    //Create on top of floor
	    var col : string[] = [];
	    for(var y = 0; y < state.stacks[x].length; y++) {
		var o : string = state.stacks[x][y];
		if(y == 0) { // Add floors
		    pddl.push({pol:true, rel: "ontop", args: [o, "f_" + x]});
		} else {
		    pddl.push({pol:true, rel: "ontop", args: [o, state.stacks[x][y-1]]});
		}
		
		col.forEach(function(c) {
		    pddl.push({pol:true, rel: "above", args: [o, c]});
		});
		col.push(o);

		pddl.push({pol:true, rel: "column", args: [o, "" + x]});

	    }
	}
	
	return pddl;
    }

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {

        var plan : string[] = [];
        var node : ShrdliteNode = new ShrdliteNode(state, "", intprt);

        var path : AStar.Path<Interpreter.Literal[]> = AStar.astarSearch<Interpreter.Literal[]>(node, checkGoal(intprt));  

        return path.getLabelPath();      
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function getHeur(ors : Interpreter.Literal[][], lits: Interpreter.Literal[]) : number {
//	return 0;

	var isHolding : boolean = false;
	for(var i = 0; i < lits.length; i++){
	    if(lits[i].rel == "holding") {  isHolding = true; break; }
	}
	

	var colData = [];
	lits.forEach(function(lit) {
	    if(lit.rel == "column") {
		colData[lit.args[0]] = lit.args[1];
	    }
	});


	var lowestCost : number = 600000000;
	ors.forEach(function(ands) {
	    var cost : number = 0;
	    ands.forEach(function(and) {
		if(and.rel == "ontop" || and.rel == "above") {
		    if(isHolding) {
			cost += 1;
		    } else {
			//if( parseInt(colData[and.args[0]]) - parseInt(colData[and.args[1]]) != 0) { cost += 1;}
		    }
		} else if( and.rel == "holding" && !isHolding) {
		    cost += 1;
		} else if (and.rel == "column") {
		    if(!isHolding){
			cost += Math.abs(parseInt(and.args[1]) - parseInt(colData[and.args[0]]));
		    }
		}
	    });
	    if(cost < lowestCost) { lowestCost = cost; }
	});
	return lowestCost;
    }

}
