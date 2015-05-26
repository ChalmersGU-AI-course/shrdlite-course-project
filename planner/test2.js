var state = {"stacks":[[],["g","l"],["e"],["k"],["m"]],"arms":[{"holding":"f","pos":1},{"holding":null,"pos":2}],"objects":{"a":{"form":"brick","size":"large","color":"green"},"b":{"form":"brick","size":"small","color":"white"},"c":{"form":"plank","size":"large","color":"red"},"d":{"form":"plank","size":"small","color":"green"},"e":{"form":"ball","size":"large","color":"white"},"f":{"form":"ball","size":"small","color":"black"},"g":{"form":"table","size":"large","color":"blue"},"h":{"form":"table","size":"small","color":"red"},"i":{"form":"pyramid","size":"large","color":"yellow"},"j":{"form":"pyramid","size":"small","color":"red"},"k":{"form":"box","size":"large","color":"yellow"},"l":{"form":"box","size":"large","color":"red"},"m":{"form":"box","size":"small","color":"blue"}},"examples":["put the white ball in a box on the floor","put the black ball in a box on the floor","take a blue object","take the white ball","put all boxes on the floor","move all balls inside a large box"]};
var rules = [{"rel":"ontop","item":"e","oneof":["k","m"]}];

var planner = require("./planner-core.js");

console.log(planner(state, rules));
