#!/usr/bin/env python3

import interpreter

def main(state):
    # # Write to log for testing purposes
    # pretty_state = json.dumps(state, sort_keys=True, indent=2, separators=(',', ': '))
    # writeToLog(pretty_state)

    try:
        intprt = interpreter.interpret(**state)
    except interpreter.InterpreterException as err:
        return {'plan': [str(err)]}

    plan = planner(intprt, **state)

    return {'int': intprt,
            'plan': plan,
    }


def writeToLog(string):
    """
    Since we cannot print to standard output, this function prints to a test log instead
    """
    with open('log', 'a') as f:
        f.write("\n----\n" + string)


def planner(intprt, stacks, holding, arm, objects, utterance, parses):
    """
    This function craetes a dummy plan involving a random stack
    """

    import simple_planner
    import AStar.algorithm

    came_from, cost_so_far, actions_so_far, goal = AStar.algorithm.a_star_search_new(simple_planner.getAction,
                        (intprt, stacks, holding, arm, objects),
                        simple_planner.goalWrapper,
                        simple_planner.heuristic)

    return AStar.algorithm.getPlan(goal, came_from, actions_so_far)

    import random
    while True:
        pickstack = random.randrange(len(stacks))
        if stacks[pickstack]:
            break
    plan = []

    # First move the arm to the selected stack
    if pickstack < arm:
        plan += ["Moving left"]
        plan += ["l"] * (arm - pickstack)
    elif pickstack > arm:
        plan += ["Moving right"]
        plan += ["r"] * (pickstack - arm)

    # Then pick up the object
    #obj = stacks[pickstack][-1];
    #plan += ["Picking up the " + objects[obj]['form'],
    #         "p"]

    if pickstack < len(stacks) - 1:
        # Then move to the rightmost stack
        plan += ["Moving as far right as possible"]
        plan += ["r"] * (len(stacks) - pickstack - 1)

        # Then move back
        plan += ["Moving back"]
        plan += ["l"] * (len(stacks) - pickstack - 1)

    # Finally put it down again
    #plan += ["Dropping the " + objects[obj]['form'],
    #         "d"]

    return plan


######################################################################

if __name__ == '__main__':
    import cgi
    import json

    print('Content-type:text/plain')
    print()

    try:
        form = cgi.FieldStorage()
        jsondata = form.getfirst('data')
        state = json.loads(jsondata)

        # add floors!
        for idx, stack in enumerate(state['stacks']):
            floor = "floor-" + str(idx)
            state['objects'][floor] = {'color': None, 'form': 'floor', 'size': None}
            stack.insert(0, floor)

        if not 'holding' in state:
            state['holding'] = None

        import PDDL

        # remove objects that are not in any stack from objects
        new_objs = {}
        for obj, props in state['objects'].items():
            if not PDDL.find_obj(obj, state['stacks']) == (None, None):
                new_objs[obj] = props

        state['objects'] = new_objs

        result = main(state)
        print(json.dumps(result))

    except:
        import sys, traceback
        print(traceback.format_exc())
        sys.exit(1)
