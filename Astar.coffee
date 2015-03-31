# "Enum" of the possible moves
# E.g: Move.LEFT
Move =
	LEFT:	1
	RIGHT:	2
	UP:		3
	DOWN:	4

# A* algorithm.
# start is the start state
# goal is the goal state
# heuristicFunction is the heuristic function
# nextMoves gives the possible moves from current state
Astar = (start, goal, heuristicFunction, nextMoves) ->



nextMoves = (currentState) ->
  possibleMoves = []

  return possibleMoves

nyDist = (current, goal) ->
  sum = 0
  return sum
