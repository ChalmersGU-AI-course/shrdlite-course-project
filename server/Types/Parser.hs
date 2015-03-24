-- |

module Types.Parser where

data Result =
  Result {r_input :: String -- ^ what the input was
         ,r_prs :: Command -- ^ grammar tree
         }

data Command =
  Command {c_cmd :: String -- ^ move, pick up, etc
          ,c_ent :: Maybe Entity
          ,c_obj :: Maybe Object
          }

data Entity =
  Entity {e_quant::String -- ^ a quantity
         ,e_obj :: Object -- ^ an object
         }

data Location =
  Location {l_rel::String
           ,l_ent::Entity
           }

-- | A grammar object
data Object
  -- | A located object
  = Located {o_obj :: Object
            ,o_loc :: Location}
  -- | An object specified by its size etc
  | Specified {o_size :: Maybe String
              ,o_color :: Maybe String
              ,o_form :: Maybe String}
