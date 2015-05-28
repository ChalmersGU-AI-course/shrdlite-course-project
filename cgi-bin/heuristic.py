from simple_planner import COST_MOVE, COST_PICK
import PDDL

import helpers

PLACE_IN_STACK_PENALTY = \
    COST_PICK * 2 + COST_MOVE # cost of picking up + moving once + putting down
CLOSE_TO_EDGE_PENALTY = \
    COST_PICK * 2 + COST_MOVE # cost of picking up + moving once + putting down
NOT_HOLDING_PENALTY = COST_PICK # cost of picking up

def no_heuristic(*_): # discard all arguments
    return 0

def heuristic(isgoal, intprt, stacks, holding, arm, objects):
    """    Passed as a parameter to A*, The heuristicfunciton for this problem.
    """

    if isgoal(intprt, stacks, holding, arm, objects):
        return 0

    scores = []

    for goals in intprt:
        scores.append(conjunctive(goals, stacks))

    return min(scores)

def update_pens(sd, pens):
    (s, d) = sd
    if pens[s] < d:
        pens[s] = d
    return pens

def conjunctive(goals, stacks):
    """heuristic for a conjunctive goal!"""

    pens = [0 for h in stacks]

    for goal in goals:
        (rel, a, b) = goal

        if rel in {'ontop', 'inside'}:
            pens = update_pens(_stackScore(a, stacks), pens)
            pens = update_pens(_stackScore(b, stacks), pens)

        elif rel == 'under':
            pens = update_pens(_stackScore(b, stacks), pens)
        elif rel == 'above':
            pens = update_pens(_stackScore(a, stacks), pens)

        elif rel == {'beside', 'leftof', 'rightof'}:
            (s1, d1) = _stackScore(a, stacks)
            (s2, d2) = _stackScore(b, stacks)
            if d1 < d2:
                pens = update_pens((s1, d1), pens)
            else:
                pens = update_pens((s2, d2), pens)

    return sum(pens)

def _stackScore(obj, stacks):
    """how many must be moved to find the objet we want"""
    for stackno, stack in enumerate(stacks):
        for i, o in enumerate(stack):
            if o == obj:
                depth = len(stack) - i - 1
                return (stackno, depth * 3)

    # no penalty if we're holding the object
    return (0, 0)

# Returns worse score if object is in first or last stack
#  if we are supposed to put something to the left/right of it
#
# Score is even worse if objects are far down in the stack at the edge
def _placeScore(obj, stacks, pred):
    for i, stack in enumerate(stacks):
        for o in stack:
            if o is obj:
                if pred is 'leftof' and i is 0 or pred is 'rightof' and i is len(stacks)-1:
                    return _stackScore(obj, stacks) + CLOSE_TO_EDGE_PENALTY
                else:
                    return 0
    #If obj was not found in any stack, assume that the arm is holding it
    return 0

# Returns a good score if we are currently holding the object, else add penalty
def _holdingScore(obj, holding):
    if holding is obj:
        return 0
    else:
        return NOT_HOLDING_PENALTY


# Returns a score based on how far the two objects are from each other
def _xdifScore(obj1, obj2, stacks):
    (obj1x,_) = find_obj(obj1, stacks)
    (obj2x,_) = find_obj(obj2, stacks)
    return abs(obj1x-obj2x)
