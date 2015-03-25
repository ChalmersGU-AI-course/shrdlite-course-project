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

When the server is running the web interface is visible at
<http://localhost:8000/shrdlite.html>
