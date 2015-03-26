///<reference path="Shrdlite.ts"/>
///<reference path="TextWorld.ts"/>
///<reference path="ExampleWorlds.ts"/>

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
if (!isNaN(example)) {
    utterance = world.currentState.examples[example];
    if (!utterance) {
        console.error("Error: Cannot find example no. " + example);
        process.exit(1);
    }
}

world.printWorld(() => {
    var plan = Shrdlite.parseUtteranceIntoPlan(world, utterance);
    console.log();
    world.performPlan(plan, () => {
        world.printWorld();
    });
});
