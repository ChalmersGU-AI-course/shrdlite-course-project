///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="collections.ts"/>

module Interpreter {

    interface Position {
        x : number;
        y : number;
    }

    interface ObjectInfo {
        pos  : Position;
        name : string;
        obj  : Parser.Object;
    }

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types
    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
        parses.forEach((parseresult) => {
            var intprt : Result = <Result>parseresult;
	    var iprcmd : LitAmb[] = interpretCommand(intprt.prs, currentState);
            
	    if(iprcmd.length != 0) {
		if(iprcmd.length == 1) {
		    intprt.intp = iprcmd[0].lits;
		    interpretations.push(intprt);
		} else {
		    iprcmd.forEach(function(ipr) {
			var inpr : Result = {intp : ipr.lits, input: intprt.input, prs: intprt.prs, amb: ipr.amb};
			interpretations.push(inpr);
		    });
		}
	    }
        });
        if (interpretations.length == 1) {
            return interpretations;
        } else if(interpretations.length) {
	    //This only occurs when there are ambiuity, either in the utterance or that the quantifier matches several objects
	    var error = new Interpreter.Clarification(getClarQuest(interpretations, currentState));
	    error.data = interpretations;
	    throw error;
	}else {
            throw new Interpreter.Error("Found no interpretation");
        }
    }

    //Haskell-like fold
    function fold(func, base, list) {
	if(list.length == 0) { return base; }
	var v = func(base, list.shift());
	return fold(func, v, list);
    }

    //Generates a string containing choices for resolving the results ambiguity
    function getClarQuest(intprts : Result[], state: WorldState): string{
	var str : string = "Did you mean:";
	for(var i = 0; i < intprts.length; i++) {
	    var intprt : Result = intprts[i];
	    var list : Parser.Command[] = [];
	    for(var j = 0; j < intprts.length; j++) {
		if(j != i) {
		    list.push(intprts[j].prs);
		}
	    }
	    
	    if(intprt.amb) {
		var res : Parser.Command = {cmd: "take", ent: {obj: intprt.amb, quant: "the"}};
	    } else {
		var res : Parser.Command = fold (cmpCmd, intprt.prs, list);
	    }
	    str += " " + (i + 1) + ". ";
	    if(res.ent){
		str += " " + genClarQuest(res.ent.obj);
	    }
	    if(res.loc) {
		if(res.ent) {
		    str += " " + res.loc.rel ;
		}
		str += " " + genClarQuest(res.loc.ent.obj);
	    }
	}
	
	return str;
    }

    //Returns the difference in two commands
    function cmpCmd(c1 : Parser.Command, c2 : Parser.Command) : Parser.Command {
	var newcmd : Parser.Command = {cmd: c1.cmd};
	if(c1.ent && c2.ent) {
	    var ob = cmpObjs (c1.ent.obj, c2.ent.obj);
	    if( hasElements(ob) ) {
		newcmd.ent = {quant: c1.ent.quant, obj: ob};
	    }
	}
	if(c1.loc && c2.loc) {
	    var ob = cmpObjs(c1.loc.ent.obj, c2.loc.ent.obj);
	    if(hasElements(ob)) {
		newcmd.loc = {rel: c1.loc.rel, ent: {quant: c1.loc.ent.quant, obj: ob }};
	    }
	}
	return newcmd;
    }

    //Returns true if the object has elements i.e is not empty
    function hasElements(o : Parser.Object) {
	return o.obj || o.loc || o.form || o.size || o.color;
    }

    //Returns the difference between two objects in the form of a new object
    function cmpObjs(o1 : Parser.Object, o2 : Parser.Object) : Parser.Object {
	var newobj : Parser.Object = {};
	var o1rec  : boolean       = o1.obj != undefined;
	var o2rec  : boolean       = o2.obj != undefined;
	if(o1rec != o2rec) { // Difference in rec
	    if(o1rec) {
		newobj = o1;
	    }else{
		
	    }
	} else if (o1rec){   //Both Recursive
	    var ob1 = cmpObjs(o1.obj, o2.obj);
	    if(hasElements(ob1)) { 
		newobj.obj = ob1;
		var ob2 = cmpObjs(o1.loc.ent.obj, o2.loc.ent.obj);
		if(hasElements(ob2)) {
		    newobj.loc = {rel: o1.loc.rel, ent: {quant: o1.loc.ent.quant, obj :ob2}};
		}
	    }
	} else {             //None recursive
	    if(o1.size != o2.size) {
		newobj.size = o1.size;
	    }if(o1.color != o2.color) {
		newobj.color = o1.color;
	    }if(o1.form != o2.form) {
		newobj.form = o1.form;
	    }
	}
	return newobj;
    }

    //Generates a string containing all the information about an object
    function genClarQuest(obj : Parser.Object) : string{
        var str : string = "";
	if(obj.obj) {   //Recursive case
	    str += genClarQuest(obj.obj);
	    if(obj.loc) {
		str += " that is " + obj.loc.rel;
		str += " " + genClarQuest(obj.loc.ent.obj);
	    }
	} else { //Base case
	    if(obj.size)  {str += " " + obj.size  + " "}
	    if(obj.color) {str += " " + obj.color + " "}
	    if(obj.form)  {str += " " + obj.form  + " "}
	}
	return str;
    }

    export interface Result extends Parser.Result {intp:Literal[][]; amb? : Parser.Object}
    export interface Literal {pol:boolean; rel:string; args:string[];}

    //Litambs contain a pddl and an optional ambiguity object
    export interface LitAmb {lits: Literal[][]; amb?: Parser.Object}
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

    //Error class used for printing ambiguity
    export class Clarification implements Error {
        public name = "Interpreter.Clarification";
	public data : Result[] = [];
        constructor(public message : string) {}
        public toString() {return this.message;}
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    function interpretCommand(cmd : Parser.Command, state : WorldState) : LitAmb[] {
	var ambs : LitAmb[] = [];
	if(cmd.cmd == "move") {
	    var valids :ObjectInfo[] = findValid(cmd.ent.obj, state);
	    var addAmbs = function(ambL) {
		if(ambL.length == 1) {
		    ambs.push({lits:ambL[0].lits});
		} else {
		    ambL.forEach(function(amb) {
			ambs.push({lits:amb.lits, amb:amb.amb});
		    });
		}
	    };
	    if(cmd.ent.quant == "any") {
		var ambL = convertGoalsToPDDL([valids[0]], cmd.loc, state); //Perm all goals from all valids?
		addAmbs(ambL);
	    } else if(cmd.ent.quant == "the") {
		var lambs : LitAmb[] = [];
		valids.forEach(function(val) {
		    var ambL = convertGoalsToPDDL([val], cmd.loc, state);
		    for(var i = 0; i < ambL.length; i++) {
			if(!ambL[i].amb) {ambL[i] = {lits: ambL[i].lits, amb: val.obj}; }
		    }
		    lambs = lambs.concat(ambL);
		});
		addAmbs(lambs);
	    } else if(cmd.ent.quant == "all") {
		var ors  = convertGoalsToPDDL([valids[0]], cmd.loc, state)[0].lits;
		for(var i = 1; i < valids.length; i++) {
		    var val = valids[i];
		    var orz : Literal[][] = convertGoalsToPDDL([valids[i]], cmd.loc, state)[0].lits;
		    var perm : Literal[][] = [];
		    for(var j = 0; j < ors.length; j++) {
			for(var k = 0; k < orz.length; k++) {
			    perm.push(ors[j].concat(orz[k]));
			}
		    }
		    ors = perm;
		}
		ambs.push({lits:ors});
	    }
	} else if(cmd.cmd == "take") {
	    var valids = findValid(cmd.ent.obj, state);
	    if(cmd.ent.quant == "any") {
		ambs.push({lits:convertGoalsToPDDL(valids, null , state)[0].lits});
	    } else if(cmd.ent.quant == "the") {
		if(valids.length == 1) {
		    ambs.push({lits:convertGoalsToPDDL(valids, null, state)[0].lits});
		} else {
		    valids.forEach(function(val) {
			ambs.push({lits:convertGoalsToPDDL([val], null, state)[0].lits, amb: val.obj});
		    })
		}
	    } // not case for all

	} else if(cmd.cmd == "put") {
	    var o : Parser.Object = state.objects[state.holding];
	    var pos : Position = findObject(state.holding, state);
	    var obj2 : ObjectInfo = {obj: o, pos: pos, name : state.holding};
	    ambs = convertGoalsToPDDL([obj2],cmd.loc,state);

	} else {
	    throw new Interpreter.Error("Error parsing command");
	}

	return ambs;
    }

    //Converts the goals to a pddl subset of all relations
    function convertGoalsToPDDL(keys : ObjectInfo[], loc : Parser.Location, state: WorldState) : LitAmb[] 
    {
	var ambs : LitAmb[]     = [];
	var ors  : Literal[][]  = [];
        keys.forEach(function (key) {
	    if(!loc) {
		var p : Literal = {pol: true, rel : "holding", args: [key.name]};
		ors = ors.concat([[p]]);
	    } else {
		var relation = loc.rel;
		var value :ObjectInfo[]  = findValid(loc.ent.obj, state);
		if(loc.ent.quant == "the" && loc.ent.obj.form != "floor") 
		{
		    if(value.length == 1) {
			ors = ors.concat(getPddl(key, relation, value, state));
		    } else {
			value.forEach(function(val) {
			    ambs.push({lits: getPddl(key, relation, [val], state), amb: val.obj});
			});
		    }
		} else if(loc.ent.quant == "all") {
		    value.forEach(function(val) {
			var orz = getPddl(key, relation, [val], state);
			var perm = [];
			for(var j = 0; j < ors.length; j++) {
			    for(var k = 0; k < orz.length; k++) {
				perm.push(ors[j].concat(orz[k]));
			    }
			}
			ors = ors.length == 0 ? orz : perm;
		    });
		    ambs.push({lits:ors});
		    ors = [];
		} else {
		    ors = ors.concat(getPddl(key, relation, value, state));
		}
	    }
	});

	if(ors.length != 0) {ambs.push({lits:ors});}
	return ambs;
    }

    //Returns the pddl of the key with a relation to all objects in value
    function getPddl(key: ObjectInfo, relation: string, value : ObjectInfo[], state: WorldState) : Literal[][] {
	var or   : Literal[][]  = [];
	var and  : Literal[]    = [];

	value.forEach(function(target) {
	    and = [];
	    if(relation == "ontop" || relation == "inside"){ 
		var p : Literal = {pol: true, rel: relation == "inside" ? "ontop" : relation, args: [key.name, target.name] };
		if(checkSize(key.obj, target.obj)) {
		    or.push([p]);
		}
	    } else if (relation == "above") {
		var p : Literal = {pol: true, rel: relation, args: [key.name, target.name] };
		or.push([p]);
	    } else if(relation == "under") {
		var p : Literal = {pol: true, rel: "above", args: [target.name, key.name] };
		or.push([p]);			
	    } else if(relation == "leftof" || relation == "rightof") {
		var left : boolean = relation == "leftof";
		for(var j = 0; j < state.stacks.length; j++) {
		    if(target.obj.form != "floor") {
			for(var k = 0; k < j;  k++) {
			    and = [];
			    var p1 : Literal = {pol: true, rel: "column", args: [key.name, "" + (left ? k : j)] };
			    var p2 : Literal = {pol: true, rel: "column", args: [target.name, "" + (left ? j : k)] };
			    and.push(p1);
			    and.push(p2);
			    or.push(and);
			}
		    } else {
			and = [];
			if(left && j < target.pos.x || !left && j > target.pos.x) {
			    var p : Literal = {pol: true, rel: "column", args: [key.name, "" + j ] };
			    and.push(p);
			    or.push(and);
			}
		    }
		}
	    } else if(relation == "beside") {
		if(target.obj.form != "floor") {
		    for(var j = 0; j < state.stacks.length; j++) {
			and = [];
			var p1 : Literal = {pol: true, rel: "column", args: [key.name, "" + (j)] };
			var p2 : Literal = {pol: true, rel: "column", args: [target.name, "" + (j + 1)] };
			var p3 : Literal = {pol: true, rel: "column", args: [target.name, "" + (j - 1)] };
			and.push(p1);
			and.push(p2);
			or.push(and);

			and = [];
			and.push(p1);
			and.push(p3);
			or.push(and);
		    }
		} else {
		    var p1 : Literal = {pol: true, rel: "column", args: [key.name, "" + (target.pos.x)] };
		    or.push([p1]);
		}
	    }
	});
	
	return or;
    }

    
    //Returns the obj at pos
    function getObjectAtPosition(pos : Position, state : WorldState) : ObjectInfo {
        if( pos.x >= 0 && pos.x < state.stacks.length && pos.y >= 0 && pos.y < state.stacks[pos.x].length) {
            var name = state.stacks[pos.x][pos.y];
            var obj = state.objects[name];
            return {name : name, pos : pos, obj: obj};
        } else {
            return null;
        }
    }

    //Returns all obj besides a certain pos
    function getBesides(pos: Position, target: ObjectInfo, obj: Parser.Object, state : WorldState ) : ObjectInfo[] {
        var valids : ObjectInfo[] = [];
        if(pos.x < state.stacks.length && pos.x >= 0) {
            valids.push({obj: {form: "floor"}, pos: {x: pos.x, y: -1}, name: ("f_" + pos.x)})
	    for(var k = 0; k < state.stacks[pos.x].length; k++) {
                var objR = getObjectAtPosition({x: pos.x, y: pos.y + k}, state);
                var objInfo : ObjectInfo[] = findValid(obj, state);
                for(var j = 0; j < objInfo.length; j++) {
                    if(objR && objR.name == objInfo[j].name) {
                        valids.push(target);
                        break;
                    } 
                }
            }
        }
        return valids;
    }


    //Returns true if above can be places on below
    export function checkSize(above : Parser.Object, below : Parser.Object) : boolean {
        if(below.form == "floor") {
            return true;
        } else if (below.form == "ball") {
            return false;
        } else if (above.form == "ball"){
            if(below.form == "floor" || (below.form == "box" && below.size <= above.size)){
                return true;
            }else{
                return false;
            }
        } else if (below.size > above.size){
            return false;
        } else if (below.size == above.size && below.form == "box" && (above.form == "pyramid" || above.form == "plank" || above.form == "box")){
            return false;
        } else if (above.size == "small" && above.form == "box" && below.size == "small" && (below.form == "brick" || below.form == "pyramid")){
            return false;
        }else if (above.size == "large" && above.form == "box" && below.size == "large" && below.form == "pyramid"){
            return false;
        }
        return true;
    }

    //Returns all objects in the state that match the specified obj
    function findValid(obj : Parser.Object, state : WorldState) : ObjectInfo[]{
        var valids : collections.Set<ObjectInfo> = new collections.Set<ObjectInfo>(function(a) {
	    return a.name;
	});
        if(obj.obj) { //If recursive
            //All obj matching the first obj in relation
            var valids2 : ObjectInfo[] = findValid(obj.obj, state);

            //All obj mathching the seconds obj in relation
            var valids3 : ObjectInfo[] = findValid(obj.loc.ent.obj , state);

            //Finds all objs in valids that match the relationship
            for( var i = 0; i < valids3.length; i++) {

                if((obj.loc.rel == "inside" && valids3[i].obj.form == "box") || obj.loc.rel == "ontop" ) {
                    var objAboveTarget : string = state.stacks[valids3[i].pos.x][valids3[i].pos.y + 1];
                    var yes : number = -1;
                    for( var j = 0; j < valids2.length; j++) {
                        if(valids2[j].name == objAboveTarget) {
                            yes = j;
                            break;
                        }
                    }
                    if(objAboveTarget && yes != -1){
                        valids.add(valids2[yes]);
                    }
                }else if(obj.loc.rel == "rightof" || obj.loc.rel == "leftof"){
                    var offset : number = obj.loc.rel == "rightof" ? 1 : -1; 

                    for(var s = valids3[i].pos.x + offset; s < state.stacks.length && s >= 0 ; s+= offset){
                        for(var h = 0 ; h < state.stacks[s].length ; h++){
                            for(var v = 0 ; v < valids2.length ; v++){
                                if(valids2[v].name == state.stacks[s][h]){
                                    valids.add(valids2[v]);
                                }
                            }
                        }
                    }
                }else if(obj.loc.rel == "above"){
                    var wholeStack : string[] = state.stacks[valids3[i].pos.x];
                    
                    for(var k=0 ; k < wholeStack.length ; k++){
                        if(k > valids3[i].pos.y){
                            for( var j = 0; j < valids2.length; j++) {
                                if(valids2[j].name == wholeStack[k]) {
                                    valids.add(valids2[j]);
                                }
                            }
                        }
                    }

                } else if(obj.loc.rel == "beside"){
                    var ls = getValidsBeside({x: valids3[i].pos.x - 1, y: 0 }, valids2, state );
                    ls.forEach(function(l){
                        valids.add(l);
                    });

                    var rs = getValidsBeside({x: valids3[i].pos.x + 1, y: 0 }, valids2, state );
                    rs.forEach(function(r){
                        valids.add(r);
                    });
                    
                }else if (obj.loc.rel == "under") {
                    var objUnderTarget : string = null;
                    var level : number = valids3[i].pos.y;
                    var yes : number = -1
                    while (level > -1) {
                        objUnderTarget = state.stacks[valids3[i].pos.x][level];
                        for( var j = 0; j < valids2.length; j++) {
                            if(valids2[j].name == objUnderTarget) {
                                valids.add(valids2[j]);
                            }
                        }
                        level--;
                    }
                } else if (obj.loc.rel == "beside"){
        	    var objL : string = state.stacks[valids3[i].pos.x - 1][valids3[i].pos.y];
        	    var objR : string = state.stacks[valids3[i].pos.x + 1][valids3[i].pos.y];
        	    
        	    var nr : number = checkObjInRelation(objL, valids2); 
        	    if( nr != -1) {
        		valids.add(valids2[nr]);
        	    }
        	    nr = checkObjInRelation(objL, valids2); 
        	    if( nr != -1) {
        		valids.add(valids2[nr]);
        	    }
		}
                if(objUnderTarget && yes != -1) valids.add(valids2[yes]);
            }
        } else { //Base case
            if(obj.form == "floor") {
                for(var n = 0; n < state.stacks.length; n++) {
                    var object : Parser.Object = {form: "floor"}
                    var info : ObjectInfo = {name : "f_" + n, pos: {x: n, y: -1}, obj : object};
                    valids.add(info);
                }
            } else {
                for(var y in state.objects) {
                    if((obj.size  == state.objects[y].size  || obj.size  == null) &&
                       (obj.form  == state.objects[y].form  || obj.form  == null || obj.form == "anyform") && 
                       (obj.color == state.objects[y].color || obj.color == null)){
                        var position : Position = findObject(y, state);
                        if(position != null){
			    valids.add({name: y, pos: position, obj : state.objects[y]});
                        }
                    }
                } 
            }
        }
        return valids.toArray();
    } 

    //Get all valid objs beside a pos
    function getValidsBeside (pos : Position, valids2: ObjectInfo[],  state : WorldState) : ObjectInfo[] {
        var valids : ObjectInfo[] = [];
        if(pos.x < state.stacks.length && pos.x >= 0) {
            for(var k = 0; k < state.stacks[pos.x].length; k++) {
                var objr : ObjectInfo = getObjectAtPosition({x: pos.x, y: 0 + k}, state);
                if(objr) {
                    var nr : number = checkObjInRelation(objr.name, valids2); 
                    if( nr != -1) {
                        valids.push(valids2[nr]);
                    }
                }
            }
        }
        return valids;
    }


    //Checks if obj is in valids
    function checkObjInRelation(obj: string, valids : ObjectInfo[]) : number{
        var nr : number = -1;
        for( var i = 0; i < valids.length; i++) {
            if(valids[i].name == obj) {
                nr = i;
                break;
            }
        }
        return nr;
    }


    //Returns the position of an obj
    function findObject(key : string, state : WorldState) : Position {
        if(key.indexOf("f_") != -1) {
            return {x:parseInt(key.charAt(2)), y:-1};
        }
        for(var i = 0; i < state.stacks.length; i++) {
            for(var j = 0; j < state.stacks[i].length; j++) {
                if(key == state.stacks[i][j]) {
                    return {x:i, y:j};
                }
            }
        }
        //should never get here
        return null;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
