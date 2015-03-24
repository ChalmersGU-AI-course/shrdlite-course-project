{-# LANGUAGE OverloadedStrings #-}
-- |

module Main where

import Web.Scotty
import Network.Wai.Middleware.Static

main :: IO ()
main = scotty 8000 (do middleware (staticPolicy (addBase "..")) -- serv all shrdlite files
                       get "/ajax" ajaxing) -- use /ajax as the entrypoint for all interesting stuff.

ajaxing :: ActionM ()
ajaxing = html "Hello"
