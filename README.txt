Shrdlite project in AI (TIN172)
Group 21: Planet Express
Jonatan Kilhamn, Johannes Ringmark, Bjarki Traustason


*** How to run the project ***

Download the entire project. From the top folder, run "make html". This requires node.js and Typescript (tsc).

Run the file shrdlite.html in a web browser (we ahve only tried Chrome).

Example utterances (based on the "medium" world, reset between each):

put all red objects on the floor

put all red objects left of all green objects

put every ball in a box

take the ball in the box





*** Our search algorithm ***


Our program uses a general A*-algorithm with a custom heuristic. The A* implementation can be found in the file astarAlgorithm.ts. The heuristic passed into A* is the function state_heur in Planner.ts, although that function delegates to several other functions also in Planner.ts.

Each node in the search tree represents a world state, augmented with the information of which action was taken most recently. This structure is defined in the class ActionState, in Planner.ts.

Each edge (i.e. each move the arm makes, updating the world state) has cost 1. This is defined by the get_state_distance function, in Planner.ts.


-- The heuristic --

Our heuristic is based on the idea of computing the best-case number of moves to fulfil a goal, with limited knowledge of the full state. For example, one subroutine is the heurToFree(state, object) method. It finds the object, counts how many other obejcts are above it its stack, and multiplies that number by 4; since moving one object out of the way and moving the arm back above it takes 4 moves.

Each of the relations (ontop, beside, holding etc.) have their own heuristic, but they all share many subroutines such as heurToFree, heurMoveObject (moving an object to a position assuming it can be placed there), heurMoveArmToPOI (moving the arm to the closest Point of Interest) and so on.

For complex goals, we compute the heuristic for each subgoal separately. For disjunctions (OR) we return the minimum value. For conjunctions (AND) we add the values; or at least the contributions to those values corresponding to tasks that need to be performed (freeing and moving objects). The contributions from moving the arm between different POIs are not added together, since this could result in counting the same moves multiple times, overestimating the total cost.


-- Goal structure -- 

Our goal structure (replacing standard PDDL) allows for any nesting of conjunctive and disjunctive goals. This is defined in Interpreter.Goal

We decided to for "respective all-in-any", i.e. correctly interpreting "put every ball in a box" as putting each ball in a separate box (and likewise for prepositions other than "in"). The alternative is the one possible intended by "put all balls in any box" (which parses identically), where it doesn't matter which box the balls go in as long as they all go in the same box.

This decision was the reason to replace the standard form of PDDL with a more flexible framework. The goal in the above example, in our interpretation, would be written:

(inside(ball1, box1) v inside(ball1, box2)) ^ ((inside(ball2, box1) v inside(ball2, box2))

However, this is the wrong structure: PDDL requires a disjunction of conjunctions, and this is the other way around. In standard PDDL, the above goal becomes:

(inside(ball1, box1) ^ inside(ball2, box1)) v (inside(ball1, box1) ^ inside(ball2, box2)) v (inside(ball1, box2) ^ inside(ball2, box1)) v (inside(ball1, box2) ^ inside(ball2, box2))

Any recursive computation of fulfillment of these goals, or heuristics for them, would have to be very clever to avoid computing each value twice.

Since each node in the search tree contains information on the previous action, we can decrease the branching factor from 3 to 2 by disallowing the immediate reversal. (There are 4 actions, but in no state will both DROP and PICK UP be valid.) We can state from the outset that the planner will never find a good path by moving left just after moving right, or by dropping immediately after picking up.



*** Half-baked features and strange behaviour ***


-- Ambiguities --

Our ambiguity resolution is technically correct (as far as we know), but it could be more instructive.

It works like this:
For each parse, it tries to interpret. If it runs into an error such as a nonexistent object, it simply fails. If it runs into an object-level ambiguity (e.g. "take the ball" when there are several balls), it fails with a special flag.

Afterwards, if there was exactly one parse which had a valid interpretation, it is assumed to be the wanted one. This takes care of the case "put the ball in the box on the floor": if there is a ball in a box, but no box on the floor, the parse "put ontop (the ball in the box) (the floor)" is chosen.

However, if there are no valid interpretations, the program will raise an error. If the object-level ambiguity flag has been raised previously, it is assumed that the user could have avoided the error by being more specific, so the message is "Possibly ambiguous command. Found ambiguous references possibly referring to: [list of objects which have raised ambiguity flags]".

Finally, if there is more than one valid interpretation, we must have had more than one valid parse. The user is then told to try again using fewer relative descriptors. in other words, we do not exract any further information from the multiple parses.


-- Planner messages --

When performing the plan, the messages output to the user amount to one per object manipulation: placing an object held at the start of the plan, moving an object, and picking up an object at the end of a plan, all generate only one message. However, these messages appear when the task they refer to is finished. it would be better to have them show up at the start of the respective task, but we did not have time to fix this issue.




