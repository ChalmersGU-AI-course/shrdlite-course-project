///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

module Interpreter {

    interface Position {
	x : number;
	y : number;
    }
    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
        parses.forEach((parseresult) => {
            var intprt : Result = <Result>parseresult;
            intprt.intp = interpretCommand(intprt.prs, currentState);
            interpretations.push(intprt);
        });
        if (interpretations.length) {
            return interpretations;
        } else {
            throw new Interpreter.Error("Found no interpretation");
        }
    }


    export interface Result extends Parser.Result {intp:Literal[][];}
    export interface Literal {pol:boolean; rel:string; args:string[];}


    export function interpretationToString(res : Result) : string {
        return res.intp.map((lits) => {
            return lits.map((lit) => literalToString(lit)).join(" & ");
        }).join(" | ");
    }

    export function literalToString(lit : Literal) : string {
        return (lit.pol ? "" : "-") + lit.rel + "(" + lit.args.join(",") + ")";
    }


    export class Error implements Error {
        public name = "Interpreter.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    function interpretCommand(cmd : Parser.Command, state : WorldState) : Literal[][] {
	
	var valids : string[] = findValid(cmd.ent.obj, state);
	if(valids.length == 0) {
	    alert("no such object TODO");
	}

        // This returns a dummy interpretation involving two random objects in the world
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        var a = objs[getRandomInt(objs.length)];
        var b = objs[getRandomInt(objs.length)];
        var intprt : Literal[][] = [[
            {pol: true, rel: "ontop", args: [a, "floor"]},
            {pol: true, rel: "holding", args: [b]}
        ]];
        return intprt;
    }


    function findValid(obj : Parser.Object, state : WorldState) : string[]{
	var valids : string[] = [];
	if(obj.obj) { //If recursive
	    var valids2 : string[] = findValid(obj.obj, state);
	    var valids3 : string[] = findValid(obj.loc.ent.obj , state);
		for( var i = 0; i < valids3.length; i++) {
		    
		    var targetObjPos : Position = findObject(valids3[i], state);
		    if(obj.loc.rel == "inside") {
			var objAboveTarget : string = state.stacks[targetObjPos.x][targetObjPos.y + 1];
			if((  objAboveTarget &&
			    ((var yes = valids2.indexOf(objAboveTarget)) != -1) &&
			      state.objects[objAboveTarget].size > state.objects[valids3[i]].size)) {
			    valids.push(valids2[yes]);
			}
		    }
		}
	    

	} else { //Base case
	    
	    for(var y in state.objects) {
		if((obj.size  == state.objects[y].size  || obj.size  == null) &&
		   (obj.form  == state.objects[y].form  || obj.form  == null) && 
		   (obj.color == state.objects[y].color || obj.color == null)){
		       valids.push(y);
		}
	    } 
	}
	return valids;
    }


    function findObject(key : string, state : WorldState) : Position {
	for(var i = 0; i < state.stacks.length; i++) {
	    for(var j = 0; i < state.stacks[i].length; j++) {
		if(key == state.stacks[i][j]) {
		    return {x:i, y:j};
		}
	    }
	}
	//should never get here
	alert("Error in findObject. Reached unreachable code");
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
