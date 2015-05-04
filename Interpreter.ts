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
        /*var intprt : Literal[][] = [[
            {pol: true, rel: "ontop", args: [a, "floor"]},
            {pol: true, rel: "holding", args: [b]}
        ]];*/
	var intprt : Literal[][] = [];
	if(cmd.cmd === "take") {
	    //TODO
	    var entities : string[][] = interpretEntity(cmd.ent, state);
	    entities.forEach( (entList) => {
		//assuming P AND Q is not valid for the relation holding
		if(entList.length == 1)
		    intprt.push([{pol: true, rel: "holding", args : entList}]);
	    });
	}
	else if(cmd.cmd === "move") {
	    //TODO
	    var entity : string[][] = interpretEntity(cmd.ent, state);
	    var locati : string[][] = interpretLocation(cmd.loc, state);
	    
	    // this is a dummy intprt, change it
	    intprt.push([{pol: false, rel: cmd.loc.rel, args: ["floor", "floor"]}]);
	}
	// We assume the arm is already holding something
	else if(cmd.cmd === "put") {
	    var locati : string[][] = interpretLocation(cmd.loc, state);
	    if (state.holding) {
		locati.forEach( (locList) => {
		    locList.forEach( (locElem) => {
		        intprt.push([{pol: true, rel: cmd.loc.rel, args: [state.holding, locElem]}]);
		    });
		});
	    }
	    // else nonsense
	}
	console.log(intprt);
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
	else if(ent.quant == "all") {
		objs.forEach((elem) => {
			intprt[0].push(elem);
		});
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

    //TODO: test if those fancy map().reduce() call work as intended
    function interpretLocation(loc : Parser.Location, state : WorldState) : string[][] {
	var intprt : string[][] = [];
	var entity : string[][] = interpretEntity(loc.ent, state);

	if(loc.rel === "leftof") {
	    // check if leftof is a valid location
	    entity.forEach((list) => {
		// check all elements in the and-clause and reduce it to true or false.
		// if the result is false the location is not possible in our world and we ignore it.
		if (list.map((e) => { return checkLeftof(e, state);}).reduce( (a, b) => { return a && b;}) )
		    intprt.push(list);
	    });
	}
	else if(loc.rel === "rightof") {
	    // check if rightof is a valid location
	    entity.forEach((list) => {
		if(list.map((e) => {return checkRightof(e, state);}).reduce((a, b) => { return a && b; }) )
		    intprt.push(list);
	    });
	}
	else if(loc.rel === "inside") {
	    entity.forEach( (list) => {
		if(list.map((e) => {return checkInside(e, state);}).reduce((a, b) => { return a && b; }) )
		    intprt.push(list);
	    });
	}
	else if(loc.rel === "ontop") {
	    entity.forEach( (list) => {
		if(list.indexOf("floor") >= 0) intprt.push(list);
		else if(list.map((e) => {return checkOntop(e, state);}).reduce((a, b) => { return a && b; }) )
		    intprt.push(list);
	    });
	}
	else if(loc.rel === "under") {
	    entity.forEach( (list) => {
		if(list.map((e) => {return checkUnder(e, state);}).reduce((a, b) => { return a && b; }) )
		    intprt.push(list);
	    });
	}
	else if(loc.rel === "beside") {
	    // check if beside is a valid location
	    entity.forEach( (list) => {
		if(list.map((e) => {return checkBeside(e, state);}).reduce((a, b) => { return a && b; }) )
		    intprt.push(list);
	    });
	}
	else if(loc.rel === "above") {
	    // check if above is a valid location
	    entity.forEach( (list) => {
		if(list.map((e) => {return checkAbove(e, state);}).reduce((a, b) => { return a && b; }) )
		    intprt.push(list);
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
	var hasForm : boolean = true;
	
	// do we really need to check the whole state if the given object is floor?
	// maybe we should just 'return valid;' here.
	if(obj.form === "floor")
	    valid.push("floor");

	if(obj.form === "anyform")
	    hasForm = false;
	
	// if size an color are given we use them
	if(obj.size && obj.color && hasForm) {
	    objs.forEach((o) => {
		if(checkSize(obj, state.objects[o]) && 
		   checkColor(obj, state.objects[o]) &&
		   checkForm(obj, state.objects[o])) {
		    valid.push(o);
		}
	    });
	}
	// if only size is given we only use size
	else if(obj.size && hasForm) {
	    objs.forEach((o) => {
		if(checkSize(obj, state.objects[o]) &&
		   checkForm(obj, state.objects[o])) {
		    valid.push(o);
		}
	    });
	}
	// same with color
	else if(obj.color && hasForm) {
	    objs.forEach((o) => {
		if(checkColor(obj, state.objects[o]) &&
		   checkForm(obj, state.objects[o])) {
		    valid.push(o);
		}
	    });
	}
	// otherwise we only use the form
	else if(hasForm) {
	    objs.forEach((o) => {
		if(checkForm(obj, state.objects[o])) {
		    valid.push(o);
		}
	    });
	}
	return valid;
    }
	
    // obj =  {obj , loc}
    // TODO: this is where I stopped last time, quite a mess.
    function interpretComplexObject(obj : Parser.Object, state : WorldState) : string[] {
	var immObjs : string[] = interpretObject(obj.obj, state);
	var posObjs : string[][] = interpretLocation(obj.loc, state);
	var intprt : string[] = [];
	
	// posObjs should give us a list of all object where the location is possible 
	// now we should check with immObjs and see if they match up in the state.stacks
	if(obj.loc.rel === "leftof") {
	    immObjs.forEach((o) => {
    	        posObjs.forEach((list) => {
	            // all element is 'list' should have the correct location to atleast one elem from immObjs
	            if(list.map((e) => { return isLeftof(o, e, state); }).reduce((a,b) => { return a && b;}))
		        intprt.push(o);
	        });
	    });
	}
	else if(obj.loc.rel === "rightof") {
	    immObjs.forEach((o) => {
    	        posObjs.forEach((list) => {
	            if(list.map((e) => { return isRightof(o, e, state); }).reduce((a,b) => { return a && b;}))
		        intprt.push(o);
	        });
	    });
	}
	else if(obj.loc.rel === "inside") {
	    immObjs.forEach((o) => {
    	        posObjs.forEach((list) => {
	            if(list.map((e) => { return isInside(o, e, state); }).reduce((a,b) => { return a && b;}))
		        intprt.push(o);
	        });
	    });
	}
	else if(obj.loc.rel === "ontop") {
	    immObjs.forEach((o) => {
    	        posObjs.forEach((list) => {
	            if(list.map((e) => { return isOntop(o, e, state); }).reduce((a,b) => { return a && b;}))
		        intprt.push(o);
	        });	
	    });
	}
	else if(obj.loc.rel === "under") {
	    immObjs.forEach((o) => {
    	        posObjs.forEach((list) => {
	            if(list.map((e) => { return isUnder(o, e, state); }).reduce((a,b) => { return a && b;}))
		        intprt.push(o);
	        });	
	    });
	}
	else if(obj.loc.rel === "beside") {
	    immObjs.forEach((o) => {
    	        posObjs.forEach((list) => {
	            if(list.map((e) => { return isBeside(o, e, state); }).reduce((a,b) => { return a && b;}))
		        intprt.push(o);
	        });	
	     });
	}
	else if(obj.loc.rel === "above") {
	    immObjs.forEach((o) => {
    	        posObjs.forEach((list) => {
	            if(list.map((e) => { return isAbove(o, e, state); }).reduce((a,b) => { return a && b;}))
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
	state.stacks.forEach((stack) => {
	    if(stack.indexOf(obj) >= 0 && state.stacks.indexOf(stack) > 0) {
		return true;
	    }
	});
	return false;
    }

    function checkRightof(obj : string, state : WorldState) : boolean {
	state.stacks.forEach((stack) => {
	    if(stack.indexOf(obj) >= 0 && state.stacks.indexOf(stack) < state.stacks.length) {
		return true;
	    }
	});
	return false;
    }

    function checkInside(obj : string, state : WorldState) : boolean {
	return checkOntop(obj, state);
    }

    function checkOntop(obj : string, state : WorldState) : boolean {
	state.stacks.forEach((stack) => {
	    if(stack.indexOf(obj) >= 0 && stack.length >= stack.indexOf(obj)+1) {
		return true;
	    }
	});
	return false;
    }

    function checkUnder(obj : string, state : WorldState) : boolean {
	state.stacks.forEach((stack) => {
	    if(stack.indexOf(obj) > 0) {
		return true;
	    }
	});
	return false;
    }

    function checkBeside(obj : string, state : WorldState) : boolean {
	state.stacks.forEach((stack) => {
	     if(stack.indexOf(obj) >= 0 && state.stacks.indexOf(stack)+1 <= state.stacks.length && state.stacks.indexOf(stack)-1 >= 0 ) {
		return true;
	     }
	});
	return false;
    }

    function checkAbove(obj : string, state : WorldState) : boolean {
	return checkOntop(obj, state);
    }

    function isLeftof(a : string, b : string, state : WorldState) : boolean {
	var stackIndex : number;
	
	state.stacks.forEach( (stack) => {
	    if(stack.indexOf(b) >= 0)
		stackIndex = state.stacks.indexOf(stack);
	});

	for(var i = 0; i < stackIndex; i++) {
	    if(state.stacks[i].indexOf(a) >= 0)
		return true;
	}
	return false;
    }

    function isRightof(a : string, b : string, state : WorldState) : boolean {
	var stackIndex : number;

	state.stacks.forEach( (stack) => {
	    if(stack.indexOf(b) >= 0)
		stackIndex = state.stacks.indexOf(stack);
	});

	for(var i = stackIndex; i > state.stacks.length; i++) {
	    if(state.stacks[i].indexOf(a) >= 0)
		return true;
	}
	return false;
    }

    function isInside(a : string, b : string, state : WorldState) : boolean {
	state.stacks.forEach( (stack) => {
	    if(stack.indexOf(b) >= 0 && stack.indexOf(a) >= 0 &&
		stack.indexOf(a) > stack.indexOf(b) && stack.indexOf(a) - stack.indexOf(b) == 1)
		return true;
	});
	return false;
    }

    function isOntop(a : string, b : string, state : WorldState) : boolean {
	return isInside(a, b, state);
    }

    function isUnder(a : string, b : string, state : WorldState) : boolean {
	state.stacks.forEach( (stack) => {
	    if(stack.indexOf(b) >= 0 && stack.indexOf(a) >= 0 && stack.indexOf(a) < stack.indexOf(b))
		return true;
	});
	return false;
    }

    function isBeside(a : string, b : string, state : WorldState) : boolean {
	var stackIndex : number;	

	state.stacks.forEach((stack) => {
	    if(stack.indexOf(b) >= 0)
		stackIndex = state.stacks.indexOf(stack);
	});

	if(state.stacks[stackIndex+1].indexOf(a) >= 0)
	    return true;
	if(state.stacks[stackIndex-1].indexOf(b) >= 0)
	    return true;
	return false;
    }

    function isAbove(a : string, b : string, state : WorldState) : boolean {
	state.stacks.forEach( (stack) => {
	    if(stack.indexOf(b) >= 0 && stack.indexOf(a) >= 0 && stack.indexOf(a) > stack.indexOf(b))
		return true;
	});
	return false;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

