class Planner

Planner.plan = (interpretations, currentState) ->
  
  plans = []
  movesToGoal = Astar(currentstate, intprt.intp[0], heuristicFunction,
      nextMoves, getNextState, equality)
  plan.plan = planInterpretation(movesToGoal, currentState)
  plans.push(plan)
  return plans

planInterpretation = (intprt, state) ->
  plan = []
  plan.push("Picking up")
  plan.push("p")
  plan.push("Moving right")
  plan.push("r")
  plan.push("r")
  plan.push("Dropping down")
  plan.push("d")
  return plan

heuristicFunction = (start, goal) ->
  return 0

nextMoves = (state) ->
 return []

getNextState = (state, move) ->
  if move is 'p'
    state.holding = state.stacks[state.arm].pop()
  else if move is 'd'
    state.stacks[state.arm].push(state.holding) 
    state.holding = null
  else if move is 'r'
    state.arm = state.arm + 1
  else if move is 'l'
    state.arm = state.arm - 1
  return state

equality = (state, goal) ->
  return false;

Planner.planToString = (res)->
  console.log "called planToString"
  return "tostring"

class Planner.Error
  constructor: (@msg) ->

  toString : ->
    return @msg
