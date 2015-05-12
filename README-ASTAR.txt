A* (ASTAR) laboration in TIN172
Group: Planet Express (Johannes Ringmark, Bjarki Traustason, Jonatan Kilhamn)


=== Relevant files ===

- astarAlgorithm.ts
- astarTests.ts
- collections.ts
- performTests.js
- astar.html

In addition, all .ts-files above compile to corresponding .js-files using tsc.

collections.ts is written by GitHub user basarat, and is available at
github.com/basarat/typescript-collections. All other files are written by us.


=== The implemented example ===

We have implemented the example problem "Travel in Romania", as described in
the lecture slides at https://github.com/AI-course-TIN172-DIT410/AI-lecture-slides/raw/master/ch03.pdf, page 39.

The edge costs are given in the figure. The heuristic function is the euclidian
distance between cities, based on planar coordinates estimated from the graph.
The file astarTests.ts contains a representation of the Romanian cities graph,
as well as the distance and heuristic function definitions which are passed to
the algorithm.


=== How to test ===

To see the output of the algorithm, first compile the .ts files. The easiest
way is to run this command:

$ tsc *.ts

open astar.html in a browser. This will
produce a text-only page outlining a few path queries, the algorithm's output,
and the correct answer.

To see that the lines denoted "O:" actually are output from the algorithm, a
cursory inspection of performTests.js should suffice.

We did regrettably not have time to produce an interactive version of the
testing page. If you want to try other path queries, here are two ways:


1. Edit performTests.js directly, editing a line on the form

test1.findPath('mehadia', 'sibiu');


2. Open astar.html, choose "inspect element" (or equivalent) in the browser,
and access the javascript console. From there, the following lines will set you
up for any query:

> var test1 = new Tests.astarTest();
> test1.townProblemSetup();

Then you can perform a query for two towns by typing:

> test1.findPath('town1', 'town2');

If you want to perform more than one query, you can use the same astarTest object (the "test1" var), but you need to rerun the line

> test1.townProblemSetup();


However, hopefully the example queries in performTests.js should be enough.





