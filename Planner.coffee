class Planner

Planner.plan = (interpretations, currentState) ->
  plans = []
  for intprt in interpretations
    plan = intprt
    plan.plan = planInterpretation(plan.intp, currentState)
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

Planner.planToString = (res)->
  console.log "called planToString"
  return "tostring"

class Planner.Error
  constructor: (@msg) ->

  toString : ->
    return @msg
