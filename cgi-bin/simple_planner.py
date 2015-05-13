from physics import check_ontop
from PDDL import satisfy_pred

# actions

def _left(intprt, stacks, holding, arm, objects):
    if not arm is 0:
        return (intprt, stacks, holding, arm-1, objects)
    return None

def _right(intprt, stacks, holding, arm, objects):
    if not arm is len(stacks)-1:
        return (intprt, stacks, holding, arm+1, objects)
    return None

def _grasp(intprt, stacks, holding, arm, objects):

    if not holding and len(stacks[arm]) > 1:
        return (intprt, 
                _changeStack(stacks[arm][:-1], arm, stacks),
                stacks[arm][-1], 
                arm, 
                objects)    
    return None

def _ungrasp(intprt, stacks, holding, arm, objects):
    if holding and physics(holding, stacks[arm][-1:], objects):
        return (intprt, 
                _changeStack(stacks[arm]+[holding],arm,stacks),
                None, 
                arm, 
                objects)
    return None

def getAction(state):
    """    Returns a list of triple tuples, with avavible actions from given state.
           (command, new state, cost - required for A*)
    """
    cost = 1
    actions =  [
                    ('l',_left(*state),cost),
                    ('r',_right(*state),cost),
                    ('d',_ungrasp(*state),cost),
                    ('p',_grasp(*state),cost)
                ]
    return [(l,x,c) for (l,x,c) in actions if x is not None]


def goalWrapper(intprt, stacks, holding, arm, objects):
    """    Passed as a parameter to A*, check if a state satisfied a goal.
    """
    for goal in intprt:
        if satisfy_pred(goal,stacks,holding):
            return True
    return False 

def heuristic(goal, current):
    """    Passed as a parameter to A*, The heuristicfunciton for this problem.
    """
    return 1

def _changeStack(newStack,index,stacks):
    """    Helperfunction to change a stack in stacks given an index
    """
    return [newStack if i is index else x for i,x in enumerate(stacks)]



#borde refaktoreras till physics!!!!!!!
def physics(top,bottom,objects):
    if not bottom:
        return True
    return check_ontop(top, bottom[0], objects)
