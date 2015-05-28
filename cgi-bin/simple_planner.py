from physics import check_ontop
from PDDL import satisfy_pred

COST_MOVE = 1
COST_PICK = 1

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
    actions =  [
                    ('l',_left(*state),COST_MOVE),
                    ('r',_right(*state),COST_MOVE),
                    ('d',_ungrasp(*state),COST_PICK),
                    ('p',_grasp(*state),COST_PICK)
                ]
    return [(l,x,c) for (l,x,c) in actions if x is not None]


def goalWrapper(intprt, stacks, holding, arm, objects):
    """    Passed as a parameter to A*, check if a state satisfied a goal.
    """
    return any([all([satisfy_pred(conj, stacks, holding) for conj in disj]) for disj in intprt])

def _changeStack(newStack,index,stacks):
    """    Helperfunction to change a stack in stacks given an index
    """
    return [newStack if i is index else x for i,x in enumerate(stacks)]

#borde refaktoreras till physics!!!!!!!
def physics(top,bottom,objects):
    if not bottom:
        return True
    return check_ontop(top, bottom[0], objects)
