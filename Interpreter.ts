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
			if(intprt.intp !== null)
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
    
        var objs : string[] = Array.prototype.concat.apply([], state.stacks,state.holding );
        
        //Draft
        var interp : Literal [][];
        //console.log(+23);
        //console.log(cmd.ent.obj);
        
        //traverseObj(cmd,state,objs,compareWithWorld);
        //console.log(state);
        //console.log("------------------------------------");
        var result :Literal[][] = interpretCmd(cmd,state,objs,compareWithWorld);
		//console.log(result);
		if(result.length <= 0)
		{
			return null;
		}
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
    
    function interpretCmd(cmd : Parser.Command, world : WorldState, wObjs : string[] , func : (obj: Parser.Object, world : WorldState, wObjs : string[]) => any ): Literal[][]
    {
        var res : Literal[][] = [];
        //var lit :Literal = {pol:true,rel : cmd.loc.rel}
        var result : string[]; 
        switch(cmd.cmd)
        {
            case "move":
                result = interpretEnt(cmd.ent,world,wObjs);
                //console.log("after interpret ent ",result);
                if(result.length <= 0)
                {
                    return [];
                }
                var moveTo: string[] = interpretLoc(cmd.loc,world,wObjs);
                console.log("after interloc" , moveTo);
                if(moveTo.length <= 1)
                {
                   return [];
                }
				for(var i = 1; i < moveTo.length; i++)
				{
					res.push([{pol:true,rel:moveTo[0],args:[result[0],moveTo[i]]}]);
				}
                
                break;
            case "take":
                    var result : string[] = interpretEnt(cmd.ent,world,wObjs);
                    if(result.length <= 0)
                    {
                        return [];
                    }
                    
                    res.push([{pol:true,rel:"holding",args:[result[0]]}])
                break;
        }
        //console.log("End of travCoom ", res);
        //console.log(res);
        return res;
    }
    
    function interpretEnt(ent : Parser.Entity, world : WorldState, wObjs : string[]) : string[]
    {
        var res: string[] = [];
        
        if(typeof(ent.quant) !== "undefined")
        {
            //hantera på något sätt
        }
        
        if (typeof (ent.obj) !== "undefined")
        {
            res = res.concat(compareWithWorld(ent.obj,world,wObjs));
        }
        return res; 
    }
    
    function interpretLoc(loc: Parser.Location, world : WorldState, wObjs : string[]): string []
    {
        var res : string[] = [];
        if (typeof(loc.rel) !== "undefined")
        {
            res.push(loc.rel);
        }
        
        if (typeof(loc.ent) !== "undefined")
        {
            res = res.concat(interpretEnt(loc.ent,world,wObjs));
        }
        
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
    
    function compareWithWorld(inobj : Parser.Object, state : WorldState, wObjs : string[]) : string[]
    {
        //console.log("searching for ", obj);
        var obj : Parser.Object;
        var res : string[] =[];
        var otherObjs : string[];
        
        if(inobj.form == 'floor')
        {
			for(var i in state.stacks)
			{
				if(state.stacks[i].length <= 0 )
				{
					res.push("floor-"+i);
				}
			}
			return ['floor'];
        }
        if(typeof(inobj.loc) !== "undefined")
        {
            otherObjs = interpretLoc(inobj.loc, state,wObjs);
            obj= inobj.obj;
            
            //console.log("loc is undefined", obj);
        }
        else
        {
            obj = inobj;
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
                        if(otherObjs == null)
                        {
                            res.push(object);
                        }
                        else
                        {
                            //console.log("inside the loop ", object, "otherObjs are", otherObjs);
                            for(var i in state.stacks)
                            {
                                for(var j in state.stacks[i])
                                {
                                    if(state.stacks[i][j] == object)
                                    {
                                        switch(otherObjs[0])
                                        {
                                            case "rightof":
                                                for(var m : number = 0; m < i; m++)
                                                {
                                                    if(isInColumn(object,m,state))
                                                    {
                                                        res.push(object);
                                                    }
                                                }
                                                break;
                                            case "leftof":
                                                for(var m : number = i+1; m < state.stacks.length; m++)
                                                {
                                                    if(isInColumn(object,i+1,state))
                                                    {
                                                        res.push(object);
                                                    }
                                                }
                                                break;
                                            case 'inside':
                                                otherObjs.forEach((obj2) =>{
                                                    if(state.stacks[i][j-1] == obj2)
                                                    res.push(object);
                                                });
                                                break;
                                            case "ontop":
												//console.log(otherObjs);
												if(otherObjs[1] == 'floor')
												{
													//console.log(j);
													if(j-1 < 0 )
													{
														res.push(object);
													}
												}
                                                else
												{
												otherObjs.forEach((obj2) =>{
													//console.log(obj2);
                                                    if(state.stacks[i][j+1] == obj2)
                                                    res.push(object);
                                                });
												}
                                                break;
                                            case "under":
                                                for(var m : number = 0; m < j; m++)
                                                {
                                                    otherObjs.forEach((obj2) =>{
                                                        if(state.stacks[i][m] == obj2)
                                                        res.push(object);
                                                    });
                                                }
                                                break;    
                                            case "beside":
                                                otherObjs.forEach((obj2) =>{
                                                    if(state.stacks[i][j-1] == obj2)
                                                    res.push(object);
                                                });
                                                otherObjs.forEach((obj2) =>{
                                                    if(state.stacks[i][j+1] == obj2)
                                                    res.push(object);
                                                });
                                                break; 
                                            case "above":
                                                for(var m : number = j+1; m < state.stacks[i].length; m++)
                                                {
                                                    otherObjs.forEach((obj2) =>{
                                                        if(state.stacks[i][m] == obj2)
                                                        res.push(object);
                                                    });
                                                }
                                                break;
                                        }
                                    }
                                }
                            }
                            if(i != 0)
                            {
                                return 0;
                            }
                        
                        }
                        //console.log("found ", object);
                        return res;
                    }
                }
            }
        });
        //console.log("from func " +res);
        return res
    }
    function isInColumn(obj: string, col: number, state:WorldState) : boolean
    {
        var result : boolean = false;
        for (var i in  state.stacks[col]) 
        {
            if(obj == state.stacks[col][i])
            {
                result = true;
            }
        }
        return result; 
    }
    
    
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

