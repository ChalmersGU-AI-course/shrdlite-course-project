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
            if(interpretations.length>1){
                throw new Interpreter.Error("Found ambiguous interpretations");
            }
            return interpretations;
        } else {
            throw new Interpreter.Error("Found no interpretation");
        }
    }


    export interface Result extends Parser.Result {intp:Literal[][];}
    export interface Literal {pol:boolean; rel:string; args:string[];}
    interface Sayings {rel:string; objs:string[]};

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
        var lit : Literal[][] = [[]];
        if(cmd.cmd === "move" || cmd.cmd === "put"){
            var objs : string[];
            if(cmd.cmd === "put"){
                if(state.holding === null){
                    return lit;
                    //TODO: Throw error?
                }
                objs = [state.holding];
            } else{
                objs = interpretEntity(cmd.ent, state);
            }
            var locs : Sayings = interpretLocation(cmd.loc, state);
            var physics : {keys:string[] ;locs: {[s:string]: string[]}} = checkPhysics(true, objs, locs, state);
            objs = physics.keys;

            //Only place we know which object to put where
            var it : number = 0;
            for(var i : number = 0; i < objs.length; i++){
                for(var j : number= 0; j< physics.locs[objs[i]].length; j++){
                    lit[it] = [];
                    //TODO:: AND between interpretations
                    lit[it++][0] = {pol: true, rel : locs.rel, args : [objs[i],physics.locs[objs[i]][j]]};    
                }
            }
            //check if valid.
            return lit;    
        } else {
            var objs : string[] = interpretEntity(cmd.ent, state);
            for(var i : number = 0; i < objs.length; i++){
                lit[i] = [];
                lit[i][0] = {pol: true, rel : "holding", args : [objs[i]]};   
            }
            return lit;
        }
    }

    function interpretEntity(ent : Parser.Entity, state : WorldState) : string[] {
        //Assuming only single objects. 
        //TODO: quant == all, any.
        var objs : string[] = interpretObject(ent.obj, state);
        //TODO Check quantifier
        return objs;
    }




    function interpretObject(obj : Parser.Object, state : WorldState) : string[] {
        
        if(obj.obj != null){
            var objs : string[] = interpretObject(obj.obj, state);
            var locs : Sayings = interpretLocation(obj.loc, state);
            var physics : {keys:string[] ;locs: {[s:string]: string[]}} = checkPhysics(false,objs, locs, state);
            objs = physics.keys;
            return objs;
        }else{
            var objsindexes : string[] = Array.prototype.concat.apply([], state.stacks);
            if(obj.form === "floor"){
                return ["floor"];
            }
            if(obj.size !== null ){
                objsindexes = objsindexes.filter(e=> state.objects[e].size === obj.size);
            }
            if(obj.color !== null){
                objsindexes = objsindexes.filter(e=> state.objects[e].color === obj.color);
            }
            if(obj.form !== "anyform"){
                objsindexes = objsindexes.filter(e=> state.objects[e].form === obj.form);
            } else if (obj.size === null && obj.color === null) {
                objsindexes.push("floor");
            }
            return objsindexes;
        }
    }

    function interpretLocation(loc : Parser.Location, state : WorldState) : Sayings {
        var locs : Sayings = {rel:loc.rel, objs:interpretEntity(loc.ent, state)}
        return locs;
    }


    function checkPhysics(futureState: boolean, objs : string[], locs : Sayings, state : WorldState) : {keys:string[] ;locs: {[s:string]: string[]}} {
        var result : {keys:string[] ;locs: {[s:string]: string[]}} = {"keys" : [] , "locs": {}}; 
        for(var i : number = 0; i < objs.length;i++){
            var sayingsI : string[] = [];
            for(var j : number = 0; j < locs.objs.length; j++){
                var works : boolean = false;
                //can't place the same object on itself
                if(locs.objs[j]===objs[i]){
                    continue;
                }
                if(locs.rel === "ontop"){
                   if(locs.objs[j] === "floor"){
                        works = futureState || state.stacks.some(e => e.indexOf(objs[i]) === 0);
                        
                    } else{
                        works = futureState ||state.stacks.some(e => isOntop(e, locs.objs[j],objs[i]));
                        works = works && formCorrectlyOnTop(locs.objs[j],objs[i], state);
                        works = works && smallOnTopOfLarge(locs.objs[j],objs[i], state);
                    }   
                } else if(locs.rel === "inside"){
                    if(locs.objs[j] !== "floor"){
                        works = futureState ||state.stacks.some(e => isOntop(e, locs.objs[j],objs[i]));
                        works = works && formCorrectlyInside(locs.objs[j],objs[i], state);
                    }  
                } else if(locs.rel === "beside"){
                    if(locs.objs[j] !== "floor"){
                        works = futureState || Math.abs(checkHorizontalDistance(state.stacks ,objs[i], locs.objs[j])) == 1
                    }
                } else if(locs.rel === "rightof"){
                    if(locs.objs[j] !== "floor"){
                        works = futureState || checkHorizontalDistance(state.stacks ,objs[i], locs.objs[j]) >= 1
                    }
                } else if(locs.rel === "leftof"){
                    if(locs.objs[j] !== "floor"){
                        works = futureState || checkHorizontalDistance(state.stacks ,objs[i], locs.objs[j]) <= -1
                    }
                } else if(locs.rel === "above"){
                    if(locs.objs[j] === "floor"){
                        works = futureState || state.stacks.some(e => e.indexOf(objs[i]) >= 0);
                    } else{
                        works = futureState || state.stacks.some(e => isAbove(e, locs.objs[j],objs[i]));
                        works = works && notAboveBall(locs.objs[i], state);
                        works = works && smallOnTopOfLarge(locs.objs[j],objs[i], state);
                    } 
                } else if(locs.rel === "under"){
                    if(locs.objs[j] !== "floor"){
                        works = futureState || state.stacks.some(e => isAbove(e, objs[i], locs.objs[j]));
                        works = works && notAboveBall(objs[i], state);
                        works = works && smallOnTopOfLarge(objs[i], locs.objs[j], state);
                    } 
                } 
                if(works){
                    sayingsI.push(locs.objs[j]);
                }
            }
            if(sayingsI.length>0){
                result.keys.push(objs[i]);
                result.locs[objs[i]] = sayingsI;
            }
        }
        return result;
    }

    function getindexOfObject(stacks : string[][], obj : string) : number[] {
        for(var i = 0; i<stacks.length; i++){
            var index = stacks[i].indexOf(obj);
            if(index > -1){
                return [i,index];
            }
        }
        return [-1,-1];
    }

    //Keep this or change inside and ontop to depenid on context?
    function formCorrectlyInside(locationObject : string, object : string, state : WorldState) : boolean {
        if(object === "floor"){
            return false;
        }
        //boxes cannot contain pyramids, planks, or boxes of same size
        var locForm : string = state.objects[locationObject].form;
        var locSize : string = state.objects[locationObject].size;
        var objForm : string = state.objects[object].form;
        var objSize : string = state.objects[object].size;
        if(locationObject !== "floor" && locForm === "box"){
            if(objForm === "ball"){
                return true;
            }
            if(locSize === "small"){
                return false;
            } 
            return objSize === "small";
        }
        return false;   
    }

    function formCorrectlyOnTop(locationObject : string, object : string, state : WorldState) : boolean {
        if(object === "floor"){
            return false;
        }
        if(locationObject === "floor"){
            return true;
        }
        var objForm : string = state.objects[object].form;
        var objSize : string = state.objects[object].form;
        var locForm : string = state.objects[locationObject].form;
        var locSize : string = state.objects[locationObject].form;
        if(locForm === "box"){
            return false;
        }
        if(objForm === "ball"){
            return false;
        }
        if(objForm === "box"){
        //Small boxes cannot be supportet by small bricks or pyramids
        //Large boxes cannot be supported by large pyramids
            if(objSize === "small"){
                return !((locForm === "brick" || locForm === "pyramid") && locSize === "small");
            }
            return !(locForm === "pyramid");
        }
        return notAboveBall(locationObject,state);

    }

    function notAboveBall(bottomObject : string, state : WorldState) :boolean {
       return bottomObject === "floor" || state.objects[bottomObject].form !== "ball";
    }


    function smallOnTopOfLarge(bottomObject : string, topObject : string, state : WorldState) : boolean {
        if(topObject === "floor"){
            return false;
        }
        var topSize : string  = state.objects[topObject].size;
        var bottomSize : string = state.objects[bottomObject].size;
        if(bottomSize === "large") {
            return true;
        }
        return topSize === "small";
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);

    }

    function isOntop(stack: string[], bottom : string, top : string) : boolean{
        var bottomIndex = stack.indexOf(bottom);
        var topIndex = stack.indexOf(top);
        return bottomIndex >=0 && topIndex >=0 && topIndex - bottomIndex === 1;
    }
    function isAbove(stack: string[], bottom : string, top : string) : boolean{
        var bottomIndex = stack.indexOf(bottom);
        var topIndex = stack.indexOf(top);
        return bottomIndex >=0 && topIndex >=0 && topIndex - bottomIndex > 0;
    }

    function checkHorizontalDistance(stacks: string[][], obj : string, locObj : string) : number{
        var indexLoc : number = getindexOfObject(stacks, locObj)[0];
        var indexobj : number = getindexOfObject(stacks, obj)[0];
        if(indexLoc>=0 && indexobj>=0 ){
            return indexobj - indexLoc;
        } 
        throw("if this happens... everything is broken. :(");
        return 0;
    }
}

