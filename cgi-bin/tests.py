#!/usr/bin/env python3

import unittest
import interpreter
import PDDL
import simple_planner
import AStar.algorithm
import physics

class TestMain(unittest.TestCase):
    
    def setUp(self):
        self.stacks = [['a'],['b']]
        self.objects = {'a': {'size': 'large', 'form': 'ball', 'color': 'blue'},
                   'b': {'size': 'large', 'form': 'box', 'color': 'red'}}        
        self.arm = 0
        self.holding = None
        self.intprt = [('inside','a','b')]
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
        self.intprt = [('inside','a','b')]
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
        self.assertEqual(simple_planner._grasp(
             self.intprt,[['a'],['b']],None,0,self.objects),
            (self.intprt, [[],['b']], 'a', 0, self.objects))

    def test_left(self):
        self.assertEqual(simple_planner._left(*self.state),
            (self.intprt, [['a'],[]], 'b', 0, self.objects)) 

    def test_left_None(self):
        self.assertEqual(simple_planner._left(
            self.intprt,[['a'],['b']],None,0,self.objects),
            None)

    def test_right_None(self):
        self.assertEqual(simple_planner._right(*self.state),
            None)

    def test_right_Move(self):
        self.assertEqual(simple_planner._right(
            self.intprt,self.stacks,'b',0,self.objects),
            (self.intprt,self.stacks,'b',1,self.objects))

class TestPhysics(unittest.TestCase):

    def setUp(self):
        self.stacks  = [[],[]] 
        self.holding = None
        self.arm     = 0
        self.objects = {'lba': {'size': 'large', 'form': 'ball', 'color': 'blue'},
                        'sba': {'size': 'small', 'form': 'ball', 'color': 'red'},
                        'lbo': {'size': 'large', 'form': 'box', 'color': 'red'},
                        'sbo': {'size': 'small', 'form': 'box', 'color': 'red'},
                        'lbr': {'size': 'large', 'form': 'brick', 'color': 'red'},
                        'sbr': {'size': 'small', 'form': 'brick', 'color': 'red'},
                        'lpl': {'size': 'large', 'form': 'plank', 'color': 'red'},
                        'spl': {'size': 'small', 'form': 'plank', 'color': 'red'},
                        'lpy': {'size': 'large', 'form': 'pyramid', 'color': 'red'},
                        'spy': {'size': 'small', 'form': 'pyramid', 'color': 'red'},
                        'lta': {'size': 'large', 'form': 'table', 'color': 'red'},
                        'sta': {'size': 'small', 'form': 'table', 'color': 'red'},
                        'floor0': {'color': None, 'form': 'floor', 'size': None},
                        'floor1': {'color': None, 'form': 'floor', 'size': None},
                        'floor2': {'color': None, 'form': 'floor', 'size': None},
                        'floor3': {'color': None, 'form': 'floor', 'size': None},
                        'floor4': {'color': None, 'form': 'floor', 'size': None},
                        'floor5': {'color': None, 'form': 'floor', 'size': None},
                        'floor6': {'color': None, 'form': 'floor', 'size': None},
                        'floor7': {'color': None, 'form': 'floor', 'size': None},
                        'floor8': {'color': None, 'form': 'floor', 'size': None},
                        'floor9': {'color': None, 'form': 'floor', 'size': None},
                        }
        self.state = (self.stacks,self.holding,self.arm,self.objects)

        # Large boxes cannot be supported by large pyramids.
    def test_support_LargeBox(self):
        self.assertFalse(physics.check_physics(
                ('ontop','lbo','lpy'),self.objects
                ))

        # Small boxes cannot be supported by small bricks or pyramids.
    def test_support_smallBox_smallBrick(self):
        self.assertFalse(physics.check_physics(
                ('ontop','sbo','sbr'),self.objects
                ))
    def test_support_smallBox_smallPyramid(self):
        self.assertFalse(physics.check_physics(
                ('ontop','sbo','spy'),self.objects
                ))
    def test_support_smallBox_largePyramid(self):
        self.assertFalse(physics.check_physics(
                ('ontop','sbo','lpy'),self.objects
                ))

        # Boxes cannot contain pyramids, planks or boxes of the same size.
    def test_support_smallPyramid_smallBox(self):
        self.assertFalse(physics.check_physics(
                ('inside','spy','sbo'),self.objects
                ))

    def test_support_smallPlank_smallBox(self):
        self.assertFalse(physics.check_physics(
                ('inside','spl','sbo'),self.objects
                ))

    def test_support_smallBox_smallBox(self):
        self.assertFalse(physics.check_physics(
                ('inside','sbo','sbo'),self.objects
                ))

    def test_support_largePyramid_smallBox(self):
        self.assertFalse(physics.check_physics(
                ('inside','lpy','lbo'),self.objects
                ))

    def test_support_largePlank_smallBox(self):
        self.assertFalse(physics.check_physics(
                ('inside','lpl','lbo'),self.objects
                ))

    def test_support_largeBox_smallBox(self):
        self.assertFalse(physics.check_physics(
                ('inside','lbo','lbo'),self.objects
                ))

        # Small objects cannot support large objects.
    def test_support_Smallobjects_LargeObjects(self):
        #for all small objects
        for small,v in self.objects.items():
            if v.get('size') is 'small':

                #test all large objects
                for large,v2 in self.objects.items():
                    if v2.get('size') is 'large':
                        self.assertFalse(physics.check_physics(
                                        ('ontop',large,small),self.objects
                                        ))


        # Balls cannot support anything.
    def test_support_Ball_Anything(self):
        for ball,v in self.objects.items():
            if v.get('form') is 'ball':

                for anyObj in self.objects.keys():
                    self.assertFalse(physics.check_physics(
                                        ('ontop',anyObj,ball),self.objects
                                        ))

        # Balls must be in boxes or on the floor, otherwise they roll away.
    # def test_balls_on_floor_or_Box(self):
    #     for ball,v in self.objects.items():
    #         if v.get('form') is 'ball':

    #             for obj,v2 in self.objects.items():
    #                 if (v2.get('form') is 'floor' or v2.get('form') is 'box') and v2.get('size') is 'large' :
    #                     self.assertTrue(physics.check_physics(
    #                                     ('ontop',ball,obj),self.objects
    #                                     ))
    #                 else:
    #                     self.assertFalse(physics.check_physics(
    #                                     ('ontop',ball,obj),self.objects
    #                                     ))

class TestGoal(unittest.TestCase):

    def setUp(self):
        self.stacks = [[],['b','a']]
        self.objects = {'a': {'size': 'large', 'form': 'ball', 'color': 'blue'},
                        'b': {'size': 'large', 'form': 'box', 'color': 'red'},
                        'c': {'size': 'large', 'form': 'pyramid', 'color': 'green'}}        
        self.arm = 0
        self.holding = None
        
        self.state = (self.stacks,self.holding,self.arm,self.objects)


        # Testing inside PDDL
    def test_inside_true(self):
        self.assertTrue(simple_planner.goalWrapper([('inside','a','b')],*self.state))

    def test_inside_false_holding(self):
        self.assertFalse(simple_planner.goalWrapper(
            [('inside','a','b')],[[],['b']],'a', 1, self.objects))

    def test_inside_false(self):
        self.assertFalse(simple_planner.goalWrapper([('inside','b','a')],*self.state))


        # Testing ontop PDDL
    def test_ontop_true(self):
        self.assertTrue(simple_planner.goalWrapper([('ontop','a','b')],*self.state))

    def test_ontop_false(self):
        self.assertFalse(simple_planner.goalWrapper([('ontop','b','a')],*self.state))


        # Testing holding PDDL
    def test_holding_true(self):
        self.assertTrue(simple_planner.goalWrapper([('holding',None, None)],*self.state))


        # Testing above PDDL
    def test_above_true(self):
        self.assertTrue(simple_planner.goalWrapper(
            [('above','a','b')],[[],[],['b','c','a']],None,0,self.objects))

    def test_above_false(self):
        self.assertFalse(simple_planner.goalWrapper(
            [('above','a','b')],[[],[],['a','c','b']],None,0,self.objects))


        # Testing under PDDL
    def test_under_true(self):
        self.assertTrue(simple_planner.goalWrapper(
            [('under','a','b')],[[],[],['a','c','b']],None,0,self.objects))

    def test_under_false(self):
        self.assertFalse(simple_planner.goalWrapper(
            [('under','a','b')],[[],[],['b','c','a']],None,0,self.objects))


        # Testing beside PDDL
    def test_beside_true_2Stacks(self):
        self.assertTrue(simple_planner.goalWrapper(
            [('beside','a','b')],[['a'],['b']],None,0,self.objects))

    def test_beside_true(self):
        self.assertTrue(simple_planner.goalWrapper(
            [('beside','a','c')],[['a'],['c'],['b']],None,0,self.objects))

    def test_beside_false(self):
        self.assertFalse(simple_planner.goalWrapper(
            [('beside','a','b')],[['a'],['c'],['b']],None,0,self.objects))

    def test_beside_notFound(self):
        self.assertFalse(simple_planner.goalWrapper(
            [('beside','a','b')],[['a'],['c'],[]],'b',0,self.objects))


        # Testing leftof PDDL
    def test_leftof_true(self):
        self.assertTrue(simple_planner.goalWrapper(
            [('leftof','a','b')],[['a'],['c'],['b']],None,0,self.objects))

    def test_leftof_false(self):
        self.assertFalse(simple_planner.goalWrapper(
            [('leftof','c','a')],[['a'],[],['b']],'c',0,self.objects))


        # Testing rightof PDDL
    def test_rightof_true(self):
        self.assertTrue(simple_planner.goalWrapper(
            [('rightof','b','a')],[['a'],['c'],['b']],None,0,self.objects))

    def test_rightof_false(self):
        self.assertFalse(simple_planner.goalWrapper(
            [('rightof','a','b')],[['a'],['c'],['b']],None,0,self.objects))

if __name__ == '__main__':
    unittest.main()