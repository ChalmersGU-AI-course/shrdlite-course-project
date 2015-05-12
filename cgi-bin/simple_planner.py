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
    if holding is None:

        return (intprt, 
                _changeStack(stacks[arm][:-1], arm, stacks),
                stacks[arm][-1], 
                arm, 
                objects)
    return None

def _ungrasp(intprt, stacks, holding, arm, objects):
    
    if not holding is None and physics(holding, stacks[arm][-1:], objects):
        return (intprt, 
                _changeStack(stacks[arm]+[holding],arm,stacks),
                None, 
                arm, 
                objects)
    return None

def getAction(state):
    cost = 1
    # TripleTuples with action label,State,cost
    actions =  [
                    ('l',_left(*state),cost),
                    ('r',_right(*state),cost),
                    ('d',_ungrasp(*state),cost),
                    ('p',_grasp(*state),cost)
                ]
    return [(l,x,c) for (l,x,c) in actions if x is not None]


def goalWrapper(current):
    (intprt, stacks, holding, arm, objects) = current
    return satisfy_pred(intprt,stacks,holding)

def heuristic(goal, current):
    return 1

def _changeStack(newStack,index,stacks):
    return [newStack if i is index else x for i,x in enumerate(stacks)]

#borde refaktoreras till physics!!!!!!!
def physics(top,bottom,objects):
    if not bottom:
        return True
    return check_ontop(top, bottom[0], objects)