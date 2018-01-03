

import {SimpleObject} from "./Types";
import {World, WorldState} from "./World";

/********************************************************************************
** TextWorld

This is the implementation of the World interface, for the command-line version.
It is used by 'shrdlite-offline.ts'.

You don't have to edit this file.
********************************************************************************/

export class TextWorld implements World {

    constructor(public currentState : WorldState) {
        if (!this.currentState.arm) this.currentState.arm = 0;
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
        var stacks : string[][] = this.currentState.stacks;
        var maxHeight : number = Math.max.apply(null, stacks.map((s) => s.length));
        var stackWidth : number = 3 + Math.max.apply(null, stacks.map((s) => {
            return Math.max.apply(null, s.map((o) => o.length))
        }));
        
        console.log(" " + repeat("_", stacks.length * stackWidth - 1));
        var left = repeat(" ", this.currentState.arm * stackWidth);
        var right = repeat(" ", (stacks.length - this.currentState.arm - 1) * stackWidth);
        var line = left + center("\\_/", stackWidth) + right;
        console.log("|" + line.slice(1) + "|");
        if (this.currentState.holding) {
            var line = left + center(this.currentState.holding, stackWidth) + right;
            console.log("|" + line.slice(1) + "|");
        }
        for (var y = maxHeight; y >= 0; y--) {
            var line = "";
            for (var x = 0; x < stacks.length; x++) {
                var obj = stacks[x][y] || "";
                line += center(obj, stackWidth);
            }
            console.log("|" + line.slice(1) + "|");
        }
        console.log("+" + repeat(repeat("-", stackWidth-1) + "+", stacks.length));
        var line = "";
        for (var x = 0; x < stacks.length; x++) {
            line += center(x + "", stackWidth);
        }
        console.log(line);
        console.log();

        //// Uncomment these if you want to print a list of the object identifiers and their parameters:
        // var printObject = (obj : string) => {
        //     var props : SimpleObject = world.currentState.objects[obj];
        //     console.log(center(obj, stackWidth) + ": " +
        //                 props.form + ", " + props.size + ", " + props.color
        //                );
        // };
        // if (this.currentState.holding) printObject(this.currentState.holding);
        // stacks.forEach((stack : string[]) => stack.forEach(printObject));
        // console.log();

        if (callback) callback();
    }

    public performPlan(plan : string[], callback? : () => void) : void {
        var planctr = 0;
        var world = this;
        function performNextAction() {
            planctr++;
            if (plan && plan.length > 0) {
                var item = (<string>plan.shift()) .trim();
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
        this.currentState.holding = <string> this.currentState.stacks[stack].pop();
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

}

//////////////////////////////////////////////////////////////////////
// Utilities

function center(str : string, width : number) : string {
	var padlen = width - str.length;
	if (padlen > 0) {
        str = Array(Math.floor((padlen+3)/2)).join(" ") + str + Array(Math.floor((padlen+2)/2)).join(" ");
	}
    return str;
}

function repeat(str : string, n : number) : string {
    return Array(1 + n).join(str);
}

