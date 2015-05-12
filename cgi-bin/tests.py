#!/usr/bin/env python3

import unittest
import interpreter
import PDDL
import simple_planner
import AStar.algorithm

# class TestWorldState(unittest.TestCase):

#     def setUp(self):
#         stacks = [['a', 'b'], []]
#         objects = {'a': {'size': 'large', 'form': 'ball', 'color': 'blue'},
#                    'b': {'size': 'large', 'form': 'table', 'color': 'red'}}
#         entities = {}
#         for label, features in objects.items():                  
#             entity = PDDL.Entity(features['size'], features['color'], features['form']) 
#             entities[label] = entity

#         self.worldState = interpreter.WorldState(stacks, entities)

#     def test_isAbove(self):
#         self.assertTrue(self.worldState.isAbove('a', 'b'))
#         self.assertFalse(self.worldState.isAbove('b', 'a'))

#     def test_lookupEntities(self):
#         self.assertTrue(len(self.worldState.lookupEntity('large', None, None)) == 2)
#         self.assertTrue(len(self.worldState.lookupEntity(None, 'ball', None)) == 1)
#         self.assertTrue(len(self.worldState.lookupEntity(None, None, 'yellow')) == 0)

class TestAction(unittest.TestCase):
    
    def setUp(self):
        self.stacks = [['a'],['b']]
        self.objects = {'a': {'size': 'large', 'form': 'ball', 'color': 'blue'},
                   'b': {'size': 'large', 'form': 'box', 'color': 'red'}}        
        self.arm = 0
        self.holding = None
        self.intprt = ('inside','a','b')
        self.state = (self.intprt,self.stacks,self.holding,self.arm,self.objects)



    def test_action(self):
        self.assertEqual(simple_planner.getAction(self.state),[('r',(self.intprt,self.stacks, self.holding, self.arm+1,self.objects),1),
                                                               ('p',(self.intprt,[[],['b']], 'a', self.arm ,self.objects),1),
                                                              ])

    def test_goal(self):
        self.assertFalse(simple_planner.goalWrapper(self.state))

    def test_AStar(self):
        came_from, cost_so_far, actions_so_far, goal = AStar.algorithm.a_star_search_new(   simple_planner.getAction,
                                                            self.state,
                                                            simple_planner.goalWrapper,
                                                            simple_planner.heuristic)
        (intprt, stacks, holding, arm, objects) = goal
        self.assertEqual(stacks,[[],['b','a']])


class TestUngrasp(unittest.TestCase):

    def setUp(self):
        self.stacks = [['a'],[]]
        self.objects = {'a': {'size': 'large', 'form': 'ball', 'color': 'blue'},
                   'b': {'size': 'large', 'form': 'box', 'color': 'red'}}        
        self.arm = 1
        self.holding = 'b'
        self.intprt = ('inside','a','b')
        self.state = (self.intprt,self.stacks,self.holding,self.arm,self.objects)

    def test_ungrasp(self):
        self.assertEqual(simple_planner._ungrasp(*self.state),
            (self.intprt, [['a'],['b']], None, 1, self.objects))


class TestGoal(unittest.TestCase):

    def setUp(self):
        self.stacks = [[],['b','a']]
        self.objects = {'a': {'size': 'large', 'form': 'ball', 'color': 'blue'},
                        'b': {'size': 'large', 'form': 'box', 'color': 'red'}}        
        self.arm = 0
        self.holding = None
        self.intprt = ('inside','a','b')
        self.state = (self.intprt,self.stacks,self.holding,self.arm,self.objects)

    def test_goal(self):
        self.assertTrue(simple_planner.goalWrapper(self.state))

if __name__ == '__main__':
    unittest.main()