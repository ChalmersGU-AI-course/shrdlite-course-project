///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>

var ExampleWorlds : {[s:string]: WorldState} = {};
	
function stacksToPDDL(stacks:string[][], objects : { [s:string]: ObjectDefinition; }):collections.Set<Interpreter.Literal>{
	var pddl = new collections.Set<Interpreter.Literal>(
					function (p){		// ToString
						var res:string;
						res = p.rel + "(";
						for(var i = 0; i < p.args.length; i++){
							res = res + p.args[i] + ", "
						}
						//res = res.substring(0, res.length-2);
						res = res + ")";
				    	return res;
				    });
	for(var i = 0; i < stacks.length; i++){
		if(i < stacks.length-1){
			pddl.add({pol: true, rel:"leftof", args:["f"+i,"f"+(i+1)]})
			pddl.add({pol: true,rel:"rightof", args:["f"+(i+1),"f"+i]})
		}
		for(var j = 0; j < stacks[i].length; j++){
			if(j == 0){
				pddl.add({pol: true,rel:"ontop", args:[stacks[i][j],"f"+i]})
			}else{
				var relation : string;
				if(objects[stacks[i][j-1]].form == "box"){
					relation = "inside";
				}else{
					relation = "ontop";
				}
				pddl.add({pol: true,rel:relation, args:[stacks[i][j],stacks[i][j-1]]})
			}
		}
	}			    
	return pddl;
}

var complexobjs : { [s:string]: ObjectDefinition; }= {
        "a": { "form":"brick",   "size":"large",  "color":"yellow" },
        "b": { "form":"brick",   "size":"small",  "color":"white" },
        "c": { "form":"plank",   "size":"large",  "color":"red"   },
        "d": { "form":"plank",   "size":"small",  "color":"green" },
        "e": { "form":"ball",    "size":"large",  "color":"white" },
        "f": { "form":"ball",    "size":"small",  "color":"black" },
        "g": { "form":"table",   "size":"large",  "color":"blue"  },
        "h": { "form":"table",   "size":"small",  "color":"red"   },
        "i": { "form":"pyramid", "size":"large",  "color":"yellow"},
        "j": { "form":"pyramid", "size":"small",  "color":"red"   },
        "k": { "form":"box",     "size":"large",  "color":"yellow"},
        "l": { "form":"box",     "size":"large",  "color":"red"   },
        "m": { "form":"box",     "size":"small",  "color":"blue"  },
        "f0": { "form":"floor",    "size":"large",  "color":"" },
        "f1": { "form":"floor",    "size":"large",  "color":"" },
        "f2": { "form":"floor",    "size":"large",  "color":"" },
        "f3": { "form":"floor",    "size":"large",  "color":"" },
        "f4": { "form":"floor",    "size":"large",  "color":"" }
        };
	
ExampleWorlds["complex"] = {
	"stacks": [["e"],["a","l"],["i","h","j"],["c","k","g","b"],["d","m","f"]],
    "holding": null,
    "arm": 0,
    "planAction":"start",
    "description":"",
    "objects": complexobjs,
    "pddl": stacksToPDDL([["e"],["a","l"],["i","h","j"],["c","k","g","b"],["d","m","f"]], complexobjs),
    "examples": [
    	//"put a box on a floor",
    	"put a box in the box",
        "put a box in a box",
        "put all balls on the floor",
        "take the yellow box",
       // "put all tables on the floor",
        "put any object under all tables",
      //  "put any object under all tables on the floor",
      //  "put a ball in a small box in a large box",
        "put all balls in a large box",
        "put all balls left of a ball",
        "put all balls beside a ball",
        "put all balls beside every ball",
        "put the box in a box",
        "put all bricks on all tables"
        //"put a box beside all objects",
       // "put all red objects above a yellow object on the floor",
       // "put all yellow objects under a red object under an object"
    ]
};	


var smallobjects : { [s:string]: ObjectDefinition; } = {
        "a": { "form":"brick",   "size":"large",  "color":"green" },
        "b": { "form":"brick",   "size":"small",  "color":"white" },
        "c": { "form":"plank",   "size":"large",  "color":"red"   },
        "d": { "form":"plank",   "size":"small",  "color":"green" },
        "e": { "form":"ball",    "size":"large",  "color":"white" },
        "f": { "form":"ball",    "size":"small",  "color":"black" },
        "g": { "form":"table",   "size":"large",  "color":"blue"  },
        "h": { "form":"table",   "size":"small",  "color":"red"   },
        "i": { "form":"pyramid", "size":"large",  "color":"yellow"},
        "j": { "form":"pyramid", "size":"small",  "color":"red"   },
        "k": { "form":"box",     "size":"large",  "color":"yellow"},
        "l": { "form":"box",     "size":"large",  "color":"red"   },
        "m": { "form":"box",     "size":"small",  "color":"blue"  },
        "f0": { "form":"floor",    "size":"large",  "color":"" },
        "f1": { "form":"floor",    "size":"large",  "color":"" },
        "f2": { "form":"floor",    "size":"large",  "color":"" },
        "f3": { "form":"floor",    "size":"large",  "color":"" },
        "f4": { "form":"floor",    "size":"large",  "color":"" }
    };
ExampleWorlds["small"] = { 
    "stacks": [["e"],["g","l"],[],["k","m","f"],["a"]],
    "holding": null,
    "arm": 0,
    "planAction":"start",
    "description":"",
    "objects": smallobjects,
    "pddl": stacksToPDDL([["e"],["g","l"],[],["k","m","f"],["a"]], smallobjects),
    "examples": [
        "put the white ball in a box on the floor",
        "put the black ball in a box on the floor",
        "take a blue object",
        "take the white ball",
        "put all boxes on the floor",
        "move all balls inside a large box"
    ]
};

var mediumObjects : { [s:string]: ObjectDefinition; } ={
        "a": { "form":"brick",   "size":"large",  "color":"green" },
        "b": { "form":"brick",   "size":"small",  "color":"white" },
        "c": { "form":"plank",   "size":"large",  "color":"red"   },
        "d": { "form":"plank",   "size":"small",  "color":"green" },
        "e": { "form":"ball",    "size":"large",  "color":"white" },
        "f": { "form":"ball",    "size":"small",  "color":"black" },
        "g": { "form":"table",   "size":"large",  "color":"blue"  },
        "h": { "form":"table",   "size":"small",  "color":"red"   },
        "i": { "form":"pyramid", "size":"large",  "color":"yellow"},
        "j": { "form":"pyramid", "size":"small",  "color":"red"   },
        "k": { "form":"box",     "size":"large",  "color":"yellow"},
        "l": { "form":"box",     "size":"large",  "color":"red"   },
        "m": { "form":"box",     "size":"small",  "color":"blue"  },
        "f0": { "form":"floor",    "size":"large",  "color":"" },
        "f1": { "form":"floor",    "size":"large",  "color":"" },
        "f2": { "form":"floor",    "size":"large",  "color":"" },
        "f3": { "form":"floor",    "size":"large",  "color":"" },
        "f4": { "form":"floor",    "size":"large",  "color":"" },
        "f5": { "form":"floor",    "size":"large",  "color":"" },
        "f6": { "form":"floor",    "size":"large",  "color":"" },
        "f7": { "form":"floor",    "size":"large",  "color":"" },
        "f8": { "form":"floor",    "size":"large",  "color":"" },
        "f9": { "form":"floor",    "size":"large",  "color":"" }
    };
ExampleWorlds["medium"] = {
    "stacks": [["e"],["a","l"],[],[],["i","h","j"],[],[],["k","g","c","b"],[],["d","m","f"]],
    "holding": null,
    "arm": 0,
    "planAction":"start",
    "description":"",
    "pddl": stacksToPDDL([["e"],["a","l"],[],[],["i","h","j"],[],[],["k","g","c","b"],[],["d","m","f"]], mediumObjects),
    "objects": mediumObjects,
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

