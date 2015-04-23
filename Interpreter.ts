///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

module Interpreter {

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
        // This returns a dummy interpretation involving two random objects in the world
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        //console.log("tttttttttttttst", state.objects["a"].color );
        var a = objs[getRandomInt(objs.length)];
        var b = objs[getRandomInt(objs.length)];
        var intprt : Literal[][] = [[
            {pol: true, rel: "ontop", args: [a, "floor"]},
            {pol: true, rel: "holding", args: [b]}
        ]];
        
        //console.log("hhhhhhhhhhhhhhhh" , state.objects);
        
        if (cmd.cmd == "take"){
        	if(cmd.ent.quant == "the"){
        		
        		checkStm(cmd.ent.obj, state);
        	}
        }
        
        //console.log("hhhhhhhhhhhhhhhh" , checkStm(cmd.ent.obj , state));
        
        
        
        return intprt;
    }
    
    
    
    
    function checkStm (objs : Parser.Object , state : WorldState) : string[] {
    	var list : string[] = [];
    	
    	if(objs.obj){
    		
    		var stmObj = checkStm(objs.obj, state);
    		var stmLocObj = checkStm(objs.loc.ent.obj, state);
    	
    	for(var x =0; x< state.stacks.length;  x++){
    		for (var y=0; y< state.stacks[x].length; y++){
    			var index = state.stacks[x][y];
    			if(index == stmLocObj[0]){
    				if( objs.loc.rel == "ontop" || objs.loc.rel == "inside"){
						if(state.stacks[x][y+1] == stmObj[0]){
							list.push(stmObj[0]);
							list.push(stmLocObj[0]);
						}
					}
    			}
		//		if((objs.color == null || objs.color == state.objects[index].color) && 
		//			(objs.form == null || objs.form == state.objects[index].form)  && 
		//				(objs.size == null || objs.size == state.objects[index].size)){
						
						
						
						console.log("index", x, y);
    	//		}
    		}
    	}
    	
    	} else {
    	
    	for(var i in state.objects){
    			if((objs.color == null || objs.color == state.objects[i].color) && 
    				(objs.form == null || objs.form == state.objects[i].form)  && 
    				(objs.size == null || objs.size == state.objects[i].size)){
    				list.push(i);
    				return list;
    			}
    	}
    	
    	return list;
    	}
    }
    


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

