///<reference path="World.ts"/>
///<reference path="lib/node.d.ts"/>
///<reference path="Interpreter.ts"/>

class ANSIWorld implements World {

    public previousRes : Interpreter.Result[] = [];

    constructor(
        public currentState : WorldState,
        public worldHeight = 40,
        public horizontalAnimationPause = 10,
        public verticalAnimationPause = 15
    ) {
        if (!this.currentState.arm) this.currentState.arm = 0;
        if (this.currentState.holding) this.currentState.holding = null;
        var readline = require('readline');
        this.readlineInterface = readline.createInterface(process.stdin, process.stdout);
    }

    //////////////////////////////////////////////////////////////////////
    // Public methods

    public readUserInput(prompt, callback) {
        this.inputCounter++;
        console.log(this.showcursor());
        this.readlineInterface.question("[" + this.inputCounter + "] " + prompt, callback);
    }

    public printSystemOutput(output, participant?) {
        this.outputCounter++;
        if (participant == "user") {
            output = '"' + output + '"';
        }
        console.log(this.gotoxy(0, this.worldHeight + 3) + this.clearline() + 
                    "[" + this.outputCounter + "] " + output);
    }

    public printDebugInfo(info) {
        this.printSystemOutput("DEBUG: " + info);
    }

    public printError(error, message?) {
        if (message) {
            error += ": " + message;
        }
        this.printSystemOutput(error, "error");
    }

    public printWorld(callback? : ()=>void) {
        console.log(this.clearscreen());
        var timeout = 0;
        for (var stacknr = 0; stacknr < this.currentState.stacks.length; stacknr++) {
            for (var pos = 0; pos < this.currentState.stacks[stacknr].length; pos++) {
                var obj = this.getObject(stacknr, pos);
                ((obj) => setTimeout(() => {
                    this.printObject(obj.x, obj.y, obj.color, obj.def);
                }, timeout))(obj);
                timeout += 50;
            }
            var x = this.getXPos(stacknr);
            console.log(this.gotoxy(x - this.stackWidth/2, this.worldHeight) + 
                        "|" + Array(this.stackWidth).join("_") + "|");
            console.log(this.gotoxy(x - 1, this.worldHeight + 1) + stacknr);
        }
        setTimeout(() => {
            var obj = this.getObject();
            if (obj) this.printObject(obj.x, obj.y, obj.color, obj.def);
            var arm = this.getArm();
            this.printObject(arm.x, arm.y, arm.color, arm.def);
        }, timeout);
        if (callback) {
            setTimeout(callback, timeout+1);
        }
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
                        world.printError(err);
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
    // Private variables

    private readlineInterface;
    private inputCounter = 0;
    private outputCounter = 0;

    //////////////////////////////////////////////////////////////////////
    // ASCII art for objects

    private stackWidth = 15;

    private objectData = {
        arm: ["||", 
              "##"],

        box: {small: ["\\        /",
                      "\\______/"],
              large: ["\\            /",
                      "\\__________/"]},

        pyramid: {small: ["____",
                          "/    \\",
                          "/______\\"],
                  large: ["______",
                          "/      \\",
                          "/        \\",
                          "/__________\\"]},

        plank: {small: ["________",
                        "|______|"],
                large: ["____________",
                        "|__________|"]},

        table: {small: ["________",
                        "|  |",
                        "|  |"],
                large: ["____________",
                        "|    |",
                        "|    |"]},

        brick: {small: ["______",
                        "|    |",
                        "|    |",
                        "|____|"],
                large: ["__________",
                        "|        |",
                        "|        |",
                        "|        |",
                        "|________|"]},

        ball: {small: ["__",
                       "/  \\",
                       "(    )",
                       "\\__/"],
               large: ["__",
                       "+    +",
                       "/      \\",
                       "(        )",
                       "\\      /",
                       "+ __ +"]}
    };

    //////////////////////////////////////////////////////////////////////
    // ANSI terminal codes
    // http://en.wikipedia.org/wiki/ANSI_escape_code

    private CSI = '\x1b[';
    private ansiColors = {black: 30, red: 31, green: 32, yellow: 33, blue: 34, 
                          magenta: 35, cyan: 36, white: 37, reset: 39};

    private gotoxy(x: number, y: number) : string {
        return this.CSI + Math.floor(y+1) + ';' + Math.floor(x+1) + 'H';
    }

    private setgraphics(code: number) : string {
        return this.CSI + code + 'm';
    }

    private setcolor(col: string) : string {
        return this.setgraphics(this.ansiColors[col]);
    }

    private setbold() : string {
        return this.setgraphics(1);
    }

    private cleargraphics() : string {
        return this.setgraphics(0);
    }

    private clearscreen() : string {
        return this.CSI + '2J';
    }

    private clearline() : string {
        return this.CSI + '2K';
    }

    private hidecursor() : string {
        return this.CSI + '?25l';
    }

    private showcursor() : string {
        return this.gotoxy(0, this.worldHeight + 4) + this.CSI + '?25h';
    }

    //////////////////////////////////////////////////////////////////////
    // Methods for getting information about objects

    private getXPos(stack: number) : number {
        return this.stackWidth * (stack + 1);
    }

    private getArm() : {x:number; y:number; color:string; def:string[]} {
        return {x:this.getXPos(this.currentState.arm), 
                y:1, color:'black', def:this.objectData.arm};
    }

    private getObject(stacknr?: number, stackpos?: number) 
    : {x:number; y:number; color:string; def:string[]} {
        var x, y, id, form, size, color, obj;
        if (stacknr == null && stackpos == null) {
            x = this.getXPos(this.currentState.arm);
            y = 2; // form == 'box' ? 1 : 2;
            id = this.currentState.holding;
            if (!id) return null;
            form = this.currentState.objects[id].form;
            size = this.currentState.objects[id].size;
            color = this.currentState.objects[id].color;
            obj = this.objectData[form][size];
        } else {
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
        return {x:x, y:y, color:color, def:obj};
    }

    //////////////////////////////////////////////////////////////////////
    // Methods for printing objects

    private printObject(xmid: number, ytop: number, color: string, objdef: string[]) {
        var outstr = this.hidecursor()
        for (var i = 0; i < objdef.length; i++) {
            var pos = this.gotoxy(xmid - objdef[i].length/2, ytop + i);
            outstr += pos + this.setcolor(color) + this.setbold() + objdef[i] + this.cleargraphics();
        }
        outstr += this.showcursor();
        console.log(outstr);
    }

    private clearObject(xmid: number, ytop: number, objdef: string[]) {
        var outstr = this.hidecursor()
        for (var i = 0; i < objdef.length; i++) {
            var pos = this.gotoxy(xmid - objdef[i].length/2, ytop + i);
            outstr += (pos + Array(objdef[i].length+1).join(" "));
        }
        outstr += this.showcursor();
        console.log(outstr);
    }

    //////////////////////////////////////////////////////////////////////
    // The basic actions: left, right, pick, drop

    private getAction(act) {
        var actions = {p:this.pick, d:this.drop, l:this.left, r:this.right};
        return actions[act.toLowerCase()];
    }

    private left(callback: ()=>void) {
        if (this.currentState.arm <= 0) {
            throw "Already at left edge!";
        }
        var x0 = this.getArm().x;
        this.currentState.arm--;
        var arm = this.getArm();
        var holding = this.getObject();
        var timeout = 0;
        for (var x = x0; x > arm.x; x--) {
            ((x) => setTimeout(() => {
                if (holding) this.clearObject(x, holding.y, holding.def);
                this.clearObject(x, arm.y, arm.def);
                if (holding) this.printObject(x-1, holding.y, holding.color, holding.def);
                this.printObject(x-1, arm.y, arm.color, arm.def);
            }, timeout))(x);
            timeout += this.horizontalAnimationPause;
        }
        setTimeout(() => {
            if (holding) this.printObject(holding.x, holding.y, holding.color, holding.def);
            this.printObject(arm.x, arm.y, arm.color, arm.def);
        }, timeout);
        setTimeout(callback, timeout+1);
    }

    private right(callback: ()=>void) {
        if (this.currentState.arm >= this.currentState.stacks.length - 1) {
            throw "Already at right edge!";
        }
        var x0 = this.getArm().x;
        this.currentState.arm++;
        var arm = this.getArm();
        var holding = this.getObject();
        var timeout = 0;
        for (var x = x0; x < arm.x; x++) {
            ((x) => setTimeout(() => {
                if (holding) this.clearObject(x, holding.y, holding.def);
                this.clearObject(x, arm.y, arm.def);
                if (holding) this.printObject(x+1, holding.y, holding.color, holding.def);
                this.printObject(x+1, arm.y, arm.color, arm.def);
            }, timeout))(x);
            timeout += this.horizontalAnimationPause;
        }
        setTimeout(() => {
            if (holding) this.printObject(holding.x, holding.y, holding.color, holding.def);
            this.printObject(arm.x, arm.y, arm.color, arm.def);
        }, timeout);
        setTimeout(callback, timeout+1);
    }

    private pick(callback: ()=>void) {
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
        // move arm down
        for (var y = arm.y; y < obj.y; y++) {
            ((y) => setTimeout(() => {
                this.printObject(arm.x, y, arm.color, arm.def);
            }, timeout))(y);
            timeout += this.verticalAnimationPause;
        }
        // move arm & object up
        for (var y = obj.y; y > arm.y+1; y--) {
            ((y) => setTimeout(() => {
                this.clearObject(obj.x, y, obj.def);
                this.printObject(obj.x, y-1, obj.color, obj.def);
                this.printObject(arm.x, y-2, arm.color, arm.def);
            }, timeout))(y);
            timeout += this.verticalAnimationPause;
        }
        var obj = this.getObject();
        setTimeout(() => {
            this.printObject(obj.x, obj.y, obj.color, obj.def);
            this.printObject(arm.x, arm.y, arm.color, arm.def);
        }, timeout);
        setTimeout(callback, timeout+1);
    }

    private drop(callback: ()=>void) {
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
        // move arm & object down
        for (var y = arm.y; y < obj.y; y++) {
            ((y) => setTimeout(() => {
                this.clearObject(obj.x, y, obj.def);
                this.printObject(obj.x, y+1, obj.color, obj.def);
                this.printObject(arm.x, y, arm.color, arm.def);
            }, timeout))(y);
            timeout += this.verticalAnimationPause;
        }
        setTimeout(() => {
            this.printObject(obj.x, obj.y, obj.color, obj.def);
        }, timeout);
        // move arm up
        for (var y = obj.y-2; y > arm.y; y--) {
            ((y) => setTimeout(() => {
                this.clearObject(arm.x, y, arm.def);
                this.printObject(arm.x, y-1, arm.color, arm.def);
            }, timeout))(y);
            timeout += this.verticalAnimationPause;
        }
        setTimeout(() => {
            this.printObject(arm.x, arm.y, arm.color, arm.def);
        }, timeout);
        setTimeout(callback, timeout+1);
    }

}
