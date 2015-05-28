#How to run the project

Compile Project with `>tsc shrdlite-html.ts -out shrdlite-html.js`
for the browser version and `>tsc shrdlite-offline.ts -out shrdlite-offline.js`
for the Node.js version


#Extensions

###Quantifiers :
* the:  Returns errors when the object is not distinguishable given the explanation
* all:  Specifies that all objects of the specified type should be placed according to the given scenario.
* any: Selects any interpretation concerning the object 

This is realised in the interpreter 

###To make the planner describe what it is doing, in a way that is understandable to humans. One important part of this will be to know how to describe the different objects in concise way. (E.g., if there is only one ball, then you just have to say that it is a ball.)
This is managed in the path reconstruction of the A* algorithm. 



#Heuristics: 
In general we check how many moves it takes to move all objects over the object we want to work on. Then we check how many moves it takes to move the source object to the target object, heur += distance + 2 (the 2 is for picking up and dropping down the object). Every action done on an object increases the heuristics by 1.

The crane is also considered in heuristic as the distance to the closest object of interest. 

We thought of some special cases and tried to make them work as good as we can, e.g. if we want to put an object X over an object Y but right now Y is over X, in this case we just want to clear all things above X (Y will be one of those objects) then take X and put it on top of the stack that Y was relocated.

The full heuristic function can be found in middle of Planner.ts and is named “getHueristic”.
