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
        console.log(":::::::::::NEW INTERPRETATION:::::::::::::");
        var lit : Literal[][] = [[]];
        if(cmd.cmd === "move" || cmd.cmd === "put"){
            var objs : string[] = interpretEntity(cmd.ent, state);
            var locs : Sayings = interpretLocation(cmd.loc, state);
            objs = checkPhysics(objs, locs, state);
            //TODO:: CHECK PHYSICS
            //Only place we know which object to put where
            var it : number = 0;
            for(var i : number = 0; i < objs.length; i++){
                for(var j : number= 0; j< locs.objs.length; j++){
                    lit[it] = [];
                    //TODO:: AND between interpretations
                    lit[it++][0] = {pol: true, rel : locs.rel, args : [objs[i],locs.objs[j]]};    
                }

            }

            console.log("yolo");
            //check if valid.
            return lit;    
        }
        else{
            var objs : string[] = interpretEntity(cmd.ent, state);
            for(var i : number = 0; i < objs.length; i++){
                    //lit[i][0] = {pol: false, rel : ontop, args : [objs[i],]};
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
        //console.log(ent+": "+ objs.length);
        
        return objs;
    }

    function filterOntop(stack: string[], bottom : string, top : string) : boolean{
        //if not in stack indexOf returns -1.
        var bottomIndex = stack.indexOf(bottom);
        var topIndex = stack.indexOf(top);
        return bottomIndex >=0 && topIndex >=0 && topIndex - bottomIndex === 1;
    }
    function filterAbove(stack: string[], bottom : string, top : string) : boolean{
        //if not in stack indexOf returns -1.
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

    function getindexOfObject(stacks : string[][], obj : string) : number[] {
        for(var i = 0; i<stacks.length; i++){
            var index = stacks[i].indexOf(obj);
            if(index > -1){
                return [i,index];
            }
        }
        return [-1,-1];
    }


    function interpretObject(obj : Parser.Object, state : WorldState) : string[] {
        
        if(obj.obj != null){
            var objs : string[] = interpretObject(obj.obj, state);
            var locs : Sayings = interpretLocation(obj.loc, state);
            objs = checkPhysics(objs, locs, state);
            return objs;
        }else{
            var objsindexes : string[] = Array.prototype.concat.apply([], state.stacks);
            if(obj.form === "floor"){
                return ["floor"];
            }
            //console.log("prefilter:"+objsindexes.length);
            if(obj.size != null ){
                objsindexes = objsindexes.filter(e=> state.objects[e].size === obj.size);
            }
            //console.log("afterfilersize: "+objsindexes.length);
            if(obj.form !== "anyform"){
                objsindexes = objsindexes.filter(e=> state.objects[e].form === obj.form);
            } else {
                objsindexes.push("floor");
            }
            //console.log("afterfilerform: "+objsindexes.length);
            if(obj.color != null){
                objsindexes = objsindexes.filter(e=> state.objects[e].color === obj.color);
            }
            //console.log("afterfilercolor: "+objsindexes.length);
            return objsindexes;
        }
    }

    function interpretLocation(loc : Parser.Location, state : WorldState) : Sayings {
        var locs : Sayings = {rel:loc.rel, objs:interpretEntity(loc.ent, state)} 
        return locs;
    }

    function checkPhysics(objs : string[], locs : Sayings, state : WorldState) : string[] {
        //TODO: Physical limitations
            //TODO: relation to self.
            //TODO: MAYBE handle ball in box or floor.
            //TODO: handle box's contents size.
        //WÄRVIK: Handle physics where intepretEntity is called
                for(var i : number = 0; i < objs.length;i++){
                    var works : boolean = false;
                    for(var j : number = 0; j < locs.objs.length && !works; j++){
                        if(locs.rel === "ontop"){
                           if(locs.objs[j] === "floor"){
                                works = state.stacks.some(e => e.indexOf(objs[i]) === 0);
                            } else{
                                works = state.stacks.some(e => filterOntop(e, locs.objs[j],objs[i]));
                                works = works && formCorrectlyOnTop(locs.objs[j],objs[i], state);
                                works = works && smallOnTopOfLarge(locs.objs[j],objs[i], state);
                                
                            }   
                        } else if(locs.rel === "inside"){
                            if(locs.objs[j] !== "floor"){
                                works = state.stacks.some(e => filterOntop(e, locs.objs[j],objs[i]));
                                works = works && formCorrectlyInside(locs.objs[j],objs[i], state);

                            }  
                        } else if(locs.rel === "beside"){
                            if(locs.objs[j] !== "floor"){
                                works = Math.abs(checkHorizontalDistance(state.stacks ,objs[i], locs.objs[j])) == 1
                            }
                        } else if(locs.rel === "rightof"){
                            if(locs.objs[j] !== "floor"){
                                works = checkHorizontalDistance(state.stacks ,objs[i], locs.objs[j]) >= 1
                            }
                        } else if(locs.rel === "leftof"){
                            if(locs.objs[j] !== "floor"){
                                works = checkHorizontalDistance(state.stacks ,objs[i], locs.objs[j]) <= -1
                            }
                        } else if(locs.rel === "above"){
                            if(locs.objs[j] === "floor"){
                                works = state.stacks.some(e => e.indexOf(objs[i]) >= 0);
                            } else{
                                works = state.stacks.some(e => filterAbove(e, locs.objs[j],objs[i]));
                                works = works && notAboveBall(locs.objs[i], state);
                                works = works && smallOnTopOfLarge(locs.objs[j],objs[i], state);
                            } 
                        } else if(locs.rel === "under"){
                            if(locs.objs[j] !== "floor"){
                                works = state.stacks.some(e => filterAbove(e, objs[i], locs.objs[j]));
                                works = works && notAboveBall(objs[i], state);
                                works = works && smallOnTopOfLarge(objs[i], locs.objs[j], state);
                            } 
                        } 
                    }
                    if(!works){
                        objs.splice(i--,1);
                    }
                }

            //if rel === ontop index obj == index loc+1 && same column
            //if rel === above index of obj > loc && same column
            //if rel === nextto     not same column. obj.column == loc.column -(or+) 1
               
            //Todo :: check loc

        //Have it like this or make multiple functions as in relational check?
        return objs;

    }


    //Keep this or change inside and ontop to depenid on context?
    function formCorrectlyInside(locationObject : string, object : string, state : WorldState) : boolean {
        //boxes cannot contain pyramids, planks, or boxes of same size
        var locForm : string = state.objects[locationObject].form;
        var locSize : string = state.objects[locationObject].size;
        var objForm : string = state.objects[object].form;
        var objSize : string = state.objects[object].size;
        if(locForm === "box"){
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
        var objForm : string = state.objects[object].form;
        var objSize : string = state.objects[object].form;
        var locForm : string = state.objects[object].form;
        var locSize : string = state.objects[object].form;
        if(locationObject !== "floor" && state.objects[locationObject].form === "box"){
            return false;
        }
        if(objForm === "ball"){
            return locationObject === "floor";
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
        var topSize : string  = state.objects[topObject].size;
        var bottomSize : string = state.objects[bottomObject].size;
        if(bottomSize === "large") {
            return topSize === "large";
        }
        return topSize === "small";
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    
    }

}

