///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
        parses.forEach((parseresult) => {
            var intprt : Result = <Result>parseresult;
            console.log("\nInput is :"+parseresult.input);
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
        console.log(cmd+'\n');
        if(cmd.cmd === "move"){
            var objs : string[] = interpretEntity(cmd.ent, state);
            var locs : {rel:string, objs:string[]} = interpretLocation(cmd.loc, state);
            var lit : Literal[][] = [[]];
            var it : number = 0;
            for(int i = 0; i< objs.length; i++){
                for(int j = 0; j< locs.objs.length; j++){
                    lit[it++][0] = {pol: true, rel: locs.rel¸[objs[i],locs.objs[j]]};
                }
            }
            //check if valid.
            return lit;    
        } 
        else if (cmd.cmd === "put"){
            //Liknande. TODO
        }
        else{
            //Liknande. TODO
        }
        
        // This returns a dummy interpretation involving two random objects in the world
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        var a = objs[getRandomInt(objs.length)];
        var b = objs[getRandomInt(objs.length)];
        var intprt : Literal[][] = [[
            {pol: false, rel: "ontop", args: [a, "floor"]},
            {pol: false, rel: "holding", args: [b]}
        ]];
        return intprt;
    }

    function interpretEntity(ent : Parser.Entity, state : WorldState) : string[] {
        //Assuming only single objects. 
        //TODO: quant == all, any.
        var objs : string[] = interpretObject(ent.obj, state);
        return objs;
        //console.log(ent+'\n');
        //if(ent.obj != null){
        //    interpretObject(ent.obj, state);
        //}

        //return null;
    }

    function interpretObject(obj : Parser.Object, state : WorldState) : string[] {
        console.log(obj+'\n');
        if(obj.obj != null){
            //check loc
            interpretObject(obj.obj, state);
        }else{
            //identify obj from woldstatt-
            if(obj.form === "floor"){
                return ["floor"];
            }
            var objs : string[]= state.objects;
            var objsindexes : string[] = Array.prototype.concat.apply([], state.stacks);

            objs = state.objects.filter(e=> e.size === obj.size).filter(e=> e.form === obj.form).filter(e=> e.color === obj.color);


        }
    }
    function interpretLocation(loc : Parser.Location, state : WorldState) : {rel: string, objs: string[]} {
        console.log(loc+'\n');
        if(loc.ent != null){
            interpretEntity(loc.ent, state);
        }
        return null;
    }



    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

