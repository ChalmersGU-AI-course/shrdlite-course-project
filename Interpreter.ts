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
            if(intprt.intp.length>0){
                interpretations.push(intprt);
            }
        });
        if (interpretations.length) {
            if(interpretations.length>1){
                throw new Interpreter.Error("Found ambiguous interpretations");
            }
            return interpretations;
        } else {
            throw new Interpreter.Error("Found no interpretation");
        }
    }


    export interface Result extends Parser.Result {intp:Literal[][];}
    export interface Literal {pol:boolean; rel:string; args:string[];}
    interface Sayings {rel:string; objs:string[][]};
    interface objLocPair {obj:string; loc:string};

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
        console.log(":::::::::::::New Interpretation:::::::::::::");
        var lit : Literal[][] = [];
        if(cmd.cmd === "move" || cmd.cmd === "put"){
            var objs : string[][];
            if(cmd.cmd === "put"){
                if(state.holding === null){
                    return lit;
                    //TODO: Throw error?
                }
                objs = [[state.holding]];
            } else{
                objs = interpretEntity(cmd.ent, state);
            }
            var locs : Sayings = interpretLocation(cmd.loc, state);
            var physics : objLocPair[][] = buildRules(true, objs, locs, state);
            
            //objs = physics.keys;
            physics.forEach(or => {
                var andList : Literal[] = [];
                or.forEach(and => {
                    var order : Literal = {pol: true, rel : locs.rel, args : [and.obj,and.loc]};
                    andList.push(order);
                    return true;
                });
                if(andList.length>0){
                    lit.push(andList);
                }
                return true;
            });
            //Only place we know which object to put where
           
            return lit;
        } else {
            var objs : string[][] = interpretEntity(cmd.ent, state);
            objs.forEach(objList => {   // obj or 
                var andList : Literal[] = [];
                objList.forEach(obj => {    //obj and
                    var order : Literal = {pol: true, rel : "holding", args : [obj]};
                    andList.push(order);
                    return true;
                });
                if(andList.length>0){
                    lit.push(andList);
                }
                return true;
            });
            return lit;
        }
    }

    function interpretEntity(ent : Parser.Entity, state : WorldState) : string[][] {
        var objs : string[][] = interpretObject(ent.obj, state);
        if(ent.quant === "the"){
            if(objs.length>1){
                console.log("problems. 'the' entity..."+objs.length)
                return objs;
            } else{
                return objs;
            }
        }
        if(ent.quant === "any"){
            return objs;
        }
        if(ent.quant === "all"){
            var newObjs : string[][] = [];
            var l : string[] = [];
            objs.forEach(o1 => {
                o1.forEach(o2 => {
                    l.push(o2);
                    return true;
                    });
                return true;
            });
            newObjs.push(l);
            return newObjs;
        }
        //TODO Throw error
        return objs;
    }

    function interpretObject(obj : Parser.Object, state : WorldState) : string[][] {
        if(obj.obj != null){
            var objs : string[][] = interpretObject(obj.obj, state);
            
            var locs : Sayings = interpretLocation(obj.loc, state);
            var physics : objLocPair[][] = buildRules(false, objs, locs, state);

            objs = [];
            physics.forEach(l => {
                var r : string[] = [];
                l.forEach(p => {
                    r.push(p.obj);
                    return true;
                });
                objs.push(r);
                return true;
            });
                //e = physics.keys;
            return objs;
        }else{
            var objsindexes : string[] = Array.prototype.concat.apply([], state.stacks);
            if(obj.form === "floor"){
                return [["floor"]];
            }
            if(obj.size !== null ){
                objsindexes = objsindexes.filter(e=> state.objects[e].size === obj.size);
            }
            if(obj.color !== null){
                objsindexes = objsindexes.filter(e=> state.objects[e].color === obj.color);
            }
            if(obj.form !== "anyform"){
                objsindexes = objsindexes.filter(e=> state.objects[e].form === obj.form);
            } else if (obj.size === null && obj.color === null) {
                objsindexes.push("floor");
            }
            var newObjs : string[][] = [];
            objsindexes.forEach(o => {
                var l : string[] = [];
                l.push(o);
                newObjs.push(l);
            });
            return newObjs;
        }
    }

    function interpretLocation(loc : Parser.Location, state : WorldState) : Sayings {
        var locs : Sayings = {rel:loc.rel, objs:interpretEntity(loc.ent, state)}
        return locs;
    }
   	
    function buildRules(futureState: boolean, objs : string[][], locs : Sayings, state : WorldState) : objLocPair[][] {
        var grid : objLocPair[][] = [];
        var newObjs : string[][] = [];
        var newLocs : string[][] = [];
        objs.forEach(and => {
        	var perms : string[][] = permute(and, [],[]); 	
        	perms.forEach(r => newObjs.push(r));
        	return true;
        });
        objs = newObjs;
        locs.objs.forEach(and => {
        	var perms : string[][] = permute(and, [],[]); 	
        	perms.forEach(r => newLocs.push(r));
        	return true;
        });
        locs.objs = newLocs;
        objs.forEach(objList => { //or obj
            locs.objs.forEach(locList => {  //or locs
            	console.log(" locs " +locList.length + " objs " +objList.length);
                var row : objLocPair[] = [];
                objList.forEach(obj => { //and obj 
                    locList.forEach(loc => {    //and locs
                        if(validatePhysics(futureState, obj,loc,locs.rel, state)){
                            if(row.every(p => p.obj !== obj &&(loc === "floor" || p.loc !== loc))) {
                                row.push({"obj":obj, "loc":loc});
                            }
                        }   
                        return true;
                    });
                    return true;
                });
	            if(row.length>0 && row.length === locList.length*objList.length ){
	                var contains : boolean = grid.some(r => { var b : boolean =  row.every(p => 
	                	((locs.rel==="below" && p.obj === "floor")|| r.some(o => o.obj === p.obj)) &&
	                	((locs.rel!=="below" && p.loc === "floor")|| r.some(o => o.loc === p.loc))); console.log("lower: "+b);return b;})
	                if(!contains){
	                	grid.push(row);
	                }
	            }
                return true;
            });
            return true;
        });
        


        return grid;
    }

    function validatePhysics(futureState: boolean, obj : string, loc : string, rel : string, state : WorldState) : boolean{
        var works : boolean  = false;
        if(loc !== obj) {
            switch(rel) {
                case "ontop":
                    if(loc === "floor"){
                        return futureState || state.stacks.some(e => e.indexOf(obj) === 0);
                    } else{
                        works = futureState || state.isOnTopOf(loc ,obj);
                        works = works && formCorrectlyOnTop(loc, obj, state);
                        return works && smallOnTopOfLarge(loc, obj, state);
                    }
                    break;
                case "inside":
                    if(loc !== "floor"){
                        works = futureState || state.isOnTopOf(loc ,obj);
                        return works && formCorrectlyInside(loc, obj, state);
                    }
                    break;
                case "beside":
                    if(loc !== "floor"){
                        return futureState || Math.abs(checkHorizontalDistance(state.stacks, obj, loc)) == 1
                    }
                    break;
                case "rightof":
                    if(loc !== "floor"){
                        return futureState || checkHorizontalDistance(state.stacks, obj, loc) >= 1
                    }
                    break;
                case "leftof":
                    if(loc !== "floor"){
                        return futureState || checkHorizontalDistance(state.stacks , obj, loc) <= -1
                    }
                    break;
                case "above":
                    if(loc === "floor"){
                        return futureState || state.stacks.some(e => e.indexOf(obj) >= 0);
                    } else{
                        works = futureState || state.isAbove(loc,obj);
                        works = works && notAboveBall(loc, state);
                        return works && smallOnTopOfLarge(loc ,obj , state);
                    }
                    break;
                case "under":
                    if(loc !== "floor"){
                        if(obj === "floor") {
                            return futureState || state.stacks.some(e => e.indexOf(loc) >= 0);
                        } else{
                            works = futureState || state.isAbove(obj, loc);
                            works = works && notAboveBall(obj, state);
                            return works && smallOnTopOfLarge(obj, loc, state);
                        }
                    }
            };
        }
        return false;
    }
    
    function getindexOfObject(stacks : string[][], obj : string) : number[] {
        for(var i = 0; i<stacks.length; i++){
            var index = stacks[i].indexOf(obj);
            if(index > -1){
                return [i,index];
            }
        }
        return [-1,-1];
    }

    //Keep this or change inside and ontop to depenid on context?
    function formCorrectlyInside(locationObject : string, object : string, state : WorldState) : boolean {
        if(object === "floor"){
            return false;
        }
        //boxes cannot contain pyramids, planks, or boxes of same size
        var locForm : string = state.objects[locationObject].form;
        var locSize : string = state.objects[locationObject].size;
        var objForm : string = state.objects[object].form;
        var objSize : string = state.objects[object].size;
        if(locationObject !== "floor" && locForm === "box"){
            if(objForm === "ball"){
                return true;
            }
            if(locSize === "small"){
                return false;
            } 
            return objSize === "small";
        }
        return false;   
    }

    function formCorrectlyOnTop(locationObject : string, object : string, state : WorldState) : boolean {
        if(object === "floor"){
            return false;
        }
        if(locationObject === "floor"){
            return true;
        }
        var objForm : string = state.objects[object].form;
        var objSize : string = state.objects[object].form;
        var locForm : string = state.objects[locationObject].form;
        var locSize : string = state.objects[locationObject].form;
        if(locForm === "box"){
            return false;
        }
        if(objForm === "ball"){
            return false;
        }
        if(objForm === "box"){
        //Small boxes cannot be supported by small bricks or pyramids
        //Large boxes cannot be supported by large pyramids
            if(objSize === "small"){
                return !((locForm === "brick" || locForm === "pyramid") && locSize === "small");
            }
            return !(locForm === "pyramid");
        }
        return notAboveBall(locationObject,state);

    }

    function notAboveBall(bottomObject : string, state : WorldState) :boolean {
       return bottomObject === "floor" || state.objects[bottomObject].form !== "ball";
    }


    function smallOnTopOfLarge(bottomObject : string, topObject : string, state : WorldState) : boolean {
        if(topObject === "floor"){
            return false;
	}
        if(bottomObject === "floor") {
	    return true;
	}
        var topSize : string  = state.objects[topObject].size;
        var bottomSize : string = state.objects[bottomObject].size;
        if(bottomSize === "large") {
            return true;
        }
        return topSize === "small";
    }

    function checkHorizontalDistance(stacks: string[][], obj : string, locObj : string) : number{
        var indexLoc : number = getindexOfObject(stacks, locObj)[0];
        var indexobj : number = getindexOfObject(stacks, obj)[0];
        if(indexLoc>=0 && indexobj>=0 ){
            return indexobj - indexLoc;
        } 
        throw("if this happens... everything is broken. :(");
        return 0;
    }

	function permute(input : string[], usedChars : string[], permArr : string[][]) {
		var i : number, ch : string;
		for (i = 0; i < input.length; i++) {
	   		ch = input.splice(i, 1)[0];
	    	usedChars.push(ch);
	    	if (input.length == 0) {
	      		permArr.push(usedChars.slice());
	    	}
	    	permute(input, usedChars, permArr);
	    	input.splice(i, 0, ch);
	    	usedChars.pop();
	  	}
	  	return permArr;
	}
}

