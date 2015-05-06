"""make sure that we don't break the physics!"""


def check_physics(pred, objects):
    (rel, x, y) = pred
    return {'ontop':  check_ontop,
            'inside': check_ontop}.get(rel, lambda x, y, o: True)(x, y, objects)

def check_ontop(t, b, objects):
    top = objects[t]
    bot = objects[b]

    return (
        # Balls cannot support anything.
        not (is_ball(bot))
        # Small objects cannot support large objects.
        and not (is_small(bot) and is_large(top))
        # Boxes cannot contain pyramids, planks or boxes of the same size.
        and not (is_box(bot)
                 and is_form(top, {'pyramid', 'plank', 'box'})
                 and is_same(top, bot, 'size'))
        # Small boxes cannot be supported by small bricks or pyramids.
        and not (is_small(top) and is_box(top)
                 and is_small(bot)
                 and is_form(bot, {'brick', 'pyramid'}))
        # Large boxes cannot be supported by large pyramids.
        and not (is_large(top) and is_box(top)
                 and is_large(bot) and is_pyramid(bot)))

def is_form(o, s):
    return o['form'] in s

def is_brick(o):
    return o['form'] == 'brick'

def is_plank(o):
    return o['form'] == 'plank'

def is_ball(o):
    return o['form'] == 'ball'

def is_pyramid(o):
    return o['form'] == 'pyramid'

def is_box(o):
    return o['form'] == 'box'

def is_table(o):
    return o['form'] == 'table'

def is_small(o):
    return o['size'] == 'small'

def is_large(o):
    return o['size'] == 'large'

def is_same(a, b, prop):
    return a[prop] == b[prop]
