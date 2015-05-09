///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types
	var clairifyingparse :Parser.ResultAnswer[];
    export function interpret(parses : Parser.Result[], clairifyparse:Parser.ResultAnswer[] , currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
        clairifyingparse = clairifyparse;
        parses.forEach((parseresult) => {
            var intprt : Result = <Result>parseresult;
        	if(intprt.prs.cmd){
    			intprt.intp = interpretCommand(intprt.prs, currentState);
			}else{
				throw new Interpreter.ErrorInput("This is a statement. \"" + intprt.input +"\" . Please tell me a command.");
			}

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
    export interface ResultAnswer extends Parser.ResultAnswer {intp:Literal[][];}


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
    export class ErrorInput implements Error {
        public name = "Interpreter.ErrorInput";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    function interpretCommand(cmd : Parser.Command, state : WorldState) : Literal[][] {
        
        // Find object to move
        
        var objs = identifyEnt(cmd.ent, state);
        // Find location to move to
        var loc;
        if(cmd.cmd == "move" || cmd.cmd == "put" || cmd.cmd == "drop"){
        	loc = identifyLocation(cmd.loc, state);
        }
        // Form goal
      	
        //var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        var pddls = state.pddl.toArray();
        
        var intprt : Literal[][] = [[]];
        if(loc){
        	var k = 0;
	        for (var i = 0; i < objs.length; i++) {
	        	for (var j = 0; j < loc.length; j++) {
	        		var lit: Literal = {pol: true, rel: cmd.loc.rel, args: [objs[i], loc[j]]};
	        			/////only interpet legal goals!
	        		if(checkIllegal(lit, state)){
	        			intprt[k]= [lit];
	        			k++;
	        		}
	        	}
	        }
		}else{
	        for (var i = 0; i < objs.length; i++) {
	        	intprt[i]= [{pol: true, rel: cmd.cmd, args: [objs[i]]}];
	        }
		}
        return intprt;
    }
    
    function checkIllegal(lit : Literal, state : WorldState):boolean{
    	var a = state.objects[lit.args[0]];
    	var b = state.objects[lit.args[1]];
    	if(a==b){
    		return false;
    	}
    	if(a.form == "ball" && (lit.rel != "ontop" && lit.rel != "inside")){
    		return false;
    	}
    	if(b.form == "ball" && (lit.rel != "beside" && lit.rel != "leftof" && lit.rel != "rightof")){
    		return false;
    	}
    	if(lit.rel == "inside" &&(a.form == "pyramid" || a.form == "plank" || 
    			(a.form == "box" && (a.size == b.size || a.size == "large" && b.size == "small")))){
    		return false;
    	}
    	if(lit.rel == "ontop" || lit.rel == "above" &&(a.size == "large" && b.size == "small")){
    		return false;
    	}
    	if(b.form == "box" && lit.rel == "ontop"){
    		return false;
    	}
    	
    	return true;
    }
    
    function identifyLocation(loc : Parser.Location, state : WorldState):string[]{
    	var result:string[] = identifyObj(loc.ent.obj, state);
    	var unqObjs:string[] = uniqeObjects(result);
    	
    	if(loc.ent.quant == "the"){
    		if(unqObjs.length > 1){
    			// ambigous interpet, use clairifying parse
    			if(!clairifyingparse){
    				throw new Interpreter.Error("Could you tell me which " + state.objects[result[0]].form + " I shoule move to?");
    			}
    			var objs = solveAmbiguity(loc.ent.obj,unqObjs, state);
    			if(objs.length > 1){
    				throw new Interpreter.Error("Could you tell me which " + state.objects[result[0]].form + " I shoule move to?" + objs);
    			}
    			result = objs;
    		}
    		return result;
    	}
    	return result;
    }
    
    function solveAmbiguity(obj : Parser.Object, objs : string[], state : WorldState):string[]{
    	var parseresult = clairifyingparse[clairifyingparse.length-1].prs.obj;
    	if(parseresult.form){
    		if(obj.form && obj.form != parseresult.form){
    			throw new Interpreter.ErrorInput("Are we talking in terms of " + obj.form + " or " + parseresult.form +"? I would say " + obj.form + ".");
    		}
    		obj.form = parseresult.form;
    	}
    	if(parseresult.color){
    		if(obj.color && obj.color != parseresult.color){
    			throw new Interpreter.ErrorInput("You have already told me that the " + obj.form + " is " + obj.color +".");
    		}
    		obj.color = parseresult.color;
    	}
    	if(parseresult.size){
    		if(obj.size && obj.size != parseresult.size){
    			throw new Interpreter.ErrorInput("You have already told me that the " + obj.form + " is " + obj.size+".");
    		}
    		obj.size = parseresult.size;
    	}
    	
    	objs = identifyObj(obj, state);
    	return objs;
    }
    
    function identifyObj(obj : Parser.Object, state : WorldState):string[]{
       	var form = obj.form;
        var color = obj.color;
        var size = obj.size;
    	var objs : collections.Set<string> = new collections.Set<string>(function (x){return x});
        if(form.length == 0){
        	return [];
        }
        var pddls = state.pddl.toArray();
        for (var index = 0; index < pddls.length; index++) {
        	var pddl = pddls[index];
        	//check the first arg for form, color and size if it matches, add it to possibel objs
        	var a = state.objects[pddl.args[0]];
        	if(a.form != form){
        		continue;
        	}
        	if(!a){
        		continue;
        	}
        	if(color != null){
        		if(a.color != color){
        			continue;
        		}
        	}
        	if(size != null){
        		if(a.size != size){
        			continue;
        		}
        	}
        	objs.add(pddl.args[0]);
		}
        return objs.toArray();
    }
    
    function identifyEnt(ent:Parser.Entity, state :WorldState):string[]{
    	var result:string[] = identifyObj(ent.obj, state);
    	var resSize:number = uniqeObjects(result).length;
    	if(ent.quant == "the"){
    		if(resSize > 1){
    			throw new Interpreter.Error("Ambigous result: " +  result);
    		}
    		return result;
    	}
    	return identifyObj(ent.obj, state);
    }
    
    function uniqeObjects(objs:string[]):string[]{
    	var objset : collections.Set<string> = new collections.Set<string>(function(a){return a});
    	objs.forEach((obj) =>
    		objset.add(obj)
    	);
    	return objset.toArray();
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
}

