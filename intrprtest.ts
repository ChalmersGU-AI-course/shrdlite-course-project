///<reference path="TextWorld.ts"/>
///<reference path="ExampleWorlds.ts"/>
///<reference path="Interpreter.ts"/>

// Extract command line arguments:
var nodename = process.argv[0];
var jsfile = process.argv[1].replace(/^.*\//, "");
var worldname = process.argv[2];
var utterance = process.argv[3];

var usage = "Usage: " + nodename + " " + jsfile +
  " (" + Object.keys(ExampleWorlds).join(" | ") + ")" +
  " (utterance | example no.)";

if (process.argv.length != 4 || !ExampleWorlds[worldname]) {
  console.error(usage);
  process.exit(1);
}

var world = new TextWorld(ExampleWorlds[worldname]);

var example = parseInt(utterance);
if (!isNaN(example)) {              // the utterance an example no.
  utterance = world.currentState.examples[example];
  if (!utterance) {
    console.error("Error: Cannot find example no. " + example);
    process.exit(1);
  }
}


// PARSING
world.printDebugInfo('\n\nParsing utterance: "' + utterance + '"');
try {
  var parses : Parser.Result[] = Parser.parse(utterance);
} catch(err) {
  if (err instanceof Parser.Error) {
    world.printError("Parsing error", err.message);
    process.exit(1);
  } else {
    throw err;
  }
}
world.printDebugInfo("Found " + parses.length + " parses");
parses.forEach((res, n) => {
    world.printDebugInfo("  (" + n + ") " + Parser.parseToString(res));
});


// INTERPRETING
world.printDebugInfo('\n\nInterpreting utterance: "' + utterance + '"');
try {
  var interpretations : Interpreter.Result[] = Interpreter.interpret(parses, world.currentState);
} catch(err) {
  if (err instanceof Interpreter.Error) {
    world.printError("Interpretation error", err.message);
    process.exit(1);
  } else {
    throw err;
  }
}
world.printDebugInfo("Found " + interpretations.length + " interpretations");
interpretations.forEach((res, n) => {
    world.printDebugInfo("  (" + n + ") " + Interpreter.interpretationToString(res));
});
