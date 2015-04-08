#!/usr/bin/env python3

# Implemented with help of a tutorial from Red blob games
# URL: http://www.redblobgames.com/pathfinding/a-star/implementation.html

from structures import PriorityQueue
from structures import GridWithWeights

def a_star_search(graph, start, goal, heuristic):
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