///<reference path="World.ts"/>

var ExampleWorlds : {[s:string]: WorldState} = {};


ExampleWorlds["complex"] = new WorldState(
    [["e"],["a","l"],["i","h","j"],["c","k","g","b"],["d","m","f"]],
    null,
    0,
    {
        "a": new ObjectDefinition("brick",   "large",  "yellow"),
        "b": new ObjectDefinition("brick",   "small",  "white" ),
        "c": new ObjectDefinition("plank",   "large",  "red"   ),
        "d": new ObjectDefinition("plank",   "small",  "green" ),
        "e": new ObjectDefinition("ball",    "large",  "white" ),
        "f": new ObjectDefinition("ball",    "small",  "black" ),
        "g": new ObjectDefinition("table",   "large",  "blue"  ),
        "h": new ObjectDefinition("table",   "small",  "red"   ),
        "i": new ObjectDefinition("pyramid", "large",  "yellow"),
        "j": new ObjectDefinition("pyramid", "small",  "red"   ),
        "k": new ObjectDefinition("box",     "large",  "yellow"),
        "l": new ObjectDefinition("box",     "large",  "red"   ),
        "m": new ObjectDefinition("box",     "small",  "blue"  )
    },
    [
        "put a box in a box",
        "put all balls on the floor",
        "take the yellow box",
        "put any object under all tables",
        "put any object under all tables on the floor",
        "put a ball in a small box in a large box",
        "put all balls in a large box",
        "put all balls left of a ball",
        "put all balls beside a ball",
        "put all balls beside every ball",
        "put a box beside all objects",
        "put all red objects above a yellow object on the floor",
        "put all yellow objects under a red object under an object"
    ]
);


ExampleWorlds["medium"] = new WorldState(
    [["e"],["a","l"],[],[],["i","h","j"],[],[],["k","g","c","b"],[],["d","m","f"]],
    null,
    0,
    {
        "a": new ObjectDefinition("brick",   "large",  "green" ),
        "b": new ObjectDefinition("brick",   "small",  "white" ),
        "c": new ObjectDefinition("plank",   "large",  "red"   ),
        "d": new ObjectDefinition("plank",   "small",  "green" ),
        "e": new ObjectDefinition("ball",    "large",  "white" ),
        "f": new ObjectDefinition("ball",    "small",  "black" ),
        "g": new ObjectDefinition("table",   "large",  "blue"  ),
        "h": new ObjectDefinition("table",   "small",  "red"   ),
        "i": new ObjectDefinition("pyramid", "large",  "yellow"),
        "j": new ObjectDefinition("pyramid", "small",  "red"   ),
        "k": new ObjectDefinition("box",     "large",  "yellow"),
        "l": new ObjectDefinition("box",     "large",  "red"   ),
        "m": new ObjectDefinition("box",     "small",  "blue"  )
    },
    [
        "put the brick that is to the left of a pyramid in a box",
        "put the white ball in a box on the floor",
        "move the large ball inside a yellow box on the floor",
        "move the large ball inside a red box on the floor",
        "take a red object",
        "take the white ball",
        "put all boxes on the floor",
        "put the large plank under the blue brick",
        "move all bricks on a table",
        "move all balls inside a large box"
    ]
);


ExampleWorlds["small"] = new WorldState(
    [["e"],["g","l"],[],["k","m","f"],[]],
    "a",
    0,
    {
        "a": new ObjectDefinition("brick",   "large",  "green" ),
        "b": new ObjectDefinition("brick",   "small",  "white" ),
        "c": new ObjectDefinition("plank",   "large",  "red"   ),
        "d": new ObjectDefinition("plank",   "small",  "green" ),
        "e": new ObjectDefinition("ball",    "large",  "white" ),
        "f": new ObjectDefinition("ball",    "small",  "black" ),
        "g": new ObjectDefinition("table",   "large",  "blue"  ),
        "h": new ObjectDefinition("table",   "small",  "red"   ),
        "i": new ObjectDefinition("pyramid", "large",  "yellow"),
        "j": new ObjectDefinition("pyramid", "small",  "red"   ),
        "k": new ObjectDefinition("box",     "large",  "yellow"),
        "l": new ObjectDefinition("box",     "large",  "red"   ),
        "m": new ObjectDefinition("box",     "small",  "blue"  )
    },
    [
        "put the black ball in the yellow box",
        "put the white ball in a box on the floor",
        "put the black ball in a box on the floor",
        "take a blue object",
        "take the white ball",
        "put all boxes on the floor",
        "move all balls inside a large box"
    ]);

ExampleWorlds["impossible"] = new WorldState(
    [["lbrick1","lball1","sbrick1"], [],
        ["lpyr1","lbox1","lplank2","sball2"], [],
        ["sbrick2","sbox1","spyr1","ltable1","sball1"]],
    null,
    0,
    {
        "lbrick1": new ObjectDefinition("brick",   "large",  "green" ),
        "sbrick1": new ObjectDefinition("brick",   "small",  "yellow"),
        "sbrick2": new ObjectDefinition("brick",   "small",  "blue" ),
        "lplank1": new ObjectDefinition("plank",   "large",  "red"   ),
        "lplank2": new ObjectDefinition("plank",   "large",  "black" ),
        "splank1": new ObjectDefinition("plank",   "small",  "green" ),
        "lball1":  new ObjectDefinition("ball",    "large",  "white" ),
        "sball1":  new ObjectDefinition("ball",    "small",  "black" ),
        "sball2":  new ObjectDefinition("ball",    "small",  "red" ),
        "ltable1": new ObjectDefinition("table",   "large",  "green" ),
        "stable1": new ObjectDefinition("table",   "small",  "red"   ),
        "lpyr1":   new ObjectDefinition("pyramid", "large",  "white"),
        "spyr1":   new ObjectDefinition("pyramid", "small",  "blue"  ),
        "lbox1":   new ObjectDefinition("box",     "large",  "yellow"),
        "sbox1":   new ObjectDefinition("box",     "small",  "red"   ),
        "sbox2":   new ObjectDefinition("box",     "small",  "blue"  )
},
[
    "this is just an impossible world"
]);