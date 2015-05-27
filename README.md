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
In order to run the HTML version, the user simply compiles it and launches the web application, 
it behaves in a similar way to the original version with the addition of controls for selecting 
search strategy.

Our console version takes the following arguments: 
 - world: small, medium, complex, impossible
 - utterance: either example number or full utterance in quotations
 - search strategy: DFS, BSF, star, BestFS (case-sensitive)

An example would be: "node shrdlite-offline small 0 star".

## Interesting example utterances
###In the complex world:
"Put all tables beside all boxes"

In order:
 - "Put all yellow objects above a red object"
 - "Put all red objects above a yellow object"

###In the medium world:
"put the object that is left of a red box that is above a brick that is left of a pyramid that is left of a ball that is inside a box into a box that is above a brick that is left of a pyramid"

## Implemented extension
The project implements a few different additions to the original project description.

### Quantifiers
We handle the quantifiers any, all and the. All can not be interpreted as any.

### Verbose planner
The planner writes what it is doing in each step and what object it is handling.
How much it says about an object depends on how many there exits. If there is only one ball it just says "the ball"

### Different search strategies
We have implemented different search strategies to compare them to A\* and they are:
 - Depth first search
 - Breadth first search
 - Best first search

## Our implementation of A\* and its heuristic 

## Strange or half-finished behaviour
Our interpreter is stupid. It is a risk when we make permutations that we create to many before filtering depending on physical rules and their actual relation. This means that it would take to long to compute and we throw an error instead.

The program have mainly been tested using the HTML and console versions, ANSI is supported but it haven't 
been tested thoroughly.

## Miscellaneous
