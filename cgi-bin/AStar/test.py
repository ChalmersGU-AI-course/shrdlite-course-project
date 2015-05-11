
from algorithm import a_star_search
from structures import GridWithWeights


def heuristic(a, b): #Manhattan distance
  (x1, y1) = a
  (x2, y2) = b
  return abs(x1 - x2) + abs(y1 - y2) 

def trivialHeuristic(a, b): # Trivial heuristic
  return 0

def printPath(goal, start, came_from, cost_so_far):
  current = goal
  path    = [goal]
  print(" ==== Running A* ====")  
  print("Path  :  Cost to node")
  while not current == start:
    print (current, " : ", cost_so_far[current])
    current = came_from[current]
  print("cost to goal: ", cost_so_far[goal])
  print("nodes visited: ", len(came_from))


##############################################################################
def testcase1(func):
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
  came_from, cost_so_far = a_star_search(diagram, start, goal,func)
  printPath(goal,start, came_from, cost_so_far)


def testcase2(func):
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
  # Expected path: (0, 0), (1, 0), (2, 0), (3, 0), (4, 0), (4, 1), (4, 2), (4, 3), (4, 4)
  came_from, cost_so_far = a_star_search(diagram, start, goal,func)
  printPath(goal,start, came_from, cost_so_far)

def testcase3(func):
  goal  = (4,4)
  start = (0,0)
  diagram = GridWithWeights(5, 5)
  diagram.walls = [(1, 1), (1, 2), (3, 4)]
  #
  #       S . . . .
  #       5 # 5 5 . 
  #       5 # 5 5 .
  #       5 5 5 5 .
  #           #   E
  # Expected path: (0, 0), (1, 0), (2, 0), (3, 0), (4, 0), (4, 1), (4, 2), (4, 3), (4, 4)
  
  diagram.weights = {loc: 5 for loc in [(0, 1), (2, 1), (3, 1),
                                         (0, 2), (2, 2), (3, 2),
                                         (0, 3), (1, 3), (2, 3), (3, 3)]}

  came_from, cost_so_far = a_star_search(diagram, start, goal,func)
  printPath(goal,start, came_from, cost_so_far)

import fileinput

def main():
  print("Hi and welcome to A*")
  print("Choose a testcase betweeen 1-3:")

  testcase = int(input())

  print("Use Manhattan distance as heuristic? Y/N")

  heuristicOn = input().upper()

  if heuristicOn == "Y":
    func = heuristic
  else:
    func = trivialHeuristic

  if testcase == 1:
    print("testcase1, dots are expected path")
    print("   ___________")
    print("   |S        |")
    print("   |. #      |")
    print("   |. #      |")
    print("   |. . . . .|")
    print("   |    #   E|")
    print("   ___________")
    testcase1(func)
  elif testcase == 2:
    print("testcase2, dots are expected path")
    print("   ___________")
    print("   |S . . #  |")
    print("   |  # . . .|")
    print("   |  # # # .|")
    print("   |  # #   .|")
    print("   |  # #   E|")
    print("   ___________")
    testcase2(func)
  elif testcase == 3:
    print("testcase3, dots are expected path, nums are cost")
    print("   ___________")
    print("   |S . . . .|")
    print("   |5 # 5 5 .|")
    print("   |5 # 5 5 .|")
    print("   |5 5 5 5 .|")
    print("   |    #   E|")
    print("   ___________")
    testcase3(func)


main()