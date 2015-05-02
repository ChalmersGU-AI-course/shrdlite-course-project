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
      /*  var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        var a = objs[getRandomInt(objs.length)];
        var b = objs[getRandomInt(objs.length)];
        var intprt : Literal[][] = [[
            {pol: true, rel: "ontop", args: [a, "floor"]},
            {pol: true, rel: "holding", args: [b]}
        ]]; */

        if(cmd.cmd == "take"){
            var ids = identifyObj(cmd.ent.obj, state);
            var intprt : Literal[][] = [[
                {pol: true, rel: "holding", args: [ids[0]]}
            ]];
        }
        else if (cmd.cmd == "put"){
            var ids = identifyObj(cmd.loc.ent.obj, state);
            var intprt : Literal[][] = [[
                {pol: true, rel: cmd.loc.rel, args: [state.holding, ids[0]]}
            ]];
            
        }
        else if (cmd.cmd == "move"){
            var idsSrc = identifyObj(cmd.ent.obj, state);
            var idsDst = identifyObj(cmd.loc.ent.obj, state);
            var intprt : Literal[][] = [[
                {pol: true, rel: cmd.loc.rel, args: [idsSrc[0],idsDst[0]]}
            ]];
        }
        else
            throw new Interpreter.Error("NYI: CMD " + cmd.cmd);
        //if(cmd.ent != null)
        //    var obj : Parser.Object[] = identifyObj(cmd.ent, state)


        return intprt;
    }

    function identifyObj(object : Parser.Object, state : WorldState){
        var ids = [];
        if(object.obj == null){
            var size = object.size;
            var color = object.color;
            var form = object.form;

            var objs : string[] = Array.prototype.concat.apply([], state.stacks);

            for(var i = 0; i < objs.length; i++){
                var currentObj = state.objects[objs[i]];
                if((currentObj.form == form || form == "anyform") && 
                    (currentObj.color == color || color == null) && 
                    (currentObj.size == size || size == null)){
                    ids.push(objs[i]);
                }
            }           
        }else{
            var objIds = identifyObj(object.obj, state);
            for(var i = 0; i < objIds.length; i++){
                if(checkLoc(objIds[i], object.loc, state)){
                    ids.push(objIds[i]);
                }
            }

        }

        return ids;

    }


    function checkLoc(objectId, loc : Parser.Location, state : WorldState) : boolean{

        var relation = loc.rel;
        var pos : [number, number] = findObjPos(objectId, state);


        if(relation == "leftof"){
            if(pos[0] = state.stacks.length - 1)
                throw new Interpreter.Error("The object " + objectId + " is in the rightmost stack.");
                throw new Interpreter.Error("NYI: checkLoc - leftof");
        }
        else if(relation == "rightof"){
            if(pos[0] = 0)
                throw new Interpreter.Error("The object " + objectId + " is in the leftmost stack.");
            throw new Interpreter.Error("NYI: checkLoc - rightof");
        }
        else if(relation == "inside"){
            throw new Interpreter.Error("NYI: checkLoc - inside");
        }
        else if(relation == "ontop"){
            throw new Interpreter.Error("NYI: checkLoc - ontop");
        }
        else if(relation == "under"){
            if(pos[1] == state.stacks[pos[0]].length-1)
                throw new Interpreter.Error("The object " + objectId + " is the uppermost object of the stack."); 
            throw new Interpreter.Error("NYI: checkLoc - under");
        }
        else if(relation == "beside"){
            throw new Interpreter.Error("NYI: checkLoc - beside");
        }
        else if(relation == "above"){
            if(pos[1] = 0)
                throw new Interpreter.Error("The object " + objectId + " is the lowermost object of the stack.");
            throw new Interpreter.Error("NYI: checkLoc - above");
        }
        else 
            throw new Interpreter.Error("NYI: checkLoc " + loc.rel);


        return false;
    }

    function findObjPos(objectId, state : WorldState) : [number, number]{

        for (var stacknr = 0; stacknr < state.stacks.length; stacknr++) {
            for (var objectnr=0; objectnr < state.stacks[stacknr].length; objectnr++) {
                if(state.stacks[stacknr][objectnr] == objectId){
                    return [stacknr,objectnr];
                }

            }
        }
        return null;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

