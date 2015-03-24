{-# LANGUAGE OverloadedStrings #-}
-- |

module Main where

import Control.Monad.IO.Class (liftIO)
import Network.Wai.Middleware.Static
import Web.Scotty

main :: IO ()
main = scotty 8000 (do middleware (staticPolicy (addBase "..")) -- serv all shrdlite files
                       get "/ajax" ajaxing) -- use /ajax as the entrypoint for all interesting stuff.

ajaxing :: ActionM ()
ajaxing = do ps <- params
             liftIO (print ps)
             html "Hello"
