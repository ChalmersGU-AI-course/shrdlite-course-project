TIN172 - Artificial Intelligence, LP4, VT 2015
========
Group 15
--------
###Gustav Alm Rosenblad
###Lukas Borin
###Denise Glansholm
###Patrik Ingmarsson

Building the project
========
If you wish to build the shrdlite project, simply run

    make all
and clicking shrdlite.html, which will run the project in your default browser.
If you wish to run the A* test suite, please refer to README-ASTAR.txt

Extensions
==========
We have completed no extensions.

Heuristics
==========

The heuristics are contained in the aptly named file "Heuristics.ts". We have chosen to implement one function for every kind of heuristic. These functions are called by the function createHeuristicsFromPDDL, which only checks what kind of goal the PDDL contains, and calls the right function. For example, if the goal is to pick up a certain object, it calls the function holdingHeuristic, contained in Heuristics.ts .
A summary of our heuristic functions:

holding
-------
In order to pick up an object, we need to remove all objects above it. For each object we'll have to remove, we add a variable penalty, chosen to be five after some testing. This makes this heuristic just short of admissible, as it could take only 4 moves (pick up, move left, drop, move right) to remove an object from a stack and return to the original arm position. Admissibility was sacrificed since we found that a penalty value of five made for a faster convergence time.
If the robot isn't currently holding anything, we also add one penalty point for every step it will take to get to the desired object's stack in order to encourage the robot to move back to the stack to pick up the next object.

ontop
-----
This heuristic implements the "above", "inside" and "ontop" PDDL goals, since all of these are very similar in our interpretation. If the goal is to put an object on the floor, we add a variable penalty for every object currently above the object to be moved. This penalty is currently 5, as we found it to be best performing in our test runs. This makes the heuristic non-admissible for the floor case.
If we are to put two normal stack-able objects on-top of one another, we begin by checking whether the objects are currently in the same stack. We introduced a special heuristic for this case, since we found that the planning algorithm had some difficulties in dealing with it. In order to be able to move both objects, the robot might have to create multiple different stacks. In the complex world specifically this was hard to overcome. With some custom penalties, sacrificing the perfect solution for a faster convergence time, this problem mostly disappeared.
For every object above the object we will want to place above the other object, we introduce a penalty of ten points. If the object we will want to place above the other object is topmost, we introduce a negative penalty of 30, but also introduce a penalty of five for every object above the other object which is not the first object. The negative penalty is needed for the robot to prefer states in which the first object is topmost.
If the objects are in different stacks, we simply introduce the variable penalty (five) for every object above them. Additionally, if the robot is holding the object which should be below another, we add the variable penalty to discourage the under object from being picked up. If we are holding the over object, we add a negative variable penalty if the under object is topmost.

sideOf
------
This heuristic implements the "rightof", "leftof" and "beside" PDDL goals. We interpreted these goals as primarily wanting to move the one of the objects. If I tell someone to "put the ball to the left of the box", I probably want them to pick up the ball and put it to the left of the box. If they instead chose to pick up the box and put it to the right of the ball, the ball would most certainly be to the left of the box, but nobody would have "put the ball to the left of the box", since the ball was never moved. As such, we have introduced a heavy penalty to moving the object we prefer to stay put. This is implemented as a penalty of 50 for the states in which the robot is currently holding the object we'd prefer to be stationary. In addition to this, we have a variable penalty currently set to five (as in the other heuristics) for every object currently on top of the object we want to move.

Spatial constraints
===================
In order to ensure that we put ourselves in an infinite loop trying to figure out how to get to an impossible goal, we have implemented a validator of PDDL goals, located in the file "SpatialConstraints.ts". In this module, you'll find the function validatePDDLGoal which ensures that a particular PDDL goal is reachable for a given world. You cannot place an object on top of itself (put the box on the box), you cannot place certain kinds of objects on other kinds of objects (put the red box on the black ball). Additionally, as we have explained in section pertaining to the "sideOf" heuristic, in states where it isn't possible achieve the goal without moving the stationary object (for example when we want to move one object to the left of another object which is located at the left wall), we reject the request.
