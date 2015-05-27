The AI Project README

1. How to run the project

If you are running a Windows machine, then simply run the "build.bat" file which
automatically will compile all the necessary files for you.

In case you're not running Windows, open a terminal in the root folder and 
execute
    tsc --out shrdlite-html.js shrdlite-html.ts
    
    
After the project has been compiled, simply open the "shrdlite.html" file.

    
2. Extensions implemented
- Handling all quantifiers in a sensible manner
    Implemented in Interpreter.ts
- Handles ambiguity in a sensible manner
    Implemented in Interpreter.ts as well as in Shrdlite.ts
- Planner describes what it is doing in a way that is understandable to humans
    Implemented in Planner.ts
- Timer for the path finding algorithm (To prevent too long wait for hard interpretations)
    Implemented in graph/astar.ts
- Handles some invalid placements in sensible manner
    Implemented in Utils.ts, Interpreter.ts as well as in Shrdlite.ts

    
3. How the A* heuristics work

3.1

3.2 Where to find it
heuristic/Heuristic.ts


4. Half-finished and/or strange/unexpected behaviour
- Every other time when asking it to pick up a object, it will simply put down
  the object on the left most valid placement, and then move the arm to the right
  most position and pick up the object in that column (if any).
  
- The heuristics is (in some cases) not admissable

- If there are three boxes and two balls and it is told to "put all balls in all boxes"
  that will be accepted in the way that the two balls will be put in boxes, leaving
  the third box empty.


5. Other things
5.1 Things that does not longer work
- The examples under graph/example/ does not longer work with how the graph etc 
  is implemented.
- The examples under heuristic/exapmle/ does not longer work with how the
  heuristics is implemented.

5.2 How we have interpreted things:
- Left
  For a object to be "to the left of", the object needs to be directly in the
  column to the left of another object. This will also be the same as puting
  the other object "to the right of" the first object.
- Right
  Same principle as for 'Left'.
- Above
  For a object to be "above" another object, the first object just needs to be
  somewhere above the second object (in the same column). We do not care about
  how "far" from eachother the obejcts are, meaning, there can be objects in between.
- Under
  Same principle as for 'Above'.

5.3 Things to ask Shrdlite to test the different extentions etc (Using any world):
(Here we use the complex world)
- pick up a red object
- pick up any red object
- put all red objects above a yellow object on the floor
- put the ball inside the red box
- put the black ball in the box
- put big ball inside small box

Note that some things might be missed (not test everything).
