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
        if (interpretations.length==1) {
            return interpretations;
        }
        else if(interpretations.length>1){throw new Interpreter.Error("Found ambigious interpretation");}
         else {
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
        var intprt : Literal[][] = []
        
        if (cmd.cmd == "move"){
        	intprt = goalsToPDDL(cmd.ent, cmd.loc, state);
        }else if(cmd.cmd == "take"){
        	intprt = goalsToPDDL(cmd.ent, null, state);
        }else if(cmd.cmd == "put"){
	    var o : ObjectDefinition = state.objects[state.holding];
	    intprt = goalsToPDDL({quant:"holding", obj:o},cmd.loc,state);
        }
        console.log("interpreter--------------", intprt);
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
    
    function checkHolding(obj : Parser.Object, holding : Parser.Object){
    	if(obj.form == holding.form || obj.color == holding.color || obj.size == holding.size){
    		return true
    	}else{
    		return false;
    	}
    	
    }
    
    function goalsToPDDL(ent : Parser.Entity , loc : Parser.Location , state : WorldState) : Literal[][] {
    	var lits : Literal[][] = [];
    	var posList : position[] = [];
    	if(ent.quant == "holding" || state.holding !=null && checkHolding(ent.obj, state.objects[state.holding])){
    		posList =  [new position(0,0,{form: ent.obj.form, color: ent.obj.color, size: ent.obj.size}, state.holding)];
    	}else{
    		posList = checkStm (ent.obj, state);
    	}
    	console.log("Entity-----------", posList);
    	for(var i =0; i< posList.length;  i++){
    		if(loc == null){
    			var hold : Literal = {pol : true, rel : "holding", args : [posList[i].name]};
    			lits.push([hold]);
    		}else{
    			var goal = checkStm (loc.ent.obj, state);
    			console.log("Location-----------", goal);
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
    				}else if(loc.rel == "above"){
                        var b : Literal = {pol : true, rel : "above", args : [posList[i].name, goal[j].name ]};
                        //if(checkValidPos(posList[i].obj, goal[j].obj )){
                            lits.push([b]);
                        //}                        
                    }else if(loc.rel == "under"){
                        var b : Literal = {pol : false, rel : "above", args : [posList[i].name, goal[j].name ]};
                        if(checkValidPos(posList[i].obj, goal[j].obj )){
                            lits.push([b]);
                        }                        
                    }else if(loc.rel == "beside"){
                        var a : Literal = {pol : true, rel : "beside", args : [posList[i].name, goal[j].name ]};
                            lits.push([a]);
                            
                    }else if(loc.rel == "leftof"){
                        var a : Literal = {pol : true, rel : "leftof", args : [posList[i].name, goal[j].name ]};
                            lits.push([a]);
                            
                    }else if(loc.rel == "rightof"){
                        var a : Literal = {pol : false, rel : "leftof", args : [posList[i].name, goal[j].name ]};
                            lits.push([a]);
                    }
    			}	
    		}
    	}
    	
    	
    	return lits;
    }

    // Returns which height the object have in the given stack 
    export function searchStack (stack : string[], obj : string ) : number {
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
				}else if( objs.loc.rel == "above"){
                    for(var j =0; j< stmObj.length;  j++){      //loops through every stmObject to check all objects matching with stmLocobj 

                        //Which height the object have in the given stack
                        var objHeight : number = searchStack (state.stacks[stmLocObj[i].x],state.stacks[stmObj[j].x][stmObj[j].y]);  
                        //check same x-cordinate && check that y-cordinate is greater
                        if((stmLocObj[i].x == stmObj[j].x) && (objHeight > stmLocObj[j].y)) {                            
                            list.push(stmObj[j]);
                        }
                    }
                }else if( objs.loc.rel == "under"){
                    for(var j =0; j< stmObj.length;  j++){      //loops through every stmObject to check all objects matching with stmLocobj 

                        //Which height the object have in the given stack
                        var objHeight : number = searchStack (state.stacks[stmLocObj[i].x],state.stacks[stmObj[j].x][stmObj[j].y]);  
                        
                        //check same x-cordinate && check that y-cordinate is lower
                        if((stmLocObj[i].x == stmObj[j].x) && (objHeight < stmLocObj[j].y)) {                            
                            list.push(stmObj[j]);
                        }
                    }
                }else if(objs.loc.rel == "beside"){
                    for(var j =0; j< stmObj.length;  j++){
                        var stack1 = searchStack(state.stacks[stmLocObj[i].x-1], state.stacks[stmObj[j].x][stmObj[j].y]);
                        var stack2 = searchStack(state.stacks[stmLocObj[i].x+1], state.stacks[stmObj[j].x][stmObj[j].y]);
                        if(stack1 != -1){
                            list.push(stmObj[j]);
                        }else if(stack2 != -1){
                            list.push(stmObj[j]);
                        }
                    }
                }else if(objs.loc.rel == "leftof"){
                	for(var j =0; j< stmObj.length;  j++){
	                	for(var t =0; t < stmLocObj[i].x; t++){
	                		var stack = searchStack(state.stacks[t], state.stacks[stmObj[j].x][stmObj[j].y]);
	                		if (stack != -1){
	                			list.push(stmObj[j]);
	                		}
	                	}
	                }
                }else if(objs.loc.rel == "rightof"){
                	for(var j =0; j< stmObj.length;  j++){
	                	for(var t =stmLocObj[i].x; t < state.stacks.length; t++){
	                		var stack = searchStack(state.stacks[t], state.stacks[stmObj[j].x][stmObj[j].y]);
	                		if (stack != -1){
	                			list.push(stmObj[j]);
	                		}
	                	}
	                }
                }
			}		
    	} else {
    		
    		if (objs.form == "floor"){
    			for(var x =0; x< state.stacks.length;  x++){
    				list.push(new position(x,-1, {form : "floor", size : "none" , color : "none"}, "floor"));
    			}
    			
    	    }else{
	    	    for(var x =0; x< state.stacks.length;  x++){
		    		for (var y=0; y< state.stacks[x].length; y++){
		    			var index = state.stacks[x][y];
		    			if((objs.color == null || objs.color == state.objects[index].color) && 
		    				(objs.form == null || objs.form=="anyform" || objs.form == state.objects[index].form)  && 
		    				(objs.size == null || objs.size == state.objects[index].size)){
		    
		    				var pos = new position(x,y, state.objects[state.stacks[x][y]], state.stacks[x][y]);
		    				list.push(pos);
		    			}
	    			}
	    		}
			}						
    	}
        return list;
    }
    


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    /**
*   Check that the combination of over and under object is valid 
**/
export function checkValidPos (over : ObjectDefinition, under : ObjectDefinition): boolean{
	//console.log(over);
	//console.log(under);
        
        if (under.form == "floor"){
            return true;
        }
        //Ball
        else if(under.form == "ball"){ return false; }
        else if(over.form == "ball" )
        {
            if (under.form == "box" && checkSizeUGE(over.size, under.size) ){
                return true;
            }else{
                return false;
            }
        }
        //Box
        else if(under.form =="box" )
        {
            if(over.form == "table"){
                if(checkSizeUGE(over.size, under.size)){
                    return true;
                }
                else{
                    return false;
                }               
            }
            else if(over.form == "plank"){
                if(checkSizeUG(over.size, under.size)){
                    return true;
                }
                else{
                    return false;
                }
            }
            else if(over.form == "brick"){
                return (checkSizeUGE(over.size, under.size))
            }
            else if(checkLessEQ(over.size, under.size) )
            {
                return true;
            }
            else
            {
                return false;
            }

        }
        // Pyramid
        else if (under.form == "pyramid" || under.form == "brick")
        {
            if (over.form == "box")
            {
                // Large Box cant be over large Pyramid
                // Small Box cant be over small Pyramid or Brick
                if(checkSizeUG(over.size, under.size) && under.form =="pyramid")
                {
                    return true;
                }
                else if(under.size == "large" && under.form=="brick")
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }

            else{
            	return checkSizeUGE(over.size, under.size);
            }
            
        }
        //table
        else if (under.form == "table"){
            if(checkSizeUGE(over.size, under.size)){
                return true;
            }
            else
            {
                return false
            }
        }
        //plank
        else if (under.form == "plank"){
            if(checkSizeUGE(over.size, under.size)){
                return true;
            }
            else
            {
                return false
            }
        }


        return false;
    }


/**
* checks that over is of same size or smaller than under.
**/
function checkSizeUGE (over : string, under : string): boolean {

        if(under == "large" )
        {
            return true;
        }
        else if(over =="small")
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

        if(under == "large" && over == "small")
        {
            return true;
        }
        else
        {
            return false;
        }

}

function checkLessEQ (over : string, under : string): boolean {

        if(under == "large" && over == "small" || under == "small" && over == "small" )
        {
            return true;
        }
        else
        {
            return false;
        }
}


}

