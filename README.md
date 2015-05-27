# Team Dandelions Shrdlite course project

Shrdlite is a programming project in Artificial Intelligence, a course given 
at the University of Gothenburg and Chalmers University of Technology.
For more information, see the course webpages:

- <http://www.cse.chalmers.se/edu/course/TIN172/>

This is an implementation of the project developed by Team Dandelion (#2) consisting of:
 
 - Gabriel Andersson 
 - Gustav Mörtberg
 - Jack Petterson
 - Niklas Wärvik 

## Running the project
### HTML version
In order to run the HTML version, the user simply compiles it and launches the web application, it behaves in a similar way to the original version with the addition of controls for selecting search strategy.

### Console version
Our console version takes the following arguments: 
 - world: small, medium, complex, impossible
 - utterance: either example number or full utterance in quotations
 - search strategy: DFS, BSF, star, BestFS (case-sensitive)

Example: `node shrdlite-offline small 0 star`

## Interesting example utterances

## Implemented extension
The project implements a few different additions to the original project description.

### Quantifiers
Quantifier handling of any, all and the. All can not be interpreted as any.

### Verbose planner
The planner writes what it is doing in each step and what object it is handling.
How much it says about an object depends on how many there exits. If there is only one ball it just says "the ball"

## A\* and its heuristic 
Our implementation of the search is a version of the generic search algorithm, which takes a function as one of its parameters. The frontier is represented as a PriorityQueue which is ordered using the supplied function, this way we can "model" different data structures (such as a stack for stack for DFS) using the a priority queue.

As it should, A\* looks at the combined value of the cost so far and the heuristic to the goal state to decide which part of the frontier to expand.

### Heuristics
All of our heuristics are based on the question "What is the minimum amount of work needed to achieve the goals?"For each new state added to the frontier, we calculate the heuristic for each of the conjuctive goals and choose the one which has the lowest combined heuristic.
## Strange or half-finished behaviour
Our interpreter is stupid. It is a risk that we create to many permutations before filtering depending on physical rules and their actual relation

The program have mainly been tested using the HTML and console versions, ANSI is supported but it haven't 
been tested thoroughly.

## Miscellaneous
