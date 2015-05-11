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
			if(intprt.intp.length){
            	interpretations.push(intprt);
            }
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
    export interface IdentResult {pol:boolean; rel?:string; argss: string[][]; loc?:Location;}


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
        
        var objs : string [][] = identifyEnt(cmd.ent, state);
        if(!objs.length){
        	return [];
        }
        // Find location to move to
        var loc : string [][];
        if(cmd.cmd == "move" || cmd.cmd == "put" || cmd.cmd == "drop"){
        	loc = identifyLocation(cmd.loc, state);
        }
        // Form goal
      	
        //var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        var pddls = state.pddl.toArray();
        
        var intprt : Literal[][] = [];
        if(loc){
        	var n = 0;
        	
        	// gather all poss
        	var lits :Literal [][] = [];
        	for (var i = 0; i < objs.length; i++) {
        		for (var k = 0; k < objs[i].length; k++) {
        			var nn = 0;
        			for (var j = 0; j < loc.length ; j++) {
        				for (var l = 0; l < loc[j].length ; l++) {
		        			var lit: Literal = {pol: true, rel: cmd.loc.rel, args: [objs[i][k], loc[j][l]]};
			        			/////only interpet legal goals!
			        		if(checkIllegal(lit, state)){
			        			if(lits[k]== null){
			        				lits[k] = [];
			        			}
			        			lits[k][nn] = lit;
			        			nn++;
			        		}
			        	}
		        	}
        		}
        	}
        	// combine the results
        	var litscomb :Literal [][] = [];
        	var n = 0;
        	for (var i = 0; i < lits.length; i++) {
        		for (var j = 0; j < lits[i].length ; j++) {
        			
        			for (var k = 0; k < lits.length ; k++) {
        				for (var l = 0; l < lits[k].length ; l++) {
        					if(litscomb[n]== null){
		        				litscomb[n] = [];
		        			}
		        			var combi : Literal[]= [];
		        			combi.push(lits[i][j]);
		        			if(i != k && j != l){
		        				combi.push(lits[k][l]);
		        			}
		        			if(checkIllegalCombi(combi, litscomb, state) && checkQuantifyer(combi, cmd.ent, cmd.loc,state)){
	        					litscomb[n] = combi;
	        					n++;
	        				}
        				}
        			}
        		}
        	}
        	// remove reoccurence
        	var litset : collections.Set<Literal[]> = new collections.Set<Literal[]>(
        		function(a){
        			var res:Result = {input: "", prs: null ,intp: [a]};
        			return interpretationToString(res);});
	    	litscomb.forEach((obj) =>
	    		litset.add(obj)
	    	);
	    	intprt =  litset.toArray();
        	//intprt = litscomb;
		}else{
	        for (var i = 0; i < objs.length; i++) {
	        	for (var j = 0; j < objs[i].length; j++) {
	        		intprt[i]= [{pol: true, rel: cmd.cmd, args: [objs[i][j]]}];
	        	}
	        }
		}
        return intprt;
    }
    
    function checkQuantifyer(lits : Literal[], ent : Parser.Entity, loc : Parser.Location, state : WorldState):boolean{
    	if(ent.quant == "the"){
    		if(lits.length > 1){
    			return false;
    		}
    	}else if(ent.quant == "all" && loc.ent.quant != "all" ||
    				ent.quant != "all" && loc.ent.quant == "all"){
    		var totalUnqObjs = findAllWithForm(ent.obj.form, state);
    		if( (loc.rel != "beside")){
	    		if(lits.length != totalUnqObjs.length){
	    			return false;
	    		}
    		}else if(loc.rel == "beside"){
    			if((loc.ent.obj.form != ent.obj.form && lits.length != totalUnqObjs.length) || 
    				(loc.ent.obj.form == ent.obj.form && lits.length != totalUnqObjs.length-1)){
	    			return false;
	    		}
    		}
    	}else if(ent.quant == "all" && loc.ent.quant == "all"){
    		
    	}
    	
    	return true;
    }
    
    function checkIllegalCombi (lits : Literal[], litscomb :Literal [][], state : WorldState):boolean{
		//return true;
    	for(var i = 0; i < lits.length; i++){
    		for(var j = i+1; j < lits.length; j++){
    			if(lits[i].rel == lits[j].rel ){
    				/*if(	(lits[i].args[0] == lits[j].args[0] ||		// remove dubletter
	    					lits[i].args[1] == lits[j].args[1]) ){
    					return false;
    				}
    				if(	(lits[i].args[0] == lits[j].args[1] ||		// remove dubletter
	    					lits[i].args[1] == lits[j].args[0])){
    					return false;
    				}*/
    				
				}
    		}
    	}
    	
    	
    	return true;
    }
    
    function checkIllegal(lit : Literal, state : WorldState):boolean{
    	var a = state.objects[lit.args[0]];
    	var b = state.objects[lit.args[1]];
    	if(lit.args[0] == lit.args[1]){
    		return false;
    	}
    	if(b.form == "floor" && a.form != b.form){
    		if(lit.rel == "under"){
    			return false;
    		}
    		return true;
    	}
    	if(a.form == "ball" && ((lit.rel == "ontop" && b.form != "floor") || (lit.rel == "inside" && 
    			(a.size == "large" && b.size == "small")))){
    		return false;
    	}
    	if(b.form == "ball" && (lit.rel == "ontop" || lit.rel == "above" )){
    		return false;
    	}
    	if(lit.rel == "inside" && (b.form != "box")){
    		return false;
    	}
    	if(lit.rel == "inside" && ((a.form == "pyramid" || a.form == "plank" || a.form == "floor" || a.form == "box")&&
    			(a.size == b.size || (a.size == "large" && b.size == "small")))){
    		return false;
    	}
    	if((lit.rel == "ontop" || lit.rel == "above" || lit.rel == "inside") && ((a.size == "large" && b.size == "small")|| a.form == "floor")){
    		return false;
    	}
    	if(lit.rel == "under" && ((b.size == "large" && a.size == "small") || a.form == "ball")){
    		return false;
    	}
    	if(b.form == "box" && lit.rel == "ontop"){
    		return false;
    	}
    	
    	return true;
    }
    
    function identifyLocation(loc : Parser.Location, state : WorldState):string[][]{
    	try {
        	var result:string[][] = identifyEnt(loc.ent, state);
		} catch (err) {
			if(err instanceof Interpreter.ErrorInput){
				err.message = err.message.substring(0, err.message.length-1) + " to?";
				throw err;
				//TODO write a better error message !! 
			}else{
				throw err;
			}
		     
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
    	
    	objs = identifyObj(obj.form, obj.color, obj.size, state);
    	return objs;
    }
    
    function identifyObj(form :string, color :string, size :string, state : WorldState):string[]{
       //	var form = obj.form;
      //  var color = obj.color;
      //  var size = obj.size;
    	var objs : collections.Set<string> = new collections.Set<string>(function (x){return x});
        if(!form){
        	return [];
        }
        var pddls = state.pddl.toArray();
        if(form == "floor" ){	// special case for floor
        	for (var index = 0; index < pddls.length; index++) {
        		var pddl = pddls[index];
        		
        		if((pddl.rel == "leftof" || pddl.rel == "rightof") && pddl.args){
        			var a = state.objects[pddl.args[0]];
        			objs.add(pddl.args[0]);	
        		}
        	}
        }else{
	        for (var index = 0; index < pddls.length; index++) {
	        	var pddl = pddls[index];
	        	//check the first arg for form, color and size if it matches, add it to possibel objs
	        	var a = state.objects[pddl.args[0]];
	        	if(a.form != form && form != "anyform"){
	        		continue;
	        	}
	        	if(!a){
	        		continue;
	        	}
	        	if(!(color == null || color.length == 0 )){
	        		if(a.color != color){
	        			continue;
	        		}
	        	}
	        	if(!(size == null || size.length == 0)){
	        		if(a.size != size){
	        			continue;
	        		}
	        	}
	        	objs.add(pddl.args[0]);
			}
		}
        return objs.toArray();
    }
    
    function identifyEnt(ent:Parser.Entity, state :WorldState):string[][]{
    	var result : string[] = identifyObj(ent.obj.form, ent.obj.color, ent.obj.size, state);
    	var unqObjs : string[] = uniqeObjects(result);
    	var results : string[][] = [[]];
    	//TODO not sure how deal with nested objects
    //	var idres : IdentResult = {pol:true , rel: null , argss :[]};
    	if(ent.obj.loc){
    		//TODO
    	//	idres.rel = ent.obj.loc.rel;
    	//	identifyLocation(ent.obj.loc, state);
    	}
    	
    	if(ent.quant == "the" && ent.obj.form != "floor"){
    		// ambigous interpet, use clairifying parse
    		if(unqObjs.length > 1){
				if(!clairifyingparse){
					throw new Interpreter.ErrorInput("Could you tell me which " + state.objects[result[0]].form + " I should move?");
				}
				var objs = solveAmbiguity(ent.obj,unqObjs, state);
				if(objs.length > 1){
					throw new Interpreter.ErrorInput("Could you tell me which " + state.objects[result[0]].form + " I should move?");
				}
				result = objs;
    		}
    		for(var i = 0; i < result.length; i++){
    			results[i] = [result[i]];
    		}
    	} else
    	if(ent.quant == "all"){
    		var totalUnqObjs = findAllWithForm(ent.obj.form, state);
    		if(unqObjs.length != totalUnqObjs.length){
    			if(!clairifyingparse){
					throw new Interpreter.ErrorInput("Could you tell me which " + state.objects[result[0]].form + " I should move?");
				}
				var objs = solveAmbiguity(ent.obj,unqObjs, state);
				if(objs.length > 1){
					throw new Interpreter.ErrorInput("Could you tell me which " + state.objects[result[0]].form + " I should move?");
				}
				result = objs;
    		}
    		for(var i = 0; i < result.length; i++){
    			results[i] = result;
    		}
    	} else
    	if (ent.quant == "any" || ent.obj.form == "floor"){ // any
    		for(var i = 0; i < result.length ;i++){
    			results[i] = [result[i]];
    		}
    	}
    	return results;
    }
    
    function findAllWithForm(form : string, state : WorldState):string[]{
    	var objs = identifyObj(form, "", "",state);
    	return uniqeObjects(objs);
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

