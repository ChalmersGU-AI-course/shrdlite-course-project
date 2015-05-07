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
            intprt.intp = interpretCommand(intprt.prs, currentState);
	    if(intprt.intp.length != 0) {
		interpretations.push(intprt);
	    }
        });
        if (interpretations.length == 1) {
            return interpretations;
        } else if(interpretations.length) {
	    throw new Interpreter.Error("Ambiguous interpretation. Please clarify");
	}else {
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
	var moveWithGoals = new collections.Dictionary<ObjectInfo, ObjectInfo[]>(function(a) {
	    return a.name;
	});
	var ors : Literal[][];
	if(cmd.cmd == "move") {
            var toMove : ObjectInfo[] = findValid(cmd.ent.obj, state);
           
            for(var i = 0; i < toMove.length; i++) {
		var validGoals : ObjectInfo[] = checkRelation(toMove[i].obj, cmd.loc, state);
		moveWithGoals.setValue(toMove[i], validGoals);
            }

	    ors = convertGoalsToPDDL(moveWithGoals, cmd.loc.rel, state);

	} else if(cmd.cmd == "take") {
	    var toMove : ObjectInfo[] = findValid(cmd.ent.obj, state);

	    toMove.map(function(o) {
		moveWithGoals.setValue(o, []);
	    });

	    ors = convertGoalsToPDDL(moveWithGoals, "holding", state);

	} else if(cmd.cmd == "put") {
	    state.holding = "m"; //TODODODODODODODOD
	    var o : Parser.Object = state.objects[state.holding];
	    var objs : ObjectInfo[] = checkRelation(o, cmd.loc, state);

	    var pos : Position = findObject(state.holding, state);
	    var obj2 : ObjectInfo = {obj: o, pos: pos, name : state.holding};

	    moveWithGoals.setValue(obj2, objs);
	    ors = convertGoalsToPDDL(moveWithGoals, cmd.loc.rel, state);

	} else {
	    throw new Interpreter.Error("Error parsing command");
	}

	return ors;
    }

    //Converts to a pddl subset of all relations
    //rels £ {holding, above, ontop, column}
    function convertGoalsToPDDL(dict : collections.Dictionary<ObjectInfo, ObjectInfo[]>, relation : string, state: WorldState) : Literal[][] 
    {
        var or : Literal[][] = [];
        var and : Literal[] = [];

        dict.forEach(function(key: ObjectInfo, value : ObjectInfo[]) {
	    and = [];
            if(relation == "holding") {
		var p : Literal = {pol: true, rel : relation, args: [key.name]};
                or.push([p]);
	    } else if(relation == "ontop" || relation == "above" || relation == "inside"){ 
		for(var i = 0; i < value.length; i++) {
                    var p : Literal = {pol: true, rel: relation == "inside" ? "ontop" : relation, args: [key.name, value[i].name] };
                    or.push([p]);
		}
            } else if(relation == "below") {
		for(var i = 0; i < value.length; i++) {
                    var p : Literal = {pol: false, rel: "above", args: [key.name, value[i].name] };
		    
		    for(var j = 0; j < state.stacks.length; j++) {
			and = [];
			var p2 : Literal = {pol: true, rel: "column", args: [key.name, "" + j] };
			var p3 : Literal = {pol: true, rel: "column", args: [value[i].name, "" + j] };
			and.push(p);
			and.push(p2);
			and.push(p3);
			or.push(and);
		    }
		}
	    } else if(relation == "leftof" || relation == "rightof") {
		var left : boolean = relation == "leftof";
		for(var i = 0; i < value.length; i++) {
		    for(var j = 0; j < state.stacks.length; j++) {
			if(value[i].obj.form != "floor") {
			    for(var k = 0; k < j;  k++) {
				and = [];
				var p1 : Literal = {pol: true, rel: "column", args: [key.name, "" + (left ? k : j)] };
				var p2 : Literal = {pol: true, rel: "column", args: [value[i].name, "" + (left ? j : k)] };
				and.push(p1);
				and.push(p2);
				or.push(and);
			    }
			} else {
			    and = [];
			    if(left && j < value[i].pos.x || !left && j > value[i].pos.x) {
				var p : Literal = {pol: true, rel: "column", args: [key.name, "" + j ] };
				and.push(p);
				or.push(and);
			    }
			}
		    }
		}	
	    } else if(relation == "beside") {
		for(var i = 0; i < value.length; i++) {
		    if(value[i].obj.form != "floor") {
			for(var j = 0; j < state.stacks.length; j++) {
			    and = [];
			    var p1 : Literal = {pol: true, rel: "column", args: [key.name, "" + (j)] };
			    var p2 : Literal = {pol: true, rel: "column", args: [value[i].name, "" + (j + 1)] };
			    var p3 : Literal = {pol: true, rel: "column", args: [value[i].name, "" + (j - 1)] };
			    and.push(p1);
			    and.push(p2);
			    or.push(and);

			    and = [];
			    and.push(p1);
			    and.push(p3);
			    or.push(and);
			}
		    } else {
			and = [];
			var p1 : Literal = {pol: true, rel: "column", args: [key.name, "" + (value[i].pos.x)] };
			or.push([p1]);
		    }
		}
	    }
        });
        return or;
    }

    //returns all valids targets for the object with the specified relation
    function checkRelation(obj : Parser.Object, loc : Parser.Location, state: WorldState) : ObjectInfo[] {
        //find target
        var targets : ObjectInfo[] = findValid(loc.ent.obj, state);
        var valids  : ObjectInfo[] = [];
        
        for(var i = 0; i < targets.length; i++) {
            if((loc.rel == "ontop") && checkSize(obj, targets[i].obj )) {
                valids.push(targets[i]);
            } else if(loc.rel == "inside" && checkSize(obj, targets[i].obj) && targets[i].obj.form == "box" ) {
                valids.push(targets[i]);
            } else if(loc.rel == "under") {
                var stack : string[] = state.stacks[targets[i].pos.x];
                for(var j = targets[i].pos.y; j >= -1; j--) {
                    var objUnder : Parser.Object;
                    var name : string;
                    if(j == -1) {
                        objUnder = {form : "floor"};
                        name = "f_" + targets[i].pos.x;
                    } else {
                        objUnder = state.objects[stack[j]];
                        name = stack[j];
                    }
                    if(objUnder.form == "floor" || checkSize(objUnder, obj)) {
                        valids.push({obj: objUnder, pos: {x: targets[i].pos.x, y: j}, name: name});
                    }
                }
            } else if(loc.rel == "beside") {
                
                var ls : ObjectInfo[] = getBesides({x: targets[i].pos.x + 1, y: targets[i].pos.y}, targets[i], obj, state );
                ls.forEach(function(l) {
                    valids.push(l);
                });

                var rs : ObjectInfo[] = getBesides({x: targets[i].pos.x - 1, y: targets[i].pos.y}, targets[i], obj, state );
                rs.forEach(function(r) {
                    valids.push(r);
                });
            }
            else if(loc.rel == "above"){
                var stack : string[] = state.stacks[targets[i].pos.x];
                for(var j = targets[i].pos.y ; j < stack.length ; j++){
                    var objAbove : Parser.Object;
                    var name : string;
                    if(j == -1){ //The floor
                        objAbove = {form : "floor"};
                        name = "f_" + targets[i].pos.x;
                    }else{
                        objAbove = state.objects[stack[j]];
                        name = stack[j];
                    }
                    if(checkSize(obj, objAbove)){
                        valids.push({obj: objAbove, pos: {x:targets[i].pos.x,y:j}, name: name});
                    }
                }
            } else if(loc.rel == "rightof" || loc.rel == "leftof"){
                var offset : number = loc.rel == "rightof" ? 1 : -1;

                for(var x = targets[i].pos.x + offset ; x < state.stacks.length && x >= 0 ; x += offset){
                    valids.push({obj: {form : "floor"}, name: "f_" + x, pos: {x:x, y:-1}});
                    for(var y = 0 ; y < state.stacks[x].length ; y++){
                        var target : Parser.Object = state.objects[state.stacks[x][y]];
                        if(checkSize(obj,target)){
                            valids.push({obj: target, name: state.stacks[x][y], pos: {x:x, y:y}});
                        }
                    }
                }

            }
        }
        return valids;
    }



    function getObjectAtPosition(pos : Position, state : WorldState) : ObjectInfo {
        if( pos.x >= 0 && pos.x < state.stacks.length && pos.y >= 0 && pos.y < state.stacks[pos.x].length) {
            var name = state.stacks[pos.x][pos.y];
            var obj = state.objects[name];
            return {name : name, pos : pos, obj: obj};
        } else {
            return null;
        }
    }

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


    function checkSize(above : Parser.Object, below : Parser.Object) : boolean {
        if(below.form == "floor") {
            return true;
        } else if (below.form == "ball") {
            return false;
        } else if (above.form == "ball"){
            if(below.form == "floor" || below.form == "box"){
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
