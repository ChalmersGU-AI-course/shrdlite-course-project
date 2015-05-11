import physics
from PDDL import satisfy_pred

# actions

def _left(intprt, stacks, holding, arm, objects):
    if not arm is 0:
        return (intprt, stacks, holding, arm-1, objects)
    return None

def _right(intprt, stacks, holding, arm, objects):
    if not arm is len(stacks):
        return (intprt, stacks, holding, arm+1, objects)
    return None

def _grasp(intprt, stacks, holding, arm, objects):
    if holding is None:

        return (intprt, 
                [stacks[arm][:-1] if i is arm else x for i,x in enumerate(stacks)],
                stacks[arm][-1], 
                arm, 
                objects)
    return None

def _ungrasp(intprt, stacks, holding, arm, objects):

    #### DENNA BORDE TESTAS PGA :TypeError: 'NoneType' object is not iterable
    if not holding is None and physics.check_ontop(holding, stacks[arm][-1], objects):
        return (intprt, stacks[arm]+[holding], None, arm, objects)
    return None

def getAction(state):
    # TripleTuples with action label,State,cost
    actions =  [
                    ('l',_left(*state),1),
                    ('r',_right(*state),1),
                    ('d',_ungrasp(*state),1),
                    ('p',_grasp(*state),1)
                ]
    return [(l,x,c) for (l,x,c) in actions if x is not None]


def goalWrapper(current):
    (intprt, stacks, holding, arm, objects) = current
    return satisfy_pred(intprt,stacks,holding)

def heuristic(goal, current):
    return 1

