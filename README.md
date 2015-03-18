The Shrdlite course project
============================

Shrdlite is a programming project in Artificial Intelligence, a course given 
at the University of Gothenburg and Chalmers University of Technology.
For more information, see the course webpages:

- <http://www.cse.chalmers.se/edu/course/TIN172/>

The goal of the project is to create an interpreter and a planner so that
a person can control a robot in a blocks world to move around objects,
by giving commands in natural language.

To make the project more interesting, there is a web-based graphical 
interface from which the user can interact with the blocks world.

The interface is written in TypeScript (which compiles into Javascript),
and it can be run in several different modes:

- as a HTML web application, using SVG animations for displaying the world

- as a text application, using ANSI graphics for displaying the world
  (requires an ASNI-capable terminal, and that Node.JS is installed)

- as an offline text application, where input is provided at the command line
  (requires that Node.JS is installed, but nothing of the terminal)

To be able to run the system you need to install Node.JS and TypeScript.
Do that. Now.


What is already implemented and what is missing
------------------------------------------------

The natural language parser is already implemented using the 
[Nearley parsing library] (https://github.com/Hardmath123/nearley).

Furthermore, there are three different implementations of the blocks
world: the SVGWorld, the ANSIWorld and the simple TextWorld.

What is not implemented correctly is the natural language interpreter
and the robot planner. What you are given are stubs that return
a dummy interpretation resp. a dummy plan. Your goal is to implement
the interpreter and the planner so that the robot behaves as it should.


Compiling to Javascript or using Ajax CGI
------------------------------------------

The preferred way to implement this is to write your programs in a 
language that can be compiled directly into Javascript, such as
TypeScript. The advantage with this is that you can use
all three ways of interacting (web, text and offline), and that there's
much less overhead when running. The (possible) disadvantage is that 
you cannot use any programming language.


Using TypeScript
-----------------

TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.
It is open-source and not specific to any browser or operating system.
(And it's developed by Microsoft...)

For information about the language, please visit the official site:

- <http://www.typescriptlang.org/>


Using Ajax CGI and a local web server
--------------------------------------

(Note: you don't need this if you don't use the CGI approach)

If you really don't want to implement in TypeScript (or JavaScript or CoffeeScript or ...), 
you can create a CGI script that the HTML file communicates with.
To be able to use this, and to make the following minor change to the file `shrdlite.html`:

- comment the line importing the file `shrdlite-html.js`, and
  instead uncomment the line importing the file `shrdlite-ajax.js`

To be able to run the graphical interface you need a web server. 
There are several options (a very common one is Apache), but for this
project it is enough to use Python's built-in server. 

### Using the Python 3 web server

For this you need to have Python 3 installed. To start the server, 
just run this from the command line, from the same directory as the 
file `shrdlite.html`:

    python3 -m http.server --cgi 8000

Now let the webserver keep running and browse to any of these addresses:

- <http://localhost:8000/shrdlite.html>
- <http://127.0.0.1:8000/shrdlite.html>
- <http://0.0.0.0:8000/shrdlite.html>

Your CGI script has to be executable and reside in the `cgi-bin` directory.
There is an example dummy CGI Python 3 script in the file `shrdlite_cgi.py`.

### Using another programming language via CGI

If you want to use another language that Python, you can either call the other
language from within Python, or use another web server. E.g., if you want to 
use Haskell, there are lots of opportunities (such as Happstack or Snap).

Note that if you choose to use another web server, you have to do some changes 
in the file `shrdlite-ajax.ts`, depending on your choice of server.


Additional information
-----------------------

There is a Makefile if you want to use the GNU Make system. Here's what it can do:

- `make clean`: Removes all auto-generated Javascript files
- `make all`: Calls TypeScript and Closure for each target
- `make html | ajax | ansi | offline`:
  Calls TypeScript and Closure for the given target,
  i.e., it compiles the file `shrdlite-X.ts` into `shrdlite-X.js`

### Data structures

You probably want to use some kind of collection datatype (such as a heap
and/or priority queue), so here are two possible TypeScript libraries:

- [TypeScript-STL] (https://github.com/vovazolotoy/TypeScript-STL)
- [typescript-collections] (https://github.com/basarat/typescript-collections)

If you're using another language (such as Haskell or Java), please see the 
public libraries of that language.

### Using JavaScript modules in TypeScript

If you want to use standard JavaScript libraries in TypeScript, you have to
have a TypeScript declaration file for that library. 
The [DefinitelyTyped library] (https://github.com/borisyankov/DefinitelyTyped)
contains declaration files for several libraries, such as the following two:

- `node.d.ts`
- `jquery.d.ts`

### JavaScript chart parser

The parser is generated by [Nearley] (http://github.com/Hardmath123/nearley).
The grammar is in the file `grammar.ne`, and it is compiled into the 
Javascript file `grammar.js`. You don't have to install Nearley if you 
don't plan to make any changes in the grammar.


List of files
--------------

BSD Makefile for automatically creating `.js` files from `.ts` files:
- `Makefile`

Main browser files:
- `shrdlite.html`, `shrdlite.css`

Wrapper files for the browser-based interfaces:
- `shrdlite-html.ts`, `shrdlite-ajax.ts`

Wrapper files for the Node.JS-based interfaces:
- `shrdlite-ansi.ts`, `shrdlite-offline.ts`

Main TypeScript module:
- `Shrdlite.ts`

TypeScript interfaces and classes for the different implementations of the blocks world:
- `World.ts`, `SVGWorld.ts`, `TextWorld.ts`, `ANSIWorld.ts`, `ExampleWorlds.ts`

TypeScript modules for parsing, interpretation and planning:
- `Parser.ts`, `Interpreter.ts`, `Planner.ts`

Grammar files used by the Nearley chartparser:
- `grammar.js`, `grammar.ne`

Example CGI script that is called by the Ajax web interface:
- `cgi-bin/shrdlite_cgi.py`

TypeScript declaration files for non-TypeScript libraries:
- `lib/jquery.d.ts`, `lib/node.d.ts`

External Javascript libraries:
- `lib/jquery-1.11.0.min.js`, `lib/nearley.js`

Assorted documentation (currently only the TypeScript language definition):
- `doc`

