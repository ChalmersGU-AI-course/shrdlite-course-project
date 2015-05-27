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

### Improved heuristics

xxx

### IDA\*

Iterative Deepening A\* was also implemented. It does take longer time but still finds the optimal solution. The advantage lies in using less memory. In order to use IDA\* instead of A\*, one has to change it in `Planner.ts` at line 62.

### Clarification questions on ambiguity

There are two types of ambiguity. The first one is with the `the` quantifier, for example `grasp the object`. In this case, the system prints a list of possible candidates to choose from. The user can then add more information such as `red`, if the new information is not sufficient he can provide more information such as `small` or `ball`.

The other type of ambiguity comes from a shift/reduce conflict in the grammar. The typical example would be `put the small ball in a box on the floor`. The box in this sentence can either be parsed as the current location of the ball or as the target location for the ball. Our system investigates both possibilities and rules out any that is inconsistent with the current state of the world. If both have valid interpretations, the system calculates both and picks the shortest one.

### Known issues/bugs

There are currently two unsolved issues, both of which has to do with resolving ambiguity:

**complex world: `put the pyramid under a table on the large table`**  
This one has a parse ambiguity but the system seems to pick the wrong one. We would want it to interpret it as

```
put the pyramid (that is under a table) on the large table
```

which has a valid interpretation, instead of

```
put the pyramid under a table (that is on the large table)
```

which have no valid interpretation no matter which pyramid you choose.

**small world: `put the ball in the box`**  
This produces an infinite loop, the ball is first resolved but then it never accepts a valid description of the box (if there are several to choose from).

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
