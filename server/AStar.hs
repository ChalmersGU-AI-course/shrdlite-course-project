-- |

module AStar where


-- | A quite general A* search function, we represent the graph as a
-- function from nodes to neighbours and any distances as a function
-- of two neighbours, thus the user can choose whatever graph
-- representation they want.
astar :: (Ord measure)
      => (node -> [node]) -- ^ function from node to neighbours
      -> (node -> node -> measure) -- ^ distance between neighbours
      -> (node -> measure) -- ^ distance heuristic to goal
      -> (node -> Bool) -- ^ goal node predicate
      -> node -- ^ start node
      -> [node] -- ^ path from start to goal (can be empty if no path is found)
astar = undefined
