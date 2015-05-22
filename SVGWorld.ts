///<reference path="World.ts"/>
///<reference path="lib/jquery.d.ts" />


class SVGWorld implements World {

    constructor(
        public currentState: WorldState,
        public useSpeech = false
    ) {
        if (!this.currentState.arm) this.currentState.arm = 0;
        if (this.currentState.holding) this.currentState.holding = null;
        this.canvasWidth = this.containers.world.width() - 2 * this.wallSeparation;
        this.canvasHeight = this.containers.world.height() - this.floorThickness;

        var dropdown = this.containers.inputexamples;
        dropdown.empty();
        dropdown.append($('<option value="">').text("(Select an example utterance)"));
        $.each(this.currentState.examples, function(i, value) {
            dropdown.append($('<option>').text(value));
        });

        dropdown.change(() => {
            var userinput = dropdown.val().trim();
            if (userinput) {
                this.containers.userinput.val(userinput).focus();
            }
        });
        this.containers.inputform.submit(() => this.handleUserInput.call(this));
        this.disableInput();
    }

    //////////////////////////////////////////////////////////////////////
    // Public constants that can be played around with

    public dialogueHistory = 100;    // max nr. utterances
    public floorThickness = 10;     // pixels
    public wallSeparation = 4;     // pixels
    public armSize = 0.2;         // of stack width
    public animationPause = 0.01;// seconds
    public promptPause = 0.5;   // seconds
    public ajaxTimeout = 5;    // seconds
    public armSpeed = 1000;   // pixels per second

    // There is no way of setting male/female voice,
    // so this is one way of having different voices for user/system:
    public voices = {
        "system": {"lang": "en-GB", "rate": 1.1}, // British English, slightly faster
        "user": {"lang": "en-US"},  // American English
    };

    // HTML id's for different containers
    public containers = {
        world: $('#theworld'),
        dialogue: $('#dialogue'),
        inputform: $('#dialogue form'),
        userinput: $('#dialogue form input:text'),
        inputexamples: $('#dialogue form select'),
    };

    //////////////////////////////////////////////////////////////////////
    // Public methods

    public readUserInput(prompt, callback) {
        this.printSystemOutput(prompt);
        this.enableInput();
        this.inputCallback = callback;
    }

    public printSystemOutput(output, participant="system", utterance?) {
        if (utterance == undefined) {
            utterance = output;
        }
        var dialogue = this.containers.dialogue;
        if (dialogue.children().length > this.dialogueHistory) {
            dialogue.children().first().remove();
        }
        $('<p>').attr("class", participant)
            .text(output)
            .insertBefore(this.containers.inputform);
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
            } catch(err) {
            }
        }
    }

    public printDebugInfo(info) {
        console.log(info);
    }

    public printError(error, message?) {
        console.error(error, message);
        if (message) {
            error += ": " + message;
        }
        this.printSystemOutput(error, "error");
    }

    public printWorld(callback?) {
        this.containers.world.empty();
        this.printSystemOutput("Please wait while I populate the world.")

        var viewBox = [0, 0, this.canvasWidth + 2 * this.wallSeparation, 
                       this.canvasHeight + this.floorThickness];
        var svg = $(this.SVG('svg')).attr({
            viewBox: viewBox.join(' '), 
            width: viewBox[2], 
            height: viewBox[3],
        }).appendTo(this.containers.world);

        // The floor:
        $(this.SVG('rect')).attr({
            x: 0,
            y: this.canvasHeight,
            width: this.canvasWidth + 2 * this.wallSeparation,
            height: this.canvasHeight + this.floorThickness,
            fill: 'black',
        }).appendTo(svg);

        // The arm:
        $(this.SVG('line')).attr({
            id:'arm',
            x1: this.stackWidth() / 2,
            y1: this.armSize * this.stackWidth() - this.canvasHeight, 
            x2: this.stackWidth() / 2, 
            y2: this.armSize * this.stackWidth(), 
            stroke: 'black', 
            'stroke-width': this.armSize * this.stackWidth(),
        }).appendTo(svg);

        var timeout = 0;
        for (var stacknr=0; stacknr < this.currentState.stacks.length; stacknr++) {
            for (var objectnr=0; objectnr < this.currentState.stacks[stacknr].length; objectnr++) {
                var objectid = this.currentState.stacks[stacknr][objectnr];
                this.makeObject(svg, objectid, stacknr, timeout);
                timeout += this.animationPause;
            }
        }
        if (callback) {
            setTimeout(callback, (timeout + this.promptPause) * 1000);
        }
    }

    public performPlan(plan, callback?) {
        if (this.isSpeaking()) {
            setTimeout(() => this.performPlan(plan, callback), this.animationPause * 1000);
            return;
        }
        var planctr = 0;
        var performNextAction = () => {
            planctr++;
            if (plan && plan.length) {
                var item = plan.shift().trim();
                var action = this.getAction(item);
                if (action) {
                    try {
                        action.call(this, performNextAction);
                    } catch(err) {
                        this.printError(err);
                        if (callback) setTimeout(callback, this.promptPause * 1000);
                    }
                } else {
                    if (item && item[0] != "#") {
                        if (this.isSpeaking()) {
                            plan.unshift(item);
                            setTimeout(performNextAction, this.animationPause * 1000);
                        } else {
                            this.printSystemOutput(item);
                            performNextAction();
                        }
                    } else {
                        performNextAction();
                    }
                }
            } else {
                if (callback) setTimeout(callback, this.promptPause * 1000);
            }
        }
        performNextAction();
    }

    //////////////////////////////////////////////////////////////////////
    // Private variables & constants

    private canvasWidth : number;
    private canvasHeight : number;
    private svgNS = 'http://www.w3.org/2000/svg';

    //////////////////////////////////////////////////////////////////////
    // Object types

    private objectData = {
        brick: {small: {width:0.30, height:0.30},
                large: {width:0.70, height:0.60}},
        plank: {small: {width:0.60, height:0.10},
                large: {width:1.00, height:0.15}},
        ball: {small: {width:0.30, height:0.30},
               large: {width:0.70, height:0.70}},
        pyramid: {small: {width:0.60, height:0.25},
                  large: {width:1.00, height:0.40}},
        box: {small: {width:0.60, height:0.30, thickness: 0.10},
              large: {width:1.00, height:0.40, thickness: 0.10}},
        table: {small: {width:0.60, height:0.30, thickness: 0.10},
                large: {width:1.00, height:0.40, thickness: 0.10}},
    };

    private stackWidth() : number {
        return this.canvasWidth / this.currentState.stacks.length;
    }

    private boxSpacing() : number {
        return Math.min(5, this.stackWidth() / 20);
    }

    private SVG(tag) {
        return document.createElementNS(this.svgNS, tag);
    }

    private animateMotion(object, path, timeout, duration) {
        if (path instanceof Array) {
            path = path.join(" ");
        }
        var animation = this.SVG('animateMotion');
        $(animation).attr({
            begin: 'indefinite',
            fill: 'freeze',
            path: path,
            dur: duration + "s",
        }).appendTo(object);
        //animation.beginElementAt(timeout);
        return animation;
    }

    //////////////////////////////////////////////////////////////////////
    // The basic actions: left, right, pick, drop

    private getAction(act) {
        var actions = {p:this.pick, d:this.drop, l:this.left, r:this.right};
        return actions[act.toLowerCase()];
    }

    private left(callback?) {
        if (this.currentState.arm <= 0) {
            throw "Already at left edge!";
        }
        this.horizontalMove(this.currentState.arm - 1, callback);
    }

    private right(callback?) {
        if (this.currentState.arm >= this.currentState.stacks.length - 1) {
            throw "Already at right edge!";
        }
        this.horizontalMove(this.currentState.arm + 1, callback);
    }

    private drop(callback?) {
        if (!this.currentState.holding) {
            throw "Not holding anything!";
        }
        this.verticalMove('drop', callback);
        this.currentState.stacks[this.currentState.arm].push(this.currentState.holding);
        this.currentState.holding = null;
    }

    private pick(callback?) {
        if (this.currentState.holding) {
            throw "Already holding something!";
        }
        this.currentState.holding = this.currentState.stacks[this.currentState.arm].pop();
        this.verticalMove('pick', callback);
    }

    //////////////////////////////////////////////////////////////////////
    // Moving around

    private horizontalMove(newArm, callback?) {
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
            var object = $("#" + this.currentState.holding)
            this.animateMotion(object, path2, 0, duration);
        }
        this.currentState.arm = newArm;
        if (callback) setTimeout(callback, (duration + this.animationPause) * 1000);
        return 
    }

    private verticalMove(action, callback?) {
        var altitude = this.getAltitude(this.currentState.arm);
        var objectHeight = this.getObjectDimensions(this.currentState.holding).heightadd;
        var yArm = this.canvasHeight - altitude - this.armSize * this.stackWidth() - objectHeight;
        var yStack = -altitude;
        var xArm = this.currentState.arm * this.stackWidth() + this.wallSeparation;

        var path1 = ["M", xArm, 0, "V", yArm];
        var path2 = ["M", xArm, yArm, "V", 0];
        var duration = (Math.abs(yArm)) / this.armSpeed;
        var arm = $('#arm');
        var object = $("#" + this.currentState.holding)

        this.animateMotion(arm, path1, 0, duration);
        this.animateMotion(arm, path2, duration + this.animationPause, duration);
        if (action == 'pick') {
            var path3 = ["M", xArm, yStack, "V", yStack-yArm];
            this.animateMotion(object, path3, duration + this.animationPause, duration)
        } else {
            var path3 = ["M", xArm, yStack-yArm, "V", yStack];
            this.animateMotion(object, path3, 0, duration)
        }
        if (callback) setTimeout(callback, 2*(duration + this.animationPause) * 1000);
    }

    //////////////////////////////////////////////////////////////////////
    // Methods for getting information about objects 

    private getObjectDimensions(objectid) {
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
            thickness: thickness,
        };
    }

    private getAltitude(stacknr, objectid?) {
        var stack = this.currentState.stacks[stacknr];
        var altitude = 0;
        for (var i=0; i<stack.length; i++) {
            if (objectid == stack[i])
                break;
            altitude += this.getObjectDimensions(stack[i]).heightadd + this.boxSpacing();
        }
        return altitude;
    }

    //////////////////////////////////////////////////////////////////////
    // Creating objects

    private makeObject(svg, objectid, stacknr, timeout) {
        var attrs = this.currentState.objects[objectid];
        var altitude = this.getAltitude(stacknr, objectid);
        var dim = this.getObjectDimensions(objectid);

        var ybottom = this.canvasHeight - this.boxSpacing();
        var ytop = ybottom - dim.height;
        var ycenter = (ybottom + ytop) / 2;
        var yradius = (ybottom - ytop) / 2;
        var xleft = (this.stackWidth() - dim.width) / 2
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
            var points = [xleft, ytop, xleft, ybottom, xright, ybottom, xright, ytop, 
                          xright-dim.thickness, ytop, xright-dim.thickness, ybottom-dim.thickness,
                          xleft+dim.thickness, ybottom-dim.thickness, xleft+dim.thickness, ytop];
            object = $(this.SVG('polygon')).attr({
                points: points.join(" ")
            });
            break;
        case 'table':
            var points = [xleft, ytop, xright, ytop, xright, ytop+dim.thickness, 
                          xmidright, ytop+dim.thickness, xmidright, ybottom, 
                          xmidright-dim.thickness, ybottom, xmidright-dim.thickness, ytop+dim.thickness,
                          xmidleft+dim.thickness, ytop+dim.thickness, xmidleft+dim.thickness, ybottom,
                          xmidleft, ybottom, xmidleft, ytop+dim.thickness, xleft, ytop+dim.thickness];
            object = $(this.SVG('polygon')).attr({
                points: points.join(" ")
            });
            break;
        }
        object.attr({
            id: objectid,
            stroke: 'black', 
            'stroke-width': this.boxSpacing() / 2, 
            fill: attrs.color, 
        });
        object.appendTo(svg);

        var path = ["M", stacknr * this.stackWidth() + this.wallSeparation, 
                    -(this.canvasHeight + this.floorThickness)];
        this.animateMotion(object, path, 0, 0);
        path.push("V", -altitude);
        this.animateMotion(object, path, timeout, 0.5);
    }

    //////////////////////////////////////////////////////////////////////
    // Methods for handling user input and system output

    private enableInput() {
        this.containers.inputexamples.prop('disabled', false).val(''); 
        this.containers.inputexamples.find("option:first").attr('selected', 'selected');
        this.containers.userinput.prop('disabled', false); 
        this.containers.userinput.focus().select();
    }

    private disableInput() {
        this.containers.inputexamples.blur();
        this.containers.inputexamples.prop('disabled', true); 
        this.containers.userinput.blur();
        this.containers.userinput.prop('disabled', true); 
    }

    private inputCallback;
    private handleUserInput() {
        var userinput = this.containers.userinput.val().trim();
        this.disableInput();
        this.printSystemOutput(userinput, "user");
        this.inputCallback(userinput);
        return false;
    }

    private isSpeaking() {
        return this.useSpeech && window && window.speechSynthesis && window.speechSynthesis.speaking;
    }

}


//////////////////////////////////////////////////////////////////////
// Additions to the TypeScript standard library 

// Support for SVG animations

interface Element {
    beginElementAt(timeout: number) : void;
}

// Support for HTML5 speech synthesis

interface Window { 
    speechSynthesis: {speaking : boolean;
                      speak(sputt: SpeechSynthesisUtterance) : void}; 
}

declare class SpeechSynthesisUtterance {
    constructor(utterance: string); 
}
