README A*
*=====================================================================*
Fredrik Ström 8809045019 Henrik Svensson 8807075554, A*dam Scott 9005283859
*=====================================================================*
To test our examples run: 
tsc -- out example.js Astarexamples.ts
node example.js
*=====================================================================*We have two files, Astar.ts which contains the A* algorithm and a Graph interface. The Graph interface contains four functions getneighbors, getcost, heuristic_cost_estimate and specialIndexOf. These are functions which are depending on the model. The A* takes an object implementing the Graph interface.


The second file Astarexamples.ts contains our example. There is a class Shortestpath which implements the Graph interface, it models a grid with or without walls. We then create examples with this Shortestpath class and print the result. The heuristic_cost_estimate is a manhattan distance, with possible weight(in case of weight > 1 then optimal path is not guaranteed, but it may find a path faster).  


*=====================================================================*
Output from our example:


Example 1 with heuristic: no wall
Start: <2,2> End: <6,6>
Counter 25
Path -> <2,2><3,2><4,2><5,2><6,2><6,3><6,4><6,5><6,6>
Path length: 9


Example 2 with heuristic: wall
Start: <2,2> End: <6,6>
Counter 42
Path -> <2,2><3,2><4,2><5,2><6,2><6,3><7,3><7,4><7,5><6,5><6,6>
Path length: 11


Example 3 with heuristic: wall with hole in middle
Start: <2,2> End: <6,6>
Counter 23
Path -> <2,2><3,2><4,2><5,2><5,3><5,4><5,5><6,5><6,6>
Path length: 9


Example 4 without heuristic: wall with hole in middle
Start: <2,2> End: <6,6>
Counter 70
Path -> <2,2><3,2><4,2><5,2><5,3><5,4><5,5><6,5><6,6>
Path length: 9




Example 5 with heuristic weight 10(instead of 1): wall with hole in middle
Start: <2,2> End: <6,6>
Counter 11
Path -> <2,2><3,2><4,2><5,2><5,3><5,4><5,5><6,5><6,6>
Path length: 9