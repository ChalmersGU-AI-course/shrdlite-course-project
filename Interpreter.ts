///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types
	var clairifyingparse :Parser.ResultAnswer[];
    export function interpret(parses : Parser.Result[], clairifyparse:Parser.ResultAnswer[] , 
    		currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
        clairifyingparse = clairifyparse;
        parses.forEach((parseresult) => {
            var intprt : Result = <Result>parseresult;
        	if(intprt.prs.cmd){
    			intprt.intp = interpretCommand(intprt.prs, currentState);
			}else{
				throw new Interpreter.ErrorInput("This is a statement. \"" + 
					intprt.input +"\" . Please tell me a command.");
			}
			if(intprt.intp.length){
            	interpretations.push(intprt);
            }
        });
        if (interpretations.length) {
        	interpretations = filterEquality(interpretations);
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
        			var object : Parser.Object = {obj: {
        						obj:null, loc :null,size:ob.size, color: ob.color, form:ob.form}, 
        						loc : cmd.loc , size:ob.size, color: ob.color, form:ob.form};
        			var tempent : Parser.Entity = {quant:"any", obj: object};
        			temp = identifyEnt(tempent, null, lstlits[l], state);
        		//	tint = append(tint, temp);
        			if(cmd.ent.quant == "all" || cmd.loc.ent.quant == "all"){
        				tint = merge(tint, temp);
        			}else{
        				tint = append(tint, temp);
        			}
        		}
        		var ks : number[] = [0];
        		var maxL = objs[i].length;
        		if(tint[0]){
        			if(tint[0].length > objs[i].length){
        				maxL = tint[0].length;
        			}
        		}
        		
        		for(var j = 0; j < maxL; j++){
        			ks.push(0);
        		}
        		var test = combineLiterals([],tint, objs[i], ks, cmd.loc.rel, state);
        		var clearedlits : Literal[][]= [];
    			for(var m = 0; m < test.length; m++){
    				var lits = clearIlligal(clone<Literal[]>(test[m]), state);
    				if(lits.length > 0){
    					clearedlits.push(lits); 
    				}
    				
    			}
    			if(cmd.loc.ent.quant == "all"){
    				if(intprt.length == 0){
    					intprt = merge(intprt,clearedlits);
    				}else{
    					var tempintprt = combine(intprt,clearedlits, state); // combine instead
    					var k = 0;
    					for(var j = 0; j < tempintprt.length; j++){
    						var clrdintprt : Literal[] =clearIlligal(tempintprt[j],state)
    						if(clrdintprt.length != 0){
    							intprt[k]= clrdintprt;
    							k++;
    						}
    					}
    				}
    			}else{
    				intprt = append(intprt,clearedlits);
    			}
           	}	
        }
        
        else if(cmd.cmd == "take"){
        	for(var i = 0; i < objs.length; i++){
        		for(var j = 0; j < objs[i].length; j++){
        			objs[i][j].rel = "hold";
        		}
        		intprt.push(objs[i]);
        	}
        //	intprt[0] =[{pol:true, rel:cmd.cmd, args : findendliterals(objs[0])}];
        }

        return intprt;
    }
    
    function identifyEnt(ent : Parser.Entity, rel : string , 
    		obj : string ,state : WorldState):Literal[][]{
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
    	var locresults : Literal[][] = [];
    	if(ent.obj.loc){

    		var locres : Literal [][]= identifyLocation(ent.obj.loc, state);
    		for(var i = 0; i < locres.length; i ++){
    			if(!locresults[i]){
    				locresults[i] = [];
    			}
				locresults[i] = append<Literal>(locresults[i], locres[i]);
			}
    	}
    	
    	if(ent.quant == "the" && ent.obj.form != "floor"){
    		// ambigous interpet, use clairifying parse
    		if(unqObjs.length > 1){
				if(!clairifyingparse){
					throw new Interpreter.ErrorInput("Could you tell me which " + 
						state.objects[result[0]].form + " I should move?");
				}
				var objs : string[]= solveAmbiguity(ent.obj,unqObjs, state);
				if(objs.length > 1){
					throw new Interpreter.ErrorInput("Could you tell me which " + 
						state.objects[result[0]].form + " I should move?");
				}
				result = objs;
    		}
    		
    	} else
    	if(ent.quant == "all"){
    		var totalUnqObjs = findAllObjsWith(ent.obj.form, ent.obj.color, 
    			ent.obj.size, state);
    		if(unqObjs.length != totalUnqObjs.length){
    			if(!clairifyingparse){
					throw new Interpreter.ErrorInput("Could you tell me which " + 
						state.objects[result[0]].form + " I should move?");
				}
				var objs : string[] = solveAmbiguity(ent.obj,unqObjs, state);
				if(objs.length > 1){
					throw new Interpreter.ErrorInput("Could you tell me which " + 
						state.objects[result[0]].form + " I should move?");
				}
				result = objs;
    		}

    	} else
    	if (ent.quant == "any" || ent.obj.form == "floor"){ // any
   			;// TODO
    	}
    	// Find location to move to
        var intprt : Literal[][] = [];
        var n : number = 0; 
    	var temp : Literal [][] = [];
        
    	// combine with possible locations
    	
    	var intrpt : Literal[][] = [];
    	var n : number = 0; 
		for(var i = 0; i < result.length; i++){
			var lit : Literal;
			if(ent.obj.loc){
				for(var j = 0 ; j < locresults.length ;j++){
					for(var k = 0 ; k < locresults[j].length ;k++){
						// create new literal
						lit = {pol : true, rel : ent.obj.loc.rel, args : [result[i], 
								locresults[j][k].args[0]]};
						if(checkIllegal(lit, state)){
							if(!intrpt[n]){ 	// used j before
								intrpt[n] = []; 
							}
							if(checkIllegal(locresults[j][k], state)){
								intrpt[n].push(locresults[j][k]);
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
    
    function identifyObj(form :string, color :string, size :string, state : WorldState):string[]{
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
	        	if(a.form == "floor" && form == "anyform"){
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
    
    //////////////////////////////////////////////////////////////////////
    // util functions
    
    function combine(loclitss : Literal[][], objlitss : Literal[][], 
    		state: WorldState):Literal[][]{
    	var result : Literal[][]= [];	
    	
    	for(var i = 0; i < objlitss.length; i ++){
    		var ks : number[] = [0];
			var maxL = objlitss[i].length;
			if(loclitss[0]){
				if(loclitss[0].length > objlitss[i].length){
					maxL = loclitss[0].length;
				}
			}
			
			for(var jj = 0; jj < maxL; jj++){
				ks.push(0);
			}
    		append(result,combineLiterals([], loclitss, objlitss[i], ks, "", state));
    	}		
    	
    	return result;
    }
    
    function combineLiterals(litss : Literal[][], loclitss : Literal[][]
    			, objlits : Literal[], ks : number[], rel : string, 
    			state : WorldState):Literal[][]{
    	var k = ks[0];
    	if(k == Math.pow(loclitss.length,  objlits.length)){
    		return litss;
    	}
		if(!checkequal(ks,rel)){
			litss[k] = append(litss[k], objlits);
			var j = 0;
			for(var i = 1; i < ks.length; i ++){
				litss[k] = append(litss[k], [loclitss[ks[i]%loclitss.length][j]]);
				j++;
			}
		}
		var inced = false;
		for(var i = ks.length-1; i > 0 ; i--){
			if(ks[i]== loclitss.length-1){
				ks[i] = 0;
				if(i > 1){
					ks[i-1] = ks[i-1] +1;
				}
			}else if(i == ks.length-1){
				ks[i] = ks[i] +1;
			}
		}
			
		ks[0] = k+1;
		return combineLiterals(litss, loclitss, objlits, ks, rel, state);
    }
    
    function checkequal(ks : number[], rel : string):boolean{
    	if(ks.length == 1){
    		return false;
    	}
    	for(var i = 1; i < ks.length; i++){
    		for(var j = i+1; j < ks.length ; j++){
    			if(ks[i]==ks[j] && i != j && (rel == "ontop" || rel == "inside")){
    				return true;
    			}
    		}
    	}
    	return false;
    }
    
    function checkillegalcombi(lits : Literal[]):boolean{
    	for(var i = 0; i < lits.length; i ++){
    		var templit = lits[i];
    		for(var j = 0; j < lits.length; j++){
	    		var templit2 = lits[j];
	    		if(templit2.rel == templit.rel && i != j){
	    			if((templit2.rel == "ontop" || templit2.rel == "inside") && 
	    					(templit2.args[0] == templit.args[0] || 
	    					 templit2.args[1] == templit.args[1] ||
	    					 templit2.args[0] == templit.args[1] ||
	    					 templit2.args[1] == templit.args[0])){
	    				return true;
	    			}
	    		}
    		}
    	}
    	
    	return false;
    }
    
    function filterEquality(intrps : Result []):Result []{
    	//TODO
    	return intrps;
    }
    
    function clearIlligal(lits : Literal[], state): Literal[]{
    	var cleared : Literal[] = [];
    	if(!lits){
    		return cleared;
    	}
    	for(var i = 0; i < lits.length;i++){
    		if(checkIllegal(lits[i], state)){
    			cleared.push(lits[i]);
    		}
    	}
    	
    	if(!checkillegalcombi(lits)){
    		return cleared;
    	}else{
    		return [];
    	}
    }
    
    
    function checkQuantifyer(lits : Literal[], ent : Parser.Entity, 
    		loc : Parser.Location, state : WorldState):boolean{
    	if(ent.quant == "the"){
    		if(lits.length > 1){
    			return false;
    		}
    	}else if(ent.quant == "all" && loc.ent.quant != "all" ||
    				ent.quant != "all" && loc.ent.quant == "all"){
    		var totalUnqObjs = findAllObjsWith(ent.obj.form, ent.obj.color, ent.obj.size, state);
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
    	if(lit.rel == "inside" && ((a.form == "pyramid" || a.form == "plank" || 
    			a.form == "floor" || a.form == "box")&&
    			(a.size == b.size || (a.size == "large" && b.size == "small")))){
    		return false;
    	}
    	if((lit.rel == "ontop" || lit.rel == "above" || lit.rel == "inside") && 
    			((a.size == "large" && b.size == "small")|| a.form == "floor")){
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
    
    function solveAmbiguity(obj : Parser.Object, objs : string[], state : WorldState):string[]{
    	var parseresult = clairifyingparse[clairifyingparse.length-1].prs.obj;
    	if(parseresult.form){
    		if(obj.form && obj.form != parseresult.form){
    			throw new Interpreter.ErrorInput("Are we talking in terms of " + obj.form + 
    				" or " + parseresult.form +"? I would say " + obj.form + ".");
    		}
    		obj.form = parseresult.form;
    	}
    	if(parseresult.color){
    		if(obj.color && obj.color != parseresult.color){
    			throw new Interpreter.ErrorInput("You have already told me that the " + 
    				obj.form + " is " + obj.color +".");
    		}
    		obj.color = parseresult.color;
    	}
    	if(parseresult.size){
    		if(obj.size && obj.size != parseresult.size){
    			throw new Interpreter.ErrorInput("You have already told me that the " + 
    				obj.form + " is " + obj.size+".");
    		}
    		obj.size = parseresult.size;
    	}
    	
    	objs = identifyObj(obj.form, obj.color, obj.size, state);
    	return objs;
    }
    
       
        
    function findAllObjsWith(form : string, color : string, size : string, state : WorldState):string[]{
    	var objs = identifyObj(form, color, size, state);
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

