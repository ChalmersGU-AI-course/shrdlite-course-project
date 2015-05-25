///<reference path="World.ts"/>

module Heuristics{


    export function createHeuristicsFromPDDL(pddl, start : WorldState) :  (a : WorldState) => number
    {
        if(pddl.rel === "holding")
        {
           return holdingHeuristic(pddl.args[0], start);
        }           
        else if(pddl.rel === "ontop" || 
                pddl.rel == "inside")
        {
            return ontopHeuristic(pddl.args[0], pddl.args[1], start);
        }
        else if(pddl.rel == "under")
        {
            return ontopHeuristic(pddl.args[1], pddl.args[0], start)
        }
        else if(pddl.rel === "rightof")
        {
            return sideOfHeuristic(pddl.args[0], pddl.args[1], start);
        }
        else if(pddl.rel === "leftof")
        {
            return sideOfHeuristic(pddl.args[0], pddl.args[1], start);
        }
    }

    function holdingHeuristic(obj : string, start : WorldState) : (a : WorldState) => number
    {
        var ps = objPos(obj, start);
        return function( a : WorldState) : number
        {
            var points = 0;
                                    
            //To hold an object we first need to remove all objects above it.
            //For each object we remove we give 10 points
            //When we are not holding anything we want to move towards the object position. 
         
            if(a.holding == null)
            {
                points += Math.abs(a.arm - ps.x);
            }
            
            for(var row = ps.y; row < a.stacks[ps.x].length; row++)
            {
                points += 10;
            }
            
            return points;                       
        }
    }

    function ontopHeuristic(over : string, under : string, start : WorldState) : (a : WorldState) => number
    {
        var underPos = objPos(under, start);
        var overPos  = objPos(over, start);
        
        if(under === "floor")
        {
            return function( a : WorldState) : number
            {
                var points = 0;
                for(var row = overPos.y + 1; row < a.stacks[overPos.x].length; row++)
                {
                    points += 10;
                }
            
                return points;
            }
        }
        else 
        {
            return function( a : WorldState) : number
            {
                var points = 0;
                                        
                //We begin by penalizing objects ontop of the under and over objects.
                for(var row = underPos.y + 1; row < a.stacks[underPos.x].length; row++) 
                {
                    if(a.stacks[underPos.x][row] !== over)
                        points += 10;
                }
                            
                for(var row = overPos.y + 1; row < a.stacks[overPos.x].length; row++) 
                {
                    points += 10;
                }
                
                //We want to move to either the under or the over pile and remove objects
                if(a.holding === over)
                {
                    if(underPos.y + 1 == a.stacks[underPos.x].length)
                        points -= 10; //We want to encurage that algorithm to pick up the over object.
                }
                else if(a.holding === under)
                {
                    //We discurage that the under object is picked up.
                    points += 10; 
                }
                            
                return points;  
            }
        }
    }
    
    function sideOfHeuristic(movable : string, stationary : string, start : WorldState) : (a : WorldState) => number
    {
        var movePos = objPos(movable, start);
        return function( a : WorldState) : number
        {
            var points = 0;
            
            //We really don't want the algorithm to move the stationary object.
            if(a.holding === stationary)
                points += 100; 
                
            //But we do want to pick up the movable object.
            if(a.holding === movable)
                points -= 5;
            
            //We need to remove potential items ontop of the movable object.
            for(var row = movePos.y + 1; row < a.stacks[movePos.x].length; row++) 
            {
                points += 10;
            }
                                
            return points;
        }
    }
    
    function objPos(obj : string, state : WorldState)
    {
        for(var i = 0; i < state.stacks.length; i++)
        {
            for(var j = 0; j < state.stacks[i].length; j++)
            {
                if(state.stacks[i][j] === obj)
                    return { x : i, y : j};
            }
        }
        
        return { x : -1, y : -1 };
    }
}