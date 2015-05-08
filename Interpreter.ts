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
        var a = objs[0];
        if(loc){
        	var b = loc[0];
		}
        var intprt : Literal[][] = [[
            //{pol: true, rel: "ontop", args: [a, "floor"]},
           // {pol: true, rel: "holding", args: [b]}
        ]];
        if(loc){
        	var k = 0;
	        for (var i = 0; i < objs.length; i++) {
	        	for (var j = 0; j < loc.length; j++) {
	        		intprt[k]= [{pol: true, rel: cmd.loc.rel, args: [objs[i], loc[j]]}];
	        		k++;
	        	}
	        }
		}else{
	        for (var i = 0; i < objs.length; i++) {
	        	intprt[i]= [{pol: true, rel: cmd.cmd, args: [objs[i]]}];
	        }
		}
        
        return intprt;
    }
    
    function identifyLocation(loc : Parser.Location, state : WorldState):string[]{
    	var objs = identifyObj(loc.ent.obj, state);
    	return objs;
    }
    
    function identifyObj(obj : Parser.Object, state : WorldState):string[]{
       	var form = obj.form;
        var color = obj.color;
        var size = obj.size;
    	var objs:collections.Set<string> = new collections.Set<string>(function (x){return x});
        if(form.length == 0){
        	return [];
        }
        var pddls = state.pddl.toArray();
        for (var index = 0; index < pddls.length; index++) {
        	var pddl = pddls[index];
        	if(pddl.rel != "ontop"){
        		continue;
        	}
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
    	return identifyObj(ent.obj, state);
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

