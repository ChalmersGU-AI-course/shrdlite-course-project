# Shrdlite - Final implementation

We (Astars) have choosen to implement the project in
[Typescript](http://www.typescriptlang.org) since we found it most appropriate
for the task of running in the browser.

#### How to run

If you want to run tests you will need to run `npm install` to include any
dependecies.

To run test in this folder:

- Run `make test`.

The tests build on the testing frameworks:
[Mocha] (https://github.com/mochajs/mocha),
[Should] (https://github.com/tj/should.js) and
[Chai] (http://chaijs.com/)

To run the program:

- Run `make all`
- Open */shrdlite.html* in your browser

#### Interesting utterance examples

In the small world:
TODO


In the medium world:
TODO


In the complex world:
TODO


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

- how your A* planning heuristics work, and where in the code we can find it
TODO

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

- if some things are half-finished, or strange/unexpected behaviour
TODO

- anything else you want to inform us about
We have not implemented any tests for neither the Planner or the Interpreter
because of the lack of time.


