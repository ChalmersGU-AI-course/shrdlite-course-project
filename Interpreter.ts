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

        var toMove : ObjectInfo[] = findValid(cmd.ent.obj, state);
        var moveWithGoals = new collections.Dictionary<ObjectInfo, ObjectInfo[]>();

        if(toMove.length == 0) {
            alert("no such object TODO");
        }
        for(var i = 0; i < toMove.length; i++) {
            var validGoals : ObjectInfo[] = checkRelation(toMove[i].obj, cmd.loc, state);
            moveWithGoals.setValue(toMove[i], validGoals);
        }

        var goals : Literal[][] = convertGoalsToPDDL(moveWithGoals, cmd.loc.rel);
        if(!goals) {
            goals = [[]];
        }
        // This returns a dummy interpretation involving two random objects in the world
        /*var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        var a = objs[getRandomInt(objs.length)];
        var b = objs[getRandomInt(objs.length)];
        var intprt : Literal[][] = [[
            {pol: true, rel: "ontop", args: [a, "floor"]},
            {pol: true, rel: "holding", args: [b]}
        ]];*/

        return goals;
    }

    function convertGoalsToPDDL(dict : collections.Dictionary<ObjectInfo, ObjectInfo[]>, relation : string) : Literal[][] 
    {
        var lits : Literal[][] = [[]];
        for(var i = 0; i < dict.keys.length; i++) {
        lits.push([]);
        }
        var index = 0;
        dict.forEach(function(key: ObjectInfo, value : ObjectInfo[]) {
            for(var i = 0; i < value.length; i++) {
                if(relation == "holding") {

                } else {
                    var p : Literal = {pol: true, rel: relation, args: [key.name, value[i].name] };
                    lits[index].push(p);
                }
            }
        index++;
        });
        return lits;
    }

    //returns all valids targets for the object with the specified relation
    function checkRelation(obj : Parser.Object, loc : Parser.Location, state: WorldState) : ObjectInfo[] {
        //find target
        var targets : ObjectInfo[] = findValid(loc.ent.obj, state);
        var valids  : ObjectInfo[] = [];
        
        for(var i = 0; i < targets.length; i++) {
            if(loc.rel == "ontop" && checkSize(obj, targets[i].obj )) {
                valids.push(targets[i]);
            } else if(loc.rel == "inside" && checkSize(obj, targets[i].obj) && targets[i].obj.form == "box" ) {
                valids.push(targets[i]);
            } else if(loc.rel == "above"){
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
            }
        }
        return valids;
    }

   

    function checkSize(above : Parser.Object, below : Parser.Object) : boolean {
        if(below.form == "floor") {
            return true;
        } else if (below.form == "ball") {
            return false;
        } else if(above.form == "box" && above.size == "small" && 
                  below.size == "small" && (below.form == "brick" || below.form == "pyramid")) {
            return false;
        } else if(above.form == "box" && above.size == "large" && 
                  below.form == "pyramid" && below.size == "large") {
            return false;
        }
        else if(above.size > below.size && (below.form == "box" || below.form == "pyramid") ) {
            return true;
        }
        else if(above.size >= below.size) {
            if((above.form == "ball" || above.form == "brick") && below.form == "box") {
                return true;
            }
            
        } 
        return false;
    }


    function findValid(obj : Parser.Object, state : WorldState) : ObjectInfo[]{
        var valids : ObjectInfo[] = [];
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
                        valids.push(valids2[yes]);
                    }
                }else if(obj.loc.rel == "above"){
                    var wholeStack : string[] = state.stacks[valids3[i].pos.x];
                    
                    for(var k=0 ; k < wholeStack.length ; k++){
                        if(k > valids3[i].pos.y){
                            for( var j = 0; j < valids2.length; j++) {
                                if(valids2[j].name == wholeStack[k]) {
                                    valids.push(valids2[j]);
                                }
                            }
                        }
                    }
                }else if(obj.loc.rel == "beside"){
                    var objL : string = state.stacks[valids3[i].pos.x - 1][valids3[i].pos.y];
                    var objR : string = state.stacks[valids3[i].pos.x + 1][valids3[i].pos.y];
        
                    var nr : number = checkObjInRelation(objL, valids2); 
                    if( nr != -1) {
                        valids.push(valids2[nr]);
                    }
                    nr = checkObjInRelation(objL, valids2); 
                    if( nr != -1) {
                        valids.push(valids2[nr]);
                    }
                }else if (obj.loc.rel == "under") {
                    var objUnderTarget : string = null;
                    var level : number = valids3[i].pos.y;
                    var yes : number = -1
                    while (level > -1) {
                        objUnderTarget = state.stacks[valids3[i].pos.x][level];
                        for( var j = 0; j < valids2.length; j++) {
                            if(valids2[j].name == objUnderTarget) {
                                yes = j;
                                break;
                            }
                        }
                        level--;
                    }
                    if(objUnderTarget && yes != -1) valids.push(valids2[yes]);
                }
            }

        } else { //Base case
            if(obj.form == "floor") {
                for(var n = 0; n < state.stacks.length; n++) {
                    var object : Parser.Object = {form: "floor"}
                    var info : ObjectInfo = {name : "f_" + n, pos: {x: n, y: -1}, obj : object};
                    valids.push(info);
                }
            } else {
                for(var y in state.objects) {
                    if((obj.size  == state.objects[y].size  || obj.size  == null) &&
                       (obj.form  == state.objects[y].form  || obj.form  == null) && 
                       (obj.color == state.objects[y].color || obj.color == null)){
                        var position : Position = findObject(y, state);
                        if(position != null){
                            valids.push({name: y, pos: position, obj : state.objects[y]});
                        }
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
