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
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        //var obj : string []  = List of objects mentiond in cmd 
        
        //Draft
        var interp : Literal [][];
        console.log(+23);
        //console.log(cmd.ent.obj);
        if (searchObj(cmd.ent.obj,state,objs) == 1)
        {
            console.log("found all objects");
        }
        else 
        {
            console.log("did not find requested objects");
        }

        
        
        var a = objs[getRandomInt(objs.length)];
        var b = objs[getRandomInt(objs.length)];
        var intprt : Literal[][] = [[
            {pol: true, rel: "ontop", args: [a, "floor"]},
            {pol: true, rel: "holding", args: [b]}
        ]];
        return intprt;
    }
    
    function searchObj(cmd : Parser.Object, state : WorldState,objs : string[]) : number
    { 
        console.log(cmd.obj);
        var res :number = 0;
        objs.forEach((object) => {
            var temp : ObjectDefinition = state.objects[object];
            console.log(temp.form + "    " + cmd.obj.form);
            if(temp.form == cmd.obj.form || cmd.obj.form == null || cmd.obj.form == 'anyform'|| cmd.obj.form == 'floor')
            {   console.log(temp.size + "    " + cmd.obj.size);
                if(temp.size == cmd.obj.size || cmd.obj.size == null)
                {console.log(temp.color + "    " + cmd.obj.color);
                    if(temp.color == cmd.obj.color || cmd.obj.color == null)
                    {
                        if (typeof cmd.loc !== 'undefined') 
                        {
                            console.log("jumping to next level");
                            res = searchObj(cmd.loc.ent,state,objs);
                            console.log("result from bottom level " +res);
                        }
                        if(res == -1)
                        {
                            console.log("fail in loop");
                            return -1;
                        }
                        console.log("exit success");
                        return 1;
                    }
                }
            }
        });
        //console.log(cmd);
        return -1;
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

