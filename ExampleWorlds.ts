
import {SimpleObject} from "./Types";
import {WorldState} from "./World";

/********************************************************************************
** ExampleWorlds

Here you define the worlds that you can interact with.
Feel free to add new worlds at will.
********************************************************************************/

export var ExampleWorlds : {[s:string]: WorldState} = {};


ExampleWorlds["small"] = {
    "stacks": [["LargeWhiteBall"],
               ["LargeBlueTable", "LargeRedBox"],
               [],
               ["LargeYellowBox", "SmallBlueBox", "SmallBlackBall"],
               []],
    "holding": null,
    "arm": 0,
    "objects": {
        "LargeWhiteBall":     new SimpleObject("ball",  "large", "white" ),
        "SmallBlackBall":     new SimpleObject("ball",  "small", "black" ),
        "LargeBlueTable":     new SimpleObject("table", "large", "blue"  ),
        "LargeYellowBox":     new SimpleObject("box",   "large", "yellow"),
        "LargeRedBox":        new SimpleObject("box",   "large", "red"   ),
        "SmallBlueBox":       new SimpleObject("box",   "small", "blue"  ),
    },
    "examples": [
        "put the white ball in a box on the floor",
        "put the black ball in a box on the floor",
        "take a blue object",
        "take the white ball",
        "put all boxes on the floor",
        "move all balls inside a large box"
    ]
};


ExampleWorlds["medium"] = {
    "stacks": [["LrgWhtBall"],
               ["LrgGrnBrck2", "LrgRedBox"],
               [],
               [],
               ["LrgYlwPrmd", "SmlRedTble", "SmlRedPrmd"],
               [],
               [],
               ["LrgYlwBox", "LrgBluTble", "LrgRedPlnk", "LrgGrnBrck3", "SmlWhtBrck"],
               [],
               ["SmlGrnPlnk", "SmlBluBox", "SmlBlkBall"]],
    "holding": "LrgGrnBrck1",
    "arm": 0,
    "objects": {
        "LrgGrnBrck1": new SimpleObject("brick",  "large", "green" ),
        "LrgGrnBrck2": new SimpleObject("brick",  "large", "green" ),
        "LrgGrnBrck3": new SimpleObject("brick",  "large", "green" ),
        "SmlWhtBrck":  new SimpleObject("brick",  "small", "white" ),
        "LrgRedPlnk":  new SimpleObject("plank",  "large", "red"   ),
        "SmlGrnPlnk":  new SimpleObject("plank",  "small", "green" ),
        "LrgWhtBall":  new SimpleObject("ball",   "large", "white" ),
        "SmlBlkBall":  new SimpleObject("ball",   "small", "black" ),
        "LrgBluTble":  new SimpleObject("table",  "large", "blue"  ),
        "SmlRedTble":  new SimpleObject("table",  "small", "red"   ),
        "LrgYlwPrmd":  new SimpleObject("pyramid","large", "yellow"),
        "SmlRedPrmd":  new SimpleObject("pyramid","small", "red"   ),
        "LrgYlwBox":   new SimpleObject("box",    "large", "yellow"),
        "LrgRedBox":   new SimpleObject("box",    "large", "red"   ),
        "SmlBluBox":   new SimpleObject("box",    "small", "blue"  ),
    },
    "examples": [
        "take a red object",
        "put the brick that is to the left of a pyramid in a box",
        "put the white ball in a box on the floor",
        "move the large ball inside a yellow box on the floor",
        "move the large ball inside a red box on the floor",
        "put all boxes on the floor",
        "put a pyramid under a ball",
        "move all bricks on a table",
        "move all balls inside a large box"
    ]
};


ExampleWorlds["complex"] = {
    "stacks": [["LargeWhiteBall"],
               ["LargeYellowBrick", "LargeRedBox"],
               ["LargeYellowPyramid", "SmallRedTable", "SmallRedPyramid"],
               ["LargeRedPlank", "LargeYellowBox", "LargeBlueTable", "SmallWhiteBrick"],
               ["SmallGreenPlank", "SmallBlueBox", "SmallBlackBall"]],
    "holding": null,
    "arm": 0,
    "objects": {
        "LargeYellowBrick":   new SimpleObject("brick",  "large", "yellow"),
        "SmallWhiteBrick":    new SimpleObject("brick",  "small", "white" ),
        "LargeRedPlank":      new SimpleObject("plank",  "large", "red"   ),
        "SmallGreenPlank":    new SimpleObject("plank",  "small", "green" ),
        "LargeWhiteBall":     new SimpleObject("ball",   "large", "white" ),
        "SmallBlackBall":     new SimpleObject("ball",   "small", "black" ),
        "LargeBlueTable":     new SimpleObject("table",  "large", "blue"  ),
        "SmallRedTable":      new SimpleObject("table",  "small", "red"   ),
        "LargeYellowPyramid": new SimpleObject("pyramid","large", "yellow"),
        "SmallRedPyramid":    new SimpleObject("pyramid","small", "red"   ),
        "LargeYellowBox":     new SimpleObject("box",    "large", "yellow"),
        "LargeRedBox":        new SimpleObject("box",    "large", "red"   ),
        "SmallBlueBox":       new SimpleObject("box",    "small", "blue"  ),
    },
    "examples": [
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
};


ExampleWorlds["impossible"] = {
    "stacks": [["LrgGrnBrck", "LrgWhtBall", "SmlYlwBrck"],
               [],
               ["LrgWhtPrmd", "LrgYlwBox", "LrgBlkPlnk", "SmlRedBall"],
               [],
               ["SmlBluBrck", "SmlRedBox", "SmlBluPrmd", "LrgGrnTble", "SmlBlkBall"]],
    "holding": null,
    "arm": 0,
    "objects": {
        "LrgGrnBrck": new SimpleObject("brick",  "large", "green" ),
        "SmlYlwBrck": new SimpleObject("brick",  "small", "yellow"),
        "SmlBluBrck": new SimpleObject("brick",  "small", "blue"  ),
        "LrgRedPlnk": new SimpleObject("plank",  "large", "red"   ),
        "LrgBlkPlnk": new SimpleObject("plank",  "large", "black" ),
        "SmlGrnPlnk": new SimpleObject("plank",  "small", "green" ),
        "LrgWhtBall": new SimpleObject("ball",   "large", "white" ),
        "SmlBlkBall": new SimpleObject("ball",   "small", "black" ),
        "SmlRedBall": new SimpleObject("ball",   "small", "red"   ),
        "LrgGrnTble": new SimpleObject("table",  "large", "green" ),
        "SmlRedTble": new SimpleObject("table",  "small", "red"   ),
        "LrgWhtPrmd": new SimpleObject("pyramid","large", "white" ),
        "SmlBluPrmd": new SimpleObject("pyramid","small", "blue"  ),
        "LrgYlwBox":  new SimpleObject("box",    "large", "yellow"),
        "SmlRedBox":  new SimpleObject("box",    "small", "red"   ),
        "SmlBluBox":  new SimpleObject("box",    "small", "blue"  ),
    },
    "examples": [
        "this is just an impossible world"
    ]
};
