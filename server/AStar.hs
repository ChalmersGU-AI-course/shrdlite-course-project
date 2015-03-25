-- |

module AStar where

astar :: (Ord measure, Ord node)
      => (node -> [node]) -- ^ function from node to neighbours
      -> (node -> node -> measure) -- ^ distance between neighbours
      -> (node -> measure) -- ^ distance heuristic for goal
      -> (node -> Bool) -- ^ goal node predicate
      -> node -- ^ start node
      -> [node] -- ^ path from start to goal (can be empty if no path is found)
astar = undefined
