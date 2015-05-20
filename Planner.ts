///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="AStar.ts"/>

module Planner {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretations : Interpreter.Result[], currentState : WorldState) : Result[] {
        var plans : Result[] = [];
        interpretations.forEach((intprt) => {
            var plan : Result = <Result>intprt;
            plan.plan = planInterpretation(plan.intp, currentState);
            plans.push(plan);
        });
        if (plans.length) {
            return plans;
        } else {
            throw new Planner.Error("Found no plans");
        }
    }


    export interface Result extends Interpreter.Result {plan:string[];}


    export function planToString(res : Result) : string {
        return res.plan.join(", ");
    }


    export class Error implements Error {
        public name = "Planner.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }


    //////////////////////////////////////////////////////////////////////
    // private functions


	// state changing functions
	function moveRight(world: WorldState) : [WorldState,string]
	{
        if(world.arm < world.stacks.length-1)
		{
            return [{stacks:world.stacks,holding:world.holding, arm:world.arm+1,objects:world.objects,examples:world.examples},"r"];
        }
        return null;
	}
	function moveLeft(world: WorldState) : [WorldState,string]
	{
        if(world.arm > 0)
		{
            return [{stacks:world.stacks,holding:world.holding, arm:world.arm-1,objects:world.objects,examples:world.examples},"l"];
        }
        return null;
	}
	function pickup(world:WorldState) : [WorldState,string]
	{
        if(world.holding == null)
        {
            if(world.stacks[world.arm].length !== 0)
            {
                var arr : string[][] = world.stacks.slice();
                for (var i = 0 ; i < world.stacks.length; i++)
                {
                    arr[i] = world.stacks[i].slice();
                }
                var hold = arr[world.arm].pop();
                
                return [{stacks:arr,holding:hold,arm:world.arm,objects:world.objects,examples:world.examples},"p"];
            }
        }
        return null;
	}
	function putdown(world:WorldState) : [WorldState,string]
	{
        if(world.holding !== null)
        {
            if(world.holding !== "" )
            {
                //console.log(world);
                if(putdownRules(world))
                {
                    var arr = world.stacks.slice();
                    for (var i = 0 ; i < world.stacks.length; i++)
                    {
                        arr[i] = world.stacks[i].slice();
                    }
                    arr[world.arm].push(world.holding);
                    
                    return [{stacks:arr, holding:null,arm:world.arm,objects:world.objects,examples:world.examples},"d"];
                }
            }
            return null;
        }
        return null;
	}
    
    function putdownRules(w : WorldState) : boolean
    {
        if(w.stacks[w.arm].length !== 0)
        {
            var topObj : string = w.stacks[w.arm][w.stacks[w.arm].length-1]; 
            var topObjDef : ObjectDefinition = w.objects[topObj];
            
            var holding : string = w.holding;
            var holdingDef : ObjectDefinition = w.objects[holding];
            
            //Balls must be in boxes or on the floor, otherwise they roll away.
            if(holdingDef.form === "ball")
            {
                if(topObjDef.form !== "box")
                    return false; 
            }
            //Balls cannot support anything.
            if(topObjDef.form === "ball")
            {
                return false;
            }
            //Small objects cannot support large objects.
            if(holdingDef.size === "large")
            {
                if(topObjDef.size !== "large")
                    return false; 
            }
            //Boxes cannot contain pyramids, planks or boxes of the same size.
            if(topObjDef.form === "box")
            {
                if(holdingDef.form === "box" || holdingDef.form === "pyramid" || holdingDef.form === "plank" )
                {
                    if(topObjDef.size == holdingDef.size)
                        return false; 
                }
            }
            //Small boxes cannot be supported by small bricks or pyramids.
            if(holdingDef.form === "box" && holdingDef.size === "small")
            {
                if(topObjDef.size === "small"&&(topObjDef.form ==="brick"||topObjDef.form ==="pyramid"))
                    return false; 
            }
            //Large boxes cannot be supported by large pyramids.
            if(holdingDef.form === "box" && holdingDef.size === "large")
            {
                if(topObjDef.size === "large"&& topObjDef.form ==="pyramid")
                    return false; 
            }
        
        }
        return true;
    }
	
	function worldItteration(world: WorldState) : [WorldState,string][]
	{
        var res :[WorldState,string][] = [];
        var test : [WorldState,string][] = [moveRight(world),moveLeft(world),pickup(world),putdown(world)]
		for (var v in test)
        {
            if(test[v] !== null)
                res.push(test[v]);
        }
        
		return res;
	}
	
    function w2N(w : WorldState) : AStar.Node
    {
        var n : AStar.Neighbour[] = [];
        var ws : [WorldState,string][] = worldItteration(w);
        for(var v in ws)
        {
            n[v] = {wState:ws[v][0],cmd :ws[v][1]}
        }
        return {wState: w,wStateId: WorldFunc.world2String(w),neighbours:n}
    }
    
    function convertToMap(w : WorldState): {[s:string]: any}
    {
        var alphabet :string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
        var i :number = 0;
        var ret : {[s:string]: any} = {}
        for( var o in w.objects)
        {
            ret[alphabet[i]] = {o};
            i++;
        }
        return ret; 
    }
    
    function goalFunction (lss : Interpreter.Literal[][], curr : string)
    {	
    	for(var j in lss)
    	{
    		var ls : Interpreter.Literal[] = lss[j];
    		
    		var ret : boolean = true;
		    for(var i in ls)
		    {
		        var l : Interpreter.Literal = ls[i];
		        
		        var rel : string = l.rel;
		        var x   : string = l.args[0];
		        var y   : string = l.args[1];
		        if(y === "floor")
		        {
		            x = x.concat("([a-z]|\\d)+");
		            y = "\\d";
		            //console.log(x,y);
		        }
		        var derp : string = ""; 
		        var regExp : RegExp;
		        switch(rel)
		        {
		            case "rightof":
		                regExp = new RegExp (derp.concat( y , "([a-z]*)\\d([a-z]|\\d)*" ,x ,"([a-z]*)\\d"));
		                break;
		            case "leftof":
		                regExp = new RegExp (derp.concat( x , "([a-z]*)\\d([a-z]|\\d)*" ,y ,"([a-z]*)\\d"));
		                break;
		            case "inside":
		            case "ontop":
		                regExp = new RegExp (derp.concat( y , x ));
		                break;
		            case "under":
		                regExp = new RegExp (derp.concat( x , "([a-z]*)" , y ));
		                break;    
		            case "beside":
		                regExp = new RegExp (derp.concat("(" , x , "([a-z]*)\\d([a-z]*)" , y , ")|(" , y , "([a-z]*)\\d([a-z]*)" , x , ")" , "([a-z]*)\\d"));
		                break; 
		            case "above":
		                regExp = new RegExp (derp.concat( y , "([a-z]*)" , x ));
		                break;
		            case "holding":
		                regExp = new RegExp (derp.concat( x , "$" ));
		                break;
		        }
		        if(!regExp.test(curr))
		        {
		            //console.log(regExp.toString());
		            //console.log(curr);
		            ret = false;
		        }
		    }
		    if(ret)
		    {
		    	return true;
		    }
        }
        return false;
    }
	
    function getHueristic (lss : Interpreter.Literal[][], curr : WorldState) :number
    {
        var totHue : number = 0;
        var biggestTot : number = 1000000;
        
        var stacks : string[] = [];
        var z : number = 0;
        
        //console.log(curr);
        
        for(var u in lss)
        {
        	var ls : Interpreter.Literal[] = lss[u];
        	
		    for(var j in ls)
		    {
		        var l : Interpreter.Literal = ls[j];

		        var rel : string = l.rel;
		        var x   : string = l.args[0];
		        var y   : string = l.args[1];
		        
		        var xStack : [number,number] = [curr.arm,-1]; //[Stacks index,Steps from bottom]
		        var yStack : [number,number] = [curr.arm,-1]; //[Stacks index,Steps from bottom]
		        
				for(var k in curr.stacks)
				{
				  var si : string[] = curr.stacks[k];
				  var iox = -1;
				  var ioy = -1;
				  for(var m in si)
				  {
					  if(si[m] === x)
					  {
						  iox = m;
					  }
					  if(si[m] === y)
					  {
						  ioy = m;
					  }
				  }
				 
				  if(iox >= 0)
				  {
					  xStack = [k,iox];
				  }
				  if(ioy >= 0)
				  {
					  yStack = [k,ioy];
				  }
				}
		        //console.log(xStack,yStack);
		        switch(rel)
		        {
		            case "rightof":
		            	if(xStack[1] == -1)
		            	{
		            		totHue += Math.abs(+yStack[0] - +xStack[0]) + +1;
		            	}
		            	else if(yStack[1] == -1)
		            	{
		            		totHue += +curr.stacks[xStack[0]].length - (+xStack[1] + +1) + 1;
		            		totHue += Math.abs(+yStack[0] - +xStack[0]) + +1;
		            	}
		            	else
		            	{
				            if(!(xStack[0] > yStack[0])) // checks if the goal isn't already met
				            {
				                if(yStack[0] == (+curr.stacks.length - +1)) // checks if there isn't a stack to the right of y
				                {
				                    totHue += +curr.stacks[yStack[0]].length - (+yStack[1] + +1) + +1; // weight for moving y to the left
				                }
				                totHue += +curr.stacks[xStack[0]].length - (+xStack[1] + +1) + Math.abs(+yStack[0] - +xStack[0]) + +1; //weight for moving x to the right of y
				            }
			            }
			            break;
		            case "leftof":
		            	if(xStack[1] == -1)
		            	{
		            		totHue += Math.abs(+yStack[0] - +xStack[0]) + +1;
		            	}
		            	else if(yStack[1] == -1)
		            	{
		            		totHue += +curr.stacks[xStack[0]].length - (+xStack[1] + +1) + +1;
		            		totHue += Math.abs(+yStack[0] - +xStack[0]) + +1;
		            	}
		            	else
		            	{
				            if(!(xStack[0] < yStack[0])) // checks if the goal isn't already met
				            {
				                if(yStack[0] == 0) // checks if there isn't a stack to the left of y
				                {
				                    totHue += +curr.stacks[yStack[0]].length - (+yStack[1] + +1) + +1; // weight for moving y to the right
				                }
				                totHue += +curr.stacks[xStack[0]].length - (+xStack[1] + +1) + Math.abs(+xStack[0] - +yStack[0]) + +1; //weight for moving x to the left of y
				            }
			            }
		                break;
		            case "inside":
		            case "ontop":
		            	if(xStack[1] === -1)
		            	{
		            		totHue += +curr.stacks[yStack[0]].length - (+yStack[1] + +1) + +1;
		            		totHue += Math.abs(+yStack[0] - +xStack[0]) + +1;
		                    if(totHue < 0)
		                    {
		                        console.log("FAIL!");
		                    }
		            	}
		            	else if(yStack[1] === -1)
		            	{
		            		totHue += +curr.stacks[xStack[0]].length - (+xStack[1] + +1) + +1;
		            		totHue += +Math.abs(+yStack[0] - +xStack[0]) + +1;
		                    if(totHue < 0)
		                    {
		                        console.log("FAIL2!");
		                    }
		            	}
		            	else
		            	{
				            if(xStack[0] === yStack[0])
				            {
				                if(xStack[1]-yStack[1] > 1)
				                { 
				                    totHue += +curr.stacks[yStack[0]].length - (+yStack[1] + +1) + +2;
				                }
				                else if(xStack[1]-yStack[1] < 1)
				                {
				                    totHue += +curr.stacks[xStack[0]].length - (+xStack[1] + +1) + +2;
				                }
		                        if(totHue < 0)
		                        {
		                            console.log("FAIL3!");
		                        }
				            }
				            else
				            {
				                var c : number = xStack[1]++;
		                        totHue += +curr.stacks[yStack[0]].length - +c; // weight for clearing the top of y
				                totHue += +curr.stacks[xStack[0]].length + Math.abs(+yStack[0] - +xStack[0]) - +c; //weight for moving x to the top/inside of y
		                        
				            }
				        }
		                //console.log(totHue);
		                break;
		            case "under":
		            	if(xStack[1] == -1)
		            	{
		            		totHue += +curr.stacks[yStack[0]].length - (+yStack[1] + +1) + +1;
		            		totHue += Math.abs(+yStack[0] - +xStack[0]) + +1;
		            	}
		            	else if(yStack[1] == -1)
		            	{
		            		totHue += Math.abs(+yStack[0] - +xStack[0]) + +1;
		            	}
		            	else
		            	{
				            if(xStack[0] != yStack[0])
				            {
				                totHue += +curr.stacks[xStack[0]].length - (+xStack[1] + +1) + (+yStack[0] - +xStack[0]);
				            }
				            else if(xStack[1] > yStack[1])
				            {
				                totHue += +curr.stacks[yStack[0]].length - (+yStack[1] + +1) + +2;
				            }
			            }
		                break;    
		            case "beside":
		            	if(xStack[1] == -1)
		            	{
		            		totHue += Math.abs(+yStack[0] - +xStack[0]) + +1;
		            	}
		            	else if(yStack[1] == -1)
		            	{
		            		totHue += Math.abs(+yStack[0] - +xStack[0]) + +1;
		            	}
		            	else
		            	{
				            if((+xStack[0] - +1) != yStack[0] && (+xStack[0] + +1) != yStack[0])
				            {
				                totHue += +curr.stacks[xStack[0]].length - (+xStack[1] + +1) + (+yStack[0] - +xStack[0] - +1); //weight for moving x beside of y
				            }
			            }
		                break; 
		            case "above":
		            	if(xStack[1] == -1)
		            	{
		            		totHue += Math.abs(+yStack[0] - +xStack[0]) + +1;
		            	}
		            	else if(yStack[1] == -1)
		            	{
		            		totHue += +curr.stacks[yStack[0]].length - (+yStack[1] + +1) + +1;
		            		totHue += Math.abs(yStack[0]-xStack[0])+1;
		            	}
		            	else
		            	{
				            if(xStack[0] != yStack[0])
				            {
				                totHue += +curr.stacks[xStack[0]].length - (+xStack[1] + +1) + (+yStack[0] - +xStack[0]);
				            }
				            else if(xStack[1] < yStack[1])
				            {
				                totHue += +curr.stacks[xStack[0]].length - (+xStack[1] + +1) + +2;
				            }
			            }
		                break;
		            case "holding":
		                if(xStack[1] != -1)
		            	{
		            		totHue += +curr.stacks[xStack[0]].length-(+xStack[1] + +1);//totHue += 0;
		            	}
		                
		        }
		        biggestTot = min(biggestTot,totHue);
		    }
	    }
        //console.log(totHue);
        return biggestTot;
    }
    
    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
        // This function returns a dummy plan involving a random stack
        		
		//console.log(worldItteration(state));
        //console.log(WorldFunc.compareWorld(state,state));
        //console.log(w2N(state).neighbours);
        //console.log(convertToMap(state));
        console.log("asdasdasd");
       
        var unqAttr : {[s:string]: string[];} = uniqueAttributes(state);
        var tempplan =  AStar.astar(intprt,state,goalFunction,getHueristic,w2N,unqAttr);
        var plan = [];
        
        var arm : number = 0; 
        var obj1: string;
        var obj2: string;
        while(tempplan.length > 0)
        {
            var s: string = tempplan.pop();
            /*switch (s)
            {
                case "l":
                    arm--;
                    //plan.push("Moving left");
                    break;
                case "r":
                    arm++;
                    //plan.push("Moving Right");
                    break;
                case "d":
                    if(state.stacks[arm].length === 0)
                    {
                        plan.push("Dropping the "+state.objects[obj1].form +" on the floor");
                    }
                    else
                    {
                        obj2 = state.stacks[arm][state.stacks[arm].length-1];
                        plan.push("Dropping the "+state.objects[obj1].form +" on the " +state.objects[obj2].form);
                    }
                    
                    break;
                case "p":
                    obj1 = state.stacks[arm][state.stacks[arm].length-1]
                    console.log(obj1);
                    plan.push("Picking up the " + state.objects[obj1].form);
                    break;
            }*/
            
            plan.push(s);
        }
        plan.push("GOBY PLZ!");
        //console.log(plan);
		/*do {
            var pickstack = getRandomInt(state.stacks.length);
        } while (state.stacks[pickstack].length == 0);
        var plan : string[] = [];

        // First move the arm to the leftmost nonempty stack
        if (pickstack < state.arm) {
            plan.push("Moving left");
            for (var i = state.arm; i > pickstack; i--) {
                plan.push("l");
            }
        } else if (pickstack > state.arm) {
            plan.push("Moving right");
            for (var i = state.arm; i < pickstack; i++) {
                plan.push("r");
            }
        }

        // Then pick up the object
        var obj = state.stacks[pickstack][state.stacks[pickstack].length-1];
        plan.push("Picking up the " + state.objects[obj].form,
                  "p");

        if (pickstack < state.stacks.length-1) {
            // Then move to the rightmost stack
            plan.push("Moving as far right as possible");
            for (var i = pickstack; i < state.stacks.length-1; i++) {
                plan.push("r");
            }

            // Then move back
            plan.push("Moving back");
            for (var i = state.stacks.length-1; i > pickstack; i--) {
                plan.push("l");
            }
        }

        // Finally put it down again
        plan.push("Dropping the " + state.objects[obj].form,
                  "d");
        */
        return plan;
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}




function uniqueAttributes ( w : WorldState  ) : { [s:string]: string[]}
{
	var objs : string[] = [];
	
    if(w.holding !== null)
    {
        objs.push(w.holding);
    }
    
	for(var oi in w.stacks)
	{
		var o : string[] = w.stacks[oi];
		
		for(var oi1 in o)
		{
			var o1 : string = o[oi1];
			objs.push(o1);
		}
	}
	
	
	var objsDef : ObjectDefinition[] = [];
	
	for(var obji in objs)
	{
		var objS : string = objs[obji];
		objsDef.push(w.objects[objS]);
	}
	
	
	var objsAttr : { [s:string]: string[]} = {} //Map of the least needed attributes.
	
	for(var obi in objs)
	{
		var objStr : string = objs[obi];
		var objDef : ObjectDefinition = w.objects[objStr];
		var obAttr : string[] = uniqueAttributes1(objDef, objsDef);
		
		objsAttr[objStr] = obAttr;
	}
	
	return objsAttr;
}

function uniqueAttributes1 ( oA : ObjectDefinition , os : ObjectDefinition[] ) : string[]
{
	var unqAttr : string[] = [oA.form];
	
	var unqOs : ObjectDefinition[] = uniqueAttributes2 ("form", oA.form, os);
	
	if(unqOs.length > 1)
	{
		var temp0 : ObjectDefinition[] = uniqueAttributes2 ("size", oA.size, unqOs);
		var temp1 : ObjectDefinition[] = uniqueAttributes2 ("color", oA.color, unqOs);
		
		if(temp0.length < temp1.length)
		{
			unqOs = temp0;
			if(unqOs.length <= 1)
			{
				unqAttr.push(oA.size);
			}
			else
			{
				unqAttr.push(oA.color);
				unqAttr.push(oA.size);
				if((uniqueAttributes2 ("color", oA.color, unqOs)).length > 1)
				{
					unqAttr.push("notUnique");
				}
			}
		}
		else
		{
			unqOs = temp1;
			if(unqOs.length <= 1)
			{
				unqAttr.push(oA.color);
			}
			else
			{
				unqAttr.push(oA.color);
				unqAttr.push(oA.size);
				if((uniqueAttributes2 ("size", oA.size, unqOs)).length > 1)
				{
					unqAttr.push("notUnique");
				}
			}
		}
	}
	
	return unqAttr;
}

function uniqueAttributes2 ( type : string , oA : string , os : ObjectDefinition[] ) : ObjectDefinition[]
{
	var notUnique : ObjectDefinition[] = [];
	
	for(var i in os)
	{
		switch (type)
		{
			case "form":
				if(oA === os[i].form)
				{
					notUnique.push(os[i]);
				}
				break;
			case "size":
				if(oA === os[i].size)
				{
					notUnique.push(os[i]);
				}
				break;
			case "color":
				if(oA === os[i].color)
				{
					notUnique.push(os[i]);
				}
				break;
		}
	}
	return notUnique;
}
