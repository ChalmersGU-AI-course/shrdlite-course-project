module Types where


--intprt
--stacks
--holding
--arm
--objects
--utterance
--parses


--data Objects = 


data Action =
  What String [Commands]

data Commands =
    R
  | L
  | D
  | U

