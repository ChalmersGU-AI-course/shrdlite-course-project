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
	    if(intprt.intp.length > 0)
            	interpretations.push(intprt);
        });
        if (interpretations.length == 1) {
            return interpretations;
        }
	else if (interpretations.length > 1) {
	    console.log(interpretationToString(interpretations[0]));
	    console.log(interpretationToString(interpretations[1]));
	    throw new Interpreter.Error("Ambigous interpretation");
	} 
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

	var intprt : Literal[][] = [];
	if(cmd.cmd === "take") {
	    var entities : string[][] = interpretEntity(cmd.ent, state);
	    entities.forEach( (entList) => {
		//We can only hold 1 object, and we cannot hold the floor
		if(entList[0] === "floor") throw new Error("I cannot pickup the floor");
		if(entList.length == 1)
		    intprt.push([{pol: true, rel: "holding", args : entList}]);
	    });
	}
	else if(cmd.cmd === "move") {
	    var entity : string[][] = interpretEntity(cmd.ent, state);
	    var locati : string[] = interpretLocation(cmd.loc, state);
	    var x = Array.prototype.concat.apply([], entity);
            var tmp = [];

	    for(var i = 0; i < x.length; i++) {
		for(var j = 0; j < locati.length; j++) {
		    tmp.push([x[i],locati[j]]);
		}
	    }
	    tmp.forEach( (elem) => {
		if(elem[0] === "floor") throw new Error("I cannot pickup the floor");
		intprt.push([{pol: true, rel: cmd.loc.rel, args: elem}]);
	    });
	}
	// We assume the arm is already holding something
	else if(cmd.cmd === "put") {
	    var locati : string[] = interpretLocation(cmd.loc, state);
	    if (state.holding) {
		locati.forEach( (locElem) => {
   	            intprt.push([{pol: true, rel: cmd.loc.rel, args: [state.holding, locElem]}]);
		});
	    }
	    else throw new Error("Cannot put something I am not holding anything");
	}
        return intprt;
    }

    // uses same principle as Literal[][] but with string[][], is there a better way to do it ?
    function interpretEntity(ent : Parser.Entity, state : WorldState) : string[][] {
	var objs : string[] = interpretObject(ent.obj, state);
	var intprt : string[][] = [];

	// [[P],[Q]] => P OR Q
	if(ent.quant === "any")	{
		objs.forEach((elem) => {
		    intprt.push([elem]);

		});
	}
	// there should only be one object for 'the' interpretation to be valid
	else if(ent.quant === "the" && objs.length == 1) {
		intprt.push([objs[0]]);
	}
	// [[P, Q]] => P AND Q
	// since this is optional, ignore it for now
	else if(ent.quant == "all") {
		throw new Error("Not Implemented Yet: all quantifier");
	}
	return intprt;
    }

    /*
	assuming we only get the structures {obj, loc} or {size?, color?, form}
	from parameter obj.(This should be the case according to the website) 
    */
    function interpretObject(obj : Parser.Object, state : WorldState) : string[] {
	
	if(obj.obj && obj.loc) {
		return interpretComplexObject(obj, state);
	}
	else {
		return interpretSimpleObject(obj, state);
	}

    }

    function interpretLocation(loc : Parser.Location, state : WorldState) : string[] {
	var intprt : string[] = [];
	var entity : string[][] = interpretEntity(loc.ent, state);

	if(loc.rel === "leftof") {
	    // check if leftof is a valid location
	    entity.forEach((list) => {
		if(list.length != 1) throw new Error ("Assert failed: inner list of entity should only have 1 element");
		else if(checkLeftof(list[0], state)){
		    intprt.push(list[0]);
		}		
	    });
	}
	else if(loc.rel === "rightof") {
	    // check if rightof is a valid location
	    entity.forEach((list) => {

		if(list.length != 1) throw new Error ("Assert failed: inner list of entity should only have 1 element");
		else if(checkRightof(list[0], state)){
		    intprt.push(list[0]);
		}
	    });
	}
	else if(loc.rel === "inside") {
	    entity.forEach( (list) => {
		if(list.length != 1) throw new Error ("Assert failed: inner list of entity should only have 1 element");
		else if(checkInside(list[0], state)){
		    intprt.push(list[0]);
		}
	    });
	}
	else if(loc.rel === "ontop") {
	    entity.forEach( (list) => {
		if(list.length != 1) throw new Error ("Assert failed: inner list of entity should only have 1 element");
		else if(checkOntop(list[0], state)){
		    intprt.push(list[0]);
		}
	    });
	}
	else if(loc.rel === "under") {
	    entity.forEach( (list) => {
		if(list.length != 1) throw new Error ("Assert failed: inner list of entity should only have 1 element");
		else if(checkUnder(list[0], state)){
		    intprt.push(list[0]);
		}
	    });
	}
	else if(loc.rel === "beside") {
	    // check if beside is a valid location
	    entity.forEach( (list) => {
		if(list.length != 1) throw new Error ("Assert failed: inner list of entity should only have 1 element");
		else if(checkBeside(list[0], state)){
		    intprt.push(list[0]);
		}
	    });
	}
	else if(loc.rel === "above") {
	    // check if above is a valid location
	    entity.forEach( (list) => {
		if(list.length != 1) throw new Error ("Assert failed: inner list of entity should only have 1 element");
		else if(checkAbove(list[0], state)){
		    intprt.push(list[0]);
		}
	    });
	}
	return intprt;
    }

    // obj = {size?, color?, form}
    // returns all matching objects from the stack
    // could probably be optimized
    // todo: may need more cases for hasForm = false.
    function interpretSimpleObject(obj : Parser.Object, state : WorldState) : string[] {
	var valid : string[] = [];
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
	
	// do we really need to check the whole state if the given object is floor?
	// maybe we should just 'return valid;' here.
	if(obj.form === "floor") {
	    valid.push("floor");
	    return valid;
	}
	
	// if the form is of any form we dont check if the form match
	// otherwise we do check if the form matc	h
	if(obj.form === "anyform") {
		// if size an color are given we use them
		if(obj.size && obj.color) {
		    objs.forEach((o) => {
			if(checkSize(obj, state.objects[o]) && 
			   checkColor(obj, state.objects[o])) {
			    valid.push(o);
			}
		    });
		}
		// if only size is given we only use size
		else if(obj.size) {
		    objs.forEach((o) => {
			if(checkSize(obj, state.objects[o])) {
			    valid.push(o);
			}
		    });
		}
		// same with color
		else if(obj.color) {
		    objs.forEach((o) => {
			if(checkColor(obj, state.objects[o])) {
			    valid.push(o);
			}
		    });
		}
		// otherwise we only use the form
		else {
		    objs.forEach((o) => {
			valid.push(o);
		    });
		}
	}
	else {
		// if size an color are given we use them
		if(obj.size && obj.color) {
		    objs.forEach((o) => {
			if(checkSize(obj, state.objects[o]) && 
			   checkColor(obj, state.objects[o]) &&
			   checkForm(obj, state.objects[o])) {
			    valid.push(o);
			}
		    });
		}
		// if only size is given we only use size
		else if(obj.size) {
		    objs.forEach((o) => {
			if(checkSize(obj, state.objects[o]) &&
			   checkForm(obj, state.objects[o])) {
			    valid.push(o);
			}
		    });
		}
		// same with color
		else if(obj.color) {
		    objs.forEach((o) => {
			if(checkColor(obj, state.objects[o]) &&
			   checkForm(obj, state.objects[o])) {
			    valid.push(o);
			}
		    });
		}
		// otherwise we only use the form
		else {
		    objs.forEach((o) => {
			if(checkForm(obj, state.objects[o])) {
			    valid.push(o);
			}
		    });
		}
	}
	
	return valid;
    }
	
    // obj =  {obj , loc}
    // TODO: this is where I stopped last time, quite a mess.
    function interpretComplexObject(obj : Parser.Object, state : WorldState) : string[] {
	var immObjs : string[] = interpretObject(obj.obj, state);
	var posObjs : string[] = interpretLocation(obj.loc, state);
	var intprt : string[] = [];

	// posObjs should give us a list of all object where the location is possible 
	// now we should check with immObjs and see if they match up in the state.stacks
	if(obj.loc.rel === "leftof") {
	    immObjs.forEach((o) => {
    	        posObjs.forEach((e) => {
	            if(isLeftof(o, e, state))
		        intprt.push(o);
	        });
	    });
	}
	else if(obj.loc.rel === "rightof") {
	    immObjs.forEach((o) => {
    	        posObjs.forEach((e) => {
	            if(isRightof(o, e, state))
		        intprt.push(o);
	        });
	    });
	}
	else if(obj.loc.rel === "inside") {
	    immObjs.forEach((o) => {
    	        posObjs.forEach((e) => {
	            if(isInside(o, e, state))
		        intprt.push(o);
	        });
	    });
	}
	else if(obj.loc.rel === "ontop") {
	    immObjs.forEach((o) => {
    	        posObjs.forEach((e) => {

	            if(isOntop(o, e, state))
		        intprt.push(o);
	        });	
	    });
	}
	else if(obj.loc.rel === "under") {
	    immObjs.forEach((o) => {
    	        posObjs.forEach((e) => {
	            if(isUnder(o, e, state))
		        intprt.push(o);
	        });	
	    });
	}
	else if(obj.loc.rel === "beside") {
	    immObjs.forEach((o) => {
    	        posObjs.forEach((e) => {
	            if(isBeside(o, e, state))
		        intprt.push(o);
	        });	
	     });
	}
	else if(obj.loc.rel === "above") {
		
	    immObjs.forEach((o) => {
    	        posObjs.forEach((e) => {
	            if(isAbove(o, e, state))
		        intprt.push(o);
	        });	
	    });
	}

	return intprt;
    }

    function checkColor(a : Parser.Object, b : ObjectDefinition) : boolean {
	if(a.color === b.color) return true;
	else return false;
    }

    function checkSize(a : Parser.Object, b : ObjectDefinition) : boolean {
	if(a.size === b.size) return true;
	else return false;
    }

    function checkForm(a : Parser.Object, b : ObjectDefinition) : boolean {
	if(a.form === b.form) return true;
	else return false;
    }

    function checkLeftof(obj : string, state : WorldState) : boolean {
	var flag : boolean = false;
	state.stacks.forEach((stack) => {
	    if(stack.indexOf(obj) >= 0 && state.stacks.indexOf(stack) < state.stacks.length-1) {
		flag = true;
	    }
	});
	return flag;
    }

    function checkRightof(obj : string, state : WorldState) : boolean {
	var flag : boolean = false;
	state.stacks.forEach((stack) => {
	    if(stack.indexOf(obj) >= 0 && state.stacks.indexOf(stack) >= 0) {
		flag = true;
	    }
	});
	return flag;
    }

    function checkInside(obj : string, state : WorldState) : boolean {
	if(state.objects[obj].form === "box") return true;
	else return false;
    }

    function checkOntop(obj : string, state : WorldState) : boolean {
	if(obj === "floor") return true;
	else if(state.objects[obj].form === "box" || state.objects[obj].form === "ball") return false;
	else return true;
    }

    function checkUnder(obj : string, state : WorldState) : boolean {
	if(obj === "floor") return false;
	else return true;
    }

    function checkBeside(obj : string, state : WorldState) : boolean {
	var flag : boolean = false;	
	state.stacks.forEach((stack) => {
	     if(stack.indexOf(obj) >= 0 && state.stacks.indexOf(stack)+1 <= state.stacks.length && state.stacks.indexOf(stack)-1 >= 0 ) {
		flag = true;
	     }
	});
	return flag;
    }

    function checkAbove(obj : string, state : WorldState) : boolean {
	if(obj === "ball") return false;
	else return true;
    }

    function isLeftof(a : string, b : string, state : WorldState) : boolean {
	var stackIndex : number;
	var flag : boolean = false;
	state.stacks.forEach( (stack) => {
	    if(stack.indexOf(b) >= 0)
		stackIndex = state.stacks.indexOf(stack);
	});

	for(var i = 0; i < stackIndex; i++) {
	    if(state.stacks[i].indexOf(a) >= 0)
		flag = true;
	}
	return flag;
    }

    function isRightof(a : string, b : string, state : WorldState) : boolean {
	var stackIndex : number;
	var flag : boolean = false;

	state.stacks.forEach( (stack) => {
	    if(stack.indexOf(b) >= 0)
		stackIndex = state.stacks.indexOf(stack);
	});
	for(var i = stackIndex+1; i < state.stacks.length; i++) {
	    if(state.stacks[i].indexOf(a) >= 0)
		flag = true;
	}
	return flag;
    }

    function isInside(a : string, b : string, state : WorldState) : boolean {
	var flag : boolean = false;	
	state.stacks.forEach( (stack) => {
	    if(stack.indexOf(b) >= 0 && stack.indexOf(a) >= 0 &&
		stack.indexOf(a) > stack.indexOf(b) && stack.indexOf(a) - stack.indexOf(b) == 1)
		flag = true;
	});
	return flag;
    }

    function isOntop(a : string, b : string, state : WorldState) : boolean {

	var flag : boolean = false;
	state.stacks.forEach( (stack) => {
	    if(b === "floor" && stack.indexOf(a) == 0) flag = true;
	    else if(stack.indexOf(a) >= 0 && stack.indexOf(b) >= 0 && stack.indexOf(a) - stack.indexOf(b) == 1) flag = true;

	});

	return flag;
    }

    function isUnder(a : string, b : string, state : WorldState) : boolean {
	var flag : boolean = false;
	state.stacks.forEach( (stack) => {
	    if(stack.indexOf(b) >= 0 && stack.indexOf(a) >= 0 && stack.indexOf(a) < stack.indexOf(b))
		flag = true;
	});
	return flag;
    }

    function isBeside(a : string, b : string, state : WorldState) : boolean {
	var stackIndex : number;	

	state.stacks.forEach((stack) => {
	    if(stack.indexOf(b) >= 0)
		stackIndex = state.stacks.indexOf(stack);
	});

	if(state.stacks[stackIndex+1].indexOf(a) >= 0)
	    return true;
	if(state.stacks[stackIndex-1].indexOf(a) >= 0)
	    return true;
	return false;
    }

    function isAbove(a : string, b : string, state : WorldState) : boolean {
	var flag : boolean = false;
	state.stacks.forEach( (stack) => {
	    if(stack.indexOf(b) >= 0 && stack.indexOf(a) >= 0 && stack.indexOf(a) > stack.indexOf(b))
		flag = true;
	});
	return flag;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

