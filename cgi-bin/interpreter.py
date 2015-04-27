#!/usr/bin/env python3

from PDDL import *

class WorldState(object):
    def __init__(self):
        self.world = {}

    def addEnity(label, entity):
       self.world[label] = entity

    def lookupEntity(size, form, color):
        fittingList = []
        for label, ent in world.iteritems():
            if size is not None and ent.size is not size
                continue
            if form is not None and ent.form is not form
                continue
            if color is not None and ent.color is not color
                continue
        return fittingList
