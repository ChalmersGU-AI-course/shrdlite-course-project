The A* exercise
============================

a* is a search heuristic in Artificial Intelligence, a course given
at the University of Gothenburg and Chalmers University of Technology.
For more information, see the course webpages:

- <http://www.cse.chalmers.se/edu/course/TIN172/>

The goal of the exercise is to create an problem and a searcher so that
that this code can be incorporated into the course project.

The interface is written in TypeScript

to run just invoke the page astar.html

It was tested using the Python 3 web server

To start the server, just run this from the command line, from the same directory as the
file `astar.html`:

    python3 -m http.server --cgi 8000

Now let the webserver keep running and browse to any of these addresses:

- <http://localhost:8000/astar.html>
- <http://127.0.0.1:8000/astar.html>
- <http://0.0.0.0:8000/astar.html>


Additional information
-----------------------

There is a Makefile. Here's what it can do:

- `make clean`: Removes all auto-generated Javascript files
- `make all`: Calls TypeScript and Closure for each target
- `make html | ajax | ansi | offline`:
  Calls TypeScript and Closure for the given target,
  i.e., it compiles the file `shrdlite-X.ts` into `shrdlite-X.js`


List of files
--------------

BSD Makefile for automatically creating `.js` files from `.ts` files:
- `Makefile`

Main browser files:
- `astar.html`, `astar.css`

Wrapper file for the browser-based interfaces:
- `astar-html.ts`

Main TypeScript module:
- `Astar.ts`

TypeScript interfaces and classes for the different implementations of the blocks world:
- `Puzzle.ts`, `SVGPuzzle.ts`, `ExamplePuzzles.ts`

TypeScript modules for parsing, interpretation and planning:
- `Parser.ts`, `Interpreter.ts`, `Planner.ts`

TypeScript declaration files for non-TypeScript libraries:
- `lib/jquery.d.ts`

External Javascript libraries:
- `lib/jquery-1.11.0.min.js`

