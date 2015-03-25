# How to use

You need GHC >= 7.6, cabal-install and a happy smile.

~~~
# Perhaps use a sandbox
cabal sandbox init

# Install dependencies, this can take a while since scotty depends on
# half of hackage...
cabal install --only-dep

# Now do some hacking

# Build the server
cabal build

# Run the server
cabal run
# or
./dist/build/server/server
~~~

When the server is running the web interface is available at
<http://localhost:8000/shrdlite.html>


# Libraries used

- [scotty][scotty] and [wai-middleware-static][wai] for web server.
- [aeson][aeson] to parse JSON into Haskell types.
- [psqueues][psq] for priority queues for the A* implementation, maybe.


[scotty]: http://hackage.haskell.org/package/scotty
[wai]: http://hackage.haskell.org/package/wai-middleware-static
[aeson]: http://hackage.haskell.org/package/aeson
[psq]: http://hackage.haskell.org/package/psqueues
