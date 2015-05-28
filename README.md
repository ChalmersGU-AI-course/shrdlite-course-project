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

### Interesting example utterances

xxx (how to run your project, and some interesting example utterances)

Implemented extensions
------------------------------------------------
xxx (what extensions you have implemented, and where in the code they are)

### Improved heuristics

The interpretation, which is a Disjunctive Normal Form, is broken down into atoms and the heuristic for each atom is computed. When we have `a && b` we take the maximum of the heuristic for `a` and `b` since both must be fulfilled. When we have `a || b` we take the minimum heuristic since we only need to achieve one of the goals. If the atomic heuristic is admissible, the combined heuristic is also admissible.

The atomic heuristic is calculated slightly differently depending on which command has been given but it generally consists of three parts:  
- `arm cost`
- `above cost`
- `drop cost`

If we want to move object `a` to the location `b`, the `arm cost` is the arm distance to `a` plus the distance from `a` to `b`. That is the minimum number of `l`/`r` actions we need to get the arm to the right stack both to get `a` and deliver `a` to its place.

The `above cost` looks at how many objects are above the wanted target or location. For each object that is blocking the way, we add a cost of 4: `p, l, d, r`. This is admissible since it ignores the fact that not all objects can support any other object and it will at least require these 4 actions to move the object somewhere else.

The `drop cost` is zero if the arm is not holding anything. If we intend to drop the object at the current stack, the drop cost is 1 for simply dropping it. If we want to drop this object at another location in order to come back and get what we really want, we add a cost of 3: `l, d, r`. This extra check did improve the heuristic very much for some cases.

The implementations of all heuristics can be found in the file `Heuristic.ts`.

### IDA\*

Iterative Deepening A\* was also implemented. It does take longer time but still finds the optimal solution. The advantage lies in using less memory. In order to use IDA\* instead of A\*, one has to change it in `Planner.ts` at line 62.

### Clarification questions on ambiguity

There are two types of ambiguity. The first one is with the `the` quantifier, for example `grasp the object`. If there are several objects that could fit with the object description, the system enters a state where it asks the user to specify which object is meant. In this case, a list of possible candidates to choose from is printed. The user can then add more information such as `red`, if the new information is not sufficient he can provide more information such as `small` or `ball`. When sufficient information has been gathered, the system performs the action.

xxx (write something on handling of misspellings, and escaping the ambiguity loop by writing a new command)

The other type of ambiguity comes from a shift/reduce conflict in the grammar. The typical example would be `put the small ball in a box on the floor`. The box in this sentence can either be parsed as the current location of the ball or as the target location for the ball. Our system investigates both possibilities and rules out any that is inconsistent with the current state of the world. If both have valid interpretations, the system calculates both and picks the shortest one.

xxx (where in the code is the ambiguity stuff?)

The implementation of the ambiguity handling is a bit spread out, but is found mainly in `Interpreter.ts` and `Shrdlite.ts`.  

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

which has no valid interpretation no matter which pyramid you choose.

**small world: `put the ball in the box`**  
This produces an infinite loop, the ball is first resolved but then it never accepts a valid description of the box (if there are several to choose from).


Description of source files
---------------------------

Main TypeScript module:

- `Shrdlite.ts`  
  Some state has been added here to help solve the ambiguity problem.

Interpretation module:

- `Interpreter.ts`  
  Attempts to interpret what the user really means, which includes resolving ambiguities. This module either outputs a non-empty list of interpretations that are valid in the current world, or an error that no interpretation was valid.

Generic search modules:

- `Astar.ts`  
  Contains interfaces for representations of heuristic search as well as the A\* algorithm.

- `IDAstar.ts`  
  Reuses the representations found in `Astar.ts` to implement the IDA\* algorithm.

Modules for planning:

- `Planner.ts`  
  Calculates a plan for each of the valid interpretations. Converts the interpretation into a goal function that is passed to the chosen search algorithm together with a cost function and a neighbour function.

- `Heuristics.ts`  
  Computes a good heuristic function for a certain interpretation, which is passed by the Planner to the search algorithm.

- `Position.ts`  
  Contains interfaces and functions that are useful in both the Planner and the Heuristics.

Basarat's collections library for Typescript:

- `lib/collections.ts`
