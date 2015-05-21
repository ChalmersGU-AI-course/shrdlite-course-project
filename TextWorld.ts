///<reference path="World.ts"/>
///<reference path="lib/node.d.ts"/>

class TextWorld implements World {

    constructor(public currentState: WorldState) {
        if (!this.currentState.arm1) this.currentState.arm1 = 0;
        if (this.currentState.holding1) this.currentState.holding1 = null;

        if (!this.currentState.arm2) this.currentState.arm2 = 0;
        if (this.currentState.holding2) this.currentState.holding2 = null;
    }

    public readUserInput(prompt, callback) {
        throw "Not implemented!";
    }

    public printSystemOutput(output, participant?) {
        if (participant == "user") {
            output = '"' + output + '"';
        }
        console.log(output);
    }

    public printDebugInfo(info) {
        console.log(info);
    }

    public printError(error, message?) {
        console.error(error, message);
    }

    public printWorld(callback? : ()=>void) {
        console.log();
        var minArm = Math.min(this.currentState.arm1, this.currentState.arm2);
        var maxArm = Math.max(this.currentState.arm1, this.currentState.arm2);
        var minArmName = this.currentState.arm1 > this.currentState.arm2 ? '2' : '1';
        var maxArmName = this.currentState.arm1 > this.currentState.arm2 ? '1' : '2';

        var stacks = this.currentState.stacks;
        var maxHeight = Math.max.apply(null, stacks.map((s) => {return s.length}));
        var stackWidth = 3 + Math.max.apply(null, stacks.map((s) => {
            return Math.max.apply(null, s.map((o) => {return o.length}))
        }));
        var line = Array(minArm * stackWidth).join(" ");
        var line2 = " " + Array((maxArm - minArm - 1) * stackWidth).join(" ");
        console.log(line + this.centerString("\\"+minArmName+"/", stackWidth) +
            line2 + this.centerString("\\"+maxArmName+"/", stackWidth));
        if (this.currentState.holding1) {
            console.log(line + this.centerString(this.currentState.holding1, stackWidth));
        }
        for (var y = maxHeight; y >= 0; y--) {
            var line = "";
            for (var x = 0; x < stacks.length; x++) {
                var obj = stacks[x][y] || "";
                line += this.centerString(obj, stackWidth);
            }
            console.log(line);
        }
        console.log("+" + Array(1+stacks.length).join(Array(stackWidth).join("-") + "+"));
        var line = "";
        for (var x = 0; x < stacks.length; x++) {
            line += this.centerString(x+"", stackWidth);
        }
        console.log(line);
        console.log();
        var printObject = (obj) => {
            var props = this.currentState.objects[obj];
            console.log(this.centerString(obj, stackWidth) + ": " +
                        Object.keys(props).map((k) => {return props[k]}).join(", "));
        };
        if (this.currentState.holding1) printObject(this.currentState.holding1);
        stacks.forEach((stack) => stack.forEach(printObject));
        console.log();
        if (callback) callback();
    }

    public performPlan(plan, callback?) {
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
                    } catch(err) {
                        world.printSystemOutput("ERROR: " + err);
                        if (callback) setTimeout(callback, 1);
                    }
                } else {
                    if (item && item[0] != "#") {
                        world.printSystemOutput(item);
                    }
                    performNextAction();
                }
            } else {
                if (callback) setTimeout(callback, 1);
            }
        }
        performNextAction();
    }

    //////////////////////////////////////////////////////////////////////
    // The basic actions: left, right, pick, drop

    private getAction(act) {
        var actions = {p:this.pick, d:this.drop, l:this.left, r:this.right};
        return actions[act.toLowerCase()];
    }

    private left(callback: ()=>void) {
        if (this.currentState.arm1 <= 0) {
            throw "Already at left edge!";
        }
        this.currentState.arm1--;
        callback();
    }

    private right(callback: ()=>void) {
        if (this.currentState.arm1 >= this.currentState.stacks.length - 1) {
            throw "Already at right edge!";
        }
        this.currentState.arm1++;
        callback();
    }

    private pick(callback: ()=>void) {
        if (this.currentState.holding1) {
            throw "Already holding something!";
        }
        var stack = this.currentState.arm1;
        var pos = this.currentState.stacks[stack].length - 1;
        if (pos < 0) {
            throw "Stack is empty!";
        }
        this.currentState.holding1 = this.currentState.stacks[stack].pop();
        callback();
    }

    private drop(callback: ()=>void) {
        if (!this.currentState.holding1) {
            throw "Not holding anything!";
        }
        var stack = this.currentState.arm1;
        this.currentState.stacks[stack].push(this.currentState.holding1);
        this.currentState.holding1 = null;
        callback();
    }

    //////////////////////////////////////////////////////////////////////
    // Utilities

    private centerString(str, width) {
		var padlen = width - str.length;
	    if (padlen > 0) {
            str = Array(Math.floor((padlen+3)/2)).join(" ") + str + Array(Math.floor((padlen+2)/2)).join(" ");
	    }
        return str;
    }

}
