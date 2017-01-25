///<reference path="World.ts"/>

var ExampleWorlds : {[s:string]: WorldState} = {};


ExampleWorlds["complex"] = {
    "stacks": [["LargeWhiteBall"],
               ["LargeYellowBrick", "LargeRedBox"],
               ["LargeYellowPyramid", "SmallRedTable", "SmallRedPyramid"],
               ["LargeRedPlank", "LargeYellowBox", "LargeBlueTable", "SmallWhiteBrick"],
               ["SmallGreenPlank", "SmallBlueBox", "SmallBlackBall"]],
    "holding": null,
    "arm": 0,
    "objects": {
        "LargeYellowBrick":   { "form":"brick",   "size":"large",  "color":"yellow"},
        "SmallWhiteBrick":    { "form":"brick",   "size":"small",  "color":"white" },
        "LargeRedPlank":      { "form":"plank",   "size":"large",  "color":"red"   },
        "SmallGreenPlank":    { "form":"plank",   "size":"small",  "color":"green" },
        "LargeWhiteBall":     { "form":"ball",    "size":"large",  "color":"white" },
        "SmallBlackBall":     { "form":"ball",    "size":"small",  "color":"black" },
        "LargeBlueTable":     { "form":"table",   "size":"large",  "color":"blue"  },
        "SmallRedTable":      { "form":"table",   "size":"small",  "color":"red"   },
        "LargeYellowPyramid": { "form":"pyramid", "size":"large",  "color":"yellow"},
        "SmallRedPyramid":    { "form":"pyramid", "size":"small",  "color":"red"   },
        "LargeYellowBox":     { "form":"box",     "size":"large",  "color":"yellow"},
        "LargeRedBox":        { "form":"box",     "size":"large",  "color":"red"   },
        "SmallBlueBox":       { "form":"box",     "size":"small",  "color":"blue"  }
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


ExampleWorlds["medium"] = {
    "stacks": [["LrgWhtBall"],
               ["LrgGrnBrck", "LrgRedBox"],
               [],
               [],
               ["LrgYlwPrmd", "SmlRedTble", "SmlRedPrmd"],
               [],
               [],
               ["LrgYlwBox", "LrgBluTble", "LrgRedPlnk", "SmlWhtBrck"],
               [],
               ["SmlGrnPlnk", "SmlBluBox", "SmlBlkBall"]],
    "holding": null,
    "arm": 0,
    "objects": {
        "LrgGrnBrck": { "form":"brick",   "size":"large",  "color":"green" },
        "SmlWhtBrck": { "form":"brick",   "size":"small",  "color":"white" },
        "LrgRedPlnk": { "form":"plank",   "size":"large",  "color":"red"   },
        "SmlGrnPlnk": { "form":"plank",   "size":"small",  "color":"green" },
        "LrgWhtBall": { "form":"ball",    "size":"large",  "color":"white" },
        "SmlBlkBall": { "form":"ball",    "size":"small",  "color":"black" },
        "LrgBluTble": { "form":"table",   "size":"large",  "color":"blue"  },
        "SmlRedTble": { "form":"table",   "size":"small",  "color":"red"   },
        "LrgYlwPrmd": { "form":"pyramid", "size":"large",  "color":"yellow"},
        "SmlRedPrmd": { "form":"pyramid", "size":"small",  "color":"red"   },
        "LrgYlwBox":  { "form":"box",     "size":"large",  "color":"yellow"},
        "LrgRedBox":  { "form":"box",     "size":"large",  "color":"red"   },
        "SmlBluBox":  { "form":"box",     "size":"small",  "color":"blue"  }
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


ExampleWorlds["small"] = {
    "stacks": [["LargeWhiteBall"],
               ["LargeBlueTable", "LargeRedBox"],
               [],
               ["LargeYellowBox", "SmallBlueBox", "SmallBlackBall"],
               []],
    "holding": "LargeGreenBrick",
    "arm": 0,
    "objects": {
        "LargeGreenBrick":    { "form":"brick",   "size":"large",  "color":"green" },
        "SmallWhiteBrick":    { "form":"brick",   "size":"small",  "color":"white" },
        "LargeRedPlank":      { "form":"plank",   "size":"large",  "color":"red"   },
        "SmallGreenPlank":    { "form":"plank",   "size":"small",  "color":"green" },
        "LargeWhiteBall":     { "form":"ball",    "size":"large",  "color":"white" },
        "SmallBlackBall":     { "form":"ball",    "size":"small",  "color":"black" },
        "LargeBlueTable":     { "form":"table",   "size":"large",  "color":"blue"  },
        "SmallRedTable":      { "form":"table",   "size":"small",  "color":"red"   },
        "LargeYellowPyramid": { "form":"pyramid", "size":"large",  "color":"yellow"},
        "SmallRedPyramid":    { "form":"pyramid", "size":"small",  "color":"red"   },
        "LargeYellowBox":     { "form":"box",     "size":"large",  "color":"yellow"},
        "LargeRedBox":        { "form":"box",     "size":"large",  "color":"red"   },
        "SmallBlueBox":       { "form":"box",     "size":"small",  "color":"blue"  }
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


ExampleWorlds["impossible"] = {
    "stacks": [["LrgGrnBrck", "LrgWhtBall", "SmlYlwBrck"],
               [],
               ["LrgWhtPrmd", "LrgYlwBox", "LrgBlkPlnk", "SmlRedBall"],
               [],
               ["SmlBluBrck", "SmlRedBox", "SmlBluPrmd", "LrgGrnTble", "SmlBlkBall"]],
    "holding": null,
    "arm": 0,
    "objects": {
        "LrgGrnBrck": { "form":"brick",   "size":"large",  "color":"green" },
        "SmlYlwBrck": { "form":"brick",   "size":"small",  "color":"yellow"},
        "SmlBluBrck": { "form":"brick",   "size":"small",  "color":"blue"  },
        "LrgRedPlnk": { "form":"plank",   "size":"large",  "color":"red"   },
        "LrgBlkPlnk": { "form":"plank",   "size":"large",  "color":"black" },
        "SmlGrnPlnk": { "form":"plank",   "size":"small",  "color":"green" },
        "LrgWhtBall": { "form":"ball",    "size":"large",  "color":"white" },
        "SmlBlkBall": { "form":"ball",    "size":"small",  "color":"black" },
        "SmlRedBall": { "form":"ball",    "size":"small",  "color":"red"   },
        "LrgGrnTble": { "form":"table",   "size":"large",  "color":"green" },
        "SmlRedTble": { "form":"table",   "size":"small",  "color":"red"   },
        "LrgWhtPrmd": { "form":"pyramid", "size":"large",  "color":"white" },
        "SmlBluPrmd": { "form":"pyramid", "size":"small",  "color":"blue"  },
        "LrgYlwBox":  { "form":"box",     "size":"large",  "color":"yellow"},
        "SmlRedBox":  { "form":"box",     "size":"small",  "color":"red"   },
        "SmlBluBox":  { "form":"box",     "size":"small",  "color":"blue"  }
    },
    "examples": [
        "this is just an impossible world"
    ]
};

// The world used in the example on the course webpage
ExampleWorlds["example"] = {
    "stacks": [["c1-SmallWhiteBall"],
               ["t3-LargeRedTable", "b4-LargeGreenBox"],
               [],
               ["b5-LargeYellowBox", "b6-SmallBlueBox", "c2-SmallBlackBall"],
               []],
    "holding": null,
    "arm": 0,
    "objects": {
        "c1-SmallWhiteBall": { "form":"ball",  "size":"small",  "color":"white" },
        "c2-SmallBlackBall": { "form":"ball",  "size":"small",  "color":"black" },
        "t3-LargeRedTable":  { "form":"table", "size":"large",  "color":"red" },
        "b4-LargeGreenBox":  { "form":"box",   "size":"large",  "color":"green" },
        "b5-LargeYellowBox": { "form":"box",   "size":"large",  "color":"yellow" },
        "b6-SmallBlueBox":   { "form":"box",   "size":"small",  "color":"blue" }
    },
    "examples": [
        "put the white ball in a box on the floor"
    ]
};
