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
            interpretations.push(result);
            console.log(result);
            console.log(interpretations);
        });
        if (interpretations.length) {
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
        var cmdType = cmd.cmd;
        console.log("cmd type: " + cmdType);
        if (cmdType == "take") {
            var object = isInState(cmd['ent']['obj'],state);            
            var intprt = [{rel: "holding", item:object}];
            console.log(intprt);
            return intprt;
            
        }if (cmdType == "move") {
            /*Check if start object is in the world
            if (!isInState(cmd['ent']['obj'], state)) {
                console.log("Start object not in the world");
                return;
            }
            //Check if goal is in the world
            if (!isInState(cdm['loc']['ent']['obj'], state)) {
                console.log("Goal not in the world");
                return;
            }*/

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
                //console.log("object in state " + object);
                var object = state.objects[thing];
                var string1 = "size " + object.size;
                var string2 = " color " + object.color;
                var string3 = " form " + object.form;

                //console.log(string1 + string2 + string3);
                var isSize = object.size == size || size == null;
                var isColor = object.color == color || color == null;
                var isForm = object.form == form || form == 'anyform';
                //console.log(isSize + " " + isColor + " " + isForm);
                if (isSize && isColor && isForm) 
                {   

                    objinstate = thing;
                    //console.log("Pushed " + object);
                    console.log(objinstate);
                }                
            });
        });
        return objinstate;                
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