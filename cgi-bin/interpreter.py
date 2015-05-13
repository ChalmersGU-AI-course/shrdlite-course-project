from PDDL import satisfy_pred
import physics

class InterpreterException(Exception):
    def __init__(self, descr):
        self.descr = descr
    def __str__(self):
        return self.descr

def interpret(stacks, holding, objects, parses, **_): # fancy way of ignoring all other stuff
    """for each parse return a collection of disjunctive goals
    """

    # find all possible goals
    goals = []
    for parse in parses:
        goals.append(interp_cmd(parse['prs'], objects, stacks, holding))

    # remove goals that do not satisfy the laws of physic
    ok_goals = []
    for goal in goals:
        possible = []
        for alt in goal:
            if physics.check_physics(alt, objects):
                possible.append(alt)

        if len(possible) >= 1:
            ok_goals.append(possible)

    # no possible goals, impossible to do!
    if len(ok_goals) < 1:
        raise InterpreterException('Physically impossible!')
    # if there is more than 1 disj. goal left the command is ambiguous
    elif not len(ok_goals) == 1:
        raise InterpreterException('Ambiguous parse: ' + str(ok_goals))


    return ok_goals[0]

def interp_cmd(cmd, objects, stacks, holding):
    """from command to disjunctive PDDL goal, list of pddl goals"""
    interp = {'take': interp_cmd_take,
              'put':  interp_cmd_put,
              'move': interp_cmd_move}.get(cmd['cmd'])

    return interp(cmd.get('ent', None), cmd.get('loc', None), objects, stacks, holding)

def interp_cmd_take(ent, _, objects, stacks, holding):
    """simple, we want to pick up something,
    1. find the object
    2. create goal
    """
    ents = find_ent(ent, objects, stacks, holding)
    return [('holding', x, None) for x in ents]

def interp_cmd_put(_, loc, objects, stacks, holding):
    """simple, we want to put what we're holding somewhere
    1. find where we want to put it
    2. create goal
    """
    if holding == None:
        raise InterpreterException('I am not holding any object!')
    rel = loc['rel']
    ent = loc['ent']
    ents = find_ent(ent, objects, stacks, holding)
    return [(rel, holding, x) for x in ents]

def interp_cmd_move(ent, loc, objects, stacks, holding):
    """harder, want to move some object to somewhere
    1. find the object to move
    2. find the location
    3. create goal
    """
    rel = loc['rel']
    goals = []
    for a in find_ent(ent, objects, stacks, holding):
        for b in find_ent(loc['ent'], objects, stacks, holding):
            goals.append((rel, a, b))
    return goals

def find_ent(ent, objects, stacks, holding):
    """ent:
    simple entity description:
    {quant: 'the',
     obj: {size: null, color: 'white', form: 'ball'}}

    complex entity description:
    {quant: 'the',
     obj: {obj: {size: null, color: 'white', form: 'ball'},
           loc: {rel: 'inside',
                 ent: {quant: 'any',
                       obj: {size: null, color: null, form: 'box'}}}}}

    returns: a list of names of possible objects
    """

    os = set()

    if not 'obj' in ent['obj']:
        # is a simple entity description
        # return all matching objects
        os = find_objs(ent['obj'], objects, stacks)
    else:
        # is a complex entity description (ie located somewhere)

        # 1. find possible objects
        possible_objs = find_objs(ent['obj']['obj'], objects, stacks)

        # 2. find whatever entity the location relation specifies
        possible_rels = find_ent(ent['obj']['loc']['ent'], objects, stacks, holding)

        # 3. find any possible_objs that are 'rel' to possible_rels
        rel = ent['obj']['loc']['rel']
        matching = set()
        for a in possible_objs:
            for b in possible_rels:
                if satisfy_pred((rel, a, b), stacks, holding):
                    matching.add(a)

        os = matching

    os_descr = [objects[o] for o in os]

    if (ent['quant'] == 'the'
        and len(os) > 1
        and not all(map(lambda o: physics.is_floor(o), os_descr))):
        raise InterpreterException('Ambiguous object, possible objects: ' + ', '.join(map(obj_str, os_descr)))
    else:
        return os

def obj_str(o):
    return 'the ' + ' '.join([o['size'], o['color'], o['form']])

def find_objs(obj, objects, stacks):
    """Find all possible objects fitting properties obj"""
    return set([name for name, props in objects.items()
                if matches_obj(obj, props)])

def matches_obj(a, b):
    """Does object a match object b, where b is a 'complete' object
    description
    """
    return ((not a['color'] or a['color'] == b['color'])
            and (not a['form']
                 or (a['form'] == 'anyform' and not b['form'] == 'floor')
                 or a['form'] == b['form'])
            and (not a['size'] or a['size'] == b['size']))
