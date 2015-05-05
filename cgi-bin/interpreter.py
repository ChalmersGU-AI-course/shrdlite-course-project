def interpret(stacks, holding, arm, objects, utterance, parses):
    """
    This function returns a dummy interpretation involving two random objects
    """
    import random
    objs = [o for stk in stacks for o in stk]
    a = random.choice(objs)
    b = random.choice(objs)
    interpretation = [[
        {'pol': True, 'rel': "ontop", 'args': [a, "floor"]},
        {'pol': True, 'rel': "holding", 'args': [b]},
    ]]
    return interpretation

def find_ent(ent, objects, stacks, holding):
    """ent:
    simple entity description:
    {quant: "the",
     obj: {size: null, color: "white", form: "ball"}}

    complex entity description:
    {quant: "the",
     obj: {obj: {size: null, color: "white", form: "ball"},
           loc: {rel: "inside",
                 ent: {quant: "any",
                       obj: {size: null, color: null, form: "box"}}}}}

    returns: a list of names of possible objects
    """

    if not ent["obj"]["obj"]: # yes, this does work, the typescript looks the same
        # is a simple entity description
        # return all matching objects
        return find_objs(ent["obj"], objects, stacks)
    else:
        # is a complex entity description (ie located somewhere)

        # 1. find possible objects
        possible_objs = find_objs(ent["obj"]["obj"], objects, stacks)

        # 2. find whatever entity the location relation specifies
        possible_rels = find_ent(ent["obj"]["loc"]["ent"], objects, stacks, holding)

        # 3. find any possible_objs that are 'rel' to possible_rels
        rel = ent["obj"]["loc"]["rel"]
        matching = []
        for a in possible_objs:
            for b in possible_rels:
                if satisfy_rel(rel, a, b, stacks):
                    matching.append(a)

        return matching


def find_objs(obj, objects, stacks):
    """Find all possible objects fitting properties obj"""
    return [name for name, props in objects.items()
            if matches_obj(obj_obj, props)]

def matches_obj(a, b):
    """Does object a match object b, where b is a "complete" object
    description
    """
    return (not a["color"] or a["color"] == b["color"]) \
        and (not a["form"] or a["form"] == b["form"]) \
        and (not a["size"] or a["size"] == b["size"])

def satisfy_rel(rel, a, b, stacks):
    return {"ontop":   satisfy_ontop,
            "inside":  satisfy_inside,
            "above":   satisfy_above,
            "under":   satisfy_under,
            "beside":  satisfy_beside,
            "leftof":  satisfy_leftof,
            "rightof": satisfy_rightof}.get(rel, lambda a, b, s: False)(a, b, stacks)

def satisfy_ontop(a, b, stacks):
    """a ontop of b: some stack: bot, ..., b, a, ..., top"""
    (astack, apos) = find_obj(a, stacks)
    (bstack, bpos) = find_obj(b, stacks)
    return astack == bstack and apos == bpos+1

def satisfy_inside(a, b, stacks):
    """used if b is a box"""
    return satisfy_ontop(a, b, stacks)

def satisfy_above(x, y, stacks):
    """x is above y if it is somewhere above"""
    (xstack, xpos) = find_obj(x, stacks)
    (ystack, ypos) = find_obj(y, stacks)
    return xstack == ystack and xpos > ypos

def satisfy_under(x, y, stacks):
    """x is under y if it is somewhere below"""
    return satisfy_above(y, x, stacks)

def satisfy_beside(x, y, stacks):
    """x is beside y if they are in adjacent stacks"""
    (xstack, xpos) = find_obj(x, stacks)
    (ystack, ypos) = find_obj(y, stacks)
    return xstack == ystack+1 or xstack == ystack-1

def satisfy_leftof(x, y, stacks):
    """x is left of y if it is somewhere to the left"""
    (xstack, xpos) = find_obj(x, stacks)
    (ystack, ypos) = find_obj(y, stacks)
    return xstack < ystack

def satisfy_rightof(x, y, stacks):
    """x is right of y if it is somewhere to the right"""
    return satisft_leftof(y, x, stacks)

def find_obj(o, stacks):
    """return (stack, position), (0,0) = bottom of leftmost stack"""
    for stackno, stack in enumerate(stacks):
        for pos, obj in enumerate(stack):
            if o == obj:
                return (stackno, pos)
