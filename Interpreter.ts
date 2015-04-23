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
        var a = objs[getRandomInt(objs.length)];
        var b = objs[getRandomInt(objs.length)];
        var intprt : Literal[][] = [[
            {pol: true, rel: "ontop", args: [a, "floor"]},
            {pol: true, rel: "holding", args: [b]}
        ]];
        
        if (cmd.cmd == "move"){
        	console.log("entity--------------\n",checkStm(cmd.ent.obj, state));
        	console.log("location------------\n",checkStm(cmd.loc.ent.obj, state));
        }        
        return intprt;
    }
    
    class position {
    	public x : number;
    	public y : number;
    	public obj : ObjectDefinition
    	public wasFound : boolean
	
    	constructor( x : number, y : number, obj : ObjectDefinition){
    		this.x = x;
    		this.y = y;
    		this.obj = obj;
    		this.wasFound = true;
    	}

    	public setWasFound(b : boolean){
    		this.wasFound = b;
    	}
    }
        
    function checkStm (objs : Parser.Object , state : WorldState) : position[] {
    	var list : position[] = [];
    	
    	if(objs.obj){
    		var stmObj = checkStm(objs.obj, state);
    		var stmLocObj = checkStm(objs.loc.ent.obj, state);
    	   				
			if( objs.loc.rel == "ontop" || objs.loc.rel == "inside"){
				if (!stmLocObj[0].obj){				//check if floor exist
					for(var x =0; x< state.stacks.length;  x++){	//loop through every floor
							 	for(var y =0; y< stmObj.length;  y++){
							 	 
								 if (state.stacks[x][0] == state.stacks[stmObj[y].x][stmObj[y].y]){
								 	list.push(stmObj[y]);
								 	list.push(stmLocObj[0]);
								 	break;
								 }
							 }
					}
					if(list.length == 0){
						var errPos = (new position(-1,-1,null));
						errPos.setWasFound(false);
						list.push(errPos);
					}
				}else{
				
					if(!(stmLocObj[0].y+1 > state.stacks[stmLocObj[0].x].length) && 
						(state.stacks[stmLocObj[0].x][stmLocObj[0].y+1] == state.stacks[stmObj[0].x][stmObj[0].y])){
				
						list.push(stmObj[0]);
						list.push(stmLocObj[0]);
					}else {
						
						stmObj[0].setWasFound(false);
						stmLocObj[0].setWasFound(false);
						list.push(stmObj[0]);
						list.push(stmLocObj[0]);
					}
				}
				return list;
			}		
    	} else { 		
    		
    		if (objs.form == "floor"){
    			list.push(new position(-1,-1, null));
    			
    	    }else{
	    	    for(var x =0; x< state.stacks.length;  x++){
		    		for (var y=0; y< state.stacks[x].length; y++){
		    			var index = state.stacks[x][y];
		    			if((objs.color == null || objs.color == state.objects[index].color) && 
		    				(objs.form == null || objs.form == state.objects[index].form)  && 
		    				(objs.size == null || objs.size == state.objects[index].size)){
		    
		    				var pos = new position(x,y, state.objects[state.stacks[x][y]]);
		    				list.push(pos);
		    			}
	    			}
	    		}
			}						
    	return list;
    	}
    }
    


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

