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
	export interface PosNode {pos:Position[]; rel:string;}


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

	/**
	* @class Represents a Checker for the spatial relations in the current world
	*/
	class ShrdliteWorldChecker {
		private nodeL : PosNode[];
		/*
		* Creates an instance of ShrdliteWorldChecker
		* @constructor
		*/
		constructor(private state : WorldState) {
			this.nodeL = [];
		}

		/**
		* add PosNode to the array of all PosNodes
		*
		* @param {object} node object
		* @param {string} spatial relation string (inside, ontop, under, beside, above, leftof, rightof)
		* @return {void}
		*/
		public addNode(o, rel : string) : void {
			//get all possible positions for the current object pattern
			var pos : Position[] = this.getPositions(o);

			//when no positions can be found
			if (!pos.length) {
				throw new Interpreter.Error("There is no "
					+ ((o.size != null) ? o.size+" " : "") 
					+ ((o.color != null) ? o.color+" " : "") 
					+ ((o.form != null) ? o.form : ""));
			}

			var node : PosNode = {pos:pos, rel:rel};
			this.nodeL.push(node);
		}	
		
		/**
		* Get the trunk node of the parse tree
		*
		* @return {PosNode} PosNode of the trunk, returns null if no trunk node is present
		*/
		public getTrunk() : PosNode {
			if (this.nodeL[0].pos.length) {
				return this.nodeL[0];
			}
			return null;
		}

		/**
		* Prune all positions that do not have the given spatial relation
		*
		* @return {boolean} Has any pruning been done?
		*/
		public prune() : boolean {
			for (var n = 0; n < (this.nodeL.length - 1); n++) {
				var p : Position [] = this.nodeL[n].pos;
				var c : Position [] = this.nodeL[n+1].pos;
				var rel : string = this.nodeL[n].rel;
				var workDone : boolean = false;

				for (var i = 0; i < p.length; i++) {
					for (var j = 0; j < c.length; j++) {
						if (!this.isReachable(p[i], c[j], rel)) {
							p.splice(i, 1);
							c.splice(j, 1);
							workDone = true;
						}
					}
				}
				this.nodeL[n].pos = p;
				this.nodeL[n+1].pos = c;
			}
			return workDone;
		}

		/**
		* Get all possible Positions of an object pattern in the current world state
		*
		* @param {object} object representing an object pattern in the parse tree
		* @return {Position[]} array of all positions that reflect the current object pattern in the world state
		*/
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

		/**
		* Check if the given spatial relation between two positions holds
		*
		* @param {Position} Position of the origin
		* @param {Position} Position of the destination
		* @param {string} spatial relation string (inside, ontop, under, beside, above, leftof, rightof)
		* @return {boolean} Does the relation hold?
		*/
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

	/**
	* @class Represents an Interpreter for a single parse based on the current world state
	*/
	class ShrdliteInterpretation {
		constructor(private state : WorldState, private cmd : Parser.Command) {}

		/**
		* Check if any position of the trunk node in the parse tree exists that fulfills the spatial and physical specs
		*
		* @param {Entity} Entity of an object pattern in the parse tree
		* @return {Position[]} array of Position for the trunk object pattern that comply with the current world state
		*/
		private checkExistence(ent) : Position[] {
			var checker : ShrdliteWorldChecker = new ShrdliteWorldChecker(this.state);

			//going through the parse tree
			while (true) {
				//checking the next object pattern
				var o = ent.obj;
				var rel : string = "";
				if (typeof o.size === "undefined") {
					rel = o.loc.rel;
					o = o.obj;
				}
					
				//add positions and relation to the checker
				checker.addNode(o, rel);

				//when there are no new objects left in the tree
				if (typeof ent.obj.loc === "undefined") {
					break;
				}

				//advancing to the next object pattern
				ent = ent.obj.loc.ent;
			}

			//removing the spatial relations that don't work in the current world state
			while(checker.prune()) {
				continue;
			}

			//get the PosNode for the trunk
			var trunk : PosNode = checker.getTrunk();

			if (trunk != null) {
				return trunk.pos;
			}

			return null;
		}	 


		//return the interpretation for the parse that was handed over on creation
		//todo: actually interpret something, right now the return is just a dummy
		public getInterpretation() : Literal[][] {
			var origs : Position[] = null;
			var dests : Position[] = null;
			//check origin
			if (typeof this.cmd.ent !== "undefined") {
				var ent = this.cmd.ent;
				origs = this.checkExistence(ent);
				if (origs == null) {
					return null;
				}
			}

			//check destination
			if (typeof this.cmd.loc !== "undefined") {
				var ent = this.cmd.loc.ent;
				dests = this.checkExistence(ent);
				if (dests == null)
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

