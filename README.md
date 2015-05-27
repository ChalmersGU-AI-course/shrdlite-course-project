The Shrdlite Qthulu project
============================

Shrdlite is a programming project in Artificial Intelligence, a course given
at the University of Gothenburg and Chalmers University of Technology.
For more information, see the course webpages:

- <http://www.cse.chalmers.se/edu/course/TIN172/>

The goal of the project was to create an interpreter and a planner so that
a person can control a robot in a blocks world to move around objects,
by giving commands in natural language.

There is a web-based graphical
interface from which the user can interact with the blocks world.

The interface is written in TypeScript (which compiles into Javascript),
and it can be run in several different modes:

- as a HTML web application, using SVG animations for displaying the world

- as a text application, using ANSI graphics for displaying the world
  (requires an ASNI-capable terminal, and that Node.JS is installed)

- as an offline text application, where input is provided at the command line
  (requires that Node.JS is installed, but nothing of the terminal)

How to compile
-----------------------

To be able to run the system you need Node.JS and TypeScript.

You can build the different targets in the project using the provided Makefile:

- `make clean`: Removes all auto-generated Javascript files
- `make all`: Calls TypeScript and Closure for each target
- `make html | ajax | ansi | offline`:
  Calls TypeScript and Closure for the given target,
  i.e., it compiles the file `shrdlite-X.ts` into `shrdlite-X.js`

Implemented features
------------------------------------------------
xxx

## Improved heuristics

xxx

## IDA\*

xxx

## Clarification questions on ambiguity

xxx

Known issues/bugs
------------------------------------------------
xxx



List of files
--------------

BSD Makefile for automatically creating `.js` files from `.ts` files:
- `Makefile`

Main browser files:
- `shrdlite.html`, `shrdlite.css`

Wrapper files for the browser-based interfaces:
- `shrdlite-html.ts`, `shrdlite-ajax.ts`

Wrapper files for the Node.JS-based interfaces:
- `shrdlite-ansi.ts`, `shrdlite-offline.ts`

Main TypeScript module:
- `Shrdlite.ts`

TypeScript interfaces and classes for the different implementations of the blocks world:
- `World.ts`, `SVGWorld.ts`, `TextWorld.ts`, `ANSIWorld.ts`, `ExampleWorlds.ts`

TypeScript modules for parsing, interpretation and planning:
- `Parser.ts`, `Interpreter.ts`, `Planner.ts`

Grammar files used by the Nearley chartparser:
- `grammar.js`, `grammar.ne`

Example CGI script that is called by the Ajax web interface:
- `cgi-bin/shrdlite_cgi.py`

TypeScript declaration files for non-TypeScript libraries:
- `lib/jquery.d.ts`, `lib/node.d.ts`

External Javascript libraries:
- `lib/jquery-1.11.0.min.js`, `lib/nearley.js`

Assorted documentation (currently only the TypeScript language definition):
- `doc`
