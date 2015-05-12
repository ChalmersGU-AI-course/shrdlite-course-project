
# CLEARTOP
#   1 start
#   2 Does X support an object Y? If not, goto 5
#   3 Move Y off X
#   4 Goto 2
#   5 Assert that X is CLEARTOP




MoveTo(pos)
  precon: !At(r,pos)
  effect: At(r,pos) 

Grasp(obj)
  precon: AT(robot, pos(obj)) and holding(null) and ClearTop(obj)
  effect: holding == obj and stack[pos(obj)] = stack[pos][1:]

Ungrasp(pos)
  precon: holding != none and physics.check_ontop(holding, stack[pos][0] ,objects)
  effect: holding = none and stack[pos] = [holding]:stack[pos]

