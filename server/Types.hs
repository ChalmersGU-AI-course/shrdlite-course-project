-- | Types for all inputs and outputs
module Types where


-- * Input types

--intprt
--stacks
--holding
--arm
--objects
--utterance
--parses


--data Object =


-- * Output types

-- | We send @[Action]@ to the web interface as an answer
data Action =
  Action String -- Description of what we are doing
         [Commands] -- Commands executing above description

-- | What the robot arm is to do.
data Commands
  = R  -- ^ Move right
  | L  -- ^ Move left
  | P  -- ^ Pick up
  | D  -- ^ Drop
