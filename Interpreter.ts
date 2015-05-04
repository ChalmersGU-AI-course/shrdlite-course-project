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
	export interface SpatRel {orig:Position; dest:Position; rel:string;}


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

	class ShrdliteSpatialCheck {
		constructor(private stacks : string[][], private parentPos : Position[], private childPos : Position[], private rel : string) {
		}

		//check if any relation might exist
		public check() : boolean {
			for (var i = 0; i < this.parentPos.length; i++) {
				for (var j = 0; j < this.childPos.length; j++) {
					if (this.isReachable(this.parentPos[i], this.childPos[j], this.rel)) {
						return true;
					}
				}
			}
			return false;
		}

		//relations: inside,ontop,under,beside,above,leftof,rightof
		//todo: check for physical impossibilities, or does the parser do that?
		private isReachable(orig : Position, dest : Position, rel : string) : boolean {
			switch (rel) {
				case "inside":
					if (orig.x == dest.x && orig.y == (dest.y + 1)) {
						return true;
					}
					break;
				case "ontop":
					if (orig.x == dest.x && orig.y == (dest.y + 1)) {
						return true;
					}
					break;
				case "above":
					if (orig.x == dest.x && orig.y > dest.y) {
						return true;
					}
					break;
				case "under":
					if (orig.x == dest.x && orig.y == (dest.y - 1)) {
						return true;
					}
					break;
				case "leftof":
					if (orig.x == (dest.x - 1)) {
						return true;
					}
					break;
				case "rightof":
					if (orig.x == (dest.x + 1)) {
						return true;
					}
					break;
				case "beside":
					if (orig.x == (dest.x - 1) || orig.x == (dest.x + 1)) {
						return true;
					}
					break;
			}
			return false;
		}
	}

	//class for interpreting a single parse based on the current worldstate
	class ShrdliteInterpretation {
		constructor(private state : WorldState, private cmd : Parser.Command) {}

		//checks for every object mentioned in the parse if the object exists in the current world state
		//todo: check if the spatial relations between the parsed objects exist
		//todo: include proper typing for the function arguments
		private checkExistence(ent, parentPos : Position[] = [], parentRel : string = "") : boolean {
			//checking the next object
			var o = ent.obj;
			var loc = null;
			if (typeof o.size === "undefined") {
				loc = o.loc;
				o = o.obj;
			}
				
			//get all possible Positions for the current object
			var pos : Position[] = this.getPositions(o);

			//when no positions can be found
			if (!pos.length) {
				throw new Interpreter.Error("There is no "
					+ ((o.size != null) ? o.size+" " : "") 
					+ ((o.color != null) ? o.color+" " : "") 
					+ ((o.form != null) ? o.form : ""));
			}

			//check if the spatial relations work out
			//todo: currently we are checking only proceedingly pairwise, what if there is a ball that is inside some box
			//and a box that is on the floor but there is no ball that is inside a box that is on the floor?
			if (parentPos.length) {
				var spatChecker = new ShrdliteSpatialCheck(this.state.stacks, parentPos, pos, parentRel);
				if (!spatChecker.check()) {
					console.log("spatial relation error");
					//throw new Interpreter.Error("Spatial relation error");
				}
			}

			//when there are no new objects left in the tree
			if (typeof ent.obj.loc === "undefined") {
				return true;
			}

			//Recursion
			return this.checkExistence(ent.obj.loc.ent, pos, loc.rel);
		}

		//return the positions of all objects that match the pattern in the world state
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

