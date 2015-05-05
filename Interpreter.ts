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
            throw new Interpreter.Error("The spatial relations do not work out");
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

	class ShrdliteSpatialCheck {
		constructor(private stacks : string[][], private parentPos : Position[], private childPos : Position[], private rel : string) {
		}

		//returns an array of all childPos that have an existing spatial relation to their parentPos
		public check() : Position[] {
			var tempPos : Position[] = [];
			for (var i = 0; i < this.parentPos.length; i++) {
				for (var j = 0; j < this.childPos.length; j++) {
					if (this.isReachable(this.parentPos[i], this.childPos[j], this.rel)) {
						tempPos.push(this.childPos[j]);
					}
				}
			}
			return tempPos;
		}

		//relations: inside,ontop,under,beside,above,leftof,rightof
		//todo: check for physical impossibilities, or does the parser do that?
		//todo: can a ball inside a small yellow box which is inside a large blue box be considered as "inside the blue box" ?
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

		//checks for every object pattern in the parse if the object exists in the current world state
		//todo: include proper typing for the function arguments
		//todo: return should be a list of positions of origins that have been found out to work in the current world
		//or sth like several lists of the possible paths
		private checkExistence(ent) : boolean {
			var parentPos : Position[] = [];
			var parentRel : string = "";

			//going through the parse tree
			while (true) {
				//checking the next object pattern
				var o = ent.obj;
				var loc = null;
				if (typeof o.size === "undefined") {
					loc = o.loc;
					o = o.obj;
				}
					
				//get all possible positions for the current object pattern
				var pos : Position[] = this.getPositions(o);

				//when no positions can be found
				if (!pos.length) {
					throw new Interpreter.Error("There is no "
						+ ((o.size != null) ? o.size+" " : "") 
						+ ((o.color != null) ? o.color+" " : "") 
						+ ((o.form != null) ? o.form : ""));
				}

				//check if the spatial relations to the parent work out
				if (parentPos.length) {
					var spatChecker : ShrdliteSpatialCheck = new ShrdliteSpatialCheck(this.state.stacks, parentPos, pos, parentRel);
					pos = spatChecker.check();
					//when there are no spatial relations from objects in the world matching the current pattern 
					//to objects in the world matching the pattern one node before
					if (!pos.length) {
						console.log("spatial relation error");
						return false;
					} 
				}

				//when there are no new objects left in the tree
				if (typeof ent.obj.loc === "undefined") {
					return true;
				}

				//advancing to the next object pattern
				ent = ent.obj.loc.ent;
				parentPos = pos;
				parentRel = loc.rel;
			}
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
				if (!this.checkExistence(ent)) {
					return null;
				}
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
        //var objs : string[] = Array.prototype.concat.apply([], state.stacks);

		var interpret = new ShrdliteInterpretation(state, cmd); 
		var intprt : Literal[][] = interpret.getInterpretation();
        return intprt;
    }



    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

