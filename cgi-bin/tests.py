#!/usr/bin/env python3

import unittest
import interpreter
import PDDL

class TestWorldState(unittest.TestCase):

    def setUp(self):
        stacks = [['a', 'b'], []]
        objects = {'a': {'size': 'large', 'form': 'ball', 'color': 'blue'},
                   'b': {'size': 'large', 'form': 'table', 'color': 'red'}}
        entities = {}
        for label, features in objects.items():                  
            entity = PDDL.Entity(features['size'], features['color'], features['form']) 
            entities[label] = entity

        self.worldState = interpreter.WorldState(stacks, entities)

    def test_isAbove(self):
        self.assertTrue(self.worldState.isAbove('a', 'b'))
        self.assertFalse(self.worldState.isAbove('b', 'a'))

    def test_lookupEntities(self):
        self.assertTrue(len(self.worldState.lookupEntity('large', None, None)) == 2)
        self.assertTrue(len(self.worldState.lookupEntity(None, 'ball', None)) == 1)
        self.assertTrue(len(self.worldState.lookupEntity(None, None, 'yellow')) == 0)

if __name__ == '__main__':
    unittest.main()
