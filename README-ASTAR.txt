README-ASTAR

SAGZ - A* implementation
---------------------------
	Goal of the game
		The goal is the sort the squares of numbers such that
		the state will become:
		1	2	3
		4	5	6
		7	8	[]

	How to play the game
		1. Click on one of the squares adjacent to the blank square
		2. Repeat 1 untill you reach the final state(see Goal of the game)

	How to run the game
		1. Compile it with the command: sh Fifteen.sh
		2. Open index.html in a browser
		3. Play the game(see How to play the game)

	How to run A*
		1. 	Run the game(see How to run the game)
		2. 	Press UP-KEY to start A*
		3. 	The function will alert when it has found 
			the solution and will print out the path to get there.

	Files
		fifteen.coffee 	-	includes everything specific to the game
							which also includes the heuristic function and
							other functions for the A* problem instance
		Astar.coffee 	-	is the generic A* algorithm
		index.html		-	is where you run the game
		Fifteen.sh 		-	bash script that compiles the neccesary
							coffeescript and typescript files

	Heuristics
		Manhattan distance	-	This works well for the problem instance.
		Without heuristics	-	This did not work well on the general case
								of the problem instance. It did take too long
								time to compute most of the time.