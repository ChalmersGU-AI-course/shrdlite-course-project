///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
var Interpreter;
(function (Interpreter) {
    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types
    function interpret(parses, currentState) {
        var interpretations = [];
        parses.forEach(function (parseresult) {
            var intprt = parseresult;
            var result = interpretCommand(intprt.prs, currentState);
            if(result != null){
                interpretations.push(result);
            }
            
        });
        if (interpretations.length) {
            console.log("INTERPRETER Found interpretations: ", interpretations)
            return interpretations;
        }
        else {
            throw new Interpreter.Error("Found no interpretation");
        }
    }
    Interpreter.interpret = interpret;
    function interpretationToString(res) {
        return res.intp.map(function (lits) {
            return lits.map(function (lit) { return literalToString(lit); }).join(" & ");
        }).join(" | ");
    }
    Interpreter.interpretationToString = interpretationToString;
    function literalToString(lit) {
        return (lit.pol ? "" : "-") + lit.rel + "(" + lit.args.join(",") + ")";
    }
    Interpreter.literalToString = literalToString;
    var Error = (function () {
        function Error(message) {
            this.message = message;
            this.name = "Interpreter.Error";
        }
        Error.prototype.toString = function () { return this.name + ": " + this.message; };
        return Error;
    })();
    Interpreter.Error = Error;
    //////////////////////////////////////////////////////////////////////
    // private functions
    function interpretCommand(cmd, state) {
        // This returns a dummy interpretation involving two random objects in the world
        //var objs = Array.prototype.concat.apply([], state.stacks);
        //var a = objs[getRandomInt(objs.length)];
        //var b = objs[getRandomInt(objs.length)]; 

        /*Get type of move:
        take/grasp/pick up” an Entity
        “move/put/drop” “it” at a Location
        “move/put/drop” an Entity to a Location
        */
        var intprt = null;
        var cmdType = cmd.cmd;
        console.log("cmd type: " + cmdType);
        if (cmdType == "take") {
            var object = isInState(cmd['ent']['obj'],state);            
            var intprt = [{rel: "holding", item:object}];
            return intprt;
            
        }if (cmdType == "move") {
            var itemEnt = cmd['ent'];
            var endLoc = cmd['loc'];
            console.log("Goal is to put", itemEnt, " on ", endLoc);
            
            //Goal is to put the itemEnt relative to 
            //something relative to something else
            // Example2
            if(cmd['ent']['obj']['loc'] == undefined){
                console.log("example2")
                return intprt;
            }
            else{
                obj = isAtLocation(cmd, state);
            }
            
            /*if()
            var intprt = [];
            var startObject = cmd['ent']['obj'];
            startObjectName = isInState(startObject);
            endObjectName = isInState(toLoc['ent']['obj']['obj'])
            intprt = [{rel: "inside", item:startObject, oneof: [endObjectName]}];*/
            return intprt;

        }else{
            throw new Interpreter.Error("Not a valid grammar" + cmd);
        }



    }
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    // Check if an object is in the state
    // obj.[size, color, form]
    function isInState(obj, state) {
        var size = obj.size;
        var color = obj.color;
        var form = obj.form;
        console.log("Is object " + size + " " + color + " " + form + " in state");
        var objinstate;
        state.stacks.forEach(function (column) {
            column.forEach(function (thing) {
                var object = state.objects[thing];
                if (isEqualObject(obj,object)) {  
                    objinstate = thing;
                    //console.log("Pushed " + object);
                    console.log("INTERPRETER New object " + objinstate);
                }                
            });
        });
        return objinstate;                
    }
    function isAtLocation(obj, state, relative) {
        //var objquant = obj['quant'];
        var startObject = obj['ent']['obj']['obj'];
        var loc = obj['ent']['obj']['loc'];
        var locObject = obj['ent']['obj']['loc']['ent']['obj'];

        // Get starObject
        var startObjectName = isInState(startObject, state);
        console.log(startObjectName);
        var locObjectName = isInState(locObject, state);
        console.log(locObjectName);



        state.stacks.forEach(function (column) {
            column.filter(function (thing) {
                //target = 
                //isobject()
            });
        });

 /*       //find location
        var c = 0;
        var index;
        state.stacks.forEach(function (column) {
            var s = 0;
            c++;
            column.forEach(function (thing) {
                s++;
                console.log(thing);
                var object = state.objects[thing];
                var isSize = object.size == size || size == null;
                var isColor = object.color == color || color == null;
                var isForm = object.form == form || form == 'anyform';
                if (isSize && isColor && isForm) {  
                    objinstate = thing;
                    //console.log("Pushed " + object);
                    console.log("INTERPRETER Location New object " + objinstate);
                    console.log(c, s);
                    index = [c,s];
                }                
            });
        });*/



    }
    function isEqualObject(goal, object) {
        var isSize = object.size == goal.size || goal.size == null;
        var isColor = object.color == goal.color || goal.color == null;
        var isForm = object.form == goal.form || goal.form == 'anyform';
        if (isSize && isColor && isForm) {  
            return true;
        }else{
            return false;
        }
    }
})(Interpreter || (Interpreter = {}));
//put the white ball that is in a box on the floor:
/*var example1 = 
{cmd: "move",
  ent: {quant: "the",
        obj: {obj: {size: null, color: "white", form: "ball"},
              loc: {rel: "inside",
                    ent: {quant: "any",
                          obj: {size: null, color: null, form: "box"}}}}},
  loc: {rel: "ontop",
        ent: {quant: "the",
              obj: {size: null, color: null, form: "floor"}}}};

//put the white ball in a box that is on the floor:
var example2 = 
{cmd: "move",
  ent: {quant: "the",
        obj: {size: null, color: "white", form: "ball"}},
  loc: {rel: "inside",
        ent: {quant: "any",
              obj: {obj: {size: null, color: null, form: "box"},
                    loc: {rel: "ontop",
                          ent: {quant: "the",
                                obj: {size: null, color: null, form: "floor"}}}}}}}
*/