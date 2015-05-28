def find_objs(obj, objects):
    """Find all possible objects fitting properties obj
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

def simplify_descr(props, objects):
    possible_descs = [{'color': None, 'size': None, 'form': props['form']},
                      {'size': None, 'color': props['color'], 'form': props['form']},
                      {'size': props['size'], 'color': None, 'form': props['form']}]
    for desc in possible_descs:
        if len(find_objs(desc, objects)) == 1:
            return desc

    return props

def stringify_descr(descr):
    out = 'the '
    for prop in ('size', 'color'):
        if descr[prop]:
            out += descr[prop] + ' '

    return out + descr['form']

def log(obj):
    """
    Since we cannot print to standard output, this function prints to a test log instead
    """
    with open('log', 'a') as f:
        f.write("\n----\n" + str(obj))
