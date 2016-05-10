
interface TestCase {
    world : string;
    utterance : string;
    interpretations : string[][]
}

var allTestCases : TestCase[] = [
    {world: "small",
     utterance: "take an object",
     interpretations: [["holding(e)", "holding(f)", "holding(g)", "holding(k)", "holding(l)", "holding(m)"]]
    },

    {world: "small",
     utterance: "take a blue object",
     interpretations: [["holding(g)", "holding(m)"]]
    },

    {world: "small",
     utterance: "take a box",
     interpretations: [["holding(k)", "holding(l)", "holding(m)"]]
    },

    {world: "small",
     utterance: "put a ball in a box",
     interpretations: [["inside(e,k)", "inside(e,l)", "inside(f,k)", "inside(f,l)", "inside(f,m)"]]
    },

    {world: "small",
     utterance: "put a ball on a table",
     interpretations: []
    },

    {world: "small",
     utterance: "put a ball above a table",
     interpretations: [["above(e,g)", "above(f,g)"]]
    },

    {world: "small",
     utterance: "put a big ball in a small box",
     interpretations: []
    },

    {world: "small",
     utterance: "put a ball left of a ball",
     interpretations: [["leftof(e,f)", "leftof(f,e)"]]
    },

    {world: "small",
     utterance: "take a white object beside a blue object",
     interpretations: [["holding(e)"]]
    },

    {world: "small",
     utterance: "put a white object beside a blue object",
     interpretations: [["beside(e,g) | beside(e,m)"]]
    },

    {world: "small",
     utterance: "put a ball in a box on the floor",
     interpretations: [["inside(e,k)", "inside(f,k)"], ["ontop(f,floor)"]]
    },

    {world: "small",
     utterance: "put a white ball in a box on the floor",
     interpretations: [["inside(e,k)"]]
    },

    {world: "small",
     utterance: "put a black ball in a box on the floor",
     interpretations: [["inside(f,k)"], ["ontop(f,floor)"]]
    }
];


// /* Simple test cases for the ALL quantifier, uncomment if you want */
// allTestCases.push(
//     {world: "small",
//      utterance: "put all balls on the floor",
//      interpretations: [["ontop(e,floor) & ontop(f,floor)"]]
//     },

//     {world: "small",
//      utterance: "put every ball to the right of all blue things",
//      interpretations: [["rightof(e,g) & rightof(e,m) & rightof(f,g) & rightof(f,m)"]]
//     },

//     {world: "small",
//      utterance: "put all balls left of a box on the floor",
//      interpretations: [["leftof(e,k) & leftof(f,k)"], ["ontop(e,floor)"]]
//     }
// );


// /* More dubious examples for the ALL quantifier */
// /* (i.e., it's not clear that these interpretations are the best) */
// allTestCases.push(
//     {world: "small",
//      utterance: "put a ball in every large box",
//      interpretations: [["inside(e,k) & inside(f,k)", "inside(e,l) & inside(f,k)",
//                         "inside(e,k) & inside(f,l)", "inside(e,l) & inside(f,l)"]]
//     },

//     {world: "small",
//      utterance: "put every ball in a box",
//      interpretations: [["inside(e,k) & inside(f,k)", "inside(e,l) & inside(f,k)",
//                         "inside(e,k) & inside(f,l)", "inside(e,l) & inside(f,l)",
//                         "inside(e,k) & inside(f,m)", "inside(e,l) & inside(f,m)"]]
//     }
// );

