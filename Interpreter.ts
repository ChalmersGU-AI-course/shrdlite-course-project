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
        if (interpretations.length==1) {
            return interpretations;
        } 
        else if(interpretations.length>1){
            throw new Interpreter.Error("I found more than one interpretation");
        }
        else {
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
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        var a = objs[getRandomInt(objs.length)];
        var b = objs[getRandomInt(objs.length)];
        var intprt : Literal[][] = [[
            {pol: true, rel: "ontop", args: [a, "floor"]},
            {pol: true, rel: "holding", args: [b]}
        ]];
        return intprt;
    }

    function interpretEntity(ent: Parser.Entity, state: WorldState): string[][]{
        var objects: string[] = interpretObject(ent.obj, state);
        if(ent.quant == "any"){
            var output = [];
            for (var i = 0; i < objects.length;i++){
                output[i] = [objects[i]];
            }
            return output;
        }
        else if(ent.quant == "the"){
            if(objects.length>1){
                return null;
            }
            else{
                return [objects];
            }
        }
        else if(ent.quant == "all"){
            return [objects];
        }
    }

    function interpretObject(obj: Parser.Object, state: WorldState): string[]{

    }

    function getObjectsFromDescription(size: string, color: string, form: string, state: WorldState): string[]{
        var objNames : string[] = Array.prototype.concat.apply([], state.stacks);
        var objectsFromDescription = [];
        for (var i = 0; i < objs.length;i++){
            var currentObjectDescription = state.objects(objNames[i]);
            if(objectFulfillsDescription(currentObjectDescription,size,color,form)){
                objectsFromDescription.push(objNames[i]);
            }
        }
        return objNames;
    }

    function objectFulfillsDescription(objDef: ObjectDefinition, size: string, color: string, form: string): boolean{
        var objOk = (objDef.form==form);
        if(size){
            objOk = objOk && (objDef.size == size);
        }
        if(color){
            objOk = objOk && (objDef.color == color);
        }
        return objOk;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

