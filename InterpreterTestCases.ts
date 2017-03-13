
/********************************************************************************
** InterpreterTestCases

This file contains several test cases, some of which have not been authored yet.
You should add your own interpretation where it says so.
You are also free to add new test cases.
********************************************************************************/

export interface TestCase {
    world : string;
    utterance : string;
    interpretations : string[][]
}

export var testCases : TestCase[] = [];


//////////////////////////////////////////////////////////////////////
// Examples that test the physical laws

// "Balls must be in boxes or on the floor, otherwise they roll away"

testCases.push({
    world: "small",
    utterance: "put a ball on a table",
    interpretations: []
});

// "Objects are “inside” boxes, but “ontop” of other objects"

testCases.push({
    world: "small",
    utterance: "put a ball on a box",
    interpretations: []
});

testCases.push({
    world: "small",
    utterance: "put a box in a brick",
    interpretations: []
});

// "Boxes cannot contain pyramids, planks or boxes of the same size"

testCases.push({
    world: "medium",
    utterance: "put a plank in a box",
    interpretations: [["inside(SmlGrnPlnk,LrgRedBox)", "inside(SmlGrnPlnk,LrgYlwBox)"]]
});

testCases.push({
    world: "medium",
    utterance: "put a large plank in a box",
    interpretations: []
});

testCases.push({
    world: "medium",
    utterance: "put a pyramid in a box",
    interpretations: [["inside(SmlRedPrmd,LrgRedBox)", "inside(SmlRedPrmd,LrgYlwBox)"]]
});

testCases.push({
    world: "medium",
    utterance: "put a pyramid in a small box",
    interpretations: []
});

testCases.push({
    world: "medium",
    utterance: "put a box in a box",
    interpretations: [["inside(SmlBluBox,LrgRedBox)", "inside(SmlBluBox,LrgYlwBox)"]]
});

testCases.push({
    world: "medium",
    utterance: "put a large box in a box",
    interpretations: []
});

testCases.push({
    world: "medium",
    utterance: "put a plank in a small box",
    interpretations: []
});

testCases.push({
    world: "small",
    utterance: "put a big ball in a small box",
    interpretations: []
});

// "Small boxes cannot be supported by small bricks or pyramids."

testCases.push({
    world: "medium",
    utterance: "put a large box on a large brick",
    interpretations: [["ontop(LrgRedBox,LrgGrnBrck)", "ontop(LrgYlwBox,LrgGrnBrck)"]]
});

testCases.push({
    world: "medium",
    utterance: "put a small box on a small brick",
    interpretations: []
});

testCases.push({
    world: "medium",
    utterance: "put a small box on a small pyramid",
    interpretations: []
});

// "Large boxes cannot be supported by large pyramids."

testCases.push({
    world: "medium",
    utterance: "put a large box on a large pyramid",
    interpretations: []
});

// Common errors with the floor

testCases.push({
    world: "small",
    utterance: "take the floor",
    interpretations: []
});

testCases.push({
    world: "small",
    utterance: "put a brick on a floor",
    interpretations: []
});

testCases.push({
    world: "small",
    utterance: "put a brick on the red floor",
    interpretations: []
});

testCases.push({
    world: "small",
    utterance: "take a ball on a box",
    interpretations: []
});

testCases.push({
    world: "small",
    utterance: "take a ball in the floor",
    interpretations: []
});

testCases.push({
    world: "small",
    utterance: "take a box in a table",
    interpretations: []
});


//////////////////////////////////////////////////////////////////////
// Simple examples with a clear interpretation

testCases.push({
    world: "small",
    utterance: "take an object",
    interpretations: [["holding(LargeBlueTable)", "holding(LargeWhiteBall)", "holding(LargeRedBox)", "holding(LargeYellowBox)", "holding(SmallBlackBall)", "holding(SmallBlueBox)"]]
});

testCases.push({
    world: "small",
    utterance: "take a blue object",
    interpretations: [["holding(LargeBlueTable)", "holding(SmallBlueBox)"]]
});

testCases.push({
    world: "small",
    utterance: "take a box",
    interpretations: [["holding(LargeRedBox)", "holding(LargeYellowBox)", "holding(SmallBlueBox)"]]
});

testCases.push({
    world: "small",
    utterance: "put a ball in a box",
    interpretations: [["inside(LargeWhiteBall,LargeRedBox)", "inside(LargeWhiteBall,LargeYellowBox)", "inside(SmallBlackBall,LargeRedBox)", "inside(SmallBlackBall,LargeYellowBox)", "inside(SmallBlackBall,SmallBlueBox)"]]
});

testCases.push({
    world: "small",
    utterance: "put a ball above a table",
    interpretations: [["above(LargeWhiteBall,LargeBlueTable)", "above(SmallBlackBall,LargeBlueTable)"]]
});

testCases.push({
    world: "small",
    utterance: "put a ball left of a ball",
    interpretations: [["leftof(LargeWhiteBall,SmallBlackBall)", "leftof(SmallBlackBall,LargeWhiteBall)"]]
});

testCases.push({
    world: "small",
    utterance: "take a white object beside a blue object",
    interpretations: [["holding(LargeWhiteBall)"]]
});

testCases.push({
    world: "small",
    utterance: "put a white object beside a blue object",
    interpretations: [["beside(LargeWhiteBall,LargeBlueTable)", "beside(LargeWhiteBall,SmallBlueBox)"]]
});

testCases.push({
    world: "small",
    utterance: "put a white ball in a box on the floor",
    interpretations: [["inside(LargeWhiteBall,LargeYellowBox)"]]
});

testCases.push({
    world: "small",
    utterance: "put a black ball in a box on the floor",
    interpretations: [["inside(SmallBlackBall,LargeYellowBox)"], ["ontop(SmallBlackBall,floor)"]]
});


//////////////////////////////////////////////////////////////////////
// Examples where YOU shuold define the interpretation

testCases.push({
    world: "small",
    utterance: "put a ball in a box on the floor",
    interpretations: [["COME UP WITH YOUR OWN INTERPRETATION"]]
});

// "put it"

testCases.push({
    world: "small",
    utterance: "put it on the floor",
    interpretations: [["COME UP WITH YOUR OWN INTERPRETATION"]]
});

// Deep recursion

testCases.push({
    world: "small",
    utterance: "take a ball in a box in a box",
    interpretations: [["COME UP WITH YOUR OWN INTERPRETATION"]]
});

testCases.push({
    world: "small",
    utterance: "take a ball in a box in a box on the floor",
    interpretations: [["COME UP WITH YOUR OWN INTERPRETATION"]]
});

testCases.push({
    world: "small",
    utterance: "put a box on a table on the floor",
    interpretations: [["COME UP WITH YOUR OWN INTERPRETATION"]]
});

testCases.push({
    world: "small",
    utterance: "put a box in a box on a table",
    interpretations: [["COME UP WITH YOUR OWN INTERPRETATION"]]
});

testCases.push({
    world: "small",
    utterance: "put a box in a box on a table on the floor",
    interpretations: [["COME UP WITH YOUR OWN INTERPRETATION"]]
});

testCases.push({
    world: "medium",
    utterance: "put a brick on a brick on a brick on the floor",
    interpretations: [["COME UP WITH YOUR OWN INTERPRETATION"]]
});


//////////////////////////////////////////////////////////////////////
// Test cases for the ALL quantifier
// These are not necessary to solve if you only aim for grade 3/G

testCases.push({
    world: "small",
    utterance: "put all balls on the floor",
    interpretations: [["ontop(LargeWhiteBall,floor) & ontop(SmallBlackBall,floor)"]]
});

testCases.push({
    world: "small",
    utterance: "put every ball to the right of all blue things",
    interpretations: [["COME UP WITH YOUR OWN INTERPRETATION"]]
});

testCases.push({
    world: "small",
    utterance: "put all balls left of a box on the floor",
    interpretations: [["COME UP WITH YOUR OWN INTERPRETATION"]]
});

testCases.push({
    world: "small",
    utterance: "put a ball in every large box",
    interpretations: [["COME UP WITH YOUR OWN INTERPRETATION"]]
});

testCases.push({
    world: "small",
    utterance: "put every ball in a box",
    interpretations: [["COME UP WITH YOUR OWN INTERPRETATION"]]
});

testCases.push({
    world: "medium",
    utterance: "put all large green bricks beside a large green brick",
    interpretations: [["COME UP WITH YOUR OWN INTERPRETATION"]]
});

testCases.push({
    world: "medium",
    utterance: "put all green objects left of all red objects",
    interpretations: [["COME UP WITH YOUR OWN INTERPRETATION"]]
});
