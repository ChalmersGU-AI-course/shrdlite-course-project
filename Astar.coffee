# TODO: Include priority queue lib to html
# https://github.com/adamhooper/js-priority-queue

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
  openSet = #PriorityQueue()
  closedSet = []
  listOfPossibleMoves = nextMoves(start)
  
  # Init open set
  for i in listOfPossibleMoves
    nextState = getNextState(start, listOfPossibleMoves[i])
    totalCost = heuristicFunction(nextState, goal) + 1 # 1 extra for the step to next state
    stateObject = # TODO: better name here
      state: nextState
      moves: listOfPossibleMoves[i]
    openSet.queue(totalCost, stateObject])

  # A* iteration
  while openSet.length > 1
    currentStateObject = openSet.dequeue()
    currentState = currentStateObject.state
    currentTraversed = currentStateObject.moves
    if currentState is goal
      # Vad ska vi göra då?
    closedSet.push(currentStateObject)
    listOfPossibleMoves = nextMoves(currentState)

    # All possible moves from move chosen from priority queue
    for i in listOfPossibleMoves
      nextState = getNextState(currentState, listOfPossibleMoves[i])
      if nextState not in closedSet
        totalCost = heuristicFunction(nextState, goal) + currentTraversed.length + 1
        stateObject =
          state: nextState
          moves: listOfPossibleMoves[i]
        openSet.queue(totalCost, stateObject)
    


nextMoves = (currentState) ->
  possibleMoves = []

  return possibleMoves

nyDist = (current, goal) ->
  sum = 0
  return sum

getNewState = (currentState, move) ->

	return newState
