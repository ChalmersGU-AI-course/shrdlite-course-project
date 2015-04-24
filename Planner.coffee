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
