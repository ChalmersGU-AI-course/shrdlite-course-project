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
	    //throw new Interpreter.Error("Ambigous interpretation");
		world.printSystemOutput("What did you mean?");
		for(int i = 0; i<interpretations.length;i++)
		{
			world.printSystemOutput(i.toString + ": " + interpretationToString(interpretations[i]));
		}
		
		return interpretations[clarification(interpretations)];
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

	function clarification(utterance : string = "") : int {
		var inputPrompt = "Choose the corresponding number.";
        var nextInput = () => world.readUserInput(inputPrompt, clarification);
		return parseInt(utterance.trim())-1;
	}
	/*function clarification(utterance : string = "", cmd : Parser.Command) : int {
            var inputPrompt = "What did you mean?";
			world.printSystemOutput(inputPrompt);
			for(int i = 0; i<cmd.size;i++){
				inputs[i] = cmd.cmd + " " + cmd.ent.quant + " ";
				if(cmd.ent.obj.obj.size != null)
					inputs[i] += cmd.ent.obj.obj.size + " ";
				if(cmd.ent.obj.obj.color != null)
					inputs[i] += cmd.ent.obj.obj.color + " ";
				if(cmd.ent.obj.obj.form != null)
					inputs[i] += cmd.ent.obj.obj.form + " ";
				if(cmd.ent.obj.loc != null)
				{
					inputs[i] += "that is " cmd.ent.obj.loc.rel + " " + cmd.ent.obj.loc.ent.quant + " ";
					if(cmd.ent.obj.loc.ent.obj.size != null)
						inputs[i] += cmd.ent.obj.loc.ent.obj.size + " ";
					if(cmd.ent.obj.loc.ent.obj.color != null)
						inputs[i] += cmd.ent.obj.loc.ent.obj.color + " ";
					if(cmd.ent.obj.loc.ent.obj.form != null)
						inputs[i] += cmd.ent.obj.loc.ent.obj.form + " ";
				}
				if(cmd.loc != null)
				{
					inputs[i] += cmd.loc.rel + " ";
					inputs[i] += cmd.loc.ent.quant + " ";
					if(cmd.loc.ent.obj.obj.size != null)
						inputs[i] += cmd.loc.ent.obj.obj.size + " ";
					if(cmd.loc.ent.obj.obj.color != null)
						inputs[i] += cmd.loc.ent.obj.obj.color + " ";
					if(cmd.loc.ent.obj.obj.form != null)
						inputs[i] += cmd.loc.ent.obj.obj.form + " ";
					if(cmd.loc.ent.obj.loc != null)
					{
						inputs[i] += "that is " cmd.loc.ent.obj.loc.rel + " " + cmd.loc.ent.obj.loc.ent.quant + " ";
						if(cmd.loc.ent.obj.loc.ent.obj.size != null)
							inputs[i] += cmd.loc.ent.obj.loc.ent.obj.size;
						if(cmd.loc.ent.obj.loc.ent.obj.color != null)
							inputs[i] += cmd.loc.ent.obj.loc.ent.obj.color;
						if(cmd.loc.ent.obj.loc.ent.obj.form != null)
							inputs[i] += cmd.loc.ent.obj.loc.ent.obj.form;
					}
				}
				world.printSystemOutput((i+1) + ": " + inputs[i]);
			}
			inputPrompt = "Choose a number corresponding to what you meant.";
            var nextInput = () => world.readUserInput(inputPrompt, clarificationDecision);
			return parseInt(utterance.trim())-1;
        }*/
	
    function interpretCommand(cmd : Parser.Command, state : WorldState) : Literal[][] {
	
	var intprt : Literal[][] = [];
	if(cmd.cmd === "take") {
	    var entities : string[] = interpretEntity(cmd.ent, state);

	    entities.forEach( (ent) => {
		if(ent === "floor") throw new Error("I cannot pickup the floor");
		intprt.push([{pol: true, rel: "holding", args: [ent]}]);
	    });
	}
	else if(cmd.cmd === "move") {
	
	    var entity : string[] = interpretEntity(cmd.ent, state);
	    var locati : string[] = interpretLocation(cmd.loc, state);
            var tmp : string[][] = [];

	    for(var i = 0; i < entity.length; i++) {
		for(var j = 0; j < locati.length; j++) {
		    if(entity[i] === "floor")
			throw new Error("I cannot pickup the floor");
		    else tmp.push([entity[i],locati[j]]);
		}
	    }
	    tmp.forEach((elem) => { 
		intprt.push([{pol: true, rel: cmd.loc.rel, args: elem}]);
	    });
	}
	// We assume the arm is already holding something
	else if(cmd.cmd === "put") {
		i
	    var locati : string[] = interpretLocation(cmd.loc, state);
	    if (state.holding) {
		locati.forEach( (locElem) => {
   	            intprt.push([{pol: true, rel: cmd.loc.rel, args: [state.holding, locElem]}]);
		});
	    }
	    else throw new Error("Cannot put down something I am not holding");
	}
        return intprt;
    }

    function interpretEntity(ent : Parser.Entity, state : WorldState) : string[] {
	var objs : string[] = interpretObject(ent.obj, state);
	if(objs.size < 1)
		throw new Error("No object exists of that specification.");
	var intprt : string[] = [];
	console.log(objs);
	if(ent.quant === "any")	{
		objs.forEach((elem) => {
		    intprt.push(elem);

		});
	}
	// there should only be one object for 'the' interpretation to be valid
	else if(ent.quant === "the") {
		if(objs.length == 1)
    		    intprt.push(objs[0]);
		else
			throw new Error("Ambiguous, more than 1 of the object exists.");
	}
	else if(ent.quant == "all") {
		throw new Error("Not Implemented Yet: all quantifier");
	}
	else throw new Error("unknown quantifier");
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
    // could probably be optimized
    function interpretSimpleObject(obj : Parser.Object, state : WorldState) : string[] {
	var valid : string[] = [];
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
	
	// do we really need to check the whole state if the given object is floor?
	if(obj.form === "floor") {
	    valid.push("floor");
	    return valid;
	}
	
	// if the form is of any form we dont check if the form match
	// otherwise we do check if the form match
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
}

