PLACE_IN_STACK_PENALTY = 5
CLOSE_TO_EDGE_PENALTY = 20
NOT_HOLDING_PENALTY = 2


def heuristic(intprt, stacks, holding, arm, objects):
    """    Passed as a parameter to A*, The heuristicfunciton for this problem.
    """
    scoreList = []
    for goal in intprt:
        score = 0
        (pred, obj1, obj2) = goal
        # If we are to put something ontop or inside something else,
        # we give it a better score if either of the objects are higher up in the stacks
        if pred in ('ontop','inside'):
            score += _stackScore(obj1, stacks)
            score += _stackScore(obj2, stacks)

            # Adds penalty if we are not holding obj1
            score += _holdingScore(obj1, holding)

            scoreList.append(score)

        # Add penalty the further down obj1/obj2 is in their respective stack,
        #   depending if we are to put them above/under something else.
        elif pred in ('under', 'above'):
            score += _placeScore(obj2 if pred is 'under' else obj1, stacks, pred)

        elif pred == 'beside':
            objectScores = []
            objectScores.append(_stackScore(obj1, stacks))
            objectScores.append(_stackScore(obj2, stacks))
            score += min(objectScores)
            scoreList.append(score)

        # If we are to put something left/right of something else,
        # we add penalty if obj2 are to the far left/right
        elif pred in ('leftof','rightof'):
            score += _placeScore(obj2, stacks, pred)
            score += _placeScore(obj1, stacks, 'leftof' if pred is 'rightof' else 'rightof')
            scoreList.append(score)

        # Add penalty if object is further down
        elif pred == 'holding':
            score += _stackScore(obj1, stacks)
            scoreList.append(score)

        else:
            scoreList.append(0)            
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

# Returns a good score if we are currently holding the object, else add penalty
def _holdingScore(obj, holding):
    if holding is obj:
        return 0
    else:
        return NOT_HOLDING_PENALTY

