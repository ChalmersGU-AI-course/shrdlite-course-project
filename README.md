- how to run your project, and some interesting example utterances
- what (if any) extensions you have implemented, and where in the code they are
- how your A* planning heuristics work, and where in the code we can find it
- if some things are half-finished, or strange/unexpected behaviour
- anything else you want to inform us about

# Aperture Science ShrdLite

## How to run:
```
make html
```
Then just open shrdlite.html in a browser. (Firefox 38 tested)

## Interesting examples:
The interpreter should be complete and interpret everything successfuly (we hope). The planner should also be complete and plan everything that is possible to perform. However the performance of the n-arms heuristics is sometimes very slow for 4 arms.

### Queries
#### Complex1:
 * put the ball left of the yellow brick right of the red pyramid
 * put all tables on the floor

##### Complex:
 * put the yellow brick under the blue table
 * put all balls beside every ball
 * put all blue objects above a yellow object
 * put an object right of the yellow box above a box above a brick

##### Medium1:
 * move all bricks on a table
 * move all balls beside a ball

##### Medium:
 * put all red objects on the floor
 * take all red objects

##### Small:
 * put all boxes on the floor
 * put the black ball in a box on the floor
    Do the latter multiple times to see how it always selects the one that works, ie
  1. First it takes the black ball *that is* in a box and puts it on the floor
  2. It now takes the black ball and puts it in a box *that is* on the floor


## Extensions
 * N-arms: The planner supports an arbitrary amount of arms, which cannot cross eachother.
 * All/The. The interpreter supports all quantifiers. If "The" is used and more than two objects match, there will be an ambuigity error.

## Heuristics
Two different heuristics are used, one specialized for 1-arm, and one general for n-arms. The heuristics are found in the file planner/planner-core.js as `SearchGraph.prototype.h_general` and `SearchGraph.prototype.h_1arm`. They employ several techniques, different for each relation.



