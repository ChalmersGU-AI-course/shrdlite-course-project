A* files.
The files for A* are inside the search folder.
	Search.ts
		This is just an interface for searches.
	Astar.ts
		This is where the magic happens. We used a couple of helper library for this. So we haven’t defined the PriorityQueue or the Dictionary ourselves.  The PriorityQueue is so that we can pick the next point with the best value. Best in this case is the lowest with the cost to go there + the heuristic value to go the. We don't make use of multiple sets for the “open” and “closed” set but rather we change the values in the dictionary.
	Heuristic.ts
		Is yet another interface over how they are supposed to look like.

Library Files.
	Both the dictionary and priority queue are located in the collections.ts file in the lib folder.

How to test.

We have a couple of test files in the Test folder. Most of the are pretty simple.
	TestNoPathToEnd.ts
		Test to see if it finishes even when there is no path to the end.
	TestMultipleEnds.ts
		This have multiple ends. You can change the value of a connection to make it go to different ends.
	TestCircularGraph.ts
		This test have a circular connection. It still finds the way through.
	TestCircularNoEnd.ts
		This is the circular test from before but no end. Just to make sure that it do not get stuck.

You can build and run them by going to the test folder and running "make all".
The JavaScript files are put in the "dist" folder together with the log files.

