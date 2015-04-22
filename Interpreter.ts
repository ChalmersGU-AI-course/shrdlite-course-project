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
    
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        
        //Draft
        var interp : Literal [][];
        //console.log(+23);
        //console.log(cmd.ent.obj);
        
        //traverseObj(cmd,state,objs,compareWithWorld);
        
        var result :Literal[][] = traverseCommand(cmd,state,objs,compareWithWorld);
        /*var failureVar : number = 0;
        for(var i in result)
        {
            if (result[i] == "")
                failureVar = -1;
        }
        if (failureVar != -1)
        {
            console.log(result);
            console.log("found all requested objects");
        }
        else 
        {
            console.log("did not find requested objects");
        }
        
        */
        
        var a = objs[getRandomInt(objs.length)];
        var b = objs[getRandomInt(objs.length)];
        var intprt : Literal[][] = [[
            {pol: true, rel: "ontop", args: [a, "floor"]},
            {pol: true, rel: "holding", args: [b]}
        ]];
        return result;//intprt;
    }
    
    function traverseCommand(cmd : Parser.Command, world : WorldState, wObjs : string[] , func : (obj: Parser.Object, world : WorldState, wObjs : string[]) => any ): Literal[][]
    {
        var res : Literal[][] = [[]];
        //var lit :Literal = {pol:true,rel : cmd.loc.rel}
        switch(cmd.cmd)
        {
            case "move":
                if(typeof(cmd.ent) !== "undefined")
                {
                    var ret : string[] = traverseEnt(cmd.ent,world,wObjs,func);
                    var arg : string[] = [];
                    for(var i = 1;i < ret.length; i++)
                    {
                        arg.push(ret[i]);
                    }
                    res[0].push( {pol:true,rel:ret[0],args:arg});
                    //console.log("after traverse ent res= ", res);
                }
                if(typeof(cmd.loc) !== "undefined")
                {
                    var ret : string[] = traverseEnt(cmd.loc.ent,world,wObjs,func)
                    console.log("dfdfdfdf ", ret);
                    var arg : string[] = [];
                    arg.push(res[0][res.length-1].args[res[0][res.length-1].args.length -1]);
                    arg.push(ret[0]);
                    res[0] = res[0].concat({pol:true,rel:cmd.loc.rel,args:arg});
                }
                break;
            case "take":
                    res[0].push({pol:true,rel:"holding",args:traverseEnt(cmd.ent,world,wObjs,func)});
                break;
        }
        //console.log("End of travCoom ", res);
        return res;
    }
    
    function traverseEnt(ent : Parser.Entity, world : WorldState, wObjs : string[] , func : (obj: Parser.Object, world : WorldState, wObjs : string[]) => any ): string[]
    {
        var res : string[] = [];
        //console.log("---------------------");
        //console.log(ent);
        //console.log("---------------------");
        
        if (typeof(ent.obj.obj) !== "undefined")
        {
            //console.log("found an object object");
            //console.log(ent.obj.obj);
            
            if(typeof(ent.obj.loc) !== "undefined")
            {
                res.push(ent.obj.loc.rel)
            }
            res.push( func(ent.obj.obj,world,wObjs));
            
            //
            res = res.concat(traverseEnt(ent.obj.loc.ent,world,wObjs, func));
            
            console.log("asdasdasd " ,res);
        }
        else if (typeof(ent.obj) !== "undefined")
        {
            //console.log("found an object");
            //console.log(ent.obj);
            res.push(func(ent.obj,world,wObjs));
        }
        
        console.log("End of travEnt ", res);
        return res;
    }
    
    
    function compareWithWorld(obj : Parser.Object, state : WorldState, wObjs : string[]) : string
    {
        //console.log("searching for ", obj);
        var res : string = "";
        if(obj.form == 'floor')
        {
            return "floor";
        }
        wObjs.forEach((object) => {
            var temp : ObjectDefinition = state.objects[object];
            //console.log(object);
            if(temp.form == obj.form || obj.form == null || obj.form == 'anyform')
            {   //console.log(temp.size + "    " + cmd.obj.size);
                if(temp.size == obj.size || obj.size == null || temp.size == obj.size)
                {//console.log(temp.color + "    " + cmd.obj.color);
                    if(temp.color == obj.color || obj.color == null )
                    {
                        res = object;
                        //console.log("found ", object);
                        return res;
                    }
                }
            }
        });
        //console.log("from func " +res);
        return res
    }
    
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

