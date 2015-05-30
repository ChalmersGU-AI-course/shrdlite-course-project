# AStar implementation

The source code for astar can be found in the *astar* folder, and the tests in the
folder *test*. We have used 2 different test cases to prove the applicability of
astar, the first simpler one involves a map over Romania and finding the
shortest path from one city to another, the second more complex test involves
finding a solution to an 8-puzzle.

### Files

*astar/AStar.ts* --  the general implementation of the A* algorithm

*/astar/AStar-tryout.ts*  --  a previous partial implementation (left it there
in case we need anything for the project)

*/test/AStar-Romania.ts*
This file contains the test for the graph example (Romania) from the lecture. We
have in this case used the built in heuristic, since the example from the
specifies this.

*/test/AStar-puzzle.ts*
This file contains the test for the 8-puzzle. We have in this case used the
manhattandistance between states as a heuristic, and furthermore made some tests
for internal functions.


### Types and Ideas in AStar

Our astar implementation uses the following interface for searching the
solution.

```
  interface State {
    heuristic(solution: any): number;  // compare length to goal
    match(solution: any): boolean;     // see if goal is found
    expand(): Transition[];            // expand to next possible states
  }
```

Since all problems involves different heuristics where the solution can be more
or less specified, have we let the parameter `solution` for the huristic and match
function be of type `any` so we can have greater applicability and allow more
generality in the implementations.

Every state can be expanded.

```
  interface Transition {
    cost: number;
    state: State;
  }
```

This interface lets us expand a state into neighbour states and give us a cost
for each transition which the astar `search` function uses to keep track of
total cost for paths.

```
  interface Solution<T extends State> {
    path: T[];
    graph: ASGraph<T>;
    stats: {
      expansions: number;
      visits: number;
    }
  }
```

This represents a solution to the problem as the name hints. Since all solutions
depends on the specific implementation, is this interface generic. `path`
gives the actual solution for how to arrive at the goal state. `graph` is given
so that further investigation in the graph can be done. The graph is
a internal class of the astar and can´t be used outside of the scope of the
astar, it simply allows to do faster searches or printing if needed. `stats` allow
us to keep record of properties of a certain search, such as the number of
expansions and visited nodes during the search.


`
  function search<T extends State>(start: T, g: ASGraph<T>, goal: any): Solution<T>
`

This is the actual astar function which takes `start`, an implementation of
`State`, an optional `ASGraph` and a goal that although is of type `any` at
least must be of the same type as the one the `heuristic` and `match`-function
uses in the implementation of `State`. The function uses a priority queue in the
background to iterate through the nodes. An internal comparator function
gives priority by comparing the totalcost and heuristic cost to see which
priority a node is given in the priority queue.


### Tests for implementation of shrdlite

- Before any testing you will need to run `npm install` to include any dependencies.

- To run test in this folder run `make test`.

The tests build on the testing frameworks:
[Mocha] (https://github.com/mochajs/mocha),
[Should] (https://github.com/tj/should.js) and
[Chai] (http://chaijs.com/)


### Testing method

In order to test the algorithm, use 'make test' in the project root. This will
run both the puzzle and the romania tests. The heuristic in the 8-puzzle is the
Manhattan distance, and the heuristic in the romanian cities example is taken
from the lecture (liniar distance between the cities).


