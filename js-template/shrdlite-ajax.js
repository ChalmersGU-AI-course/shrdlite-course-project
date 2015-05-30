///<reference path="World.ts"/>
///<reference path="lib/jquery.d.ts" />
var SVGWorld = (function () {
    function SVGWorld(currentState, useSpeech) {
        var _this = this;
        if (useSpeech === void 0) { useSpeech = false; }
        this.currentState = currentState;
        this.useSpeech = useSpeech;
        //////////////////////////////////////////////////////////////////////
        // Public constants that can be played around with
        this.dialogueHistory = 100; // max nr. utterances
        this.floorThickness = 10; // pixels
        this.wallSeparation = 4; // pixels
        this.armSize = 0.2; // of stack width
        this.animationPause = 0.01; // seconds
        this.promptPause = 0.5; // seconds
        this.ajaxTimeout = 5; // seconds
        this.armSpeed = 1000; // pixels per second
        // There is no way of setting male/female voice,
        // so this is one way of having different voices for user/system:
        this.voices = {
            "system": { "lang": "en-GB", "rate": 1.1 },
            "user": { "lang": "en-US" }
        };
        // HTML id's for different containers
        this.containers = {
            world: $('#theworld'),
            dialogue: $('#dialogue'),
            inputform: $('#dialogue form'),
            userinput: $('#dialogue form input:text'),
            inputexamples: $('#dialogue form select')
        };
        this.svgNS = 'http://www.w3.org/2000/svg';
        //////////////////////////////////////////////////////////////////////
        // Object types
        this.objectData = {
            brick: { small: { width: 0.30, height: 0.30 }, large: { width: 0.70, height: 0.60 } },
            plank: { small: { width: 0.60, height: 0.10 }, large: { width: 1.00, height: 0.15 } },
            ball: { small: { width: 0.30, height: 0.30 }, large: { width: 0.70, height: 0.70 } },
            pyramid: { small: { width: 0.60, height: 0.25 }, large: { width: 1.00, height: 0.40 } },
            box: { small: { width: 0.60, height: 0.30, thickness: 0.10 }, large: { width: 1.00, height: 0.40, thickness: 0.10 } },
            table: { small: { width: 0.60, height: 0.30, thickness: 0.10 }, large: { width: 1.00, height: 0.40, thickness: 0.10 } }
        };
        if (!this.currentState.arm)
            this.currentState.arm = 0;
        if (this.currentState.holding)
            this.currentState.holding = null;
        this.canvasWidth = this.containers.world.width() - 2 * this.wallSeparation;
        this.canvasHeight = this.containers.world.height() - this.floorThickness;
        var dropdown = this.containers.inputexamples;
        dropdown.empty();
        dropdown.append($('<option value="">').text("(Select an example utterance)"));
        $.each(this.currentState.examples, function (i, value) {
            dropdown.append($('<option>').text(value));
        });
        dropdown.change(function () {
            var userinput = dropdown.val().trim();
            if (userinput) {
                _this.containers.userinput.val(userinput).focus();
            }
        });
        this.containers.inputform.submit(function () { return _this.handleUserInput.call(_this); });
        this.disableInput();
    }
    //////////////////////////////////////////////////////////////////////
    // Public methods
    SVGWorld.prototype.readUserInput = function (prompt, callback) {
        this.printSystemOutput(prompt);
        this.enableInput();
        this.inputCallback = callback;
    };
    SVGWorld.prototype.printSystemOutput = function (output, participant, utterance) {
        if (participant === void 0) { participant = "system"; }
        if (utterance == undefined) {
            utterance = output;
        }
        var dialogue = this.containers.dialogue;
        if (dialogue.children().length > this.dialogueHistory) {
            dialogue.children().first().remove();
        }
        $('<p>').attr("class", participant).text(output).insertBefore(this.containers.inputform);
        dialogue.scrollTop(dialogue.prop("scrollHeight"));
        if (this.useSpeech && utterance && /^\w/.test(utterance)) {
            try {
                // W3C Speech API (works in Chrome and Safari)
                var speech = new SpeechSynthesisUtterance(utterance);
                for (var attr in this.voices[participant]) {
                    speech[attr] = this.voices[participant][attr];
                }
                console.log("SPEAKING: " + utterance);
                window.speechSynthesis.speak(speech);
            }
            catch (err) {
            }
        }
    };
    SVGWorld.prototype.printDebugInfo = function (info) {
        console.log(info);
    };
    SVGWorld.prototype.printError = function (error, message) {
        console.error(error, message);
        if (message) {
            error += ": " + message;
        }
        this.printSystemOutput(error, "error");
    };
    SVGWorld.prototype.printWorld = function (callback) {
        this.containers.world.empty();
        this.printSystemOutput("Please wait while I populate the world.");
        var viewBox = [0, 0, this.canvasWidth + 2 * this.wallSeparation, this.canvasHeight + this.floorThickness];
        var svg = $(this.SVG('svg')).attr({
            viewBox: viewBox.join(' '),
            width: viewBox[2],
            height: viewBox[3]
        }).appendTo(this.containers.world);
        // The floor:
        $(this.SVG('rect')).attr({
            x: 0,
            y: this.canvasHeight,
            width: this.canvasWidth + 2 * this.wallSeparation,
            height: this.canvasHeight + this.floorThickness,
            fill: 'black'
        }).appendTo(svg);
        // The arm:
        $(this.SVG('line')).attr({
            id: 'arm',
            x1: this.stackWidth() / 2,
            y1: this.armSize * this.stackWidth() - this.canvasHeight,
            x2: this.stackWidth() / 2,
            y2: this.armSize * this.stackWidth(),
            stroke: 'black',
            'stroke-width': this.armSize * this.stackWidth()
        }).appendTo(svg);
        var timeout = 0;
        for (var stacknr = 0; stacknr < this.currentState.stacks.length; stacknr++) {
            for (var objectnr = 0; objectnr < this.currentState.stacks[stacknr].length; objectnr++) {
                var objectid = this.currentState.stacks[stacknr][objectnr];
                this.makeObject(svg, objectid, stacknr, timeout);
                timeout += this.animationPause;
            }
        }
        if (callback) {
            setTimeout(callback, (timeout + this.promptPause) * 1000);
        }
    };
    SVGWorld.prototype.performPlan = function (plan, callback) {
        var _this = this;
        if (this.isSpeaking()) {
            setTimeout(function () { return _this.performPlan(plan, callback); }, this.animationPause * 1000);
            return;
        }
        var planctr = 0;
        var performNextAction = function () {
            planctr++;
            if (plan && plan.length) {
                var item = plan.shift().trim();
                var action = _this.getAction(item);
                if (action) {
                    try {
                        action.call(_this, performNextAction);
                    }
                    catch (err) {
                        _this.printError(err);
                        if (callback)
                            setTimeout(callback, _this.promptPause * 1000);
                    }
                }
                else {
                    if (item && item[0] != "#") {
                        if (_this.isSpeaking()) {
                            plan.unshift(item);
                            setTimeout(performNextAction, _this.animationPause * 1000);
                        }
                        else {
                            _this.printSystemOutput(item);
                            performNextAction();
                        }
                    }
                    else {
                        performNextAction();
                    }
                }
            }
            else {
                if (callback)
                    setTimeout(callback, _this.promptPause * 1000);
            }
        };
        performNextAction();
    };
    SVGWorld.prototype.stackWidth = function () {
        return this.canvasWidth / this.currentState.stacks.length;
    };
    SVGWorld.prototype.boxSpacing = function () {
        return Math.min(5, this.stackWidth() / 20);
    };
    SVGWorld.prototype.SVG = function (tag) {
        return document.createElementNS(this.svgNS, tag);
    };
    SVGWorld.prototype.animateMotion = function (object, path, timeout, duration) {
        if (path instanceof Array) {
            path = path.join(" ");
        }
        var animation = this.SVG('animateMotion');
        $(animation).attr({
            begin: 'indefinite',
            fill: 'freeze',
            path: path,
            dur: duration + "s"
        }).appendTo(object);
        animation.beginElementAt(timeout);
        return animation;
    };
    //////////////////////////////////////////////////////////////////////
    // The basic actions: left, right, pick, drop
    SVGWorld.prototype.getAction = function (act) {
        var actions = { p: this.pick, d: this.drop, l: this.left, r: this.right };
        return actions[act.toLowerCase()];
    };
    SVGWorld.prototype.left = function (callback) {
        if (this.currentState.arm <= 0) {
            throw "Already at left edge!";
        }
        this.horizontalMove(this.currentState.arm - 1, callback);
    };
    SVGWorld.prototype.right = function (callback) {
        if (this.currentState.arm >= this.currentState.stacks.length - 1) {
            throw "Already at right edge!";
        }
        this.horizontalMove(this.currentState.arm + 1, callback);
    };
    SVGWorld.prototype.drop = function (callback) {
        if (!this.currentState.holding) {
            throw "Not holding anything!";
        }
        this.verticalMove('drop', callback);
        this.currentState.stacks[this.currentState.arm].push(this.currentState.holding);
        this.currentState.holding = null;
    };
    SVGWorld.prototype.pick = function (callback) {
        if (this.currentState.holding) {
            throw "Already holding something!";
        }
        this.currentState.holding = this.currentState.stacks[this.currentState.arm].pop();
        this.verticalMove('pick', callback);
    };
    //////////////////////////////////////////////////////////////////////
    // Moving around
    SVGWorld.prototype.horizontalMove = function (newArm, callback) {
        var xArm = this.currentState.arm * this.stackWidth() + this.wallSeparation;
        var xNewArm = newArm * this.stackWidth() + this.wallSeparation;
        var path1 = ["M", xArm, 0, "H", xNewArm];
        var duration = Math.abs(xNewArm - xArm) / this.armSpeed;
        var arm = $('#arm');
        this.animateMotion(arm, path1, 0, duration);
        if (this.currentState.holding) {
            var objectHeight = this.getObjectDimensions(this.currentState.holding).heightadd;
            var yArm = -(this.canvasHeight - this.armSize * this.stackWidth() - objectHeight);
            var path2 = ["M", xArm, yArm, "H", xNewArm];
            var object = $("#" + this.currentState.holding);
            this.animateMotion(object, path2, 0, duration);
        }
        this.currentState.arm = newArm;
        if (callback)
            setTimeout(callback, (duration + this.animationPause) * 1000);
        return;
    };
    SVGWorld.prototype.verticalMove = function (action, callback) {
        var altitude = this.getAltitude(this.currentState.arm);
        var objectHeight = this.getObjectDimensions(this.currentState.holding).heightadd;
        var yArm = this.canvasHeight - altitude - this.armSize * this.stackWidth() - objectHeight;
        var yStack = -altitude;
        var xArm = this.currentState.arm * this.stackWidth() + this.wallSeparation;
        var path1 = ["M", xArm, 0, "V", yArm];
        var path2 = ["M", xArm, yArm, "V", 0];
        var duration = (Math.abs(yArm)) / this.armSpeed;
        var arm = $('#arm');
        var object = $("#" + this.currentState.holding);
        this.animateMotion(arm, path1, 0, duration);
        this.animateMotion(arm, path2, duration + this.animationPause, duration);
        if (action == 'pick') {
            var path3 = ["M", xArm, yStack, "V", yStack - yArm];
            this.animateMotion(object, path3, duration + this.animationPause, duration);
        }
        else {
            var path3 = ["M", xArm, yStack - yArm, "V", yStack];
            this.animateMotion(object, path3, 0, duration);
        }
        if (callback)
            setTimeout(callback, 2 * (duration + this.animationPause) * 1000);
    };
    //////////////////////////////////////////////////////////////////////
    // Methods for getting information about objects 
    SVGWorld.prototype.getObjectDimensions = function (objectid) {
        var attrs = this.currentState.objects[objectid];
        var size = this.objectData[attrs.form][attrs.size];
        var width = size.width * (this.stackWidth() - this.boxSpacing());
        var height = size.height * (this.stackWidth() - this.boxSpacing());
        var thickness = size.thickness * (this.stackWidth() - this.boxSpacing());
        var heightadd = attrs.form == 'box' ? thickness : height;
        return {
            width: width,
            height: height,
            heightadd: heightadd,
            thickness: thickness
        };
    };
    SVGWorld.prototype.getAltitude = function (stacknr, objectid) {
        var stack = this.currentState.stacks[stacknr];
        var altitude = 0;
        for (var i = 0; i < stack.length; i++) {
            if (objectid == stack[i])
                break;
            altitude += this.getObjectDimensions(stack[i]).heightadd + this.boxSpacing();
        }
        return altitude;
    };
    //////////////////////////////////////////////////////////////////////
    // Creating objects
    SVGWorld.prototype.makeObject = function (svg, objectid, stacknr, timeout) {
        var attrs = this.currentState.objects[objectid];
        var altitude = this.getAltitude(stacknr, objectid);
        var dim = this.getObjectDimensions(objectid);
        var ybottom = this.canvasHeight - this.boxSpacing();
        var ytop = ybottom - dim.height;
        var ycenter = (ybottom + ytop) / 2;
        var yradius = (ybottom - ytop) / 2;
        var xleft = (this.stackWidth() - dim.width) / 2;
        var xright = xleft + dim.width;
        var xcenter = (xright + xleft) / 2;
        var xradius = (xright - xleft) / 2;
        var xmidleft = (xcenter + xleft) / 2;
        var xmidright = (xcenter + xright) / 2;
        var object;
        switch (attrs.form) {
            case 'brick':
            case 'plank':
                object = $(this.SVG('rect')).attr({
                    x: xleft,
                    y: ytop,
                    width: dim.width,
                    height: dim.height
                });
                break;
            case 'ball':
                object = $(this.SVG('ellipse')).attr({
                    cx: xcenter,
                    cy: ycenter,
                    rx: xradius,
                    ry: yradius
                });
                break;
            case 'pyramid':
                var points = [xleft, ybottom, xmidleft, ytop, xmidright, ytop, xright, ybottom];
                object = $(this.SVG('polygon')).attr({
                    points: points.join(" ")
                });
                break;
            case 'box':
                var points = [xleft, ytop, xleft, ybottom, xright, ybottom, xright, ytop, xright - dim.thickness, ytop, xright - dim.thickness, ybottom - dim.thickness, xleft + dim.thickness, ybottom - dim.thickness, xleft + dim.thickness, ytop];
                object = $(this.SVG('polygon')).attr({
                    points: points.join(" ")
                });
                break;
            case 'table':
                var points = [xleft, ytop, xright, ytop, xright, ytop + dim.thickness, xmidright, ytop + dim.thickness, xmidright, ybottom, xmidright - dim.thickness, ybottom, xmidright - dim.thickness, ytop + dim.thickness, xmidleft + dim.thickness, ytop + dim.thickness, xmidleft + dim.thickness, ybottom, xmidleft, ybottom, xmidleft, ytop + dim.thickness, xleft, ytop + dim.thickness];
                object = $(this.SVG('polygon')).attr({
                    points: points.join(" ")
                });
                break;
        }
        object.attr({
            id: objectid,
            stroke: 'black',
            'stroke-width': this.boxSpacing() / 2,
            fill: attrs.color
        });
        object.appendTo(svg);
        var path = ["M", stacknr * this.stackWidth() + this.wallSeparation, -(this.canvasHeight + this.floorThickness)];
        this.animateMotion(object, path, 0, 0);
        path.push("V", -altitude);
        this.animateMotion(object, path, timeout, 0.5);
    };
    //////////////////////////////////////////////////////////////////////
    // Methods for handling user input and system output
    SVGWorld.prototype.enableInput = function () {
        this.containers.inputexamples.prop('disabled', false).val('');
        this.containers.inputexamples.find("option:first").attr('selected', 'selected');
        this.containers.userinput.prop('disabled', false);
        this.containers.userinput.focus().select();
    };
    SVGWorld.prototype.disableInput = function () {
        this.containers.inputexamples.blur();
        this.containers.inputexamples.prop('disabled', true);
        this.containers.userinput.blur();
        this.containers.userinput.prop('disabled', true);
    };
    SVGWorld.prototype.handleUserInput = function () {
        var userinput = this.containers.userinput.val().trim();
        this.disableInput();
        this.printSystemOutput(userinput, "user");
        this.inputCallback(userinput);
        return false;
    };
    SVGWorld.prototype.isSpeaking = function () {
        return this.useSpeech && window && window.speechSynthesis && window.speechSynthesis.speaking;
    };
    return SVGWorld;
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
///<reference path="Parser.ts"/>
///<reference path="SVGWorld.ts"/>
///<reference path="ExampleWorlds.ts"/>
///<reference path="lib/jquery.d.ts" />
// Replace this with the URL to your CGI script:
var ajaxScript = "cgi-bin/shrdlite_cgi.py";
$(function () {
    var startWorld = 'small';
    var useSpeech = false;
    var world = new SVGWorld(ExampleWorlds[startWorld], useSpeech);
    ajaxInteractive(world);
});
function ajaxInteractive(world) {
    function endlessLoop(utterance) {
        if (utterance === void 0) { utterance = ""; }
        var inputPrompt = "What can I do for you today? ";
        var nextInput = function () { return world.readUserInput(inputPrompt, endlessLoop); };
        if (utterance.trim()) {
            var plan = ajaxParseUtteranceIntoPlan(world, utterance);
            if (plan) {
                world.printDebugInfo("Plan: " + plan.join(", "));
                world.performPlan(plan, nextInput);
                return;
            }
        }
        nextInput();
    }
    world.printWorld(endlessLoop);
}
function ajaxParseUtteranceIntoPlan(world, utterance) {
    world.printDebugInfo('Parsing utterance: "' + utterance + '"');
    try {
        var parses = Parser.parse(utterance);
    }
    catch (err) {
        if (err instanceof Parser.Error) {
            world.printError("Parsing error: " + err.message);
            return;
        }
        else {
            throw err;
        }
    }
    world.printDebugInfo("Found " + parses.length + " parses");
    parses.forEach(function (res, n) {
        world.printDebugInfo("  (" + n + ") " + JSON.stringify(res.prs));
    });
    world.printDebugInfo('Calling interpreter/planner using AJAX');
    var ajaxData = JSON.stringify({ stacks: world.currentState.stacks, holding: world.currentState.holding, arm: world.currentState.arm, objects: world.currentState.objects, utterance: utterance, parses: parses });
    var xhReq = new XMLHttpRequest();
    xhReq.open("GET", ajaxScript + "?data=" + encodeURIComponent(ajaxData), false);
    xhReq.send();
    var response = xhReq.responseText;
    world.printDebugInfo("AJAX response: " + response);
    try {
        var result = JSON.parse(response);
    }
    catch (err) {
        world.printError("JSON error:" + err);
        return;
    }
    if (result.plan) {
        return result.plan;
    }
    else {
        return result;
    }
    ;
}
