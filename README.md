Team Dandelions Shrdlite course project
============================

Shrdlite is a programming project in Artificial Intelligence, a course given 
at the University of Gothenburg and Chalmers University of Technology.
For more information, see the course webpages:

- <http://www.cse.chalmers.se/edu/course/TIN172/>

This is an implementation of the project developed by Team Dandelion (#2) consisting of:
 
 - Gabriel Andersson 
 - Gustav Mörtberg,
 - Jack Petterson
 - Niklas Wärvik 

Running the project
------------------------------------------------
In order to run the HTML version, the user simply compiles it and launches the web application, 
it behaves in a similar way to the original version with the addition of controls for selecting search strategy.

Our console version takes the following arguments: 
- world: small, medium, complex, impossible
- utterance: either example number or full utterance in quotations
- search strategy: DFS, BSF, star, BestFS (case-sensitive)

An example would be: "node shrdlite-offline small 0 star".

Interesting example utterances
------------------------------------------


Implemented extension
-----------------

Our implementation of A* and its heuristic
--------------------------------------

Strange or half-finished behaviour
-----------------------
The program have mainly been tested using the HTML and console versions, ANSI is supported but it haven't 
been tested thoroughly.

Miscellaneous
--------------
