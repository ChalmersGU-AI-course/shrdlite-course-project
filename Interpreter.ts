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
    
        var objs : string[] = Array.prototype.concat.apply([], state.stacks );
        if(state.holding !== null)
            objs.push(state.holding);
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
                //console.log("after interloc" , moveTo);
                if(moveTo.length <= 1)
                {
                   return [];
                }
                if( cmd.ent.quant === "all"){
                    var ls : Literal [] = [];
                    var temp : Literal [] = [];
                    var grej : number = 0;
                    for(var i = 1; i < moveTo.length; i++)
                    {
                        for(var j = 1; j < moveTo.length; j++)
                        {
                            grej = i;
                            for(var o in result)
                            {
                                var l : Literal = {pol:true,rel:moveTo[0],args:[result[o],moveTo[grej]]};
                                if(result[o] !== moveTo[grej] && validateL(l,world))
                                    temp.push(l);
                                grej = j; 
                            }
                            if(result.length <= temp.length)
                                res.push(temp);
                            temp = [];
                        }
                        
                    }
                    console.log("el done");
                    /*for(var t in res)
                        for(var p in res[t])
                            console.log(res[t][p].args);
                    for(var i = 1; i < moveTo.length; i++)
                    {
                        for(var r in result)
                        {
                            var l : Literal = {pol:true,rel:moveTo[0],args:[result[r],moveTo[i]]};
                            if(result[r] !== moveTo[i] && validateL(l,world))
                                ls.push(l);
                        }
                        res.push(ls);
                        ls = [];
                    }*/
                    
                }
                else
                {
                    for(var r in result)
                    {
                        for(var i = 1; i < moveTo.length; i++)
                        {
                            var l : Literal = {pol:true,rel:moveTo[0],args:[result[r],moveTo[i]]};
                            if(result[r] !== moveTo[i] && validateL(l,world))
                                res.push([l]);
                                
                        }
                    }
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
    
    
    function isValidConfig(lits : Literal []) : boolean
    {
        var temp : boolean = true;
        for(var r in lits)
        {
            for(var r2 in lits)
            {
                temp = temp && (!(lits[r] == lits[r2] || lits[r] ==lits[r2]) || r==r2);
            }
        }
        return temp;
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
        //console.log("in cwW", inobj)
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
            
            console.log("loc returned", otherObjs, "   ", obj);
            
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
                            console.log("inside the loop ", object, "otherObjs are", otherObjs);
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
                                                    if(isInColumn(otherObjs,m,state))
                                                    {
                                                        res.push(object);
                                                    }
                                                }
                                                break;
                                            case "leftof":
                                                console.log("asdasdasdasdasd",m, i,state.stacks.length);
                                                for(var m : number = +i+ +1; m < state.stacks.length; m++)
                                                {
                                                    console.log("suff")
                                                    if(isInColumn(otherObjs,m,state))
                                                    {
                                                        res.push(object);
                                                    }
                                                }
                                                break;
                                            case "inside":
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
                                                    if(state.stacks[i][+j+ +1] == obj2)
                                                    res.push(object);
                                                });
                                                break; 
                                            case "above":
                                                for(var m : number = +j + +1; m < state.stacks[i].length; m++)
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
                                //console.log(res);
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
    function isInColumn(obj: string[], col: number, state:WorldState) : boolean
    {
        var result : boolean = false;
        for(var j: number = 1; j < obj.length ; j++)
        {
            for (var i in  state.stacks[col]) 
            {
                console.log("in is column",state.stacks[col][i], "object is", obj[j])
                if(obj[j] === state.stacks[col][i])
                {
                    console.log("in is column",state.stacks[col][i])
                    result = true;
                }
            }
        }
        return result; 
    }
    
    
    function validateL(l : Literal, w: WorldState ) : boolean
    {
        var obj1 = w.objects[l.args[0]];
        var obj2 = w.objects[l.args[1]];
        if((l.rel == "ontop" || l.rel == "inside") && l.args[1] !== "floor")
        {
            //Balls must be in boxes or on the floor, otherwise they roll away.
            if(obj1.form === "ball")
            {
                if(obj2.form !== "box")
                    return false; 
            }
            //Balls cannot support anything.
            if(obj2.form === "ball")
            {
                return false;
            }
            //Small objects cannot support large objects.
            if(obj1.size === "large")
            {
                if(obj2.size !== "large")
                    return false; 
            }
            //Boxes cannot contain pyramids, planks or boxes of the same size.
            if(obj2.form === "box")
            {
                if(obj1.form === "box" || obj1.form === "pyramid" || obj1.form === "plank" )
                {
                    if(obj2.size == obj1.size)
                        return false; 
                }
            }
            //Small boxes cannot be supported by small bricks or pyramids.
            if(obj1.form === "box" && obj1.size === "small")
            {
                if(obj2.size === "small"&&(obj2.form ==="brick"||obj2.form ==="pyramid"))
                    return false; 
            }
            //Large boxes cannot be supported by large pyramids.
            if(obj1.form === "box" && obj1.size === "large")
            {
                if(obj2.size === "large"&& obj2.form ==="pyramid")
                    return false; 
            }
        }
        else if(l.rel === "above" && l.args[1] !== "floor")
        {
        	//Small objects cannot support large objects.
        	if(obj1.size === "large")
        	{
        		if(obj2.size === "small")
        		{
        			return false;
    			}
        	}
        	//No object can be above a ball.
        	if(obj2.form === "ball")
        	{
        		return false;
        	}
        }
        else if(l.rel === "under")
        {
        	//Objects cannot be under the ground.
        	if(l.args[1] === "floor")
        	{
        		return false;
        	}
        	//Small objects cannot support large objects.
        	if(obj1.size === "small")
        	{
        		if(obj2.size === "large")
        		{
        			return false;
        		}
        	}
        	//No object can be above a ball.
        	if(obj1.form === "ball")
        	{
        		return false;
        	}
        }
        
        return true;
    }
    
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

