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
            // If the interpretation is null, the command in the parse tree is impossible to follow
            // and the interpretation is "dropped".
            if(intprt.intp != null)
                interpretations.push(intprt);
        });
        // If the utterance can be parsed into to several possible interpretations, it is ambiguous
        // and the user can try again to be more specific.
        if (interpretations.length > 1) {
            throw new Interpreter.Error("Your utterance was ambiguous, please be more specific!");
        } else if (interpretations.length){
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

    /**
        Finds the interpretation of a given parse tree.
    */
    function interpretCommand(cmd : Parser.Command, state : WorldState) : Literal[][] {

        // If the command is to pick something up, we find every object that fits the description
        // and gives the command to pick the first one up. If no object is found, return null.
        if(cmd.cmd == "take"){
            var ids = identifyObj(cmd.ent.obj, state);
            if(ids.length == 0) 
                return null;
            var intprt : Literal[][] = [[
                {pol: true, rel: "holding", args: [ids[0]]}
            ]];
        }
        // If the command is to put the current held object down at a given location, we find every
        // location that fits the description and drops the object at the first we found. Returns 
        // null if no locations were found or if the arm does not hold anything.
        else if (cmd.cmd == "put"){
            var ids = identifyObj(cmd.loc.ent.obj, state);
            if(ids.length == 0 || state.holding == null) 
                return null;
            var intprt : Literal[][] = [[
                {pol: true, rel: cmd.loc.rel, args: [state.holding, ids[0]]}
            ]];
            
        }
        // If the command is to move an object to a certain location, we try to find every object that fits
        // the description, returns null if none were found. Then we search for all locations that fits the
        // given description, return null if none were found. After that we drop the first found object at
        // the first found location.
        else if (cmd.cmd == "move"){
            var srcIds = identifyObj(cmd.ent.obj, state);
            if(srcIds.length == 0) 
                return null;
            var dstIds = identifyObj(cmd.loc.ent.obj, state);
            if(dstIds.length == 0) 
                return null;

            var intprt : Literal[][] = [[
                {pol: true, rel: cmd.loc.rel, args: [srcIds[0], dstIds[0]]}
            ]];        
        }
        else
            throw new Interpreter.Error("NYI: CMD " + cmd.cmd);

        return intprt;
    }

    /**
        Searches through the stacks to find every object that conforms to the given specifications and returns
        the IDs.
    */
    function identifyObj(object : Parser.Object, state : WorldState){
        var ids = [];
        // If object does not contain any further constraints (objects and locations), it contains the description
        // of the object itself.
        if(object.obj == null){
            var size = object.size;
            var color = object.color;
            var form = object.form;

            // The floor object is handeld separately.
            if(form == "floor") ids.push("floor");

            // Since we do not care where the object is, only if it exists, we can concat all stacks
            // and iterate through that instead of iterating through every stack. 
            var objs : string[] = Array.prototype.concat.apply([], state.stacks);

            for(var i = 0; i < objs.length; i++){
                var currentObj = state.objects[objs[i]];
                if((currentObj.form == form || form == "anyform") && 
                    (currentObj.color == color || color == null) && 
                    (currentObj.size == size || size == null)){
                    ids.push(objs[i]);
                }
            }           
        }
        // Find every object that conforms to the given constraints inlcuded in object and location.
        else{
            var objIds = identifyObj(object.obj, state);
            for(var i = 0; i < objIds.length; i++){
                if(checkLoc(objIds[i], object.loc, state)){
                    ids.push(objIds[i]);
                }
            }
        }

        return ids;
    }

    /**
        Checks if an object with the given Object ID conforms to a location (a relation to another object)
    */
    function checkLoc(objectId, loc : Parser.Location, state : WorldState) : boolean{

        // The relation to the object
        var relation = loc.rel;
        // The postion of the object
        var pos : [number, number] = findObjPos(objectId, state);
        // The result, which per default is false.
        var res : boolean = false;

        // Iterates through every location that fits the description of the given location.
        var ids = identifyObj(loc.ent.obj, state);
        ids.forEach( id => {
            // The position of the found location
            var lpos : [number, number] = findObjPos(id, state);

            if(relation == "leftof"){
                if(pos[0] < lpos[0])
                    res = true;
            }
            else if(relation == "rightof"){
                if(pos[0] > lpos[0])
                    res = true;
            }
            else if(relation == "inside"){
                if(pos[0] == lpos[0] && pos[1] == lpos[1] + 1)
                    res = true;
            }
            else if(relation == "ontop"){
                // The floor object is "in" all stacks
                if((pos[0] == lpos[0] || lpos[0] == -1) && pos[1] == lpos[1] + 1)
                    res = true;   
            }
            else if(relation == "under"){
                if(pos[0] == lpos[0] && pos[1] < lpos[1])
                    res = true;
            }
            else if(relation == "beside"){
                if(pos[0] == lpos[0] + 1 || pos[0] == lpos[0] - 1)
                    res = true;
            }
            else if(relation == "above"){
                // The floor object is "in" all stacks
                if((pos[0] == lpos[0] || lpos[0] == -1) && pos[1] > lpos[1])
                    res = true;
            }
            else 
                throw new Interpreter.Error("NYI: checkLoc " + loc.rel);

        });
        return res;
    }
    /**
        Returns the postion of an object with the given object ID as [stack number, stack altitude].
    */
    function findObjPos(objectId, state : WorldState) : [number, number]{

        // The floor "object" is handled separately
        if(objectId == "floor")
            return [-1,-1];

        // Iterates through the stacks until the given Object ID is found.
        for (var stacknr = 0; stacknr < state.stacks.length; stacknr++) {
            for (var objectnr=0; objectnr < state.stacks[stacknr].length; objectnr++) {
                if(state.stacks[stacknr][objectnr] == objectId){
                    return [stacknr,objectnr];
                }

            }
        }
        // If no object matches the given Object ID, null is returned.
        return null;
    }

    //function getRandomInt(max) {
    //    return Math.floor(Math.random() * max);
    //}

}

        // This returns a dummy interpretation involving two random objects in the world
      /*  var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        var a = objs[getRandomInt(objs.length)];
        var b = objs[getRandomInt(objs.length)];
        var intprt : Literal[][] = [[
            {pol: true, rel: "ontop", args: [a, "floor"]},
            {pol: true, rel: "holding", args: [b]}
        ]]; */