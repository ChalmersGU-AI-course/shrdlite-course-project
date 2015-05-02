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
			if (intprt.intp != null)
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
	export interface Position {x:number; y:number;}


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

	//class for interpreting a single parse based on the current worldstate
	class ShrdliteInterpretation {
		constructor(private state : WorldState, private cmd : Parser.Command) {}

		//checks for every object mentioned in the parse if the object exists in the current world state
		//todo: check if the spatial relations between the parsed objects exist
		private checkExistence(ent) : boolean {
			//going through the objects-tree
			while (true) {
				var o = ent.obj;
				if (typeof o.size === "undefined") {
					o = o.obj;
				}

				//when no positions can be found
				if (!this.getPositions(o).length) {
					throw new Interpreter.Error("There is no "
						+ ((o.size != null) ? o.size+" " : "") 
						+ ((o.color != null) ? o.color+" " : "") 
						+ ((o.form != null) ? o.form : ""));
				}

				//when there are no new objects left in the tree
				if (typeof ent.obj.loc === "undefined") {
					return true;
				}
				ent = ent.obj.loc.ent;
			}
			return false;
		}

		//return the positions of all objects that match the pattern in the world state
		//note: currently this function only returns the first occurence of an object that matches
		//note: in my eyes this checking should be a method within World (will ask the TA's about if we may do that)
		//todo: figure out what to return in case of "floor"
		private getPositions(o) : Position[] {
			var p : Position[] = [];
			for (var i = 0; i < this.state.stacks.length; i++) {
				for (var j = 0; j < this.state.stacks[i].length; j++) {
					var a = this.state.objects[this.state.stacks[i][j]];
					if (((o.size == null || o.size == a.size) &&
						(o.color == null || o.color == a.color) &&
						(o.form == null || o.form == a.form || o.form == "anyform")) ||
				   		(o.form == "floor")) {
							var temp : Position = {x: i, y: j}; 
							p.push(temp);	
					}
				}
			}
			return p;
		}

		//return the interpretation for the parse that was handed over on creation
		//todo: actually interpret something, right now the return is just a dummy
		public getInterpretation() : Literal[][] {
			//check origin
			if (typeof this.cmd.ent !== "undefined") {
				var ent = this.cmd.ent;
				if (!this.checkExistence(ent))
					return null;
			}

			//check destination
			if (typeof this.cmd.loc !== "undefined") {
				var ent = this.cmd.loc.ent;
				if (!this.checkExistence(ent))
					return null;
			}

			var intprt : Literal[][] = [[
				{pol: true, rel: "ontop", args: ["test", "test"]}
			]];

			return intprt;
		}
	}


    //////////////////////////////////////////////////////////////////////
    // private functions

    function interpretCommand(cmd : Parser.Command, state : WorldState) : Literal[][] {
        // This returns a dummy interpretation involving two random objects in the world
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        //var a = objs[getRandomInt(objs.length)];
        //var b = objs[getRandomInt(objs.length)];
        //var intprt : Literal[][] = [[
        //    {pol: true, rel: "ontop", args: [a, "floor"]},
        //    {pol: true, rel: "holding", args: [b]}
        //]];
		var interpret = new ShrdliteInterpretation(state, cmd); 
		var intprt : Literal[][] = interpret.getInterpretation();
        return intprt;
    }



    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

