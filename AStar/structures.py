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

### Grid with weights for edges
class GridWithWeights(SquareGrid):
  def __init__(self, width, height):
    super().__init__(width, height)
    self.weights = {}
    
  def cost(self, a, b):
    return self.weights.get(b, 1)

