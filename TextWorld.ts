///<reference path="World.ts"/>
///<reference path="lib/node.d.ts"/>

class TextWorld implements World {

    constructor(public currentState : WorldState) {
        if (!this.currentState.arm) this.currentState.arm = 0;
        if (this.currentState.holding) this.currentState.holding = null;
    }

    public readUserInput(prompt : string, callback : (input:string) => void) : void {
        throw "Not implemented!";
    }

    public printSystemOutput(output : string, participant? : string) : void {
        if (participant == "user") {
            output = '"' + output + '"';
        }
        console.log(output);
    }

    public printDebugInfo(info : string) : void {
        console.log(info);
    }

    public printError(error : string, message? : string) : void {
        console.error(error, message);
    }

    public printWorld(callback? : () => void) {
        var world = this;
        console.log();
        var stacks : Stack[] = this.currentState.stacks;
        var maxHeight : number = Math.max.apply(null, stacks.map((s) => {return s.length}));
        var stackWidth : number = 3 + Math.max.apply(null, stacks.map((s) => {
            return Math.max.apply(null, s.map((o) => {return o.length}))
        }));
        var line : string = Array(this.currentState.arm * stackWidth).join(" ");
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
        console.log("+" + Array(1+stacks.length).join(Array(stackWidth).join("-") + "+"));
        var line = "";
        for (var x = 0; x < stacks.length; x++) {
            line += this.centerString(x+"", stackWidth);
        }
        console.log(line);
        console.log();
        var printObject = (obj : string) => {
            var props : ObjectDefinition = world.currentState.objects[obj];
            console.log(this.centerString(obj, stackWidth) + ": " +
                        props.form + ", " + props.size + ", " + props.color
                       );
                        // Object.keys(props).map((k) => {return props[k]}).join(", "));
        };
        if (this.currentState.holding) printObject(this.currentState.holding);
        stacks.forEach((stack : string[]) => stack.forEach(printObject));
        console.log();
        if (callback) callback();
    }

    public performPlan(plan : string[], callback? : () => void) : void {
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

    private getAction(act : string) : (callback:()=>void) => void {
        var actions : {[act:string] : (callback:()=>void) => void}
            = {p:this.pick, d:this.drop, l:this.left, r:this.right};
        return actions[act.toLowerCase()];
    }

    private left(callback : () => void) : void {
        if (this.currentState.arm <= 0) {
            throw "Already at left edge!";
        }
        this.currentState.arm--;
        callback();
    }

    private right(callback : () => void) : void {
        if (this.currentState.arm >= this.currentState.stacks.length - 1) {
            throw "Already at right edge!";
        }
        this.currentState.arm++;
        callback();
    }

    private pick(callback: () => void) : void {
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
    }

    private drop(callback: () => void) : void {
        if (!this.currentState.holding) {
            throw "Not holding anything!";
        }
        var stack = this.currentState.arm;
        this.currentState.stacks[stack].push(this.currentState.holding);
        this.currentState.holding = null;
        callback();
    }

    //////////////////////////////////////////////////////////////////////
    // Utilities

    private centerString(str : string, width : number) : string {
		var padlen = width - str.length;
	    if (padlen > 0) {
            str = Array(Math.floor((padlen+3)/2)).join(" ") + str + Array(Math.floor((padlen+2)/2)).join(" ");
	    }
        return str;
    }

}
