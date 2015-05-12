#!/usr/bin/env python3

import unittest
import interpreter
import PDDL
import simple_planner
import AStar.algorithm

class TestMain(unittest.TestCase):
    
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
        self.assertFalse(simple_planner.goalWrapper(*self.state))

    def test_AStar(self):
        came_from, cost_so_far, actions_so_far, goal = AStar.algorithm.a_star_search_new(   simple_planner.getAction,
                                                            self.state,
                                                            simple_planner.goalWrapper,
                                                            simple_planner.heuristic)
        (intprt, stacks, holding, arm, objects) = goal
        self.assertEqual(stacks,[[],['b','a']])
        self.assertEqual(AStar.algorithm.getPlan(goal, came_from, actions_so_far), ['start','p','r','d'])


class TestAStar(unittest.TestCase):
    
    def setUp(self):
        self.stacks = [['a'],[],['b'],[]]
        self.objects = {'a': {'size': 'large', 'form': 'ball', 'color': 'blue'},
                   'b': {'size': 'large', 'form': 'box', 'color': 'red'}}        
        self.arm = 0
        self.holding = None
        self.intprt = ('inside','a','b')
        self.state = (self.intprt,self.stacks,self.holding,self.arm,self.objects)

    def test_AStar(self):
        came_from, cost_so_far, actions_so_far, goal = AStar.algorithm.a_star_search_new(   simple_planner.getAction,
                                                            self.state,
                                                            simple_planner.goalWrapper,
                                                            simple_planner.heuristic)
        (intprt, stacks, holding, arm, objects) = goal
        self.assertEqual(stacks,[[],[],['b','a'],[]])
        self.assertEqual(AStar.algorithm.getPlan(goal, came_from, actions_so_far), ['start','p','r','r','d'])

class TestActions(unittest.TestCase):

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

    def test_grasp(self):
        self.assertEqual(simple_planner._ungrasp(self.intprt,
                                                 [['a'],['b']],
                                                 None,
                                                 0,
                                                 self.objects),
            (self.intprt, [[],['b']], 'a', 1, self.objects))

    def test_left(self):
        self.assertEqual(simple_planner._left(*self.state),
            (self.intprt, [['a'],[]], 'b', 0, self.objects))       

    def test_right(self):
        self.assertEqual(simple_planner._right(*self.state),
            None)

    def test_grasp(self):
        self.assertEqual(simple_planner._grasp(*self.state),
            None)


class TestGoal(unittest.TestCase):

    def setUp(self):
        self.stacks = [[],['b','a']]
        self.objects = {'a': {'size': 'large', 'form': 'ball', 'color': 'blue'},
                        'b': {'size': 'large', 'form': 'box', 'color': 'red'}}        
        self.arm = 0
        self.holding = None
        # ('inside','a','b')
        # ('ontop','a','b')
        # ('above','a','b')
        # ('under','a','b')
        # ('beside','a','b')
        # ('leftof','a','b')
        # ('rightof','a','b')
        # ('holding','a','b')

        self.state = (self.stacks,self.holding,self.arm,self.objects)

    def test_inside_true(self):
        self.assertTrue(simple_planner.goalWrapper(('inside','a','b'),*self.state))

    def test_inside_false_holding(self):
        self.assertFalse(simple_planner.goalWrapper(('inside','a','b'),
                                                     [[],['b']],
                                                     'a', 
                                                     1, 
                                                     self.objects)
                                                    )

    def test_inside_false(self):
        self.assertFalse(simple_planner.goalWrapper(('inside','b','a'),*self.state))

    def test_ontop_true(self):
        self.assertTrue(simple_planner.goalWrapper(('ontop','a','b'),*self.state))

    def test_ontop_false(self):
        self.assertFalse(simple_planner.goalWrapper(('ontop','b','a'),*self.state))

    def test_holding_true(self):
        self.assertTrue(simple_planner.goalWrapper(('holding',None, None),*self.state))    

if __name__ == '__main__':
    unittest.main()