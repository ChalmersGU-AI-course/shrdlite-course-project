class Planner

Planner.plan = (interpretations, currentState) ->
  
  plans = []
  plan = interpretations[0]
  #movesToGoal = Astar(currentstate, intprt.intp[0], heuristicFunction,
  #   nextMoves, getNextState, equality)
  plan.plan = planInterpretation(plan.intp, currentState)
  plans.push(plan)
  console.log plan.intp
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
  moves = []
  
  nbrOfStacks = state.stacks.length
  cranePos = state.arm
  craneItem = state.holding

  # Crane movement
  if cranePos > 0
    moves.push("r")
  if cranePos < nbrOfStacks-1
    moves.push("l")

  # Crane items
  stack = state.stacks[cranePos]
  if craneItem is null
    if stack.length > 0
      moves.push("p")
  else
    # Check if drop is legit
    if stack.length > 0
      topItem = stack[stack.length-1]
      if isObjectDropValid(craneItem, topItem)
        moves.push("d")
    else
      # No items in stack
      moves.push("d")


  return moves

isObjectDropValid = (craneItem, topItem) ->
  # Cannot place large item on small item
  if not (topItem.size is "small" and craneItem.size is "large")
    # Cannot place any items on a ball
    if topItem.form is not "ball"

      # Cases for crane item

      # Box cannot contain plank or pyramid of same size
      if craneItem.form is "plank" or craneItem.form is "pyramid"
        return topItem.form is "box" and (topItem.size is craneItem.size)

      switch craneItem.form
        when "brick"
          return true
        when "ball"
          # Ball can only be in box or on floor(which is checked outside)
          return topItem.form is "box"
        when "table" 
          return true
        when "box" 
          # Box cannot contain box of same size
          if not (topItem.form is "box" and (topItem.size is craneItem.size))
            # Box cannot be supported by pyramid
            if not (topItem.form is "pyramid")
              # Small box cannot be supported by small brick
              if not (craneItem.size is "small" and topItem.size is "small" and topItem.form is "brick")
                return true 
          return false
  return false

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
  return state.arm == goal.arm && state.holding == goal.holding && "#{state.stacks}" is "#{goal.stacks}"

polarity = (polarity, b) ->
  return ((not polarity and not b) or (polarity and b))

leftOfCheck = (state, left, right) ->
  result = false
  for stack,i in state.stacks
    if right in stack
      if i is not 0 and left in state.stacks[i - 1]
        result = true
  return result

onTopCheck = (state, above, below) ->
  result = false
  for stack in state.stacks
    if below in stack
      if stack.indexOf(above) - stack.indexOf(below) is 1
        result = true
  return result

aboveCheck = (state, above, below) ->
  result = false
  for stack in state.stacks
    if below in stack
      if stack.indexOf(above) - stack.indexOf(below) >= 1
        result = true
  return result

satisfaction = (state, goalRep) ->
  result = true
  for goal in goalRep
    p = goal.pol
    c = false
    switch goal.rel
      when "holding"
        c = (goal.args[0] is state.holding)
      when "ontop", "inside"
        a = goal.args[0]
        b = goal.args[1]
        c = onTopCheck(state,a,b)
      when "leftof"
        a = goal.args[0]
        b = goal.args[1]
        c = leftOfCheck(state,a,b)
      when "rightof"
        a = goal.args[0]
        b = goal.args[1]
        c = leftOfCheck(state,b,a)
      when "beside"
        a = goal.args[0]
        b = goal.args[1]
        c = leftOfCheck(state,a,b) or leftOfCheck(state,b,a)
      when "above"
        a = goal.args[0]
        b = goal.args[1]
        c = aboveCheck(state,a,b)
      when "under"
        a = goal.args[0]
        b = goal.args[1]
        c = aboveCheck(state,b,a)
    result = result and polarity(p, c)

  return result

Planner.planToString = (res)->
  console.log "called planToString"
  return "tostring"

class Planner.Error
  constructor: (@msg) ->

  toString : ->
    return @msg
