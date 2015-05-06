"""Simple implementation of PDDL predicates, we use a triple/tuple encoding.

Examples:

::

  ('holding', 'b', None) # hold object 'b' to satisfy
  ('leftof', 'a', 'b') # object 'a' to the left of object 'b'

"""


def satisfy_rel(pred, stacks, holding):
    """check if a PDDL predicate is satisfied"""
    (rel, x, y) = pred
    return {'ontop':   satisfy_ontop,
            'inside':  satisfy_inside,
            'above':   satisfy_above,
            'under':   satisfy_under,
            'beside':  satisfy_beside,
            'leftof':  satisfy_leftof,
            'rightof': satisfy_rightof,
            'holding': satisfy_holding}.get(rel, lambda **_: False)(x, y, stacks, holding)

def satisfy_ontop(a, b, stacks, holding):
    """a ontop of b: some stack: bot, ..., b, a, ..., top"""
    (astack, apos) = find_obj(a, stacks)
    (bstack, bpos) = find_obj(b, stacks)
    return astack == bstack and apos == bpos+1

def satisfy_inside(a, b, stacks, holding):
    """used if b is a box"""
    return satisfy_ontop(a, b, stacks)

def satisfy_above(x, y, stacks, holding):
    """x is above y if it is somewhere above"""
    (xstack, xpos) = find_obj(x, stacks)
    (ystack, ypos) = find_obj(y, stacks)
    return xstack == ystack and xpos > ypos

def satisfy_under(x, y, stacks, holding):
    """x is under y if it is somewhere below"""
    return satisfy_above(y, x, stacks)

def satisfy_beside(x, y, stacks, holding):
    """x is beside y if they are in adjacent stacks"""
    (xstack, xpos) = find_obj(x, stacks)
    (ystack, ypos) = find_obj(y, stacks)
    return xstack == ystack+1 or xstack == ystack-1

def satisfy_leftof(x, y, stacks, holding):
    """x is left of y if it is somewhere to the left"""
    (xstack, xpos) = find_obj(x, stacks)
    (ystack, ypos) = find_obj(y, stacks)
    return xstack < ystack

def satisfy_rightof(x, y, stacks, holding):
    """x is right of y if it is somewhere to the right"""
    return satisft_leftof(y, x, stacks)

def satisfy_holding(x, _, stacks, holding):
    """we are holding x"""
    return x == holding

def find_obj(o, stacks):
    """return (stack, position), (0,0) = bottom of leftmost stack"""
    for stackno, stack in enumerate(stacks):
        for pos, obj in enumerate(stack):
            if o == obj:
                return (stackno, pos)
