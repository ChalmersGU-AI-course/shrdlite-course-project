from simple_planner import COST_MOVE, COST_PICK 
import PDDL

PLACE_IN_STACK_PENALTY = \
    COST_PICK * 2 + COST_MOVE # cost of picking up + moving once + putting down
CLOSE_TO_EDGE_PENALTY = \
    COST_PICK * 2 + COST_MOVE # cost of picking up + moving once + putting down
NOT_HOLDING_PENALTY = COST_PICK # cost of picking up


def heuristic(intprt, stacks, holding, arm, objects):
    """    Passed as a parameter to A*, The heuristicfunciton for this problem.
    """
    scoreList = []
    for disjunctive_goal in intprt:
        addedScore = 0

        for conjunctive_goal in disjunctive_goal:
            score = 0
            (pred, obj1, obj2) = conjunctive_goal
            # if we are to put something ontop or inside something else,
            # we give it a better score if either of the objects are higher up in the stacks
            if pred in ('ontop','inside'):
                score += _stackScore(obj1, stacks)
                score += _stackScore(obj2, stacks)

                # adds penalty if we are not holding obj1. 
                # Is stupid?? Commented out.

                #score += _holdingScore(obj1, holding)

                addedScore += score

            # add penalty the further down obj1/obj2 is in their respective stack,
            #   depending if we are to put them above/under something else.
            elif pred in ('under', 'above'):
                score += _placeScore(obj2 if pred is 'under' else obj1, stacks, pred)

            elif pred == 'beside':
                objectscores = []
                objectscores.append(_stackScore(obj1, stacks))
                objectscores.append(_stackScore(obj2, stacks))
                score += min(objectscores)
                addedScore += score

            # If we are to put something left/right of something else,
            # we add penalty if obj2 are to the far left/right
            elif pred in ('leftof','rightof'):
                # Add stack penalties???
                score1 += _stackScore(obj1, stacks)
                score2 += _stackScore(obj2, stacks)
                score = min(score1, score2)


                # Commented out to make more simple, might add back later
               # score += _placeScore(obj2, stacks, pred)
               # score += _placeScore(obj1, stacks, 'leftof' if pred is 'rightof' else 'rightof')
                addedScore += score

            # Add penalty if object is further down
            elif pred == 'holding':
                score += _stackScore(obj1, stacks)
                addedScore += score

        scoreList.append(addedScore)

    return min(scoreList)

# Function for deciding the position of a object given the stacks of the world
def _stackScore(obj, stacks):
    for stack in stacks:
        for i, o in enumerate(stack):
            if o is obj:
                score = (len(stack) - i - 1) * PLACE_IN_STACK_PENALTY
                return score
    #If obj was not found in any stack, assume that the arm is holding it
    return 0
    
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