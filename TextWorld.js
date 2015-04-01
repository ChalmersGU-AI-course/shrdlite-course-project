///<reference path="World.ts"/>
///<reference path="lib/node.d.ts"/>
var TextWorld = (function () {
    function TextWorld(currentState) {
        this.currentState = currentState;
        if (!this.currentState.arm)
            this.currentState.arm = 0;
        if (this.currentState.holding)
            this.currentState.holding = null;
    }
    TextWorld.prototype.readUserInput = function (prompt, callback) {
        throw "Not implemented!";
    };
    TextWorld.prototype.printSystemOutput = function (output, participant) {
        if (participant == "user") {
            output = '"' + output + '"';
        }
        console.log(output);
    };
    TextWorld.prototype.printDebugInfo = function (info) {
        console.log(info);
    };
    TextWorld.prototype.printError = function (error, message) {
        console.error(error, message);
    };
    TextWorld.prototype.printWorld = function (callback) {
        var _this = this;
        console.log();
        var stacks = this.currentState.stacks;
        var maxHeight = Math.max.apply(null, stacks.map(function (s) {
            return s.length;
        }));
        var stackWidth = 3 + Math.max.apply(null, stacks.map(function (s) {
            return Math.max.apply(null, s.map(function (o) {
                return o.length;
            }));
        }));
        var line = Array(this.currentState.arm * stackWidth).join(" ");
        console.log(line + this.centerString("\\_/", stackWidth));
        if (this.currentState.holding) {
            console.log(line + this.centerString(this.currentState.holding, stackWidth));
        }
        for (var y = maxHeight; y >= 0; y--) {
            var line = "";
            for (var x = 0; x < stacks.length; x++) {
                var obj = stacks[x][y] || "";
                line += this.centerString(obj, stackWidth);
            }
            console.log(line);
        }
        console.log("+" + Array(1 + stacks.length).join(Array(stackWidth).join("-") + "+"));
        var line = "";
        for (var x = 0; x < stacks.length; x++) {
            line += this.centerString(x + "", stackWidth);
        }
        console.log(line);
        console.log();
        var printObject = function (obj) {
            var props = world.currentState.objects[obj];
            console.log(_this.centerString(obj, stackWidth) + ": " + Object.keys(props).map(function (k) {
                return props[k];
            }).join(", "));
        };
        if (this.currentState.holding)
            printObject(this.currentState.holding);
        stacks.forEach(function (stack) { return stack.forEach(printObject); });
        console.log();
        if (callback)
            callback();
    };
    TextWorld.prototype.performPlan = function (plan, callback) {
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
                        world.printSystemOutput("ERROR: " + err);
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
    //////////////////////////////////////////////////////////////////////
    // The basic actions: left, right, pick, drop
    TextWorld.prototype.getAction = function (act) {
        var actions = { p: this.pick, d: this.drop, l: this.left, r: this.right };
        return actions[act.toLowerCase()];
    };
    TextWorld.prototype.left = function (callback) {
        if (this.currentState.arm <= 0) {
            throw "Already at left edge!";
        }
        this.currentState.arm--;
        callback();
    };
    TextWorld.prototype.right = function (callback) {
        if (this.currentState.arm >= this.currentState.stacks.length - 1) {
            throw "Already at right edge!";
        }
        this.currentState.arm++;
        callback();
    };
    TextWorld.prototype.pick = function (callback) {
        if (this.currentState.holding) {
            throw "Already holding something!";
        }
        var stack = this.currentState.arm;
        var pos = this.currentState.stacks[stack].length - 1;
        if (pos < 0) {
            throw "Stack is empty!";
        }
        this.currentState.holding = this.currentState.stacks[stack].pop();
        callback();
    };
    TextWorld.prototype.drop = function (callback) {
        if (!this.currentState.holding) {
            throw "Not holding anything!";
        }
        var stack = this.currentState.arm;
        this.currentState.stacks[stack].push(this.currentState.holding);
        this.currentState.holding = null;
        callback();
    };
    //////////////////////////////////////////////////////////////////////
    // Utilities
    TextWorld.prototype.centerString = function (str, width) {
        var padlen = width - str.length;
        if (padlen > 0) {
            str = Array(Math.floor((padlen + 3) / 2)).join(" ") + str + Array(Math.floor((padlen + 2) / 2)).join(" ");
        }
        return str;
    };
    return TextWorld;
})();
