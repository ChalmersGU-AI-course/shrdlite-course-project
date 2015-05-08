///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

	//todo: ambiguity, what to do when there are several possible interpretations?
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
		* Get an array of the trunk objects of the parse tree
		*
		* @return {string[]} string[] that represent the trunk objects, returns [] if no objects matched the pattern
		*/
		public getTrunk() : string[] {
			var t : string[] = [];
			for (var i = 0; i < this.nodeL[0].pos.length; i++) {
				var x : number = this.nodeL[0].pos[i].x;
				var y : number = this.nodeL[0].pos[i].y;
				var s : string = "";

				if (x == -1) {
					s = "floor";
				} else if (x == -2) {
					s = this.state.holding;
				} else {
					s = this.state.stacks[x][y];
				}

				t.push(s);
			}
			return t;
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
							c.splice(j, 1);
							workDone = true;
						}
					}
					if (workDone) {
						p.splice(i, 1);
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
		* returns [{x: -1, y: -1}] in case of "floor"
		* returns [{x: -2, y: -2}] in case of holding
		*/
		private getPositions(o) : Position[] {
			//in case of floor
			if (o.form == "floor") {
				return [{x: -1, y: -1}];
			}

			//otherwise
			var p : Position[] = [];
			//is it held by the arm?
			if (this.state.holding != null) {
				var a = this.state.objects[this.state.holding];
				if (this.objCompare(o,a)) {
					var temp : Position = {x: -2, y: -2}; 
					p.push(temp);	
				}
			}

			//is it on the table?
			for (var i = 0; i < this.state.stacks.length; i++) {
				for (var j = 0; j < this.state.stacks[i].length; j++) {
					var a = this.state.objects[this.state.stacks[i][j]];
						if (this.objCompare(o,a)) {
							var temp : Position = {x: i, y: j}; 
							p.push(temp);	
						}
				}
			}
			return p;
		}

		/**
		* Do the objects match?
		*
		* @param {object} object representing an object pattern in the parse tree
		* @param {object} object representing an actual object in the current world
		* @return {boolean} true if they match, false if they do not match
		*/
		private objCompare(o,a) : boolean {
			if ((o.size == null || o.size == a.size) &&
			(o.color == null || o.color == a.color) &&
			(o.form == null || o.form == a.form || o.form == "anyform")) {
				return true;
			}

			return false;
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
		//todo: What to do with "move all balls inside all boxes"
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
					} else if (dest.x == -1 && orig.y == 0) { //the floor case
						return true;
					}
					break;
				case "above":
					if (orig.x == dest.x && orig.y > dest.y) {
						return true;
					} else if (dest.x == -1 && orig.y >= 0) { //the floor case
						return true;
					}
					break;
				case "under":
					if (orig.x == dest.x && orig.y == (dest.y - 1)) {
						return true;
					}
					break;
				case "leftof": //as in "directly left of"
					if (orig.x == (dest.x - 1)) {
						return true;
					}
					break;
				case "rightof": //as in "directly right of"
					if (orig.x == (dest.x + 1)) {
						return true;
					}
					break;
				case "beside": //as in "directly beside"
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
		* @return {string[]} array of string for the trunk object pattern that represent the existing objects in the current world state
		*/
		private checkExistence(ent) : string[] {
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

			//return the array of matching trunk objects
			return checker.getTrunk();
		}	 

		/**
		* Build the Literal[][] based on the Position[] of the origin and/or destination, 
		* the goal and the quantifiers for both origin and/or destination
		*
		* @param {string} goal of the movement (ontop, above, under, beside, leftof, rightof, inside)
		* @param {string} quantifier for the origin (the, any)
		* @param {string} quantifier for the destination (the, any)
		* @param {string[]} array of string that represent the objects for the origin
		* @param {string[]} array of string that represent the objects for the destination
		* @return {Literal[][]} Literal describing the PDDL goals
		*/
		private buildLiteral(goal : string, quantOrig : string, quantDest : string, origs : string[], dests : string[]) {
			var intprt : Literal[][] = [[]];
			var n : number = 0;
			//++n is like "or", n stays unchanged is like "and"

			if (!dests.length) {
				for (var i = 0; i < origs.length; i++) {
					if (n>(intprt.length - 1))
						intprt[n] = [];
					var lit : Literal =  {pol:true, rel:goal, args:[origs[i]]};
					intprt[n].push(lit);
					n = (quantOrig == "all" || quantOrig == "the") ? n : ++n;
				}
				return intprt;
			}

			if (!origs.length) {
				for (var i = 0; i < dests.length; i++) {
					if (n>(intprt.length - 1))
						intprt[n] = [];
					var lit : Literal =  {pol:true, rel:goal, args:[dests[i]]};
					intprt[n].push(lit);
					n = (quantDest == "all" || quantDest == "the") ? n : ++n;
				}
				return intprt;
			}

			for (var i = 0; i < origs.length; i++) {
				for (var j = 0; j < dests.length; j++) {
					if (n>(intprt.length - 1))
						intprt[n] = [];
					var lit : Literal =  {pol:true, rel:goal, args:[origs[i], dests[j]]};
					intprt[n].push(lit);
					n = (quantDest == "all" || quantDest == "the") ? n : ++n;
				}
				n = (quantOrig == "all" || quantOrig == "the") ? n : ++n;
			}

			return intprt;
		}


		/**
		* Interpret the command based on the given objects and their relations and the actual command
		*
		* @return {Literal[][]} Literal describing the PDDL goals
		*/
		//todo: ambigous stuff like "move the ball on the floor" currently produces two PDDL goals when there are two balls present
		public getInterpretation() : Literal[][] {
			//typeof this.cmd.ent !== "undefined"
			//typeof this.cmd.loc !== "undefined"

			var cmdS : string = this.cmd.cmd;

			//for a take/grasp/pick up command
			if (cmdS == "take" || cmdS == "grasp" || cmdS == "pick up") {
				//check origin
				var ent = this.cmd.ent;
				var origs : string[] = this.checkExistence(ent);
				if (origs.length) {
					return this.buildLiteral("holding", ent.quant, "", origs, []);
				}
			}

			//for a move/put/drop command when we are holding something and the "it" specifier is used (e.g. "drop it on the floor")
			if ((cmdS == "move" || cmdS == "put" || cmdS == "drop") && this.state.holding != null && typeof this.cmd.ent === "undefined") {
				//check destination
				var ent = this.cmd.loc.ent;
				var dests : string[] = this.checkExistence(ent);
				if (dests.length) {
					return this.buildLiteral(this.cmd.loc.rel, "the", ent.quant, [this.state.holding], dests); 
				}
			}

			//for a move/put/drop command from an origin pattern to a destination pattern
			if (cmdS == "move" || cmdS == "put" || cmdS == "drop") {
				//check origin
				var entO = this.cmd.ent;
				var origs : string[] = this.checkExistence(entO);

				//check destination
				var entD = this.cmd.loc.ent;
				var dests : string[] = this.checkExistence(entD);

				if (origs.length && dests.length) {
					return this.buildLiteral(this.cmd.loc.rel, entO.quant, entD.quant, origs, dests); 
				}
			}

			return null;
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

