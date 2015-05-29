class Planner

# Plan according to the chosen interpretation and based on the current state of the world
# Chose the interpretation with lowest heuristic
# Input: List of interpretation, the current state of the world
# Output: Return the plan
Planner.plan = (interpretations, currentState) ->
  plans = []
  # Pick the interpretation with the lowest heuristic
  minHeuristic = -1
  planIndex = -1
  for inter,i in interpretations
    heuristic = heuristicFunction(currentState, inter.intp)
    if heuristic < minHeuristic or planIndex is -1
      planIndex = i
      minHeuristic = heuristic
  plan = interpretations[planIndex]
  console.log "The interpretation (" + planIndex + ") was chosen with heuristic " + minHeuristic
  goalRep = plan.intp
  start = new Date().getTime()
  # Search with GBFS for 200 states 
  movesToGoal = GreedyBFS(currentState, goalRep, heuristicFunction,
     nextMoves, getNextState, satisfaction, equality)
  # If no solution then switch to A*
  if movesToGoal is -1
    movesToGoal = Astar(currentState, goalRep, heuristicFunction,
     nextMoves, getNextState, satisfaction, equality)
  end = new Date().getTime()
  console.log "Total search time: " + (end - start) + "ms"
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

# Calculates the heuristic for the way from the current state to the goal state.
# Input: Current state, goal state
# Output: The heuristic cost
heuristicFunction = (state, goalRep) ->
  sum = 0
  for goal in goalRep
    if goal.rel is "holding"
      item = goal.args[0][0]
      for stack,i in state.stacks
        # If the item is in a stack add distance to it
        if item in stack
          sum += Math.abs( state.arm - i )
          sum += 4*(stack.length-stack.indexOf(item)-1)
      sum += if item isnt state.holding then 1 else 0 # add cost to pick it up

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
        #dist to nearest empty spot, else 
        mindist = 10000 #INF
        for stack,i in state.stacks
          if si1 is i
            mindist = Math.min(mindist, 6 + 4*stack.indexOf(e1))
          else
            if e1 isnt state.holding
              mindist = Math.min(mindist, 2 + Math.abs(i-si1) + 4*state.stacks[i].length)
            else
              mindist = Math.min(mindist, 1 + Math.abs(i-state.arm) + 4*state.stacks[i].length)
        if e1 isnt state.holding
          stack = state.stacks[si1]
          if stack.indexOf(e1) isnt 0
            sum += 4*(stack.length-stack.indexOf(e1) - 1)
            # cost for lifting e1, and dropping at new location
            sum += mindist
        else
          # cost for dropping e1 at current location
          # if floor does not have empty space.
          sum += mindist - 1 - (i+1)
      else
        # Found the stack of both items
        # incorrect, stack -1 if holding
        switch goal.rel
          when "ontop", "inside"
            if not onTopCheck(state, e1, e2)
              # If they are in the same stack but not "onTop"
              # we have to remove all items on top of the lower one
              if si1 is si2
                stack = state.stacks[si1]
                minPos = Math.min(stack.indexOf(e1), stack.indexOf(e2) )
                sum = sum + 4*(state.stacks[si1].length - minPos - 1)
              # If they are in different stacks then add for both elements
              else # Add 3 for all items on top of e1 and e2
                if e1 isnt state.holding
                  stack = state.stacks[si1]
                  sum += 4*(stack.length - stack.indexOf(e1) - 1)
                if e2 isnt state.holding
                  stack = state.stacks[si2]
                  sum += 4*(stack.length - stack.indexOf(e2) - 1)

                sum += 1 # add drop cost for the item to move
                if e1 isnt state.holding # add pick up cost for the item
                  sum += 1

                # Also add for the difference in columns between the items
                pos1 = if si1 is -1 then state.arm else si1
                pos2 = if si2 is -1 then state.arm else si2
                sum += Math.abs(pos1 - pos2)
          when "leftof"
            if e1 is state.holding
              # The distance should be 1 and +1 for drop
              sum += Math.abs(1 - (si2 - state.arm)) + 1
            else if e2 is state.holding
              sum += Math.abs(1 - (state.arm - si1)) + 1
            else
              # The distance should be 1 and +2 for pick and drop
              costOver1 = 4*(state.stacks[si1].length - state.stacks[si1].indexOf(e1) - 1)
              costOver2 = 4*(state.stacks[si2].length - state.stacks[si2].indexOf(e2) - 1)
              sum += Math.abs(1 - (si2-si1)) + 2 + Math.min(costOver1, costOver2)
          when "rightof"
            if e1 is state.holding
              # The distance should be 1 and +1 for drop
              sum += Math.abs(1 - (state.arm - si2)) + 1
            else if e2 is state.holding
              sum += Math.abs(1 - (si1 - state.arm)) + 1
            else
              # The distance should be 1 and +2 for pick and drop
              costOver1 = 4*(state.stacks[si1].length - state.stacks[si1].indexOf(e1) - 1)
              costOver2 = 4*(state.stacks[si2].length - state.stacks[si2].indexOf(e2) - 1)
              sum += Math.abs(1 - (si1-si2)) + 2 + Math.min(costOver1, costOver2)
          when "beside"
            if e1 is state.holding
              sum += Math.abs(state.arm - si2) + 1
            else if e2 is state.holding
              sum += Math.abs(state.arm - si1) + 1
            else
              dist = Math.abs(Math.abs(si1 - si2) - 1)
              sum += dist + if dist > 1 then Math.min(Math.abs(state.arm - si1), Math.abs(state.arm - si2)) + 2 else 0
              costOver1 = 4*(state.stacks[si1].length - state.stacks[si1].indexOf(e1) - 1)
              costOver2 = 4*(state.stacks[si2].length - state.stacks[si2].indexOf(e2) - 1)
              sum += if state.holding isnt null then 1 else 0
              sum += Math.min(costOver1, costOver2)
          when "above"
            if e1 is state.holding
              sum += Math.abs(state.arm - si2) + 1
            else if e2 is state.holding
              costOver = 4*(state.stacks[si1].length-state.stacks[si1].indexOf(e1) - 1)
              sum += Math.abs(state.arm - si1) + costOver + 1
            else
              # The height (position of item in list)
              h1 = state.stacks[si1].indexOf(e1)
              h2 = state.stacks[si2].indexOf(e2)
              # If not e1 above e2
              if not (si1 is si2 and h1 > h2)
                # Add work for all items above h1
                sum += 4*(state.stacks[si1].length - h1 - 1);
                # Add work for distance between them
                sum += Math.abs(si1-si2)
          when "under"
            if e1 is state.holding
              costOver = 4*(state.stacks[si2].length-state.stacks[si2].indexOf(e2) - 1)
              sum += Math.abs(state.arm - si2) + costOver + 1
            else if e2 is state.holding
              sum += Math.abs(state.arm - si1) + 1
            else
              # The height (position of item in list)
              h1 = state.stacks[si1].indexOf(e1)
              h2 = state.stacks[si2].indexOf(e2)
              # If not e1 above e2
              if not (si1 is si2 and h1 < h2)
                # Add work for all items above h2
                sum += 4*(state.stacks[si2].length-h2 - 1);
                # Add work for distance between them
                sum += Math.abs(si1-si2)
  return sum

# Returns a list of possible moves based on the current state
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

# Return the object of specified letter
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

# Checks if the cranteItem can be on topItem based on the physical laws
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

# Returns the new state after performing the move on the current state
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

# Check if the current state is equal to the goal state
equality = (state, goal) ->
  return state.arm == goal.arm && state.holding == goal.holding && "#{state.stacks}" is "#{goal.stacks}"

# Returns the polarity
polarity = (polarity, b) ->
  return ((not polarity and not b) or (polarity and b))

# Check if an item is left of another
leftOfCheck = (state, left, right) ->
  result = false
  for stack,i in state.stacks
    if right in stack
      if i isnt 0 and left in state.stacks[i - 1]
        result = true
  return result

# Check if an items is on top of the other
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

# Check if an item is above the other
aboveCheck = (state, above, below) ->
  result = false
  for stack in state.stacks
    if below in stack
      if stack.indexOf(above) - stack.indexOf(below) >= 1
        result = true
  return result

# Check if an item is beside the other
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

# Check if PDDL-goals are satisfied
satisfaction = (state, goalRep) ->
  result = true
  for goal in goalRep
    p = goal.pol
    q1 = goal.quantifier1
    q2 = goal.quantifier2
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
        c = checkRelation(state, q2, B, aboveCheck, q1, A)
    result = result and polarity(p, c)

  return result

Planner.planToString = (res)->
  return ""

class Planner.Error
  constructor: (@msg) ->

  toString : ->
    return @msg
