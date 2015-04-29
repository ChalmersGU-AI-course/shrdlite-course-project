#!/usr/bin/env python3

from PDDL import *

class WorldState(object):
    # I think everything about the world state should be added at initialization /fab
    def __init__(self, stacks, entities):
        self.stacks = stacks
        self.entities = entities

    # Probably not needed /fab
    def addEntity(self, label, entity):
        self.entities[label] = entity

    def lookupEntity(self, size, form, color):
        fittingList = []
        for label, ent in self.entities.items():
            if size not in (None, ent.size):
                continue
            if form not in (None, ent.form):
                continue
            if color not in (None, ent.color):
                continue
            fittingList.append(ent)
        return fittingList

    # If this is a good idea, here will be a series of methods that check similar spatial relations /fab
    def isAbove(self, labelSubj, labelObj):
        for stack in self.stacks:
            foundSubj = False
            for label in stack:
                if label == labelSubj: 
                    foundSubj = True
                if foundSubj and label == labelObj: 
                    return True
        return False

def interpret(stacks, objects):

    # Add all entities 
    entities = {}
    for label, features in objects.items():
        # This way, the features in the entity will be saved as strings, not as the enums
        # we defined in PDDL.py... I wonder if this is bad?
        entity = Entity(features['size'], features['color'], features['form']) 
        entities[label] = entity

    worldState = WorldState(stacks, entities)
