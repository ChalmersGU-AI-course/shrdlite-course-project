from enum import Enum

class Size(Enum):
  small = 1
  large = 2

class Color(Enum):
  red = 1
  black = 2
  blue = 3
  green = 4
  yellow = 5
  white = 6

class Form(Enum):
  brick = 1
  plank = 2
  ball = 3
  pyramid = 4
  box = 5
  table = 6
  floor = 7

class Entity:
  def __init__(self, size, color, form):
    self.size = size
    self.color = color
    self.form = form

class Spatial(Enum):
  on = 1
  above = 2
  under = 3
  beside = 4
  left_of = 5
  right_of = 6
  strictly_right_of = 7

class Relation:
  def __init__(self, spatial, a, b):
    self.spatial = spatial
    self.a = a
    self.b = b

# POSSIBLE MORE OF THESE FOR ALL RELATIONS???
def ON(a, b):
  return Relation(Spatial.on, a, b)
