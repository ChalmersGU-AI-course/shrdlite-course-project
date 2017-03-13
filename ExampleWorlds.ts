
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
        "LargeWhiteBall":     new SimpleObject("large",    "white",  "ball" ),
        "SmallBlackBall":     new SimpleObject("small",    "black",  "ball" ),
        "LargeBlueTable":     new SimpleObject("large",   "blue",  "table"  ),
        "LargeYellowBox":     new SimpleObject("large",     "yellow",  "box"),
        "LargeRedBox":        new SimpleObject("large",     "red",  "box"   ),
        "SmallBlueBox":       new SimpleObject("small",     "blue",  "box"  ),
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
        "LrgGrnBrck1": new SimpleObject("large",   "green",  "brick" ),
        "LrgGrnBrck2": new SimpleObject("large",   "green",  "brick" ),
        "LrgGrnBrck3": new SimpleObject("large",   "green",  "brick" ),
        "SmlWhtBrck": new SimpleObject("small",   "white",  "brick" ),
        "LrgRedPlnk": new SimpleObject("large",   "red",  "plank"   ),
        "SmlGrnPlnk": new SimpleObject("small",   "green",  "plank" ),
        "LrgWhtBall": new SimpleObject("large",    "white",  "ball" ),
        "SmlBlkBall": new SimpleObject("small",    "black",  "ball" ),
        "LrgBluTble": new SimpleObject("large",   "blue",  "table"  ),
        "SmlRedTble": new SimpleObject("small",   "red",  "table"   ),
        "LrgYlwPrmd": new SimpleObject("large", "yellow",  "pyramid"),
        "SmlRedPrmd": new SimpleObject("small", "red",  "pyramid"   ),
        "LrgYlwBox":  new SimpleObject("large",     "yellow",  "box"),
        "LrgRedBox":  new SimpleObject("large",     "red",  "box"   ),
        "SmlBluBox":  new SimpleObject("small",     "blue",  "box"  ),
    },
    "examples": [
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
        "LargeYellowBrick":   new SimpleObject("large",   "yellow",  "brick"),
        "SmallWhiteBrick":    new SimpleObject("small",   "white",  "brick" ),
        "LargeRedPlank":      new SimpleObject("large",   "red",  "plank"   ),
        "SmallGreenPlank":    new SimpleObject("small",   "green",  "plank" ),
        "LargeWhiteBall":     new SimpleObject("large",    "white",  "ball" ),
        "SmallBlackBall":     new SimpleObject("small",    "black",  "ball" ),
        "LargeBlueTable":     new SimpleObject("large",   "blue",  "table"  ),
        "SmallRedTable":      new SimpleObject("small",   "red",  "table"   ),
        "LargeYellowPyramid": new SimpleObject("large", "yellow",  "pyramid"),
        "SmallRedPyramid":    new SimpleObject("small", "red",  "pyramid"   ),
        "LargeYellowBox":     new SimpleObject("large",     "yellow",  "box"),
        "LargeRedBox":        new SimpleObject("large",     "red",  "box"   ),
        "SmallBlueBox":       new SimpleObject("small",     "blue",  "box"  ),
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
        "LrgGrnBrck": new SimpleObject("large",   "green",  "brick" ),
        "SmlYlwBrck": new SimpleObject("small",   "yellow",  "brick"),
        "SmlBluBrck": new SimpleObject("small",   "blue",  "brick"  ),
        "LrgRedPlnk": new SimpleObject("large",   "red",  "plank"   ),
        "LrgBlkPlnk": new SimpleObject("large",   "black",  "plank" ),
        "SmlGrnPlnk": new SimpleObject("small",   "green",  "plank" ),
        "LrgWhtBall": new SimpleObject("large",    "white",  "ball" ),
        "SmlBlkBall": new SimpleObject("small",    "black",  "ball" ),
        "SmlRedBall": new SimpleObject("small",    "red",  "ball"   ),
        "LrgGrnTble": new SimpleObject("large",   "green",  "table" ),
        "SmlRedTble": new SimpleObject("small",   "red",  "table"   ),
        "LrgWhtPrmd": new SimpleObject("large", "white",  "pyramid" ),
        "SmlBluPrmd": new SimpleObject("small", "blue",  "pyramid"  ),
        "LrgYlwBox":  new SimpleObject("large",     "yellow",  "box"),
        "SmlRedBox":  new SimpleObject("small",     "red",  "box"   ),
        "SmlBluBox":  new SimpleObject("small",     "blue",  "box"  ),
    },
    "examples": [
        "this is just an impossible world"
    ]
};
