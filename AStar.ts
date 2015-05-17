///<reference path='collections.ts'/>
///<reference path='World.ts'/>


getHueristic (ls : Interpreter.Literal[], curr : string)
{
	var totHue : number = 0;	
	
	var stacks : string[] = [];
	var x : number = 0;
	for(var i : number = 0; i < curr.length; i++)
	{
		if(!isNaN(curr[i]))
		{
			x = curr[i];
			stacks[x] = "";
		}
		else
		{
			stacks[x] = stacks[x] + curr[i];
		}
	}
	
	for(var i in ls)
	{
		var l : Interpreter.Literal = ls[i];

		var rel : string = l.rel;
		var x   : string = l.args[0];
		var y   : string = l.args[1];
		var derp : string;
		
		var xStack : [number,number]; //[Stacks index,Steps from bottom]
		var yStack : [number,number]; //[Stacks index,Steps from bottom]
		
		for(var i in stacks)
		{
			var si : number = stacks[i];
			
			iox = si.indexOf(x);
			ioy = si.indexOf(y);
			
			if(iox >= 0)
			{
				xStack = [i,iox];
			}
			if(ioy >= 0)
			{
				yStack = [i,ioy];
			}
		}
		
		switch(rel)
		{
			case "rightof":
				if(!(xStack[0] > yStack[0])) // checks if the goal isn't already met
				{
					if(yStack[0] == (stacks.length -1)) // checks if there isn't a stack to the right of y
					{
						totHue += stacks[yStack[0]].length - (yStack[1]+1) + 1; // weight for moving y to the left
					}
					totHue += stacks[xStack[0]].length - (xStack[1]+1) + (yStack[1]-xStack[1]+1) //weight for moving x to the right of y
				}
				break;
			case "leftof":
				if(!(xStack[0] < yStack[0])) // checks if the goal isn't already met
				{
					if(yStack[0] == 0) // checks if there isn't a stack to the left of y
					{
						totHue += stacks[yStack[0]].length - (yStack[1]+1) + 1; // weight for moving y to the right
					}
					totHue += stacks[xStack[0]].length - (xStack[1]+1) + (yStack[1]-xStack[1]+1) //weight for moving x to the left of y
				}
				break;
			case "inside":
			case "ontop":
				if(xStack[0] == yStack[0])
				{
					if(xStack[1]-yStack[1] > 1)
					{
						totHue += stacks[yStack[0]].length - (yStack[1]+1) + 2;
					}
					else if(xStack[1]-yStack[1] < 1)
					{
						totHue += stacks[xStack[0]].length - (xStack[1]+1) + 2;
					}
				}
				else
				{
					totHue += stacks[yStack[0]].length - (yStack[1]+1); // weight for clearing the top of y
					totHue += stacks[xStack[0]].length - (xStack[1]+1) + (yStack[1]-xStack[1]); //weight for moving x to the top/inside of y
				}
				break;
			case "under":
				if(xStack[0] != yStack[0])
				{
					totHue += stacks[xStack[0]].lenght - (xStack[1]+1) + (yStack[1]-xStack[1]);
				}
				else if(xStack[1] > yStack[1])
				{
					totHue += stacks[yStack[0]].length - (yStack[1]+1) + 2;
				}
				break;    
			case "beside":
				if(xStack[0]-1 != yStack[0] && xStack[0]+1 != yStack[0])
				{
					totHue += stacks[xStack[0]].length - (xStack[1]+1) + (yStack[1]-xStack[1]-1); //weight for moving x beside of y
				}
				break; 
			case "above":
				if(xStack[0] != yStack[0])
				{
					totHue += stacks[xStack[0]].lenght - (xStack[1]+1) + (yStack[1]-xStack[1]);
				}
				else if(xStack[1] < yStack[1])
				{
					totHue += stacks[xStack[0]].length - (xStack[1]+1) + 2;
				}
				break;
		}
	}
}

module AStar {
 

    export interface Node
    {
        wState : string;
        neighbours: [string,number] [];
        fscore?: number;
        hweight? : number;
        id?: number;
    }
    
    
    //TBD
    function compareT(a:Node,b:Node)
    {
        if(a.fscore == null || b.fscore == null)
        {
            return 1
        }
        if(a.fscore > b.fscore) // a is greater than b
        {
            return 1
        }
        if(a.fscore < b.fscore) //a is less than b
        {
            return -1
        }
        
        return 0
    }
    
    export function astar(startObject,goalFunction,huerFunction,getNode) : string[]
    {
        var closedSet : Node[] = [];
        var openSet = new collections.PriorityQueue<Node>(compareT);
        
        var startNode : Node = getNode(startObject)
        openSet.add(startNode);
        
        var came_from : {[key:string]:Node} = {};
        
        var g_score : {[key:string]:number} = {};
        g_score[startObject] = 0;
        
        var f_score : number [] = [];
        f_score[startObject] = g_score[startObject] + huerFunction(startObject);
        
        while(!openSet.isEmpty())
        {
            var current = openSet.dequeue();
            if (goalFunction(current))
            {
                return reconstruct_path(came_from, current);
            }
            
            closedSet.push(current); 
            for(var ei in current.neighbours)
            {
                var e : [string,number] = current.neighbours[ei];
                
                var eNeigh : [Node,number] = [getNode(e[0]),e[1]];
                
                if (!arrayIsMember(e[0],closedSet))
                {
                    var tentative_g_score :number = g_score[current.wState] + eNeigh[1];
                    
                    if(!openSet.contains(eNeigh[0]) || tentative_g_score < g_score[e[0]])
                    {
                        came_from[e[0]] = current;
                        g_score[e[0]] = tentative_g_score;
                        f_score[e[0]] = g_score[e[0]] + huerFunction(e[0]);
                        eNeigh[0].fscore = f_score[e[0]];
                        openSet.enqueue(eNeigh[0]);
                    }
                }
            }
        }
        return [];
    }
    
    function reconstruct_path (came_from, current) : string[]
    {
        var total_path : string[] = [];
        total_path.push(current.wState);
        while(came_from[current] != null)
        {
            current = came_from[current];
            total_path.push(current.wState);
        }
        return total_path;
    }

    function arrayIsMember (e : string, array) : boolean
    {
        for(var i in array)
        {
            var v : string = array[i].wState;
            if(e===v) // functionsanropet ska ändras lite
            {
                return true;
            }
        }
        return false;
    }
}
