The Shrdlite course project
============================

Shrdlite is a programming project in Artificial Intelligence, a course given 
at the University of Gothenburg and Chalmers University of Technology.
For more information, see the course webpages:

- <http://www.cse.chalmers.se/edu/course/TIN172/>

The goal of the project is to create an interpreter and a planner so that
a person can control a robot in a blocks world to move around objects,
by giving commands in natural language.

How to compile
--------------
In order to compile the project coffeescript is needed, if you do not have
it you can install it with npm install -g coffee-script.

Also bash is needed (for Windows) and it is installed through Cygwin.

In order to compile use the command:
bash Cake.sh

which should run if you have coffeescript and bash. 


How to run
----------
When you have compiled you can run the project with the command:
node shrdlite-offline.js [world] [Ex]

where [world] = small | medium | complex | impossible
and [Ex] is a number or a string.

E.g.
node shrdlite-offline.js medium "put the small box in the large box"
or
node shrdlite-offline.js complex 2

Enjoy!
------
