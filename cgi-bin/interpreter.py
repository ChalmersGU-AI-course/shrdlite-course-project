#!/usr/bin/env python3

from PDDL import *

class WorldState(object):
    def __init__(self):
        self.world = {}

    def addEntity(self, label, entity):
        self.world[label] = entity

    def lookupEntity(self, size, form, color):
        fittingList = []
        for label, ent in self.world.items():
            if size not in (None, ent.size):
                continue
            if form not in (None, ent.form):
                continue
            if color not in (None, ent.color):
                continue
            fittingList.append(ent)
        return fittingList

def interpret(objects):
    worldState = WorldState()

    # Add all entities to world state
    for label, features in objects.items():
        # This way, the features in the entity will be saved as strings, not as the enums
        # we defined in PDDL.py... I wonder if this is bad?
        entity = Entity(features['size'], features['color'], features['form']) 
        worldState.addEntity(label, entity)

