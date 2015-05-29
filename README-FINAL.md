# Shrdlite - Final implementation

We (Astars) have choosen to implement the project in
[Typescript](http://www.typescriptlang.org) since we found it most appropriate
for the task of running in the browser.

#### How to run

- Run `make all`
- Open */shrdlite.html* in your browser

#### Interesting utterance examples

In the small world (quantifiers):
- **"put all balls inside a box"** (all objects, any references)
- **"put the table inside any box"** (the object, any reference)
- **"take the ball"** (gives Interpretation error)

In the medium world (relations):
- **"take the red table ontop of a object on the floor"** (ontop)
- **"put all green objects above the blue table"** (above)
- **"put all boxes to the left of the pyramid"** (left of)
- **"put all boxes to the right of the pyramid"** (right of) <br />
Observe that it takes into consideration all pyramids since the interpreter does
not know what pyramid the utterance refers to, so it puts the boxes to the
left/right of both of the pyramids.
- **"put the small pyramid beside all boxes"** <br />
Observe that the boxes could be to both the right or the left since it does not
matter as long as they are directly to the right/left of the pyramid.
- **"put all boxes beside the small pyramid"** <br />
Observe that this sentence have the same semantic meaning as the one before so
running these commands in sequence does not affect the state of the world more
than once.
- **"put all tables under a brick"** (under) <br />
Observe that we have choosen to interpret the command as all tables under any
brick but the same brick.

## Overview of the implementation

####*/Interpreter.ts*
This file contains the code for the interepreter. The code is self-contained and
the only references to other files are */World.ts* and */Parser.ts*.

#### Types and Ideas in Interpreter

```
  function interpret(parses : Parser.Result[], currentState : WorldState) : Result[]
```
This is the only exported function and it is also what returnes the final result
back to the Planner to compute the path for how to resolve the command in the
context of the world. It also handles all the exceptions that are thrown by the
methods of the class to refine them for the caller.

```
  function interpretCommand(cmd : Parser.Command, state : WorldState) : Literal[][] {
    var interpreter = new Interpret(state);
    return interpreter.derive(cmd);
  }
```
This function is the function that `interpret` calls to create the Literals that
is the main content of the `Result` type.

```
  class Interpret {
    state: WorldState;
    constructor(state: WorldState) {
      this.state = state;
    }
    ...
  }
```
The interpreter is structured according to a class and the toplevel functionality is
implemented as methods. The reason for having a choosen this structure is to
contain the state in one place, and the state is given during instantiation of
the class.

```
  public derive(cmd: Parser.Command): Literal[][]
```
The top-level public function defines the following interpretation depending on the
verb action. The verb actions: "take", "put" and "move" only check preconditions, the
real work is done by "the/any/all" and "literals" that these functions call.

```
  private take(ent : Parser.Entity): Literal[][]
  private put(loc : Parser.Location): Literal[][]
  private move(ent : Parser.Entity, loc : Parser.Location): Literal[][]
```
Verb methods that handle the verb actions in derive.

```
  private the(objs: string[],           // the objects extracted from the command
              rel: string,              // relation ("ontop", "under", etc)
              refQuant: string,         // quantifer for reference
              refs: string[],           // references extracted from the command
              refspec: Parser.Object):  // spec of the ref/s for errors
                Literal[][]             // returning Literals
  private any(objs: string[],
              rel: string,
              refQuant: string,
              refs: string[],
              objspec: Parser.Object,   // spec of the object/s for errors
              refspec: Parser.Object):
                Literal[][]
  private all(objs: string[],
              rel: string,
              refQuant: string,
              refs: string[],
              objspec: Parser.Object,
              refspec: Parser.Object): Literal[][]
```
Quantifer methods for the objects. All the arguments have been extracted by the
verb methods.

```
  private references(obj: Parser.Object): string[]
```
Searches world state to find target object/s and reference/s referred in command.
Example reference: "take the ball beside the table inside the box to the left of
the brick". In this case the table is the reference, and we want to figure out what table
the sentence refers to, in order to know what ball to take.

```
  private findTarget(obj: Parser.Object, rel: string, ref: string, onFloor: boolean): string
```
Finds target object in relation (leftof, rightof, under, etc..) to another object.

```
  private literals(objs: string[],      // objects
                   refs: string[],      // references
                   rel: string,         // relation
                   swapped?: boolean,   // if refs are in fact objects (optional)
                   tolerant?: boolean): // see below (optional)
                    Literal[][]

```
Makes literals of objects and references, and relation. The last argument tells
whether we should weed out all arrays that are bad, i.e containing a bad
literal (conflicting literal, for example because of physical error), or if we
should be weed out only the bad literals. The former case is what we describe as
`tolerant` and the latter not.


####*/Planner.ts*

TODO

#### Types and Ideas in Planner

TODO

#### Heuristics

- Our heuristic is implemented in the Planner module and calculates a
  non-admisible heuristical distance between a state and a goal in
  PDDL-form. A PDDL is a disjuction of conjunctions of literals, where
  each literal has a relationship, a number of arguments and can be
  negated. For each parameter of the disjuction, we calculate a
  heuristical value which is the sum of the heuristical values of all
  contained literals. The heuristical value of each literal depends on
  its relationship. The following functions are implemented:
-- inside/ontop: if x should be ontop/inside of y, we have to remove all
  things above x and y, so the heuristic is the number of objects above
  x and y
-- above/leftof/rightof/holding: if x should be
  above/leftof/rightof y or the crane should hold x, we return the
  number of objects above of x, which must be removed.
-- under: if x should be under y, we return the number of objects above
  of y
-- beside: if x should be beside y, we return the minimum of objects
  over x and y

In the end, we return the minimum heuristical value of all disjuncted
parameters.

This heuristic is can overestimate the number of moves, for example if
  one stack is used in more than one relationship, so its objects are
  counted multiple times. This can result in PDDLs for which our program
  returns a path which is longer than the optimal one, but we think this
  will occur very rare, and a easy and fast heuristic is more import and
  than getting always the optimal path.

## Extensions

We have implemented all the quantifiers as a extension. We have additionally
extended with ambiguities. There are 2 types of ambiguitues that we have
implemented, but we have not implemented any ambiguity resolution.

#### ambiguity 1 (Multiple interpretations)
If there are more than one valid interpretation then the interpreter throws an
error that asks what reference/s the user means.

#### ambiguity 2 (Too many objects)
If the "the" quantifiers refers to many objects the interpreter throws an error
that asks the user what object he/she means.


### Other

We have not implemented any tests for neither the Planner or the Interpreter
because of the lack of time.

We have diabled the tests for the Astar implementation since there were some
issues with [Mocha] (https://github.com/mochajs/mocha). Mocha runs ontop of Node
and since Node has a different module system (commonjs) we could not have both
the tests and the browser compile at the same time. This is a known
[issue](https://github.com/Microsoft/TypeScript/issues/17) in typescript. But
since we had the test pass for the Astar implementation we did not consider it
that important to make it work this time since we have not made any substatial
changes in the Astar implementation and you have already seen the tests pass
before.


