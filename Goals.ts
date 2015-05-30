///<reference path="World.ts"/>
///<reference path="SpatialConstraints.ts"/>

module Goals
{
    //Converts a pddl goal to a goal predicate
	  export function createGoalFromPDDL(pddl, state : WorldState) : (a : WorldState) => boolean
	  {
		    var goal;
		    if(pddl.rel === "holding")
		    {
		        goal = holdingGoal(pddl.args[0]);
		    }
        else if(pddl.rel === "ontop" || pddl.rel === "inside" || pddl.rel === "above")
        {
            goal = ontopGoal(pddl.args[0], pddl.args[1]);
        }
        else if(pddl.rel === "under")
        {
            //The under goal is the same as an onput goal only the
            //arguments have to be swapped.
            goal = ontopGoal(pddl.args[1], pddl.args[0]);
        }
        else if(pddl.rel === "rightof")
        {
            goal = sideOfGoal(pddl.args[1], pddl.args[0]);
        }
        else if(pddl.rel === "leftof")
        {
            goal = sideOfGoal(pddl.args[0], pddl.args[1]);
        }
        else if(pddl.rel === "beside")
        {
            goal = besideGoal(pddl.args[0], pddl.args[1]);
        }
        else
        {
            return (a) => false;
        }

		    return goal;
	  }


    //If the goal is to be holding an object,
    //we only need a predicate which checks whether
    //the robot is holding the desired object
    function holdingGoal(obj : string) : (a : WorldState) => boolean
    {
        return function(a : WorldState) : boolean
        {
            return a.holding === obj;
        }
    }

    //If the goal is to have an object above another,
    //we need to check whether any stack has the objects
    //on top of one another.
    //It could instead be argued that an object can be above another
    //without being in direct contact with it, or maybe even
    //in another stack, but still at a higher level.
    //We have decided to go with our interpretation since
	  //we find it to be the most intuitive
	  function ontopGoal(over : string, under : string) : (a : WorldState) => boolean
	  {
		    //The floor is a special case, since there is no "floor object"
		    if(under == "floor")
		    {
			      return function(a : WorldState) : boolean
			      {
				        for (var i = 0; i < a.stacks.length; i++)
				        {
					          if(a.stacks[i].length > 0 &&
						           a.stacks[i][0] === over)
						            return true;
				        }
					      return false;
			      }
		    }
		    else
		    {
			      return function(a : WorldState) : boolean
			      {
				        for (var i = 0; i < a.stacks.length; i++)
				        {
					          for (var j = 0; j < a.stacks[i].length - 1; j++)
					          {
						            //Return true if the objects can be found directly
						            //above one another
						            if(a.stacks[i][j] == under &&
							             a.stacks[i][j + 1] == over)
							              return true;
					          }
				        }
				        return false;
			      }
		    }
	  }

	  //If the goal is to put something to the side of something else,
	  //we just need to check whether one object is to the left of another.
	  function sideOfGoal(left: string, right : string) : (a : WorldState) => boolean
	  {
		    return function(a : WorldState) : boolean
		    {
			      var le = a.stacks.length, ri = 0;
			      for (var i = 0; i < a.stacks.length; i++)
			      {
				        for (var j = 0; j < a.stacks[i].length; j++)
				        {
					          if(a.stacks[i][j] == left)
					          {
						            le = i;
					          }
					          else if(a.stacks[i][j] == right)
					          {
						            ri = i;
					          }
                }
            }

            return le < ri;
        }
    }

    //Here the goal is to put one object directly to the side of another one
    //The code is similar to sideOfGoal, but we accept the state only if
    //the first object is exactly one x-position from the other
    function besideGoal(moved : string, stationary : string) : (a : WorldState) => boolean
    {
        return function(a : WorldState) : boolean
        {
            var mov = 0, stat = 0;
            for (var i = 0; i < a.stacks.length; i++)
            {
                for (var j = 0; j < a.stacks[i].length; j++)
                {
                    if(a.stacks[i][j] == moved)
                    {
                        mov = i;
                    }
                    else if(a.stacks[i][j] == stationary)
                    {
                        stat = i;
                    }
                }
            }
            return Math.abs(mov - stat) == 1;
        }
    }
}
