///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

module Interpreter {

	//////////////////////////////////////////////////////////////////////
	// exported functions, classes and interfaces/types

	export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
		var interpretations : Result[] = [];
		var error : string = "";
		parses.forEach((parseresult) => {
			var intprt : Result = <Result>parseresult;

			try {
			var goals : Literal[][][] = interpretCommand(intprt.prs, currentState);
			} catch(err) {
				if (err instanceof Interpreter.Error) {
					error = err.message;
				} else {
					throw err;
					}
			}

			if (goals) {
				for (var i=0; i < goals.length; i++) {
					var interpretation = jQuery.extend(true, {}, intprt); //deep copy
					interpretation.intp = goals[i];
					if (interpretation.intp != null) {
						interpretations.push(interpretation);
					}
				}
			}
		});
		if (interpretations.length) {
			return interpretations;
		} else {
			if (error == "") {
				error = "The described spatial relations do not exist.";
			}
			throw new Interpreter.Error(error);
		}
	}


	export interface Result extends Parser.Result {intp:Literal[][];}
	export interface Literal {pol:boolean; rel:string; args:string[];}
	export interface Position {x:number; y:number;}
	export interface PosNode {pos:Position[]; rel:string;}

	export function interpretationToSentence(res : Result, state : WorldState) : string[] {
		//todo: this new utterance might actually be more specific than the user's first input
		//todo: move all balls inside the box
		var l : string[] = [];
		for (var i = 0; i < res.intp.length; i++) {
			for (var j = 0; j < res.intp[i].length; j++) {
				var s : string = "";
				var oS : string = res.intp[i][j].args[0];
				var dS : string = res.intp[i][j].args[1];
				var rel : string = res.intp[i][j].rel;
				var o = state.objects[oS];
				var d = state.objects[dS];
				if (rel == "ontop") {
					rel = "ontop of";
				}
				if (rel == "infront") {
					rel = "in front of";
				}
				if (rel == "holding" || d == null) {
					s += res.prs.cmd + " the " + o.size + " " + o.color + " " + o.form;
				} else {
					s += res.prs.cmd + " the " + o.size + " " + o.color + " " + o.form + " " + rel + " the " + d.size + " " + d.color + " " + d.form;
				}

				l.push(s);
			}
		}

		return l;
	}

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

	//private functions
	/**
	* Interpret a command from the parser and return PDDL goals
	*
	* @param {Parser.Command} a command from the parser
	* @param {WorldState} a description of the current state of the world
	* @return {Literal[][]} Literal describing the PDDL goals
	*/
	function interpretCommand(cmd : Parser.Command, state : WorldState) : Literal[][][] {
		var interpret = new ShrdliteInterpretation(state, cmd); 
		var intprt : Literal[][][] = interpret.getInterpretation();
		return intprt;
	}

	/**
	 * @class Represents an Interpreter for a single parse based on the current world state
	 */
	class ShrdliteInterpretation {
		constructor(private state : WorldState, private cmd : Parser.Command) {}

		/**
		 * Interpret the command based on the given objects and their relations and the actual command
		 *
		 * @return {Literal[][]} Literal describing the PDDL goals
		 */
		public getInterpretation() : Literal[][][] {
			var cmdS : string = this.cmd.cmd;

			//for a stack command
			if (cmdS == "stack") {
				//check objects
				var ent = this.cmd.ent;
				var objects : string[] = this.checkExistence(ent);
				if (objects.length && this.isPhysicallyPossible(cmdS, ent.quant, "", objects, [])) {
					return this.buildLiteral(cmdS, ent.quant, "", objects, []);
				}
			}

			//for a take/grasp/pick up command
			if (cmdS == "take") {
				//check origin
				var ent = this.cmd.ent;
				var origs : string[] = this.checkExistence(ent);
				if (origs.length && this.isPhysicallyPossible("holding", ent.quant, "", origs, [])) {
					return this.buildLiteral("holding", ent.quant, "", origs, []);
				}
			}

			//for a move/put/drop command when we are holding something and the "it" specifier is used (e.g. "drop it on the floor")
			if ((cmdS == "put" || cmdS == "move") && this.state.holding != null && typeof this.cmd.ent === "undefined") {
				//check destination
				var ent = this.cmd.loc.ent;
				var origs : string[] = [this.state.holding];
				var dests : string[] = this.checkExistence(ent);
				if (dests.length && this.isPhysicallyPossible(this.cmd.loc.rel, "the", ent.quant, origs, dests)) {
					return this.buildLiteral(this.cmd.loc.rel, "the", ent.quant, origs, dests); 
				}
			}

			//for a move/put/drop command from an origin pattern to a destination pattern
			if (cmdS == "move") {
				//check origin
				var entO = this.cmd.ent;
				var origs : string[] = this.checkExistence(entO);

				//check destination
				var entD = this.cmd.loc.ent;
				var dests : string[] = this.checkExistence(entD);

				if (origs.length && dests.length && this.isPhysicallyPossible(this.cmd.loc.rel, entO.quant, entD.quant, origs, dests)) {
					return this.buildLiteral(this.cmd.loc.rel, entO.quant, entD.quant, origs, dests); 
				}
			}

			return null;
		}

		/**
		 * Check if any position of the top node in the parse tree exists that fulfills the spatial specs
		 *
		 * @param {Entity} Entity of an object pattern in the parse tree
		 * @return {string[]} array of string for the top object pattern that represent the existing objects in the current world state
		 */
		private checkExistence(ent) : string[] {
			//object to check the spatial relations
			var checker : ShrdliteWorldChecker = new ShrdliteWorldChecker(this.state);

			//going through the parse tree
			while (true) {
				//checking the next object pattern
				var o = ent.obj;
				var rel : string = "";
				while (typeof o.size === "undefined") {
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

			//removing all spatial relations that don't work in the current world state
				while(checker.prune()) {
					continue;
			}

			//return the array of matching top objects
			return checker.getTop();
		}	 
		
		/**
		 * Check if the transition is physically possible
		 *
		 * @param {string} goal of the movement (ontop, above, under, beside, leftof, rightof, inside)
		 * @param {string} quantifier for the origin (the, any)
		 * @param {string} quantifier for the destination (the, any)
		 * @param {string[]} array of string that represent the objects for the origin
		 * @param {string[]} array of string that represent the objects for the destination
		 * @return {boolean} true if it is possible
		 */
		private isPhysicallyPossible(goal : string, quantOrig : string, quantDest : string, origs : string[], dests : string[]) : boolean {
			//a quick check for the "take" command
			if (goal == "holding" && quantOrig == "all" && origs.length > 1) {
				throw new Interpreter.Error("Only one object can be held by the arm at the same time.");
			} else if (goal == "holding") {
				return true;
			}

			//a quick check for the "stack" command
			if (goal == "stack" && quantOrig != "all") {
				throw new Interpreter.Error("The stack command needs to be used with the 'all' quantifier.");
			} else if (goal == "stack") {
				return true;
			}

			var error : string = "";
			var sizeO : string, formO : string, sizeD : string, formD : string = "";
			var nO : number = origs.length;
			var nD : number = dests.length;
			var origChecker : number[] = [];
			for (var i = 0; i < nO; i++) {
				origChecker.push(nD);
			}
			var destChecker : number[] = [];
			for (var i = 0; i < nD; i++) {
				destChecker.push(nO);
			}

			for (var i = 0; i < nO; i++) {
				for (var j = 0; j < nD; j++) {

					var rel : string = goal;
					var sizeO : string = this.state.objects[origs[i]].size;
					var formO : string = this.state.objects[origs[i]].form;
					var sizeD : string = this.state.objects[dests[j]].size;
					var formD : string = this.state.objects[dests[j]].form;

					//do the same checks for "under" as for "above" but change the roles of origin and destination
					if (rel == "under") {
						rel = "above";
						var sizeD : string = this.state.objects[origs[i]].size;
						var formD : string = this.state.objects[origs[i]].form;
						var sizeO : string = this.state.objects[dests[j]].size;
						var formO : string = this.state.objects[dests[j]].form;
					}

					if (formO == "floor") {
						origChecker[i] = origChecker[i] - 1;
						destChecker[j] = destChecker[j] - 1;
						error = "The floor can only be a destination.";
						continue;
					}

					if (rel == "inside") {
						if (formD != "box") {
							origChecker[i] = origChecker[i] - 1;
							destChecker[j] = destChecker[j] - 1;
							error = "Objects can only be inside boxes.";
							continue;
						}

						if (sizeO == "large" && sizeD == "small") {
							origChecker[i] = origChecker[i] - 1;
							destChecker[j] = destChecker[j] - 1;
							error = "Small objects cannot support large objects.";
							continue;
						}

						if (formO == "ball" && formD != "box") {
							origChecker[i] = origChecker[i] - 1;
							destChecker[j] = destChecker[j] - 1;
							error = "Balls must be in boxes or on the floor.";
							continue;
						}

						if (nO > 1 && nD == 1) {
							origChecker[i] = origChecker[i] - 1;
							destChecker[j] = destChecker[j] - 1;
							error = "Only one thing can be inside another thing.";
							continue;
						}

						if (quantOrig == "all" && nO > 1 && quantDest == "all" && nD > 1) {
							origChecker[i] = origChecker[i] - 1;
							destChecker[j] = destChecker[j] - 1;
							error = "Only one thing can be inside another thing.";
							continue;
						}

						if ((formO == "pyramid" || formO == "box" || formO == "plank") && (sizeO == sizeD) && (formD == "box")) {
							origChecker[i] = origChecker[i] - 1;
							destChecker[j] = destChecker[j] - 1;
							error = "Boxes cannot contain pyramids, planks or boxes of the same size.";
							continue;
						}
					}
					
					//TODO: clean up
					if (rel == "ontop" || rel == "above") {
						if (rel == "ontop" && formO == "ball" &&  formD != "floor") {
							origChecker[i] = origChecker[i] - 1;
							destChecker[j] = destChecker[j] - 1;
							error = "Balls must be in boxes or on the floor.";
							continue;
						}

						if ((sizeO == "large" && formO == "box") && (sizeD == "large" && formD == "pyramid")) {
							origChecker[i] = origChecker[i] - 1;
							destChecker[j] = destChecker[j] - 1;
							error = "Large boxes cannot be supported by large pyramids.";
							continue;
						}

						if (rel == "ontop" && (sizeO == "small" && formO == "box") && (sizeD == "small" && (formD == "pyramid" || formD == "brick"))) {
							origChecker[i] = origChecker[i] - 1;
							destChecker[j] = destChecker[j] - 1;
							error = "Small boxes cannot be supported by small bricks or pyramids.";
							continue;
						}

						if (rel == "ontop" && (formO == "pyramid" || formO == "box" || formO == "plank") && (sizeO == sizeD) && (formD == "box")) {
							origChecker[i] = origChecker[i] - 1;
							destChecker[j] = destChecker[j] - 1;
							error = "Boxes cannot contain pyramids, planks or boxes of the same size.";
							continue;
						}

						if (formD == "ball") {
							origChecker[i] = origChecker[i] - 1;
							destChecker[j] = destChecker[j] - 1;
							error = "Balls cannot support other objects.";
							continue;
						}

						if (sizeO == "large" && sizeD == "small") {
							origChecker[i] = origChecker[i] - 1;
							destChecker[j] = destChecker[j] - 1;
							error = "Small objects cannot support large objects.";
							continue;
						}

						if (nO > 1 && nD == 1 && rel == "ontop" && formD != "floor") {
							origChecker[i] = origChecker[i] - 1;
							destChecker[j] = destChecker[j] - 1;
							error = "Only one thing can be ontop of another thing.";
							continue;
						}

						if (quantOrig == "all" && rel == "ontop" && nO > 1 && formD != "floor" && quantDest == "all" && nD > 1) {
							origChecker[i] = origChecker[i] - 1;
							destChecker[j] = destChecker[j] - 1;
							error = "Only one thing can be ontop of another thing.";
							continue;
						}
					}
				}
			}
			for (var i = nO-1; i >= 0; i--) {
				if (origChecker[i] == 0) {
					origs.splice(i, 1);
				}
			}
			for (var i = nD-1; i >= 0; i--) {
				if (destChecker[i] == 0) {
					dests.splice(i, 1);
				}
			}

			if (!origs.length || !dests.length) {
				throw new Interpreter.Error(error);
			}
			return true;
		}

		/**
		 * Build the Literal[][] based on the objects of the origin and/or destination, 
		 * the goal and the quantifiers for both origin and/or destination
		 *
		 * @param {string} goal of the movement (ontop, above, under, beside, leftof, rightof, inside)
		 * @param {string} quantifier for the origin (the, any)
		 * @param {string} quantifier for the destination (the, any)
		 * @param {string[]} array of string that represent the objects for the origin
		 * @param {string[]} array of string that represent the objects for the destination
		 * @return {Literal[][]} Literal describing the PDDL goals
		 */
		private buildLiteral(goal : string, quantOrig : string, quantDest : string, origs : string[], dests : string[]) : Literal[][][] {
			var intprt : Literal[][][] = [[[]]];

			if (goal == "stack") {
				var argList : string[] = [];
				for (var i = 0; i < origs.length; i++) {
					argList.push(origs[i]);
				}
				var lit : Literal =  {pol:true, rel:goal, args:argList};
				intprt[0] = [[]];
				intprt[0][0] = [];
				intprt[0][0].push(lit);
				return intprt;
			}

			var n : number = 0; //++n is like "or", n stays unchanged is like "and"
			var m : number = 0;

			if (!dests.length) {
				for (var i = 0; i < origs.length; i++) {
					if (m>(intprt.length - 1)) {
						m = intprt.length;
						n = 0;
						intprt[m] = [[]];
					}
					if (n>(intprt[m].length - 1)) {
						n = intprt[m].length;
						intprt[m][n] = [];
					}
					var lit : Literal =  {pol:true, rel:goal, args:[origs[i]]};
					intprt[m][n].push(lit);
					n = (quantOrig == "all" || quantOrig == "the") ? n : ++n;
					m = (quantOrig == "all" || quantOrig == "any") ? m : ++m;
				}
				return intprt;
			}

			if (!origs.length) {
				for (var i = 0; i < dests.length; i++) {
					if (m>(intprt.length - 1)) {
						m = intprt.length;
						n = 0;
						intprt[m] = [[]];
					}
					if (n>(intprt[m].length - 1)) {
						n = intprt[m].length;
						intprt[m][n] = [];
					}
					var lit : Literal =  {pol:true, rel:goal, args:[dests[i]]};
					intprt[m][n].push(lit);
					n = (quantDest == "all" || (quantDest == "the" && dests[i] != "floor")) ? n : ++n;
					m = ((quantDest == "all" || quantDest == "any") && dests[i] == "floor")? m : ++m;
				}
				return intprt;
			}

			//this is a rather special case that requires the computation of all possible combinations
			if (quantOrig == "all" && quantDest == "any" && origs.length > 1) {
				var a : string[][][] = [[[]]];
				for (var i = 0; i < origs.length; i++) {
					a.push(combinations([[origs[i]], dests]));
				}
				a.splice(0,1);
				var b : string[][] = [[]];
				for (var i=0; i<a.length; i++) {
				var c : string[] = [];
					for (var j=0; j<a[i].length; j++) {
						c.push(a[i][j][0]+a[i][j][1]);
					}
					b.push(c);
				}
				b.splice(0,1);
				var test : string[][] = combinations(b);
				var max : number = test.length;
				for (var i = 0; i < max; i++) {
					var o1 : string = test[i][0].substring(0,1);
					var o2 : string = test[i][0].substring(1,2);
					var o3 : string = test[i][1].substring(0,1);
					var o4 : string = test[i][1].substring(1,2);
					//self referencing or same goal for "ontop" or "inside"
					if (o1 == o2 || o3 == o4 || (o2 == o4 && (goal == "ontop" || goal == "inside"))) {
						continue;
					}
					var lit : Literal = {pol:true, rel:goal, args:[o1, o2]};
					var lit2 : Literal = {pol:true, rel:goal, args:[o3, o4]};
					intprt[0].push([lit, lit2]);
				}
				intprt[0].splice(0,1);
				//TODO: ugly!!!!
				//TODO: test all complex examples
				//TODO: move all balls beside a ball

				return intprt;
			}

			for (var i = 0; i < origs.length; i++) {
				for (var j = 0; j < dests.length; j++) {
					if (m>(intprt.length - 1)) {
						m = intprt.length;
						n = 0;
						intprt[m] = [[]];
					}
					if (n>(intprt[m].length - 1)) {
						n = intprt[m].length;
						intprt[m][n] = [];
					}
					var lit : Literal =  {pol:true, rel:goal, args:[origs[i], dests[j]]};
					intprt[m][n].push(lit);
					n = (quantDest == "all" || quantDest == "the") ? n : ++n;
					m = ((quantDest == "all" || quantDest == "any") || dests[j] == "floor")? m : ++m;
				}
				n = (quantOrig == "all" || quantOrig == "the") ? n : ++n;
				m = (quantOrig == "all" || quantOrig == "any") ? m : ++m;
			}

			function combinations(arg : string[][]) {
				var r : string[][] = [[]];
				var max = arg.length - 1;
				function helper(arr, i) {
					for (var j=0, l=arg[i].length; j<l; j++) {
						var a = arr.slice(0); // clone arr
						a.push(arg[i][j]);
						if (i==max) {
							r.push(a);
						} else
							helper(a, i+1);
					}
				}
				helper([], 0);
				r.splice(0,1);
				return r;
			}

			return intprt;
		}
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
		 * @param {string} spatial relation string (inside, ontop, under, beside, above, leftof, rightof, behind, infront)
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
		 * Get an array of the topmost objects of the parse tree
		 *
		 * @return {string[]} string[] that represents the top objects, returns [] if no objects matched the pattern
		 */
		public getTop() : string[] {
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
			var workDone : boolean = false;
			for (var n = 0; n < (this.nodeL.length - 1); n++) {
				var p : Position [] = this.nodeL[n].pos;
				var c : Position [] = this.nodeL[n+1].pos;
				var rel : string = this.nodeL[n].rel;

				var nP : number = p.length;
				var nC : number = c.length;
				var parentChecker : number[] = [];
				for (var i = 0; i < nP; i++) {
					parentChecker.push(nC);
				}
				var childChecker : number[] = [];
				for (var i = 0; i < nC; i++) {
					childChecker.push(nP);
				}

				//for every potential relation that does not actually exist, decrease the respective checker by 1
				for (var i = 0; i < p.length; i++) {
					for (var j = 0; j < c.length; j++) {
						if (!this.isReachable(p[i], c[j], rel)) {
							parentChecker[i] = parentChecker[i] - 1;
							childChecker[j] = childChecker[j] - 1;
						}
					}
				}
				//if the checker is 0 (no relation exists), then remove that Position
				for (var i = nP-1; i >= 0; i--) {
					if (parentChecker[i] == 0) {
						p.splice(i, 1);
						workDone = true;
					}
				}
				for (var i = nC-1; i >= 0; i--) {
					if (childChecker[i] == 0) {
						c.splice(i, 1);
						workDone = true;
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
		 * @param {string} spatial relation string (inside, ontop, under, beside, above, leftof, rightof, behind, infront)
		 * @return {boolean} Does the relation hold?
		 */
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
					if (orig.x == (dest.x - 1) || orig.x == (dest.x + 1) || orig.x == (dest.x - this.state.rowLength) || orig.x == (dest.x + this.state.rowLength)) {
						return true;
					}
					break;
				case "behind": //as in "directly behind"
					if (orig.x == (dest.x + this.state.rowLength)) {
						return true;
					}
					break;
				case "infront": //as in "directly in front of"
					if (orig.x == (dest.x - this.state.rowLength)) {
						return true;
					}
					break;
			}
			return false;
		}
	}
}
