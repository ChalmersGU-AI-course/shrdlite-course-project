# Shrdlite project

## Running the project
Build the project and load the Shrdlite.html website.

## Interesting utterances
The example utterances of the small world has been updated with a couple of utterances that we consider extra interesting. All of the default ones are very relevant as well.

## Extensions
We have chosen to implement three extensions.

### Quantifiers
The quantifiers the/any/all are handled.

Implemented in Interpreter.ts

### Ambiguity resolve
Notifies the user when there are ambiguities in the utterance and provides advice on how to make the utterance more specific. Works on both ambiguities where multiple valid interpretations are present and ambiguities when the "the" quantifier has been specified but more than one object match the criteria.

The ambiguity resolve is currently slightly too strict and will for example consider the utterance "move the large ball inside a yellow box on the floor" on the medium world ambiguous, which it is not because there are no plans for the first parse.

Mostly implemented in AmbiguityResolve.ts.

### Plan description
Describes the plan in a human readable way, for example that it is moving an object and why. It tries to be as brief as possible with the description of the object, so if there is only one table it just states "the table". It can also differ between if the action is to pick up, move or drop an object.

This extension does not handle when secondary args are moved to satisfy literal as elegantly however. It will then not print the "why" of the action, and just say e.g. "Moving the white ball".

Implemented in Planalyzer.ts.

## Heuristics
*describe the heuristics*
Implemented in WorldAstar.ts

## TODO
Except for the notes above, we are pretty happy with how things are working.

## Misc
We also added a new relation "containing", which is the opposite of "inside".