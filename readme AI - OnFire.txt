readme AI - OnFire

Hello,

#To run the program follow these steps.

1. go to the shrdlite directory and run the command -  "make all"
    This will compile the .ts files to javascript.
2. open the shrdlite.html in a browser.


Interesting examples to test the shrdlite.

- Small World

1. put the white ball in a box on the floor.
    - This command will give the user the chance to select between two options.
    This is because of ambiguity in the question. To select an option respond by typing the number corresponding to your choice.

- Medium World
1. put the green plank in the red box. - Very interesting and fun to watch.
    The heuristic have made it possible to find a solution in a reasonably amount of time. Before we had time outs but now the heuristic makes it possible to find a solution without script stalling.

2. Put the green plank on the red plank. It is possible to find solution pretty fast.

Complex World



###Extensions implemented.###############################
- Ambiguity

Where in code.
- Interpreter.ts row 20 - check if there are more than one interpretation.
    If more than one interpretation,  calls function makeClariQuest (row 60)

    makeClariQuest , uses help functions getRestOfPath and cmpObj.

    MakeClariQuest - Compares the different interpretations and adds the entity and location with the most nested objects


- Shredlite.ts
    (row 55 and forward) Check if last question was ambiguous and parses the input from the user to chose a correct interpretation.

- World.ts
    (row 20) Added support for lastans in world.

- Grammar.ne
    (row 40)
    added support for numbers as command in grammar.


### AStar planning heuristics. ############################

the function is called heuristicFunc in planner.ts (row 197) and it is a manhattan heuristic.

the arguments to the function are,
 - current state which is a worldState
 - goal which is a list of lists of pddl goals.

The return statement is a number corresponding to the heuristic value for the worldstate.

For each goal it finds the objects that matches the goal in the stacks in the worldstate.

We give different penalty to the object depending on how high it is in  the stack. If the object is on top of a stack we give penalty 0.
otherwise we give 4 penalty points for each object that is above the goal object, the we reduce it with one because on the last move we do not need to move the arm 4 times.

We also add a penalty of one for each floor between the target and goal.

If holding is the goal then we just take height of the stack as penalty and ignore location.

We have also added a arm penalty that adds more points if the arm is not holding the target and is dependent on how far from the target the arm is. more points if the arm is far from the target.


##Strange Behaviour ######################################

for example in medium world if we use the following command.
- Put the green plank right of the blue box.
Our shrdlite picks up the white ball and moves it unnecessarily but it seems to be concentrated to the left command. Most likely it has something to do with the arm penalty in the heuristic.


##Extra information#######################################

It was a fun project!!
But a lot to do....

