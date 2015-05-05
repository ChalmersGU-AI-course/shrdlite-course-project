import json

from interpreter import *

fp = open("example.json")
world = json.load(fp)

ent = world['parses'][0]['prs']['ent']
loc = world['parses'][0]['prs']['loc']

os = world['objects']
ss = world['stacks']
h = world['holding']

for idx, stack in enumerate(ss):
    floor = "floor-" + str(idx)
    os[floor] = {'color': None, 'form': 'floor', 'size': None}
    stack.insert(0, floor)


#interpret(**world)
