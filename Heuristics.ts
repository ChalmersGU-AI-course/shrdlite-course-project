///<reference path="World.ts"/>


//This module contains the various heuristics that are possible given diffrent pddls goals. 
module Heuristics{

    //The penalty used when items are ontop of other items
    //that needs to be accessable to the robot arm.
    var penaltiyModulator = 5;


    //From the inputed pddl goal selects a good heuristic specialized for that goal.
    export function createHeuristicsFromPDDL(pddl, start : WorldState) :  (a : WorldState) => number
    {
        if(pddl.rel === "holding")
        {
           return holdingHeuristic(pddl.args[0], start);
        }           
        else if(pddl.rel === "ontop" || pddl.rel === "inside" || pddl.rel === "above")
        {
            return ontopHeuristic(pddl.args[0], pddl.args[1], start);
        }
        else if(pddl.rel === "under")
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
        else if(pddl.rel === "beside")
        {
            return sideOfHeuristic(pddl.args[0], pddl.args[1], start);    
        }
        else
        {
            //Default heuristic
            return (a) => 0;
        }
    }

    //Heuristic for "holding" pddl goal
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
                points += penaltiyModulator;
            }
            
            return points;                       
        }
    }

    //Heuristic for "above", "inside", "ontop" pddl goals.
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
                    points += penaltiyModulator;
                }
            
                return points;
            }
        }
        else if(underPos.x == overPos.x)
        {
            //The objects are stacked. In this case we need to remove all 
            //items from the overpos And then move the overpos to the underpos.    
            //This case is not handled well with the general function (else branch)
            //so this new heuristic is introduced. In the complex world
            //this can be a very hard problem for the planning algorithm since
            //It can lead to it having to creating multiple stacks. Durint the block moving.
            //Thus we need a heuristic that leads us to the goal as fast as possible. For this reason the 
            //heuristic is not admissible, it sacrifices the potential for a perfect 
            //solution for a faster convergance time.
            return function(a : WorldState) : number
            {
                var points = 0;
            
                for(var row = overPos.y + 1; row < a.stacks[overPos.x].length; row++) 
                {
                    points += 10;
                }
                
                if(overPos.y == a.stacks.length - 1)
                {
                    points -= 10 * 3;
                    for(var row = underPos.y + 1; row < a.stacks[underPos.x].length; row++) 
                    {   
                        if(a.stacks[underPos.x][row] !== over)
                            points += penaltiyModulator;
                    }
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
                        points += penaltiyModulator;
                }
                            
                for(var row = overPos.y + 1; row < a.stacks[overPos.x].length; row++) 
                {
                    points += penaltiyModulator;
                }
                
                //We want to move to either the under or the over pile and remove objects
                if(a.holding === over)
                {
                    if(underPos.y + 1 == a.stacks[underPos.x].length)
                        points -= penaltiyModulator; //We want to encurage that algorithm to pick up the over object.
                }
                else if(a.holding === under)
                {
                    //We discurage that the under object is picked up.
                    points += penaltiyModulator; 
                }
                            
                return Math.max(0, points);  
            }
        }
    }

    //Heuristic used for "rightof", "leftof" and "beside"    
    function sideOfHeuristic(movable : string, stationary : string, start : WorldState) : (a : WorldState) => number
    {
        var movePos = objPos(movable, start);
        return function( a : WorldState) : number
        {
            var points = 0;
            
            //We really don't want the algorithm to move the stationary object.
            if(a.holding === stationary)
                points += penaltiyModulator * 10; 
                  
            //We need to remove potential items ontop of the movable object.
            for(var row = movePos.y + 1; row < a.stacks[movePos.x].length; row++) 
            {
                points += penaltiyModulator;
            }
                                
            return points;
        }
    }
    
    //Finds the xy position of an object in the world.
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