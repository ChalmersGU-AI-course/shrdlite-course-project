1)How to run the project: 
  - make html in the main directory
  - open shrdlite.html with any web browser 
  
2)Extension:
  If multiple parses gave an interpretation in the current world then the user is asked to choose which of the parse was intended.
  (It is only to disambiguate the parses not the interpretations, if there are two balls and the user input is "take the ball" no question will be asked to the user).
  An example:
  if the user input was "put the white ball in a box on the floor" and two interpretations (one for each parse) are found then the user has to choose between the following choices: put the white ball in a box that is on the floor" or "put the white ball that is in a box on the floor". If there was only one interpretation found then no question will be asked and the valid interpretation would be returned to the planner.
  
  The extension can be found in the file Interpreter.ts
  
3)A* heuristic:
  The fcost in the A* is calculated via the function "heuristic", the value returned is based on the minimal number of pick and drop, and distances between objects that are mentioned in the double array of Interpreter.Literal. Many cases are taken care of such as when the arm is already holding an object, when the floor is an argument etc...
  
  The implementation of A* and the heuristic function can be found in the file SearchAlgo.ts
