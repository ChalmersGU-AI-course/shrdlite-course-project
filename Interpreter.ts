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
        
        var objs : Literal [][] = identifyEnt(cmd.ent, null, null, state);
        if(!objs.length){
        	return [];
        }
        
        // Find location to move to
        var intprt : Literal[][] = [];
        var loc : Literal [][] = [];
        var n : number = 0; 
        if(cmd.cmd == "move" || cmd.cmd == "put" || cmd.cmd == "drop"){
        	var temp : Literal [][] = [];
        	for(var i = 0; i < objs.length; i++){
        		var lstlits : string[] = findendliterals(objs[i]);
        		var tint : Literal[][] = [];
        		for(var l = 0; l < lstlits.length; l++){
        			if(cmd.ent.quant == "all"){
        				n = 0;
        			}
        			var ob = state.objects[lstlits[l]];
        			var object : Parser.Object = {obj: {obj:null, loc :null,size:ob.size, color: ob.color, form:ob.form}, 
        						loc : cmd.loc , size:ob.size, color: ob.color, form:ob.form};
        			var tempent : Parser.Entity = {quant:"any", obj: object};
        			temp = identifyEnt(tempent, null, lstlits[l], state);
        		//	tint = append(tint, temp);
        			if(cmd.ent.quant == "all"){
        				tint = merge(tint, temp);
        			}else{
        				tint = append(tint, temp);
        			}
	        	/*	for(var j = 0; j < temp.length; j++){
	        			var temp2 : Literal[]= clearIlligal(clone<Literal[]>(objs[i]), state);
	        			
	        			for(var k = 0; k < temp[j].length; k++){
	        				if(checkIllegal(temp[j][k], state)){
		        				intprt[n] = append(intprt[n], temp2);
		        				intprt[n].push(temp[j][k]);
		        				n++;
	        				}
	        			}
	        		}*/
        		}
        		var test = combineLiterals([],tint, objs[i], 0, 0, 0);
    			for(var m = 0; m < test.length; m++){
    				test[m] = clearIlligal(clone<Literal[]>(test[m]), state);
    			}
    			intprt = append(intprt,test);
        		
        	}
        }
        
        else if(cmd.cmd == "take"){
        	intprt[0] =[{pol:true, rel:cmd.cmd, args : findendliterals(objs[0])}];
        }

        return intprt;
    }
    
    function combineLiterals(litss : Literal[][], loclitss : Literal[][]
    			, objlits : Literal[], k : number, k2 :number , k3 : number):Literal[][]{
    	// 1 x 5  = 5 
    	if(k == Math.pow(loclitss.length,  objlits.length)){
    		return litss;
    	}
    //	for(var i = 0; i < objlits.length; i++){
    		
			litss[k] = append(litss[k], objlits);
			litss[k] = append(litss[k], [loclitss[ (k2) % loclitss.length][0]]);
			litss[k] = append(litss[k], [loclitss[ (k3) % loclitss.length][1]]);
			if(k3 == loclitss.length-1){
    			k3 = 0;
    			k2 ++;
    		}else{
    			k3++;
    		}
    		
			return combineLiterals(litss, loclitss, objlits, k+1, k2 ,k3);
			
  //  	}
    }
    
    function clearIlligal(lits : Literal[], state): Literal[]{
    	var cleared : Literal[] = [];
    	for(var i = 0; i < lits.length;i++){
    		if(checkIllegal(lits[i], state)){
    			cleared.push(lits[i]);
    		}
    	}
    	return cleared;
    }
    
    function findendliterals(lits : Literal []): string[]{
    	var temp : Literal [] = [];
    	var end : string[] = [];
    	var found : boolean = true;
    	for(var i = 0; i < lits.length; i++){
    		var lit : Literal = lits[i];
    		found = true;
    		for(var j = 0; j < lits.length; j++){
    			var lit2 : Literal = lits[j];
    			if(lit2.args[0] == lit.args[1]){
    				found = false;
    			}
    		}
    		if(found){
    			end.push(lit.args[lit.args.length-1]);
    		}
    	}
    	return end;
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
        	var result : Literal[][] = identifyEnt(loc.ent, null, null,state);
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
    
    
    
    function identifyEnt(ent : Parser.Entity, rel : string , obj : string ,state : WorldState):Literal[][]{
    	var result : string[];
    	if(obj == null && ent.obj){
	    	if(ent.obj.loc && ent.obj.obj){
	    		result = identifyObj(ent.obj.obj.form, ent.obj.obj.color, ent.obj.obj.size, state);
	    	}else{
	    		result = identifyObj(ent.obj.form, ent.obj.color, ent.obj.size, state);
	    	}
    	}else{
    		result = [obj];
    	}
    	 
    	var unqObjs : string[] = uniqeObjects(result);
    	var results : Literal[][] = [];
    	if(ent.obj.loc){

    		var locres : Literal [][]= identifyLocation(ent.obj.loc, state);
    		for(var i = 0; i < locres.length; i ++){
    			//if()
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
    	var n : number = 0; 
		for(var i = 0; i < result.length; i++){
			var lit : Literal;
			if(ent.obj.loc){
				for(var j = 0 ; j < results.length ;j++){
					for(var k = 0 ; k < results[j].length ;k++){
						lit = {pol : true, rel : ent.obj.loc.rel, args : [result[i], results[j][k].args[0]]};
						if(checkIllegal(lit, state)){
							if(!intrpt[n]){ 	// used j before
								intrpt[n] = []; 
							}
							if(checkIllegal(results[j][k], state)){
								intrpt[n].push(results[j][k]);
							}
							intrpt[n].push(lit);
							n++;
						}
					}
				}
			}else{
				if(ent.quant != "all"){
					n = i;
				}
				lit = {pol : true, rel : rel, args : [result[i]]};
				if(!intrpt[n]){
					intrpt[n] = [];
				}
				intrpt[n].push(lit);
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
    
    function merge(a : Literal [][],b :Literal [][]):Literal[][]{
    	if(!a){
    		a = [];
    	}
    	for(var i = 0; i < b.length; i++){
    		a[i] = append(a[i], b[i]);
    	}
    	return a;
    }
    
    function append<T>(a : T [],b :T []):T[]{
    	if(!a){
    		a = [];
    	}
    	for(var i = 0; i < b.length; i++){
    		a.push(b[i]);
    	}
    	return a;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    
	function clone<T>(obj: T): T {
        if (obj != null && typeof obj == "object") {
            var result : T = obj.constructor();
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result[key] = clone(obj[key]);
                }
            }
            return result;
        } else {
            return obj;
        }
    }
}

