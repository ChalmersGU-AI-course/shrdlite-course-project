
*=====================================================================*

README SHRDLITE
*=====================================================================*
Fredrik Ström 8809045019 Henrik Svensson 8807075554, A*dam Scott 9005283859
*=====================================================================*
To test our examples run: 
tsc --out shrdlite-html.js shrdlite-html.ts
Then open shredlite.html
*========================= Examples =================================*
Complex world:
put all balls on the floor
put all bricks on all tables
(ambiguous) put a box in the box
(impossible) put all balls left of a ball
put a box in a box on a table

Medium world:
put the white ball in a box on the floor
move the large ball inside a red box on the floor
take a red object
put the large plank under the green brick

Small world:
Put the black ball in a box on the floor
put the white ball in the yellow box on the table
Move all balls inside a large box
Put all boxes on the floor

*======================== Main Structure ===============================*
*Interpreter.ts contains the interpreter, it interprets all the parses sent from the parser. At line 166 there is the central function interpretCommand, it traverse through the parse and interpret one or many goals for the planner. It uses the function indentifyEnt at line 292 to find entities in the parse, where ambiguity will be checked and there might be a question for more information to be sent. It is a recursive function, using identifyLocation (line 418) as a middle function, that will follow the entity tree to the bottom. 

*Planner.ts contains the class Shortestpath which is our node class which implements the node interface for the A* algorithm. In this class we handle:
heuristics for A*
generating neighbours for nodes
and checking if the goal is reached

At row 851 in Planner.ts the central function planInterpretation is found. It controls all searches with A*, sorts all results and adds the action description for the dialog. 

*======================== Extensions =================================*

Handles different Quantifiers, e.g. "the red ball", "any ball", "all boxes".

Can be found in Interpreter.ts on line
“all” uses the function combine at line 438. Also in function identifyEnt at line 292 and interpretCommand on line 166

If the user writes the ball, and there's several balls, it will ask clarification 
question to the user. We also added grammar in grammar.ne to handle the dialog. The answer to a question is a object description, “red ball”, “large table” or “large red box”.

Can be found in Interpreter.ts on line
identifyEnt (line 292) will handle ambiguity, also identifyLocation will send a clarification error, but the message here does not change yet. These functions sends an error which is caught in Shrdlite.ts on line 66, where it handles the dialog.
grammar.ne on line 41

The AI will describe what action it is performing in the dialog. 

Can be found in Planner.ts on line
923, the description will be added when we build the path of actions. 

The world is described in pddl

Can be found in ExampleWorlds.ts on line
6, the function stacksToPDDL, converts a stack into PDDL. 

*=================== A* planning heuristics ==========================*

Counts number of estimated steps toward the goal, including arm distance, 
objects above start and goal object and steps to remove each of them but assuming floor 
space is available to drop these.

This needs more work tho :’( If we have few goals it works fine. But if we get more complicated goals we can get an overestimate. We calculate the heuristic individually for each part of the goal and then sum them up, but there are parts which will be counted many times, which is not optimal. 

Can be found in Planner.ts on line 392

*======================== A* planning ===============================*
The function getNeighbours(planner.ts:63) will fetch all legal (obeying physical laws) neighbours to a current node. We have added some extra pruning. For example: it will not fetch a neighbour which is directly backwards, if the current path is reached by going left, then we will not generate the neighbour going back to that node (going right), same with picking and dropping. This saves a few stupid cycles. 

A* does not need cycle checking to work, but we added it in get neighbours anyway. It seems like our A* search likes to explore the same nodes many times, so by adding cycle checking the speed went up significantly. This might be due to our heuristics. 


*====================== strange behaviour ============================*



* Sometimes overestimates the heuristics when there are several conditions that needs to be      fulfilled
* Without cycle checking Planner.ts line 128. Our A* with current heuristics has a hard time finding most goals. But with the check, it finds most goals quite fast. 

* The clarification question does work for simple dialogs and simple goals, but not so well at handling complex cases and sometimes gets locked in the wrong dialog state. 

* The “all” quantifier does work for “put all balls in all boxes” if there are equal number of possible boxes to put all balls in, but it also works if there are more boxes than balls, which is a bug. It does not handle left of so well either. “put all balls right of all tables”

Can be found in .ts on line

* Fill in more here


*=========================== Other ===================================*
* We never implemented a timeout for when the a* goes on for a longer time, so when encountering an especially troubling problem with many different solutions it can appear to be frozen until it finishes the search





