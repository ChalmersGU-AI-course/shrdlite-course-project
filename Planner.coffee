class Planner

Planner.plan = (interpretations, currentState) ->
  
  plans = []
  plan = interpretations[0]
  goalRep = plan.intp
  movesToGoal = Astar(currentState, goalRep, heuristicFunction,
     nextMoves, getNextState, satisfaction, equality)
  plan.plan = planInterpretation(movesToGoal)
  plans.push(plan)
  return plans
# This function adds text about what shrd does
planInterpretation = (moves) ->
  plan = []
  lastMove = ''
  for move in moves
    if not (move is lastMove)
      switch move
        when 'p'
          plan.push("Picking up item")
          lastMove = 'p'
        when 'd'
          plan.push("Dropping item")
          lastMove = 'd'
        when 'r'
          plan.push("Moving right")
          lastMove = 'r'
        when 'l'
          plan.push("Moving left")
          lastMove = 'l'
    plan.push(move)
  return plan

heuristicFunction = (state, goalRep) ->
  sum = 0
  for goal in goalRep
    if goal.rel is "holding"
      item = goal.args[0][0]
      for stack,i in state.stacks
        # If the item is in a stack add distance to it
        if item in stack
          sum += Math.abs( state.arm - i )# + 1
    else # All other relations has two arguments
      e1 = goal.args[0][0]
      e2 = goal.args[1][0]
      si1 = -1 # The stackindex of e1
      si2 = -1 # The stackindex of e2
      for stack,i in state.stacks
        if e1 in stack
          si1 = i
        if e2 in stack
          si2 = i
      # Floor is a special case 
      if e2 is "floor"
        if e1 isnt state.holding
          stack = state.stacks[si1]
          if stack.indexOf(e1) isnt 0
            sum += 3*(stack.length-stack.indexOf(e1))
      else
        # Found the stack of both items
        switch goal.rel
          when "ontop", "inside"
            if not onTopCheck(state, e1, e2)
              # If they are in the same stack but not "onTop"
              # we have to remove all items on top of the lower one
              if si1 is si2
                stack = state.stacks[si1]
                minPos = Math.min(stack.indexOf(e1), stack.indexOf(e2) )
                sum = sum + 3*(state.stacks[si1].length - minPos)
              # If they are in different stacks then add for both elements
              else # Add 3 for all items on top of e1 and e2
                s1 = state.stacks[si1]
                s2 = state.stacks[si2]
                if e1 isnt state.holding
                  sum += 3*(s1.length-s1.indexOf(e1))
                if e2 isnt state.holding
                  sum += 3*(s2.length-s2.indexOf(e2))
                # Also add for the difference in columns between them
                sum += Math.abs(si1 - si2)
          when "leftof"
            if e1 is state.holding
              # The distance should be 1 and +1 for drop
              sum += Math.abs(1 - (si2 - state.arm)) + 1
            else if e2 is state.holding
              sum += Math.abs(1 - (state.arm - si1)) + 1
            else
              # The distance should be 1 and +2 for pick and drop
              sum += Math.abs(1 - (si2-si1)) + 2
          when "rightof"
            if e1 is state.holding
              # The distance should be 1 and +1 for drop
              sum += Math.abs(1 - (state.arm - si2)) + 1
            else if e2 is state.holding
              sum += Math.abs(1 - (si1 - state.arm)) + 1
            else
              # The distance should be 1 and +2 for pick and drop
              costOver1 = 3*(state.stacks[si1].length-state.stacks[si1].indexOf(e1))
              costOver2 = 3*(state.stacks[si2].length-state.stacks[si2].indexOf(e2))
              sum += Math.abs(1 - (si1-si2)) + 2 + Math.min(costOver1, costOver2)
          when "beside"
            if e1 is state.holding
              sum += Math.abs(state.arm - si2) + 1
            else if e2 is state.holding
              sum += Math.abs(state.arm - si1) + 1
          when "above"
            if e1 is state.holding
              sum += Math.abs(state.arm - si2) + 1
            else if e2 is state.holding
              costOver = 3*(state.stacks[si1].length-state.stacks[si1].indexOf(e1))
              sum += Math.abs(state.arm - si1) + costOver + 1
            else
              # The height (position of item in list)
              h1 = state.stacks[si1].indexOf(e1)
              h2 = state.stacks[si2].indexOf(e2)
              # If not e1 above e2
              if not (si1 is si2 and h1 > h2)
                # Add work for all items above h1
                sum += 3*(state.stacks[si1].length-h1);
                # Add work for distance between them
                sum += Math.abs(si1-si2)
          when "under"
            if e1 is state.holding
              costOver = 3*(state.stacks[si2].length-state.stacks[si2].indexOf(e2))
              sum += Math.abs(state.arm - si2) + costOver + 1
            else if e2 is state.holding
              sum += Math.abs(state.arm - si1) + 1
            else
              # The height (position of item in list)
              h1 = state.stacks[si1].indexOf(e1)
              h2 = state.stacks[si2].indexOf(e2)
              # If not e1 above e2
              if not (si1 is si2 and h1 < h2)
                # Add work for all items above h1
                sum += 3*(state.stacks[si1].length-h2);
                # Add work for distance between them
                sum += Math.abs(si1-si2)
  return sum

nextMoves = (state) ->
  moves = []
  
  nbrOfStacks = state.stacks.length
  cranePos = state.arm
  craneItem = state.holding

  # Crane movement
  if cranePos > 0
    moves.push("l")
  if cranePos < nbrOfStacks-1
    moves.push("r")

  # Crane items
  stack = state.stacks[cranePos]
  if craneItem is null
    if stack.length > 0
      moves.push("p")
  else
    craneItem = getItem(state, craneItem)
    # Check if drop is legit
    if stack.length > 0
      topItem = getItem(state, stack[stack.length-1])
      if isObjectDropValid(craneItem, topItem)
        moves.push("d")
    else
      # No items in stack
      moves.push("d")

  return moves

getItem = (state, letter) ->
  switch letter
    when "a" then return state.objects.a
    when "b" then return state.objects.b
    when "c" then return state.objects.c
    when "d" then return state.objects.d
    when "e" then return state.objects.e
    when "f" then return state.objects.f
    when "g" then return state.objects.g
    when "h" then return state.objects.h
    when "i" then return state.objects.i
    when "j" then return state.objects.j
    when "k" then return state.objects.k
    when "l" then return state.objects.l
    when "m" then return state.objects.m
    else console.log "Did not recognize object!"

isObjectDropValid = (craneItem, topItem) ->
  # Cannot place large item on small item
  if not (topItem.size is "small" and craneItem.size is "large")
    # Cannot place any items on a ball
    if topItem.form isnt "ball"

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
  stackCopy = []
  for s,i in state.stacks
    stackCopy.push([])
    for item in s
      stackCopy[i].push(item)
  newState =
    holding: state.holding
    arm:     state.arm
    stacks:  stackCopy
    objects: state.objects
  if move is 'p'
    newState.holding = newState.stacks[newState.arm].pop()
  else if move is 'd'
    newState.stacks[newState.arm].push(newState.holding) 
    newState.holding = null
  else if move is 'r'
    newState.arm = state.arm + 1
  else if move is 'l'
    newState.arm = state.arm - 1
  return newState

equality = (state, goal) ->
  return state.arm == goal.arm && state.holding == goal.holding && "#{state.stacks}" is "#{goal.stacks}"

polarity = (polarity, b) ->
  return ((not polarity and not b) or (polarity and b))

leftOfCheck = (state, left, right) ->
  result = false
  for stack,i in state.stacks
    if right in stack
      if i isnt 0 and left in state.stacks[i - 1]
        result = true
  return result

onTopCheck = (state, above, below) ->
  result = false
  if below is "floor" # Floor is a special case..
    for stack in state.stacks
      if above in stack
        return stack.indexOf(above) is 0
  for stack in state.stacks
    if below in stack
      if (stack.indexOf(above) - stack.indexOf(below)) is 1
        result = true
  return result

aboveCheck = (state, above, below) ->
  result = false
  for stack in state.stacks
    if below in stack
      if stack.indexOf(above) - stack.indexOf(below) >= 1
        result = true
  return result

besideCheck = (state, a, b) ->
  return leftOfCheck(state,a,b) or leftOfCheck(state,b,a)

# For each element in itemList1, the relation is evaluated for
# all elements in itemList2. 
#
# The first quantifier describes the items of the first list.
# The second quantifier describes the items of the second list
# in relation to the items of the first list.
#
# examples:
# 1) foo(state, "all", [all objects], onTopCheck, "the", ["floor"])
#     all objects are on the floor.
# 2) foo(state, "any", [all balls], leftOfCheck, "any", [all boxes]
#     any one ball is to the left of any one box.
# 3) foo(state, "all", [Small Green Table], onTopCheck, [Big Red Box])
#     the Small Green Table is inside the Big Red Box
# 4) foo(state, "all", [all balls], inside, "any", [all boxes]
#     any one ball is to the left of any one box.
checkRelation = (state, quantifier1, itemList1, relation, quantifier2, itemList2) ->
  result = if quantifier1 is "any" then false else true
  for item1 in itemList1
    # quant
    itemResult = if quantifier2 is "any" then false else true
    for item2 in itemList2
      if quantifier2 is "any"
        itemResult = itemResult or relation(state, item1, item2)
      if quantifier2 is "all"
        itemResult = itemResult and relation(state, item1, item2) 
    if quantifier1 is "any"
      result = result or itemResult
    if quantifier1 is "all"
      result = result and itemResult
  return result

satisfaction = (state, goalRep) ->
  result = true
  for goal in goalRep
    p = goal.pol
    q1 = "all"#goal.quantifier1
    q2 = "all"#goal.quantifier2
    c = false
    switch goal.rel
      when "holding"
        c = (goal.args[0][0] is state.holding)
      when "ontop", "inside"
        A = goal.args[0]
        B = goal.args[1]
        c = checkRelation(state, q1, A, onTopCheck, q2, B)
      when "leftof"
        A = goal.args[0]
        B = goal.args[1]
        c = checkRelation(state, q1, A, leftOfCheck, q2, B)
      when "rightof"
        A = goal.args[0]
        B = goal.args[1]
        c = checkRelation(state, q1, B, leftOfCheck, q2, A)
      when "beside"
        A = goal.args[0]
        B = goal.args[1]
        c = checkRelation(state, q1, A, besideCheck, q2, B)
      when "above"
        A = goal.args[0]
        B = goal.args[1]
        c = checkRelation(state, q1, A, aboveCheck, q2, B)
      when "under"
        A = goal.args[0]
        B = goal.args[1]
        c = checkRelation(state, q1, A, aboveCheck, q2, B)
    result = result and polarity(p, c)

  return result

Planner.planToString = (res)->
  console.log "called planToString"
  return "tostring"

class Planner.Error
  constructor: (@msg) ->

  toString : ->
    return @msg
