-- | Types for all inputs and outputs
module Types.World where

import           Data.Map (Map)


-- | Position in the world, from left to right
type Position = Int

-- | The world
data World =
  World {stacks :: Map Position String -- ^ where objects are located
        ,holding :: Maybe String -- ^ object we are holding
        ,arm :: Position -- ^ arms position
        ,objects :: Map String Object -- ^ what objects are in the world
        }

-- | Objects in the world
data Object =
  Object {form :: String
         ,size :: String
         ,color :: String}
