{- |

> example :: Command
> example =
>   Command "move"
>           (Just $
>            Entity "the"
>                   (Specified (Just "black")
>                              (Just "ball")
>                              Nothing))
>           (Just $
>            Location "inside"
>                     (Entity "any"
>                             (Located
>                                (Location "ontop"
>                                          (Entity
>                                             "the"
>                                             (Specified Nothing (Just "floor") Nothing)))
>                                (Specified Nothing (Just "box") Nothing))))
>
-}
module Types.Parser where

data Result =
  Result {r_input :: String -- ^ what the input was
         ,r_prs :: Command -- ^ grammar tree
         }

data Command =
  Command {c_cmd :: String -- ^ move, pick up, etc
          ,c_ent :: Maybe Entity -- ^ with what
          ,c_loc :: Maybe Location -- ^ to where
          }

data Entity =
  Entity {e_quant::String -- ^ quantifier, the, any ...
         ,e_obj :: Object -- ^ an object
         }

data Location =
  Location {l_rel::String -- ^ ontop, beside, inside ...
           ,l_ent::Entity -- ^ in relation to what
           }

-- | An object is either located in relation to some other object or
-- specified by its color, size and form
data Object
  =
    -- | A located object. "red ball on top of lilac floor"
    Located {o_loc :: Location
            ,o_obj :: Object}
  |
    -- | An object specified by its size etc. "red ball"
    Specified {o_color :: Maybe String
              ,o_form :: Maybe String
              ,o_size :: Maybe String}


-- "put the black ball in a box on the floor"
-- -> move the black ball inside any box that is on top of the floor
example :: Command
example =
  Command "move"
          (Just $
           Entity "the"
                  (Specified (Just "black")
                             (Just "ball")
                             Nothing))
          (Just $
           Location "inside"
                    (Entity "any"
                            (Located
                               (Location "ontop"
                                         (Entity
                                            "the"
                                            (Specified Nothing (Just "floor") Nothing)))
                               (Specified Nothing (Just "box") Nothing))))
{-
{
    "cmd": "move",
    "ent": {
        "obj": {
            "color": "black",
            "form": "ball",
            "size": null
        },
        "quant": "the"
    },
    "loc": {
        "ent": {
            "obj": {
                "loc": {
                    "ent": {
                        "obj": {
                            "color": null,
                            "form": "floor",
                            "size": null
                        },
                        "quant": "the"
                    },
                    "rel": "ontop"
                },
                "obj": {
                    "color": null,
                    "form": "box",
                    "size": null
                }
            },
            "quant": "any"
        },
        "rel": "inside"
    }
}
-}
