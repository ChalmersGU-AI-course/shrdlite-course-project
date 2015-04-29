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
        var lit : Literal[][] = [[]];
        if(cmd.cmd === "move" || cmd.cmd === "put"){
            var objs : string[] = interpretEntity(cmd.ent, state);
            var locs : Sayings = interpretLocation(cmd.loc, state);
            var it : number = 0;
            
            for(var i : number = 0; i < objs.length; i++){
                for(var j : number= 0; j< locs.objs.length; j++){
                    lit[it++][0] = {pol: true, rel : locs.rel, args : [objs[i],locs.objs[j]]};
                }
            }
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
        return objs;
    }

    function interpretObject(obj : Parser.Object, state : WorldState) : string[] {
        if(obj.obj != null){
            //Todo :: check loc
            return interpretObject(obj.obj, state);
            
        }else{
            //identify obj from woldstatt-
            if(obj.form === "floor"){
                return ["floor"];
            }
            var objsindexes : string[] = Array.prototype.concat.apply([], state.stacks);
            if(obj.size != null){
                objsindexes = objsindexes.filter(e=> state.objects[e].size === obj.size);
            }
            if(obj.form != null){
                objsindexes = objsindexes.filter(e=> state.objects[e].form === obj.form);
            }
            if(obj.color != null){
                objsindexes = objsindexes.filter(e=> state.objects[e].color === obj.color);
            }
            return objsindexes;
        }
    }

    function interpretLocation(loc : Parser.Location, state : WorldState) : Sayings {
        return {rel:loc.rel, objs:interpretEntity(loc.ent, state)};
    }



    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

