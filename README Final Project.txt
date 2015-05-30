**************************************************************
** README - Final project Shrdlu - Artificial Intelligence 	**
** 			  Group Potatissallad/Goto fail;				**
** 					2015 - period 4							**
**************************************************************

The project is entirely coded in Typescript and fully working in the html view.

-= Features =-
 
 "Laziest-first strategy" which means that to resolve ambiguities (parsing as well as interpretation),
 the heuristic will be run for each possibility of goal and the lowest score will be chosen.
 
 - Implemented the any, all feature
 - When "the" is used and matches several possibilities, we get notified how much objects are designed.
 - When "a" (or any) is used, the simplest move is chosen
 - All these relations have been implemented: on top, inside, beside, above, under, right of, left of, holding.
 - It is possible to ask to "take" an object and then refer to it by "it" in the next utterance.
 - It is possible to ask several propositions at a time with relations "and" and "or":
 	For example: "Put a table in a red box and take a brick or put a box on the floor."
 	This would try to resolve "put a table in a red box" and "take a brick" simultaneously, or "put a box on
 	the floor". The cheapest solution according to the heuristic would be chosen.
 
 See the example section at the end for some interesting demos!
 
 
-= Parser modifications =-

 [see Parser.ts file, first function]
 The parser has been modified to parse sentences with "and"/"or", with priority on "and" as in boolean algebra.
 
 
-= Interpreter implementation =-
 
 Some comments are writen in the code.
 
 
-= Planner implementation =-
 
 --> Graph search: AStar algorithm [implemented in AStar.ts file]
 
	 We represent one state as a configuration of the piles. The position of the arm and whether
	 he's holding anything is not taken into account. If we start or finish with an object in the arm,
	 the additional moves are made before or after the AStar algorithm. (If there's an object hold by
	 the arm at start, we "drop" it before launching the AStar research, and if we want to hold an object
	 at the end, we just ensure in the AStar that this object is on top of a pile, and grab it after the AStar.)
	 
	 So, one transition is called a "Move" and is determined by a "pick" column and a "drop" column.
	 We build the graph dynamically. We start from the current state, then build every neighbor state by
	 trying every possible Move (see computeNeighbor method of class Node). Then we compute the path cost
	 and heuristic for each neighbor and add them to the frontier of the AStar search.
	 A same state may be reached by different path, we prevent this by using a string representation of
	 a state (hash) so that we can compare if two instances of a Node are actually the same "State". We would
	 set this Node with the shortest path.
	 
	 Graph representation:
	 	Node with the attributes:
	 	- content: Planner.State
	 			Planner.State contains:
	 			- stacks: string[][] the stacks of objects
	 			- moves: Move[] the list of moves from start to this state
	 			- hash: a string representing the state uniquely
	 	- neighbors: Arc[]
	 			Arc contains:
	 			- destination: Node a destination node
	 			- weight: associated weight (in our case, always 1)
	 	- g_score: number the cost of the path from start
	 	- f_score: number evaluation of the total cost: g_score + heuristic

 --> Heuristic: [implemented in Planner.ts, at the end of the file]
 
	 * Prototype:
	 function heuristic(stacks: string[][], goalConditions: Interpreter.Literal[]) : number
	 
	 It computes an under-estimate of the number of Moves to perform in order to fulfill each goal conditions.
	 
	 * Args:
	 - stacks: the objects in stacks for a given state
	 - goalConditions: list of Literals describing binary relations (or unary for the holding constraint)
	 between 2 objects. Ex: ontop<"a","floor">, leftof<"d","b">
	 
	 It relies on the number of object to be moved.
	 There are different cases depending on the relation:
	 "ontop"/"inside", "beside", "above"/"under", "rightof"/"leftof", "holding".
	 
	 The goal is to fill a list of the objects we need to move, without duplicate, and simply return the length
	 of this list. The number of Moves needed would be at least the number of objects to be moved and therefore,
	 we guarantee the admissibility of the heuristic. If all the goal constraints are reached, the heuristic is
	 null (0).
	 
	 * Example:
			Stacks:
			    c
			_ a b _
		 
		 	Goal:
		 ontop<"a","b">, leftof<"c","b">, leftof<"c","a">
		 
		 objMove=[]
		 for ontop<"a","b"> : we need to move all objects above a and b, plus a itself: objMove=[a,c]
		 for leftof<"c","b"> : we need to move all objects from above one of both concerned objects,
		 						plus one of themselves.
		 						b has one object over itself, so it should be faster to move c,
		 						which is already in objMove. So objMove=[a,c]
		 for leftof<"c","a"> : same consideration and we still have objMove=[a,c].
		 
		 The heuristic value for this state according to these goal conditions is therefore 2.
		 Here, we can see that we can indeed solve the problem in two moves. If there weren't the left-most stack,
		 it would have been 3 moves.
	 
	 Our AStar algorithm with this admissible heuristic can therefore reach the goalConditions in the fewest
	 Moves possible!
	 
	 Note that the optimisation is on the number of moves and not in the distance travelled by the arm.
	 
	 This could have been adapted to this method as well, but we didn't try to implement it. (The transition
	 cost in the graph wouldn't be always 1 anymore but the distance between both columns + pick and drop.)


-= Examples =-

[To run in complex world. /!\ Reset the world for each example.]

- Take the yellow object.
- Take a yellow object. (The easiest one to take will be chosen)
- Put all red objects above a yellow object on the floor.
- Put the white ball right of all objects.
- Put a red table on the floor and put a box on the floor and put a blue table in a box and take a brick.
- Put a table in a red box and take a brick or put a box on the floor.
- Put all boxes on the floor and take a yellow object.
- Put a black ball left of all objects.
