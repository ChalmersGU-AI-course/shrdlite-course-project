README SHRDLITE
*=====================================================================*
Fredrik Ström 8809045019 Henrik Svensson 8807075554, A*dam Scott 9005283859
*=====================================================================*
To test our examples run: 
tsc --out shredlite.js shredlite.ts
Then open shredlite.html

*======================== Extensions =================================*

Handles differnt Quantifiers, e.g. "the red ball", "any ball", "all boxes".

Can be found in .ts on line

If the user write the ball, and there's several balls, it will ask clarification 
question to the user.

Can be found in .ts on line


*=================== A* planning heuristics ==========================*

counts number of estimated steps thoward the goal, including arm distance, 
objects above start and goal object and steps to remove each of them but assuming floor 
space is avalible to drop these.

Can be found in Planner.ts on line 392



*====================== strange behaviour ============================*


* Can't handle some involving many different objects, get call stack full error

Can be found in .ts on line

* Fill in more here


*=========================== Other ===================================*




TODO:
- how to run your project, 
- and some interesting example utterances
- what (if any) extensions you have implemented, and where in the code they are
- how your A* planning heuristics work, and where in the code we can find it
- if some things are half-finished, or strange/unexpected behaviour
- anything else you want to inform us about