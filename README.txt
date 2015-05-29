#How to run the project
1.To compile the project run "make all". 
2.Then open the shrdlite.html
3.Then you may write commands.
4.If there are ambiguities in the command, enter the
number to choose what interpretation you meant. 
5.Goto 3. and repeat 
Note: Every time a command is executed we count the number of iterations in the A* algorithm
and displays these along with time it took.

#Interesting examples
##Small world
Put a ball in a box on the floor - Ambigous utterance, either you mean the ball that is inside a box or put any ball inside a box that is on the floor

Put the ball inside a large box - Ambigous interpretation, which of the balls did you mean?

Move all balls inside a large box - No ambig, just to show that all cmd works

Put the ball in the box on the floor - Ambigous in both utterance and interpretation. Do we want to move the ball in the box or any other ball to the box on the floor, and in that case, which of the balls? (To clarify, perhaps we should have written large white ball to the floor and small black ball to the floor?)

##Medium world
Put the blue table below the yellow box - To show how fast the heuristic works, 70.000-ish iterations without heuristic and 48 with. 

Put the large ball inside the box - Ambigous, which box did you mean? 

Put the white brick above all pyramids - To show that the all commands works in the location entity aswell. (feel free to move the pyramids before running)

##Complex world
Put the yellow brick right of the green plank - To show that the iprt/planner works reasonably fast for complex world aswell.

#What extensions
##Ambigious
Implemented inside Interpreter.ts. If we have a utterance that can be parsed as several meanings, we throw an error inside the interpret function to request a clarification from the user. The error message is built up from the different meanings. Here we only show information that is necessary to the user. This is done by comparing all the different commands by 'folding' them against each other. In each fold, we remove unecessary information by comparing them against each other (see cmpCmd and cmpObjs in interpreter.ts). The fold then returns only the useful information and from that we print a message.

The error is caught in parseUtteranceIntoPlan in Shrdlite.ts which presents the message to the user. 
It also saves information about all the different meanings in the World. This information is used when the user then clarifies. If we required a clarification, parseUtteranceIntoPlan will not call Interpreter.interpret, but instead just pick a command, based on what the user answered.

##Quantifiers
We also implemented quatifiers in Interpreter.ts. In interpret we check the length of the result from interpretCommand. If its larger than 1, we have some ambiguity. To indicate this, we have extended the Result type to also include an optional object. Where there are ambiguity, we add the ambigous object to the result. We here use the ambigous solution to resolve ambiguity; as there are several ambigous objects there will be several interpretations and because of that; interpret will throw an clarification error. Resolving this is performed in the same way as in the ambig extension. 

However, there can also be quantifiers in the loc entity. These are checked in convertGoalsToPDDL(in interpreter.ts). Here we look at the loc.ent quantifier. If the quant is "the", we make sure there are only 1 object found or we will return several ambigous interpretations. If the quant is "all", we permutate all resulting and relations to one big. If quant is "a", we just return the pddl without any ambiguity. Ambiguity in here are saved in the new type, LitAmb, which is a Literal[][] combined with an ambigous object. The ambigous object is then propagated out all the way until the interpret function where it will be taken care of the same way as before. 

#Heuristic
Our heuristic function is declared inside Planner.ts and is called getHeur. 
We begin by extracting all the data we want in a one pass by iteration through the current state pddl. This to minimize nested loops (slooow) and fast access to the data. The data extracted is the column of all objects, what objects are above, ontop and below an object and the armpos. We then iterate through all ors and all and lits. For every or we calculate the heur and the function returns the minimal of them. For every and we check what relation we want, and calculate a heuristic according to that. The general idea is to calculate the following (where applicable):
*Distance between arm and an object to move/pickup(only performed when nothing is currently held) - To make the arm want to move towards an object. Without quantifiers this is admissible. However, with the all command there might be a problem as the arm would want to move to several objects. 
*Distance between current position of an object and target position - To make the object want to move closer to its goal pos. Should be admissible, as if they are 3 columns apart there should be at least 3 turns to fulfil relation. 
*The number of objects above an object that is to be moved - We want to give a lower heur for removing objects. For all objects above (sometimes including itself) we multiply by 4. To move an object requires the arm to pickup a obj, move one step, drop it and move back. So it takes at least 4 turns per object, so it should be admissible. 

#Unexpected behaviour
    As stated in the heuristic part, we might have a non-admissible heur for all quantifiers. When we optimized the heuristic, we hadn't implemented quantifiers. We could make the heur admissible easily by just commenting away to cost in the heuristic between armpos and objectpos. But to show you how fast the heur is without the quantifier extension, we choose to leave the 'move arm to object' part. However, this can make some examples using all quite slow. 

#Half-finished
Well, we haven't had the time to fully optimize the leftof/rightof/besides relation. We have implemented a heuristic for these cases aswell, but they are not as fast as ontop/above/below. In the perfect world where we have unlimited time, we would like to optimize these more! 

#Anything else
--- 
