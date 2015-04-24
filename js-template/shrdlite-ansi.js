///<reference path="World.ts"/>
///<reference path="lib/node.d.ts"/>
var ANSIWorld = (function () {
    function ANSIWorld(currentState, worldHeight, horizontalAnimationPause, verticalAnimationPause) {
        if (worldHeight === void 0) { worldHeight = 40; }
        if (horizontalAnimationPause === void 0) { horizontalAnimationPause = 10; }
        if (verticalAnimationPause === void 0) { verticalAnimationPause = 15; }
        this.currentState = currentState;
        this.worldHeight = worldHeight;
        this.horizontalAnimationPause = horizontalAnimationPause;
        this.verticalAnimationPause = verticalAnimationPause;
        this.inputCounter = 0;
        this.outputCounter = 0;
        //////////////////////////////////////////////////////////////////////
        // ASCII art for objects
        this.stackWidth = 15;
        this.objectData = {
            arm: ["||", "##"],
            box: { small: ["\\        /", "\\______/"], large: ["\\            /", "\\__________/"] },
            pyramid: { small: ["____", "/    \\", "/______\\"], large: ["______", "/      \\", "/        \\", "/__________\\"] },
            plank: { small: ["________", "|______|"], large: ["____________", "|__________|"] },
            table: { small: ["________", "|  |", "|  |"], large: ["____________", "|    |", "|    |"] },
            brick: { small: ["______", "|    |", "|    |", "|____|"], large: ["__________", "|        |", "|        |", "|        |", "|________|"] },
            ball: { small: ["__", "/  \\", "(    )", "\\__/"], large: ["__", "+    +", "/      \\", "(        )", "\\      /", "+ __ +"] }
        };
        //////////////////////////////////////////////////////////////////////
        // ANSI terminal codes
        // http://en.wikipedia.org/wiki/ANSI_escape_code
        this.CSI = '\x1b[';
        this.ansiColors = { black: 30, red: 31, green: 32, yellow: 33, blue: 34, magenta: 35, cyan: 36, white: 37, reset: 39 };
        if (!this.currentState.arm)
            this.currentState.arm = 0;
        if (this.currentState.holding)
            this.currentState.holding = null;
        var readline = require('readline');
        this.readlineInterface = readline.createInterface(process.stdin, process.stdout);
    }
    //////////////////////////////////////////////////////////////////////
    // Public methods
    ANSIWorld.prototype.readUserInput = function (prompt, callback) {
        this.inputCounter++;
        console.log(this.showcursor());
        this.readlineInterface.question("[" + this.inputCounter + "] " + prompt, callback);
    };
    ANSIWorld.prototype.printSystemOutput = function (output, participant) {
        this.outputCounter++;
        if (participant == "user") {
            output = '"' + output + '"';
        }
        console.log(this.gotoxy(0, this.worldHeight + 3) + this.clearline() + "[" + this.outputCounter + "] " + output);
    };
    ANSIWorld.prototype.printDebugInfo = function (info) {
        this.printSystemOutput("DEBUG: " + info);
    };
    ANSIWorld.prototype.printError = function (error, message) {
        if (message) {
            error += ": " + message;
        }
        this.printSystemOutput(error, "error");
    };
    ANSIWorld.prototype.printWorld = function (callback) {
        var _this = this;
        console.log(this.clearscreen());
        var timeout = 0;
        for (var stacknr = 0; stacknr < this.currentState.stacks.length; stacknr++) {
            for (var pos = 0; pos < this.currentState.stacks[stacknr].length; pos++) {
                var obj = this.getObject(stacknr, pos);
                (function (obj) { return setTimeout(function () {
                    _this.printObject(obj.x, obj.y, obj.color, obj.def);
                }, timeout); })(obj);
                timeout += 50;
            }
            var x = this.getXPos(stacknr);
            console.log(this.gotoxy(x - this.stackWidth / 2, this.worldHeight) + "|" + Array(this.stackWidth).join("_") + "|");
            console.log(this.gotoxy(x - 1, this.worldHeight + 1) + stacknr);
        }
        setTimeout(function () {
            var obj = _this.getObject();
            if (obj)
                _this.printObject(obj.x, obj.y, obj.color, obj.def);
            var arm = _this.getArm();
            _this.printObject(arm.x, arm.y, arm.color, arm.def);
        }, timeout);
        if (callback) {
            setTimeout(callback, timeout + 1);
        }
    };
    ANSIWorld.prototype.performPlan = function (plan, callback) {
        var planctr = 0;
        var world = this;
        function performNextAction() {
            planctr++;
            if (plan && plan.length) {
                var item = plan.shift().trim();
                var action = world.getAction(item);
                if (action) {
                    try {
                        action.call(world, performNextAction);
                    }
                    catch (err) {
                        world.printError(err);
                        if (callback)
                            setTimeout(callback, 1);
                    }
                }
                else {
                    if (item && item[0] != "#") {
                        world.printSystemOutput(item);
                    }
                    performNextAction();
                }
            }
            else {
                if (callback)
                    setTimeout(callback, 1);
            }
        }
        performNextAction();
    };
    ANSIWorld.prototype.gotoxy = function (x, y) {
        return this.CSI + Math.floor(y + 1) + ';' + Math.floor(x + 1) + 'H';
    };
    ANSIWorld.prototype.setgraphics = function (code) {
        return this.CSI + code + 'm';
    };
    ANSIWorld.prototype.setcolor = function (col) {
        return this.setgraphics(this.ansiColors[col]);
    };
    ANSIWorld.prototype.setbold = function () {
        return this.setgraphics(1);
    };
    ANSIWorld.prototype.cleargraphics = function () {
        return this.setgraphics(0);
    };
    ANSIWorld.prototype.clearscreen = function () {
        return this.CSI + '2J';
    };
    ANSIWorld.prototype.clearline = function () {
        return this.CSI + '2K';
    };
    ANSIWorld.prototype.hidecursor = function () {
        return this.CSI + '?25l';
    };
    ANSIWorld.prototype.showcursor = function () {
        return this.gotoxy(0, this.worldHeight + 4) + this.CSI + '?25h';
    };
    //////////////////////////////////////////////////////////////////////
    // Methods for getting information about objects
    ANSIWorld.prototype.getXPos = function (stack) {
        return this.stackWidth * (stack + 1);
    };
    ANSIWorld.prototype.getArm = function () {
        return { x: this.getXPos(this.currentState.arm), y: 1, color: 'black', def: this.objectData.arm };
    };
    ANSIWorld.prototype.getObject = function (stacknr, stackpos) {
        var x, y, id, form, size, color, obj;
        if (stacknr == null && stackpos == null) {
            x = this.getXPos(this.currentState.arm);
            y = 2; // form == 'box' ? 1 : 2;
            id = this.currentState.holding;
            if (!id)
                return null;
            form = this.currentState.objects[id].form;
            size = this.currentState.objects[id].size;
            color = this.currentState.objects[id].color;
            obj = this.objectData[form][size];
        }
        else {
            x = this.getXPos(stacknr);
            y = this.worldHeight;
            for (var h = 0; h <= stackpos; h++) {
                id = this.currentState.stacks[stacknr][h];
                form = this.currentState.objects[id].form;
                size = this.currentState.objects[id].size;
                color = this.currentState.objects[id].color;
                obj = this.objectData[form][size];
                y -= form == 'box' && h < stackpos ? 1 : obj.length;
            }
        }
        return { x: x, y: y, color: color, def: obj };
    };
    //////////////////////////////////////////////////////////////////////
    // Methods for printing objects
    ANSIWorld.prototype.printObject = function (xmid, ytop, color, objdef) {
        var outstr = this.hidecursor();
        for (var i = 0; i < objdef.length; i++) {
            var pos = this.gotoxy(xmid - objdef[i].length / 2, ytop + i);
            outstr += pos + this.setcolor(color) + this.setbold() + objdef[i] + this.cleargraphics();
        }
        outstr += this.showcursor();
        console.log(outstr);
    };
    ANSIWorld.prototype.clearObject = function (xmid, ytop, objdef) {
        var outstr = this.hidecursor();
        for (var i = 0; i < objdef.length; i++) {
            var pos = this.gotoxy(xmid - objdef[i].length / 2, ytop + i);
            outstr += (pos + Array(objdef[i].length + 1).join(" "));
        }
        outstr += this.showcursor();
        console.log(outstr);
    };
    //////////////////////////////////////////////////////////////////////
    // The basic actions: left, right, pick, drop
    ANSIWorld.prototype.getAction = function (act) {
        var actions = { p: this.pick, d: this.drop, l: this.left, r: this.right };
        return actions[act.toLowerCase()];
    };
    ANSIWorld.prototype.left = function (callback) {
        var _this = this;
        if (this.currentState.arm <= 0) {
            throw "Already at left edge!";
        }
        var x0 = this.getArm().x;
        this.currentState.arm--;
        var arm = this.getArm();
        var holding = this.getObject();
        var timeout = 0;
        for (var x = x0; x > arm.x; x--) {
            (function (x) { return setTimeout(function () {
                if (holding)
                    _this.clearObject(x, holding.y, holding.def);
                _this.clearObject(x, arm.y, arm.def);
                if (holding)
                    _this.printObject(x - 1, holding.y, holding.color, holding.def);
                _this.printObject(x - 1, arm.y, arm.color, arm.def);
            }, timeout); })(x);
            timeout += this.horizontalAnimationPause;
        }
        setTimeout(function () {
            if (holding)
                _this.printObject(holding.x, holding.y, holding.color, holding.def);
            _this.printObject(arm.x, arm.y, arm.color, arm.def);
        }, timeout);
        setTimeout(callback, timeout + 1);
    };
    ANSIWorld.prototype.right = function (callback) {
        var _this = this;
        if (this.currentState.arm >= this.currentState.stacks.length - 1) {
            throw "Already at right edge!";
        }
        var x0 = this.getArm().x;
        this.currentState.arm++;
        var arm = this.getArm();
        var holding = this.getObject();
        var timeout = 0;
        for (var x = x0; x < arm.x; x++) {
            (function (x) { return setTimeout(function () {
                if (holding)
                    _this.clearObject(x, holding.y, holding.def);
                _this.clearObject(x, arm.y, arm.def);
                if (holding)
                    _this.printObject(x + 1, holding.y, holding.color, holding.def);
                _this.printObject(x + 1, arm.y, arm.color, arm.def);
            }, timeout); })(x);
            timeout += this.horizontalAnimationPause;
        }
        setTimeout(function () {
            if (holding)
                _this.printObject(holding.x, holding.y, holding.color, holding.def);
            _this.printObject(arm.x, arm.y, arm.color, arm.def);
        }, timeout);
        setTimeout(callback, timeout + 1);
    };
    ANSIWorld.prototype.pick = function (callback) {
        var _this = this;
        if (this.currentState.holding) {
            throw "Already holding something!";
        }
        var stack = this.currentState.arm;
        var pos = this.currentState.stacks[stack].length - 1;
        if (pos < 0) {
            throw "Stack is empty!";
        }
        var obj = this.getObject(stack, pos);
        this.currentState.holding = this.currentState.stacks[stack].pop();
        var arm = this.getArm();
        var timeout = 0;
        for (var y = arm.y; y < obj.y; y++) {
            (function (y) { return setTimeout(function () {
                _this.printObject(arm.x, y, arm.color, arm.def);
            }, timeout); })(y);
            timeout += this.verticalAnimationPause;
        }
        for (var y = obj.y; y > arm.y + 1; y--) {
            (function (y) { return setTimeout(function () {
                _this.clearObject(obj.x, y, obj.def);
                _this.printObject(obj.x, y - 1, obj.color, obj.def);
                _this.printObject(arm.x, y - 2, arm.color, arm.def);
            }, timeout); })(y);
            timeout += this.verticalAnimationPause;
        }
        var obj = this.getObject();
        setTimeout(function () {
            _this.printObject(obj.x, obj.y, obj.color, obj.def);
            _this.printObject(arm.x, arm.y, arm.color, arm.def);
        }, timeout);
        setTimeout(callback, timeout + 1);
    };
    ANSIWorld.prototype.drop = function (callback) {
        var _this = this;
        if (!this.currentState.holding) {
            throw "Not holding anything!";
        }
        var stack = this.currentState.arm;
        this.currentState.stacks[stack].push(this.currentState.holding);
        this.currentState.holding = null;
        var pos = this.currentState.stacks[stack].length - 1;
        var obj = this.getObject(stack, pos);
        var arm = this.getArm();
        var timeout = 0;
        for (var y = arm.y; y < obj.y; y++) {
            (function (y) { return setTimeout(function () {
                _this.clearObject(obj.x, y, obj.def);
                _this.printObject(obj.x, y + 1, obj.color, obj.def);
                _this.printObject(arm.x, y, arm.color, arm.def);
            }, timeout); })(y);
            timeout += this.verticalAnimationPause;
        }
        setTimeout(function () {
            _this.printObject(obj.x, obj.y, obj.color, obj.def);
        }, timeout);
        for (var y = obj.y - 2; y > arm.y; y--) {
            (function (y) { return setTimeout(function () {
                _this.clearObject(arm.x, y, arm.def);
                _this.printObject(arm.x, y - 1, arm.color, arm.def);
            }, timeout); })(y);
            timeout += this.verticalAnimationPause;
        }
        setTimeout(function () {
            _this.printObject(arm.x, arm.y, arm.color, arm.def);
        }, timeout);
        setTimeout(callback, timeout + 1);
    };
    return ANSIWorld;
})();
///<reference path="World.ts"/>
var ExampleWorlds = {};
ExampleWorlds["complex"] = {
    "stacks": [["e"], ["a", "l"], ["i", "h", "j"], ["c", "k", "g", "b"], ["d", "m", "f"]],
    "holding": null,
    "arm": 0,
    "objects": {
        "a": { "form": "brick", "size": "large", "color": "yellow" },
        "b": { "form": "brick", "size": "small", "color": "white" },
        "c": { "form": "plank", "size": "large", "color": "red" },
        "d": { "form": "plank", "size": "small", "color": "green" },
        "e": { "form": "ball", "size": "large", "color": "white" },
        "f": { "form": "ball", "size": "small", "color": "black" },
        "g": { "form": "table", "size": "large", "color": "blue" },
        "h": { "form": "table", "size": "small", "color": "red" },
        "i": { "form": "pyramid", "size": "large", "color": "yellow" },
        "j": { "form": "pyramid", "size": "small", "color": "red" },
        "k": { "form": "box", "size": "large", "color": "yellow" },
        "l": { "form": "box", "size": "large", "color": "red" },
        "m": { "form": "box", "size": "small", "color": "blue" }
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
    "stacks": [["e"], ["a", "l"], [], [], ["i", "h", "j"], [], [], ["k", "g", "c", "b"], [], ["d", "m", "f"]],
    "holding": null,
    "arm": 0,
    "objects": {
        "a": { "form": "brick", "size": "large", "color": "green" },
        "b": { "form": "brick", "size": "small", "color": "white" },
        "c": { "form": "plank", "size": "large", "color": "red" },
        "d": { "form": "plank", "size": "small", "color": "green" },
        "e": { "form": "ball", "size": "large", "color": "white" },
        "f": { "form": "ball", "size": "small", "color": "black" },
        "g": { "form": "table", "size": "large", "color": "blue" },
        "h": { "form": "table", "size": "small", "color": "red" },
        "i": { "form": "pyramid", "size": "large", "color": "yellow" },
        "j": { "form": "pyramid", "size": "small", "color": "red" },
        "k": { "form": "box", "size": "large", "color": "yellow" },
        "l": { "form": "box", "size": "large", "color": "red" },
        "m": { "form": "box", "size": "small", "color": "blue" }
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
    "stacks": [["e"], ["g", "l"], [], ["k", "m", "f"], []],
    "holding": "a",
    "arm": 0,
    "objects": {
        "a": { "form": "brick", "size": "large", "color": "green" },
        "b": { "form": "brick", "size": "small", "color": "white" },
        "c": { "form": "plank", "size": "large", "color": "red" },
        "d": { "form": "plank", "size": "small", "color": "green" },
        "e": { "form": "ball", "size": "large", "color": "white" },
        "f": { "form": "ball", "size": "small", "color": "black" },
        "g": { "form": "table", "size": "large", "color": "blue" },
        "h": { "form": "table", "size": "small", "color": "red" },
        "i": { "form": "pyramid", "size": "large", "color": "yellow" },
        "j": { "form": "pyramid", "size": "small", "color": "red" },
        "k": { "form": "box", "size": "large", "color": "yellow" },
        "l": { "form": "box", "size": "large", "color": "red" },
        "m": { "form": "box", "size": "small", "color": "blue" }
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
    "stacks": [["lbrick1", "lball1", "sbrick1"], [], ["lpyr1", "lbox1", "lplank2", "sball2"], [], ["sbrick2", "sbox1", "spyr1", "ltable1", "sball1"]],
    "holding": null,
    "arm": 0,
    "objects": {
        "lbrick1": { "form": "brick", "size": "large", "color": "green" },
        "sbrick1": { "form": "brick", "size": "small", "color": "yellow" },
        "sbrick2": { "form": "brick", "size": "small", "color": "blue" },
        "lplank1": { "form": "plank", "size": "large", "color": "red" },
        "lplank2": { "form": "plank", "size": "large", "color": "black" },
        "splank1": { "form": "plank", "size": "small", "color": "green" },
        "lball1": { "form": "ball", "size": "large", "color": "white" },
        "sball1": { "form": "ball", "size": "small", "color": "black" },
        "sball2": { "form": "ball", "size": "small", "color": "red" },
        "ltable1": { "form": "table", "size": "large", "color": "green" },
        "stable1": { "form": "table", "size": "small", "color": "red" },
        "lpyr1": { "form": "pyramid", "size": "large", "color": "white" },
        "spyr1": { "form": "pyramid", "size": "small", "color": "blue" },
        "lbox1": { "form": "box", "size": "large", "color": "yellow" },
        "sbox1": { "form": "box", "size": "small", "color": "red" },
        "sbox2": { "form": "box", "size": "small", "color": "blue" }
    },
    "examples": [
        "this is just an impossible world"
    ]
};
///<reference path="Shrdlite.ts"/>
///<reference path="ANSIWorld.ts"/>
///<reference path="ExampleWorlds.ts"/>
// Extract command line arguments:
var nodename = process.argv[0];
var jsfile = process.argv[1].replace(/^.*\//, "");
var worldname = process.argv[2];
var usage = "Usage: " + nodename + " " + jsfile + " (" + Object.keys(ExampleWorlds).join(" | ") + ")";
if (process.argv.length != 3 || !ExampleWorlds[worldname]) {
    console.error(usage);
    process.exit(1);
}
var world = new ANSIWorld(ExampleWorlds[worldname]);
Shrdlite.interactive(world);
