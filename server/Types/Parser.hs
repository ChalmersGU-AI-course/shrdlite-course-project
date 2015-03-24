{-# LANGUAGE OverloadedStrings #-}
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

-- from base
import Control.Applicative

-- from aeson
import qualified Data.Aeson as A
import Data.Aeson hiding (Object, Result)

data Result =
  Result {r_input :: String -- ^ what the input was
         ,r_prs :: Command -- ^ grammar tree
         }
  deriving (Show)

instance FromJSON Result where
  parseJSON (A.Object v) = Result <$> v .: "input" <*> v .: "prs"
  parseJSON _ = empty


-- | A command
data Command =
  Command {c_cmd :: String -- ^ move, pick up, etc
          ,c_ent :: Maybe Entity -- ^ with what
          ,c_loc :: Maybe Location -- ^ to where
          }
  deriving (Show)

instance A.FromJSON Command where
  parseJSON (A.Object v) = Command <$> v .: "cmd" <*> v .: "ent" <*> v .: "loc"
  parseJSON _ = empty


-- | a specified object
data Entity =
  Entity {e_quant :: String -- ^ quantifier, the, any ...
         ,e_obj :: Object -- ^ an object
         }
  deriving (Show)

instance FromJSON Entity where
  parseJSON (A.Object v) = Entity <$> v .: "quant" <*> v .: "obj"
  parseJSON _ = empty


-- | Location of in relation to some entity
data Location =
  Location {l_rel :: String -- ^ ontop, beside, inside ...
           ,l_ent :: Entity -- ^ in relation to what
           }
  deriving (Show)

instance FromJSON Location where
  parseJSON (A.Object v) = Location <$> v .: "rel" <*> v .: "ent"
  parseJSON _ = empty


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
  deriving (Show)

instance FromJSON Object where
  parseJSON (A.Object v) =
    (Located <$> v .: "loc" <*> v .: "obj") <|>
    (Specified <$> v .: "color" <*> v .: "form" <*> v .: "size")
  parseJSON _ = empty


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



exampljson = "{ \"cmd\": \"move\", \"ent\": { \"obj\": { \"color\": \"black\", \"form\": \"ball\", \"size\": null }, \"quant\": \"the\" }, \"loc\": { \"ent\": { \"obj\": { \"loc\": { \"ent\": { \"obj\": { \"color\": null, \"form\": \"floor\", \"size\": null }, \"quant\": \"the\" }, \"rel\": \"ontop\" }, \"obj\": { \"color\": null, \"form\": \"box\", \"size\": null } }, \"quant\": \"any\" }, \"rel\": \"inside\" } }"

hej :: Maybe Command
hej = decode exampljson
