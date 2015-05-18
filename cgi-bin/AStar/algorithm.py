#!/usr/bin/env python3

# Implemented with help of a tutorial from Red blob games
# URL: http://www.redblobgames.com/pathfinding/a-star/implementation.html

from AStar.structures import PriorityQueue
from AStar.structures import GridWithWeights

def a_star_search_new(GetAction, start, goal, heuristic):
    frontier = PriorityQueue()
    frontier.put(start, 0)

    came_from        = {}      # Map a node with previous node
    cost_so_far      = {}      # Map a node with the lowest known cost from start
    actions_so_far   = {}      # Best action to the state
    speech           = {}      # Describes what action to do

    came_from[_getkey(start)] = None      
    actions_so_far[_getkey(start)] = "started on solution"
    cost_so_far[_getkey(start)] = 0  
    
    while not frontier.empty():
        current = frontier.get()
        
        
        if goal(*current):
            return came_from, cost_so_far, actions_so_far, current
        
        for next in GetAction(current): 

            (cmd,nextState,cost) = next
            new_cost = cost_so_far[_getkey(current)] + cost

            # We have not visited the node before or the new cost is lower then the old one
            
            if _getkey(nextState) not in cost_so_far or new_cost < cost_so_far[_getkey(nextState)]:
                cost_so_far[_getkey(nextState)] = new_cost 
                actions_so_far[_getkey(nextState)] = cmd
                priority = new_cost + heuristic(*nextState) #Priority is new cost and expected cost
                frontier.put(nextState, priority)
                came_from[_getkey(nextState)] = _getkey(current)
    
    return None

def getPlan(goal,came_from,actions_so_far,objects):
    current = _getkey(goal)
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


def _getkey(state):
  (intprt,stacks,holding,arm,objects) = state
  return str((stacks,holding,arm))
  # Byt till hash n'r skiten funkar

