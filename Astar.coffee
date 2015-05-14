PriorityQueue = require('./priority-queue.js')
# A* algorithm.
# start is the start state
# goal is the goal "state"
# heuristicFunction is the heuristic function
# nextMoves gives the possible moves from current state
# getNextState gives a new state given a move
# Equality compares to states for equality
Astar = (start, goal, heuristicFunction, nextMoves, getNextState,
    satisfaction, equality) ->
  openSet = new PriorityQueue({ comparator: compareObjects })
  closedSet = []
  # Add the start state to the queue
  totalCost = heuristicFunction(start, goal)
  startObject = 
      state:  start
      moves:  []
      cost:   totalCost
  openSet.queue(startObject)

  # A* iteration
  while openSet.length > 0
    current = openSet.dequeue()
    if satisfaction(current.state, goal)
      console.log "Number of states searched in Astar: " + closedSet.length
      console.log "Length of solution: " + current.moves.length
      return current.moves
    closedSet.push(current.state)
    listOfPossibleMoves = nextMoves(current.state)
    # All possible moves from move chosen from priority queue
    for move in listOfPossibleMoves
      state = getNextState(current.state, move)
      if not (true in (equality(state, closed) for closed in closedSet))
        path = current.moves.concat(move)
        totalCost = heuristicFunction(state, goal) + path.length
        stateObject =
          state:  state
          moves:  path
          cost:   totalCost
        openSet.queue(stateObject)
  return -1
    
compareObjects = (obj1, obj2) ->
  return obj1.cost - obj2.cost
