#!/usr/bin/env python3

# Implemented with help of a tutorial from Red blob games
# URL: http://www.redblobgames.com/pathfinding/a-star/implementation.html


class Graph:
  def __init__(self):
    self.edges = {} # Map a node with coresponding edges
  
  def neighbors(self, id):
    return self.edges[id]


###############################################
#### Helperfunction used by a_star_search

import heapq
class PriorityQueue:
  def __init__(self):
    self.elements = []
    
  def empty(self):
    return len(self.elements) == 0
    
  def put(self, item, priority):
    heapq.heappush(self.elements, (priority, item))
    
  def get(self):
    return heapq.heappop(self.elements)[1]

################################################
### Grid representation

class SquareGrid:
  def __init__(self, width, height):
    self.width = width
    self.height = height
    self.walls = []
    
  def in_bounds(self, id):
    (x, y) = id
    return 0 <= x < self.width and 0 <= y < self.height
    
  def passable(self, id):
    return id not in self.walls
    
  def neighbors(self, id):
    (x, y) = id
    results = [(x+1, y), (x, y-1), (x-1, y), (x, y+1)]
    # if (x + y) % 2 == 0: results.reverse() # aesthetics
    results = filter(self.in_bounds, results)
    results = filter(self.passable, results)
    return results

### Grid with weights for arcs
class GridWithWeights(SquareGrid):
  def __init__(self, width, height):
    super().__init__(width, height)
    self.weights = {}
    
  def cost(self, a, b):
    return self.weights.get(b, 1)

def heuristic(a, b):
  (x1, y1) = a
  (x2, y2) = b
  return abs(x1 - x2) + abs(y1 - y2) #Manhattan distance

def a_star_search(graph, start, goal):
  frontier = PriorityQueue()
  frontier.put(start, 0)
  came_from = {}      # Map a node with previous node
  cost_so_far = {}    # Map a node with the lowest known cost from start
  came_from[start] = None 
  cost_so_far[start] = 0  
    
  while not frontier.empty():
    current = frontier.get()
        
    if current == goal:
      break
        
    for next in graph.neighbors(current):
      new_cost = cost_so_far[current] + graph.cost(current, next)

      # We have not visited the node before or the new cost is lower then the old one
      if next not in cost_so_far or new_cost < cost_so_far[next]:
        cost_so_far[next] = new_cost 
        priority = new_cost + heuristic(goal, next) #Priority is new cost and expected cost
        frontier.put(next, priority)
        came_from[next] = current 
    
  return came_from, cost_so_far

def printPath(goal, start, came_from, cost_so_far):
  current = goal

  while not current == start:
    print(current," : ", cost_so_far[current])
    current = came_from[current]
  
  print(start," :  0")


##############################################################################
def testcase1():
  goal  = (4,4)
  start = (0,0)
  diagram = GridWithWeights(5, 5)
  diagram.walls = [(1, 1), (1, 2), (3, 4)]
  #
  #       S 
  #       . #
  #       . #
  #       . . . . .
  #           #   E
  came_from, cost_so_far = a_star_search(diagram, start, goal)
  printPath(goal,start, came_from, cost_so_far)

def testcase2():
  goal  = (4,4)
  start = (0,0)
  diagram = GridWithWeights(5, 5)
  diagram.walls = [(1, 1), (1, 2), (1, 3), (1,4), (3,0), (2,2), (2,3), (2,4),(3,2)]
  #
  #       S . . # 
  #         # . . .
  #         # # # .
  #         # #   .
  #         # #   E
  came_from, cost_so_far = a_star_search(diagram, start, goal)
  printPath(goal,start, came_from, cost_so_far)


def testcase3():
  goal  = (4,4)
  start = (0,0)
  diagram = GridWithWeights(5, 5)
  diagram.walls = [(1, 1), (1, 2), (3, 4)]
  # diagram4.weights = {loc: 5 for loc in [(3, 4), (3, 5), (4, 1), (4, 2),
  #                                        (4, 3), (4, 4), (4, 5), (4, 6), 
  #                                        (4, 7), (4, 8), (5, 1), (5, 2),
  #                                        (5, 3), (5, 4), (5, 5), (5, 6), 
  #                                        (5, 7), (5, 8), (6, 2), (6, 3), 
  #                                        (6, 4), (6, 5), (6, 6), (6, 7), 
  #                                        (7, 3), (7, 4), (7, 5)]}

testcase2()

