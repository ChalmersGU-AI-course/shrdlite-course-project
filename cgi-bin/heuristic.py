def heuristic(intprt, stacks, holding, arm, objects):
    """    Passed as a parameter to A*, The heuristicfunciton for this problem.
    """
    scoreList = []
    for goal in intprt:
        score = 0
        (pred, obj1, obj2) = goal
        if pred in ('ontop','inside'):
            score += _stackScore(obj1, stacks)
            score += _stackScore(obj2, stacks)
            scoreList.append(score)
        else:
            scoreList.append(0)            
    
    return min(scoreList)

def _stackScore(obj, stacks):
    for stack in stacks:
        for i, o in enumerate(stack):
            if o is obj:
                score = len(stack) - i - 1
                return score
    #If obj was not found in any stack, assume that the arms is holding it
    return 0
            
