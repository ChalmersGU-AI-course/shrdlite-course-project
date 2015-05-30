README file for group 7 singularity

How to run:
    1. make sure you have nodejs, NPM, and typescipt installed
    2. execute "make all"
    3. open "shrdlite.html" and enjoy!

Example Utterances:
    1. "put a large ball inside a small box" (small world)
        Defies physics laws, generates "Interpretation error Physical Laws error."

    2. "put the black ball in a box on the floor" (small world)
        this line tests the parsing ambiguity and will give you two options

    3. "put the white ball in a box on the floor" (small world)
        shows heuristics characteristics, our heuristic walues a pick/drop equal to a single move

Extensions:
    1. ambiguity, when multiple parses are found the and more than one has a
        valid interpretation then the user will have the option to choose between interpretations.
        this is done with confirm boxes, since confirm boxes pauses execution and and waits for input.
        This results in giving the user multiple options without having to write anything.

        An example of this scenario can be seen in (Example Utterances) Nr.2

        found inside: shrdlite.ts / parseUtteranceIntoPlan

    2. All quantifier, All can be a bit tricky since it can easily create imposible situations 
        for example "put all balls beside all balls" is only possible if there are only two balls.
        if there is one, or more than two then this should be physicaly imposible, and Yes, 
        this works for us.
        
        Another example for All is "put all boxes on the floor", which also works for us.

        found inside: Interpreter.ts / groupRules

Astar heuristic:
    For our solution, the Astar heuristic is a function that is a combination of two parts.

    The first part is a heuristic for the movement of the arm of the robot, the heuristic is measured
    by the distance of the arm from the goal object without taking into account what is blocking 
    the object.

    The second heuristic is a measurement of the amount of goals to be achieved in order to reach the
    goal object. This evaluation is based on the number of objects that are on top of the goal object.
    This does not into account the distance of the arm from the object.
    
    The two heuristic parts have equal value, meaning that the movement to the left and right has the 
    same heuristic cost as the pulling and dropping of an object.