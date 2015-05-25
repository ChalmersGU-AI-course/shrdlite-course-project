from PDDL import satisfy_pred
import physics
import sys

class InterpreterException(Exception):
    def __init__(self, descr):
        self.descr = descr
    def __str__(self):
        return self.descr

def interpret(stacks, holding, objects, parses, **_): # fancy way of ignoring all other stuff
    """for each parse return PDDL description of goals in disjunctive normal form

    [[a, b], [c, d]] === (a and b) or (c and d)
    """

    def physics_ok(goals):
        return all(physics.check_physics(goal, objects) for goal in goals)

    # find all possible goals
    goals = []
    exc = []
    for parse in parses:
        try:
            goal = interp_cmd(parse['prs'], objects, stacks, holding)
            ok_goal = [g for g in goal if physics_ok(g)] # filter out impossible disj. gaols

            if len(ok_goal) < 1:
                # whooops
                raise InterpreterException('Physics do not allow me to do as you want.')

            goals.append(ok_goal)
        except InterpreterException as e:
            # stash the exception for later use
            et, ei, tb = sys.exc_info()
            exc = ei.with_traceback(tb)


    if len(goals) < 1:
        # no possible goals left -- something strange happened, rethrow last exception
        raise exc
    elif not len(goals) == 1:
        # more than one parse was successful
        raise InterpreterException('Ambiguous parse')

    return goals[0]

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
    (what, what_quant) = find_ent(ent, objects, stacks, holding)

    if what_quant == 'all' and len(what) > 1:
        raise InterpreterException("Cannot hold more than 1 object!")

    return [[('holding', a, None)] for a in what]

def interp_cmd_put(_, loc, objects, stacks, holding):
    """simple, we want to put what we're holding somewhere
    1. find where we want to put it
    2. create goal
    """

    if holding == None:
        raise InterpreterException('I am not holding any object!')

    rel = loc['rel']
    (where, where_quant) = find_ent(loc['ent'], objects, stacks, holding)

    if where_quant == 'all':
        # put it to the left of all tables
        return [[(rel, holding, b) for b in where]]
    else:
        # put it to the left of any table
        return [[(rel, holding, b)] for b in where]

def interp_cmd_move(ent, loc, objects, stacks, holding):
    """harder, want to move some object to somewhere
    1. find the object to move
    2. find the location
    3. create goal
    """

    rel = loc['rel']

    (what, what_quant) = find_ent(ent, objects, stacks, holding)
    (where, where_quant) = find_ent(loc['ent'], objects, stacks, holding)

    if what_quant == 'all':
        if where_quant == 'all':
            # all balls to the left of all tables
            return [[(rel, a, b) for a in what for b in where]]
        else:
            # all balls to the left of any table
            return [[(rel, a, b) for a in what] for b in where]
    else:
        if where_quant == 'all':
            # any ball to the left of all tables
            return [[(rel, a, b) for b in where] for a in what]
        else:
            # any ball to the left of any table
            return [[(rel, a, b)] for a in what for b in where]

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

    returns: a list of names of possible objects and the quantifier

    aka arc consistency
    """

    quant = ent['quant']
    simple = not 'obj' in ent['obj']
    descr = ent['obj'] if simple else ent['obj']['obj']
    domain = find_objs(descr, objects, stacks)

    if not simple:
        # we need to check the PDDL predicates going out from this node
        (rel_domain, rel_quant) = find_ent(ent['obj']['loc']['ent'],
                                                   objects, stacks, holding)
        rel = ent['obj']['loc']['rel']
        check = all if rel_quant == 'all' else any
        matching = set()
        for me in domain:
            if check([satisfy_pred((rel, me, they), stacks, holding) for they in rel_domain]):
                matching.add(me)
        domain = matching


    domain_props = [objects[o] for o in domain]

    # if the quantifier is 'the' and we have more than 1 object the
    # parse is ambiguous
    if (quant == 'the'
        and len(domain) > 1
        and not all(map(physics.is_floor, domain_props))):
        raise InterpreterException('Ambiguous object: '
                                   + ', '.join(map(obj_str, domain_props)))

    return (domain, quant)

def obj_str(o):
    return 'the ' + ' '.join([o['size'], o['color'], o['form']])

def find_objs(obj, objects, stacks):
    """Find all possible objects fitting properties obj
    aka domain consistency
    """

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
