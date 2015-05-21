#!/usr/bin/env python3

# Implemented with help of a tutorial from Red blob games
# URL: http://www.redblobgames.com/pathfinding/a-star/implementation.html

from AStar.structures import PriorityQueue
from AStar.structures import GridWithWeights

def a_star_search_new(getActions, startState, isGoal, heuristic):
    """Find a good path to a goal node using a-star.
    
    Keyword arguments:
    getActions -- Function to get neighboring actions: state -> cmd, state, cost
    startState -- The state to start searching from
    isGoal -- Function to se if a state is a goal: state -> bool
    heuristic -- Function to give heurustic value for state: *state -> int
    """
    frontier = PriorityQueue()
    frontier.put(startState, 0)

    came_from        = {}      # Map a node with previous node
    cost_so_far      = {}      # Map a node with the lowest known cost from startState
    actions_so_far   = {}      # Best action to the state
    speech           = {}      # Describes what action to do

    came_from[_getKey(startState)] = None      
    actions_so_far[_getKey(startState)] = "Started on solution"
    cost_so_far[_getKey(startState)] = 0  
    
    while not frontier.empty():
        current = frontier.get()
        
        if isGoal(*current):
            return came_from, cost_so_far, actions_so_far, current
        
        for next in getActions(current): 
            (cmd, nextState, cost) = next
            new_cost = cost_so_far[_getKey(current)] + cost

            # If we have not visited the node before or the new cost is lower then the old one
            if _getKey(nextState) not in cost_so_far or new_cost < cost_so_far[_getKey(nextState)]:
                cost_so_far[_getKey(nextState)] = new_cost 
                actions_so_far[_getKey(nextState)] = cmd
                priority = new_cost + heuristic(*nextState) #Priority is new cost and expected cost
                frontier.put(nextState, priority)
                came_from[_getKey(nextState)] = _getKey(current)
    
    return None

def getPlan(goal, came_from, actions_so_far, objects):
    current = _getKey(goal)
    plan = []
    while current in came_from:
        next    = came_from[current]
        command = actions_so_far[current]

        if command is 'p':
            obj = keyToObj(current,objects)
            plan += ['p',
                     'Pick up the ' + obj.get('size')  + ' '
                                    + obj.get('color') + ' '
                                    + obj.get('form')
                                    ]
        elif command is 'd':
            plan += ['d','Drop it like it\'s hot']
        else:
            plan += [command]
        current = next

    return plan[::-1] #Reverse the list


def keyToObj(strkey,objects):
    k = strkey.split(',')[-2].strip().strip("'")
    return objects.get(k)


def _getKey(state):
  (intprt,stacks,holding,arm,objects) = state
  return str((stacks,holding,arm))
  # Byt till hash n'r skiten funkar

