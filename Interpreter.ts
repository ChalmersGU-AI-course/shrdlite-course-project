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
        
        var objs : Literal [][] = identifyEnt(cmd.ent, null , state);
        if(!objs.length){
        	return [];
        }
        // Find location to move to
        var loc : Literal [][] = [];
        if(cmd.cmd == "move" || cmd.cmd == "put" || cmd.cmd == "drop"){
        	loc = identifyLocation(cmd.loc, state);
        }
        // Form goal
        var intprt : Literal[][] = [];
        
        // combine a obj with possible locations
       	var n = 0;
        for(var l = 0; l < objs.length; l++){
			for(var i = 0; i < objs[l].length; i++){
				var lit : Literal;
				if(loc.length){
					for(var j = 0 ; j < loc.length ;j++){
						for(var k = 0 ; k < loc[j].length ;k++){
							lit = {pol : true, rel : cmd.loc.rel, args : [objs[l][i].args[objs[l][i].args.length -1], loc[j][k].args[0]]};
							
							if(checkIllegal(lit, state) ){
								if(!intprt[n]){
									intprt[n] = [];
								}
								if(checkIllegal(objs[l][i], state)){
									intprt[n].push(objs[l][i]);
								}
								if(checkIllegal(loc[j][k], state)){
									intprt[n].push(loc[j][k]);
								}
								intprt[n].push(lit);
								n++;
							}
						}
					}
				}else{
					lit = {pol : true, rel : null, args : [objs[l][i].args[0]]};
					if(checkIllegal(lit, state)){
						if(!intprt[l]){
							intprt[l] = [];
						}
						intprt[l].push(lit);
					}
				}
			}
		}
		var resintprt : Literal[][] = [];
		var max : number = findMaxdepth(objs)+ findMaxdepth(loc) -1;
		
		
		// filter incomplete intrepretations
		for(var i = 0; i < intprt.length; i++){
			if(checkCompleteness(max, intprt[i])){
				if(!resintprt[i]){
					resintprt[i] = [];
				}
				resintprt[i] = intprt[i];
			}
		}

        return resintprt;
    }
    
    function findMaxdepth(litss : Literal[][]):number{
    	var max : number = 0;
		litss.forEach((lits) =>{
			if(max < lits.length){
				max = lits.length;
			}
		});
		return max;
    }
    
    function checkCompleteness(max : number, lits : Literal []):boolean{

    	//if(lits.length <= max && max > 2){
    	//	return false;
    	//}
    	
    	return true;
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
    	
    	if(!lit.rel || lit.rel == null){
    		return false;
    	}
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
    
    function identifyLocation(loc : Parser.Location, state : WorldState):Literal[][]{
    	try {
        	var result : Literal[][] = identifyEnt(loc.ent, null, state);
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
    
    
    
    function identifyEnt(ent : Parser.Entity, rel : string ,state : WorldState):Literal[][]{
    	var result : string[];
    	if (ent.obj.loc){
    		result = identifyObj(ent.obj.obj.form, ent.obj.obj.color, ent.obj.obj.size, state);
    	}else{
    		result = identifyObj(ent.obj.form, ent.obj.color, ent.obj.size, state);
    	}
    	 
    	var unqObjs : string[] = uniqeObjects(result);
    	var results : Literal[][] = [];
    	if(ent.obj.loc){

    		var locres : Literal [][]= identifyLocation(ent.obj.loc, state);
    		for(var i = 0; i < locres.length; i ++){
    			if(!results[i]){
    				results[i] = [];
    			}
    			results[i] = append<Literal>(results[i], locres[i]);
    		}
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

    	} else
    	if (ent.quant == "any" || ent.obj.form == "floor"){ // any
   			;// TODO
    	}
    	// combine with possible locations
    	var intrpt : Literal[][] = [];
		for(var i = 0; i < result.length; i++){
			var lit : Literal;
			if(ent.obj.loc){
				for(var j = 0 ; j < results.length ;j++){
					for(var k = 0 ; k < results[j].length ;k++){
						lit = {pol : true, rel : ent.obj.loc.rel, args : [result[i], results[j][k].args[0]]};
						if(checkIllegal(lit, state)){
							if(!intrpt[j]){
								intrpt[j] = [];
							}
							if(checkIllegal(results[j][k], state)){
								intrpt[j].push(results[j][k]);
							}
							intrpt[j].push(lit);
						}
					}
				}
			}else{
				lit = {pol : true, rel : rel, args : [result[i]]};
				if(!intrpt[i]){
					intrpt[i] = [];
				}
				intrpt[i].push(lit);
			}
		}
			
    	return intrpt;
    }
    
    function findAllWithForm(form : string, state : WorldState):string[]{
    	var objs = identifyObj(form, "", "",state);
    	return uniqeObjects(objs);
    }
    
    function uniqeObjsFromLits(lits: Literal[]):collections.Set<string>{
    	var objset : collections.Set<string> = new collections.Set<string>(function(a){return a});
    	lits.forEach((lit) => {
    		if(lit.args[0]){
    			objset.add(lit.args[0]);
    		}
    		if(lit.args[1]){
    			objset.add(lit.args[1]);
    		}
    	});
    	return objset;
    }
    
    function uniqeObjects(objs:string[]):string[]{
    	var objset : collections.Set<string> = new collections.Set<string>(function(a){return a});
    	objs.forEach((obj) =>
    		objset.add(obj)
    	);
    	return objset.toArray();
    }
    
    function append<T>(a : T [],b :T []):T[]{
    	for(var i = 0; i < b.length; i++){
    		a.push(b[i]);
    	}
    	return a;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
}

