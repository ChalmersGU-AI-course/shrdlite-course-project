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
	    throw new Interpreter.Error("Ambiguous interpretation");
		
		//return interpretations;
	} 
	else {
            throw new Interpreter.Error("Found no interpretation");
        }
    }

    export interface Result extends Parser.Result {
    	intp:Literal[][]
    ;}
    export interface Literal {
    	pol : boolean; 
	rel:string; 
    	args:string[];}

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
	
	var intprt : Literal[][] = [];

	switch(cmd.cmd) {
		case "take":
			return interpretTake(cmd.ent, state);
			break;
		case "move":
			return interpretMove(cmd.ent, cmd.loc, state);
			break;
		case "put":
			return interpretPut(cmd.loc, state);
			break;
		default:
			throw new Error(cmd.cmd+" is an invalid command.");
	}

    }

    function interpretTake(entity, state) : Literal[][] {
	var entities : string[] = interpretEntity(entity, state);
	return entities.map((ent) => {
		if(ent !== "floor") return [{pol: true, rel: "holding", args: [ent] }];
	});
    }

    function interpretMove(entity, location, state) : Literal[][] {
	var ent : string[] = interpretEntity(entity, state);
	var loc : string[] = interpretLocation(location, state);
	
	var intprt : Literal[][] = [];
	for(var i = 0; i < ent.length; i++) {
		for(var j = 0; j < loc.length; j++) {
			// physics is only relevant to 'ontop' and 'inside'
			if(validPhysics(ent[i], loc[j], location.rel, state))
				intprt.push([{pol: true, rel: location.rel, args: [ent[i],loc[j]] }]);
		}
	}
	return intprt;
    }

    function interpretPut(location, state) : Literal[][] {
	var locations : string[] = interpretLocation(location, state);

	if(state.holding) {
		return locations.map((loc) => {
			if(validPhysics(state.holding, loc, location.rel, state))
				return [{pol: true, rel: location.rel, args: [state.holding, loc] }];
		});
	}
	else throw new Error("I need to hold it");
    }

    function interpretEntity(ent : Parser.Entity, state : WorldState) : string[] {
	var objs : string[] = interpretObject(ent.obj, state);
	switch(ent.quant) {
	    case "the":
		if(objs.length == 1 || objs.every(o => o === objs[0])) return objs;
		else return [];
		break;
	    case "any":
		return objs;
		break;
	    default:
		throw new Error(ent.quant+" is not implemented yet.");
	}
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
	var entity : string[] = interpretEntity(loc.ent, state);

	switch(loc.rel) {
	    case "leftof":
		return entity.filter((e) => { return validLeftof(e, state); });
		break;
	    case "rightof":
		return entity.filter((e) => { return validRightof(e, state); });
		break;
	    case "inside":
		return entity.filter((e) => { return validInside(e, state); });
		break;
	    case "ontop":
		return entity.filter((e) => { return validOntop(e, state); });
		break;
	    case "under":
		return entity.filter((e) => { return validUnder(e, state); });
		break;
	    case "beside":
		return entity.filter((e) => { return validBeside(e, state); });
		break;
	    case "above":
		return entity.filter((e) => { return validAbove(e, state); });
		break;
	    default:
		throw new Error("Unknown location");
	}
    }

    // obj = {size?, color?, form}
    // returns all matching objects from the stack
    function interpretSimpleObject(obj : Parser.Object, state : WorldState) : string[] {
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
	
	if(obj.form === "floor") {
	    return ["floor"];
	}

	return objs.filter((o) => {return checkObject(obj, state.objects[o], obj.size, obj.color);});
    }
	
    // obj =  {obj , loc}
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

    function checkObject(a : Parser.Object, b : ObjectDefinition, size, color) : boolean {
	if(size && color) {
	    return checkSize(a, b) && checkColor(a, b) && checkForm(a, b);
	}
	else if(size) {
	    return checkSize(a, b) && checkForm(a, b);
	}
	else if(color) {
	    return checkColor(a, b) && checkForm(a, b);
	}
	else return checkForm(a, b);
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
	if(a.form === "anyform") return true;
	if(a.form === b.form) return true;
	else return false;
    }

    function validLeftof(obj : string, state : WorldState) : boolean {
	var flag : boolean = false;
	state.stacks.forEach((stack) => {
	    if(stack.indexOf(obj) >= 0 && state.stacks.indexOf(stack) < state.stacks.length-1) {
		flag = true;
	    }
	});

	return flag;
    }

    function validRightof(obj : string, state : WorldState) : boolean {
	var flag : boolean = false;
	state.stacks.forEach((stack) => {
	    if(stack.indexOf(obj) >= 0 && state.stacks.indexOf(stack) >= 0) {
		flag = true;
	    }
	});
	return flag;
    }

    function validInside(obj : string, state : WorldState) : boolean {
	if(state.objects[obj].form === "box") return true;
	else return false;
    }

    function validOntop(obj : string, state : WorldState) : boolean {
	if(obj === "floor") return true;
	else if(state.objects[obj].form === "box" || state.objects[obj].form === "ball") return false;
	else return true;
    }

    function validUnder(obj : string, state : WorldState) : boolean {
	if(obj === "floor") return false;
	else return true;
    }

    function validBeside(obj : string, state : WorldState) : boolean {
	var flag : boolean = false;	
	state.stacks.forEach((stack) => {
	     if(stack.indexOf(obj) >= 0 && state.stacks.indexOf(stack)+1 <= state.stacks.length && state.stacks.indexOf(stack)-1 >= 0 ) {
		flag = true;
	     }
	});
	return flag;
    }

    function validAbove(obj : string, state : WorldState) : boolean {
	if(state.objects[obj].form === "ball") return false;
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

    // insideof(a,b) a inside b
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

    function validPhysics(a: string, b: string, rel : string, state : WorldState) : boolean {
	//we cannot hold the floor
	if(a === "floor") return false;
	// the floor supports everything
	if(b === "floor") return true;
	// you cannot be inside,ontop,above,leftof,rightof,under,beside youself
	if(a === b) return false;
	var objA : ObjectDefinition = state.objects[a];
	var objB : ObjectDefinition = state.objects[b];

	if(rel === "ontop") {
		// You cannot put large objects on top of small objects
		if(objA.size === "large" && objB.size === "small") return false;

		// pyramid cannot support boxes of equal size
		if(objA.size === objB.size && 
		   objB.form === "pyramid" && 
		   objA.form === "box") return false;

		// small bricks cannot support small boxes
		if(objA.form === "box" && 
		   objA.size === "small" && 
		   objB.size === "small" && 
		   objB.form === "brick") return false;

		// balls cannot be on top of anything except the floor (and inside boxes)
		if(objA.form === "ball") return false;
	}
	else if(rel === "inside") {
		// You cannot put large objects inside a small box
		if(objA.size === "large" && objB.size === "small") return false;

		// boxes cannot have pyramids, planks and boxes of same size inside them
		if(objA.size == objB.size && (objA.form === "pyramid" || 
					      objA.form === "plank" || 
					      objA.form === "box"))
			return false;
	
	}
	else if(rel === "under") {
		// small objects cannot support large objects
		if(objA.size === "small" && objB.size === "large") return false;

		// balls cannot support anything; ball under x, under(ball, x),  is invalid
		if(objA.form === "ball") return false;

		// pyramids cannot support boxes of equal size
		if(objA.size === objB.size && 
		   objB.form === "box" && 
		   objA.form === "pyramid") return false;

		// small bricks cannot support small boxes
		if(objA.form === "brick" && 
		   objA.size === "small" && 
		   objB.size === "small" &&
		   objB.form === "box") return false;
	}
	return true;

    }
}

