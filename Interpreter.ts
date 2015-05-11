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
        	console.log("PDDL\n", goalsToPDDL(cmd.ent, cmd.loc, state));
        	//goalsToPDDL(checkStm(cmd.ent.obj, state), cmd.loc, state)
        }        
        return intprt;
    }
    
    class position {
    	public x : number;
    	public y : number;
    	public obj : ObjectDefinition;
    	public name : string; 
	
    	constructor( x : number, y : number, obj : ObjectDefinition, name : string){
    		this.x = x;
    		this.y = y;
    		this.obj = obj;
    		this.name = name; 
    	}
    }
    
    function goalsToPDDL(ent : Parser.Entity , loc : Parser.Location , state : WorldState) : Literal[][] {
    	var lits : Literal[][] = [];
    	var posList : position[] = checkStm (ent.obj, state);
    	for(var i =0; i< posList.length;  i++){
    		if(loc == null){
    			var hold : Literal = {pol : true, rel : "holding", args : [posList[i].name]};
    			lits.push([hold]);
    		}else{
    			var goal = checkStm (loc.ent.obj, state);
    			for(var j =0; j< goal.length;  j++){
    				if(loc.rel == "ontop"){
    					var g : Literal = {pol : true, rel : "ontop", args : [posList[i].name, goal[j].name ]};
    					if(checkValidPos(posList[i].obj, goal[j].obj )){
    						lits.push([g]);
    					}
    				}else if(loc.rel == "inside"){
    					var	a : Literal = {pol : true, rel : "inside", args : [posList[i].name, goal[j].name ]};
    					if(checkValidPos(posList[i].obj, goal[j].obj )){
    						lits.push([a]);
    					}
    				}
    			}	
    		}
    	}
    	
    	
    	return lits;
    }

    function searchStack (stack : string[], obj : string ) : number {
        for(var i =0; i< stack.length;  i++){
            if(obj == stack[i]){
                return i;
            }
        }
        return -1;
    }
        
    function checkStm (objs : Parser.Object , state : WorldState) : position[] {
    	var list : position[] = [];
    	
    	if(objs.obj){
    		var stmObj = checkStm(objs.obj, state);
    		var stmLocObj = checkStm(objs.loc.ent.obj, state);
    	   	
    	   	for(var i =0; i< stmLocObj.length;  i++){	//for every loc obj check every stm obj
    	   	
				if( objs.loc.rel == "ontop" || objs.loc.rel == "inside"){
					for(var j =0; j< stmObj.length;  j++){		//loops through every stmObject to check all objects matching with stmLocobj 
						if(!(stmLocObj[i].y+1 > state.stacks[stmLocObj[i].x].length) && 
							(state.stacks[stmLocObj[i].x][stmLocObj[i].y+1] == state.stacks[stmObj[j].x][stmObj[j].y])){
					
							list.push(stmObj[j]);
							//list.push(stmLocObj[i]);
						}
					}
				}
			}		
			return list;
    	} else { 		
    		
    		if (objs.form == "floor"){
    			for(var x =0; x< state.stacks.length;  x++){
    				list.push(new position(x,-1, {form : "floor", size : "none" , color : "none"}, "floor"+x));
    			}
    			
    	    }else{
	    	    for(var x =0; x< state.stacks.length;  x++){
		    		for (var y=0; y< state.stacks[x].length; y++){
		    			var index = state.stacks[x][y];
		    			if((objs.color == null || objs.color == state.objects[index].color) && 
		    				(objs.form == null || objs.form == state.objects[index].form)  && 
		    				(objs.size == null || objs.size == state.objects[index].size)){
		    
		    				var pos = new position(x,y, state.objects[state.stacks[x][y]], state.stacks[x][y]);
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

    /**
*   Check that the combination of over and under object is valid 
**/
function checkValidPos (over : ObjectDefinition, under : ObjectDefinition): boolean{
        
        if (under.form === "floor"){
            return true;
        }
        //Ball
        else if(under.form === "ball"){ return false; }
        else if(over.form === "ball" )
            {
            if (under.form === "box" && checkSizeUGE(over.size, under.size) ){
                return true;
            }else{
                return false;
            }
        }
        //Box
        else if(under.form ==="box" )
        {
            if(checkSizeUG(over.size, under.size))
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        // Pyramid
        else if (under.form === "pyramids" || under.form === "bricks")
        {
            if (over.form === "box")
            {
                // Large Box cant be over large Pyramid
                // Small Box cant be over small Pyramid or Brick
                if(checkSizeUG(over.size, under.size) && under.form==="pyramids")
                {
                    return true;
                }
                else if(checkSizeUGE(over.size, under.size) && under.form==="bricks")
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            
        }
        //Check that under is larger or of same size
            if else(checkSizeUGE(over.size, under.size))
            {
                return true;
            }
            else
            {
                return false;
            }
        
        return false;
    }


/**
* checks that over is of same size or smaller than under.
**/
function checkSizeUGE (over : string, under : string): boolean {

        if(under === "large" )
        {
            return true;
        }
        else if(over ==="small")
        {
            return true;
        }
        else
        {
            return false;
        }

}

/**
* checks that over is of same size or smaller than under.
**/
function checkSizeUG (over : string, under : string): boolean {

        if(under === "large" && over =="small" )
        {
            return true;
        }
        else
        {
            return false;
        }

}

}

