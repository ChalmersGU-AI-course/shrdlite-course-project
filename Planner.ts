///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Graph.ts"/>
///<reference path="lib/collections.ts"/>

module Planner {

    class ShrdliteNodeFilter implements GraphFilter {
        public constructor(protected intptr: Interpreter.Literal) {

        }
        public costTo(node: ShrdliteNode): number {
            switch (this.intptr.rel) {
                case 'holding':
                    if (node.state.holding == this.intptr.args[0])
                        return 0;
                    break;
                case 'ontop':
                case 'inside':
                    for (var i = 0; i < this.state.stacks.length; ++i) {
                        for (var j = 0; j < this.state.stacks[i].length; ++j) {
                            if (node.state.states[i][j] == this.intptr.args[0] && node.state.states[i][j+1]==this.intptr.args[1])
                                return 0;
                        }
                    }
                    break;
                case 'above':
                    for (var i = 0; i < this.state.stacks.length; ++i) {
                        for (var j = 0; j < this.state.stacks[i].length; ++j) {
                            for ( var k = j; k < this.state.stacks[i].length; ++k ) { //some redundant chacks here
                                if (node.state.states[i][j] == this.intptr.args[0] && node.state.states[i][j+k]==this.intptr.args[1])
                                    return 0;
                            }
                        }
                    }
                    break;
                case 'beside':
                for (var i = 0; i < this.state.stacks.length; ++i) {
                        for (var j = 0; j < this.state.stacks[i].length; ++j) {
                            for ( var k = 0; k < this.state.stacks[i].length; ++k){
                                if (node.state.states[i][j] == this.intptr.args[0] && node.state.states[i+1][k]==this.intptr.args[1])
                                    return 0;                      
                            }
                        }
                    }
                    break;
                case 'leftof':
                    for (var i = 0; i < this.state.stacks.length; ++i) {
                        for (var j = 0; j < this.state.stacks[i].length; ++j) {
                            for ( var k = 0; k < this.state.stacks[i].length; ++k){
                                if (node.state.states[i][j] == this.intptr.args[0] && node.state.states[i+1][k]==this.intptr.args[1])
                                    return 0;                      
                            }
                        }
                    }
                    break;
                case 'rightof':
                    for (var i = 0; i < this.state.stacks.length; ++i) {
                        for (var j = 0; j < this.state.stacks[i].length; ++j) {
                            for ( var k = 0; k < this.state.stacks[i].length; ++k){
                                if (node.state.states[i][j] == this.intptr.args[1] && node.state.states[i+1][k]==this.intptr.args[0])
                                    return 0;                      
                            }
                        }
                    }
                    break;
                case 'under':
                    for (var i = 0; i < this.state.stacks.length; ++i) {
                        for (var j = 0; j < this.state.stacks[i].length; ++j) {
                            for ( var k = j; k < this.state.stacks[i].length; ++k){
                                if (node.state.states[i][j] == this.intptr.args[1] && node.state.states[i][k]==this.intptr.args[0])
                                    return 0;                      
                            }
                        }
                    }
                    break;
                default:
                    break;
            }
            return 1;
        }
    }

    class ShrdliteNode implements GraphNode<number> {
        public name: string;
        public updateName() {
            this.name = this.toString();
        }
        private objects: { [s: string]: ObjectDefinition; };

        public constructor(public state: WorldState) {
            this.name = this.toString();
        }


        costTo(to: ShrdliteNode): number {
            return Math.abs(to.state.arm - this.state.arm);
        }

        neighbours(): { node: ShrdliteNode; edge: number }[] {
            var path: Array<{ node: ShrdliteNode; edge: number }> = [];

            //take up object
            if (this.state.holding == null) {

                for (var i = 0; i < this.state.stacks.length; ++i)
                    if (this.state.stacks[i].length > 0) {
                        var newNode = new ShrdliteNode(this.cloneOfWorld());
                        newNode.state.arm = i;
                        newNode.state.holding = newNode.state.stacks[i].pop();
                        newNode.updateName(); //Overhead but nice anyway
                        path.push({ node: newNode, edge: i });
                    }
            }
            else {
                
                //put down object
                for (var i = 0; i < this.state.stacks.length; ++i) {
                    if (this.isPhysicallyPossible(i)) {
                        var newNode = new ShrdliteNode(this.cloneOfWorld());
                        newNode.state.arm = i;
                        newNode.state.stacks[i].push(newNode.state.holding);
                        newNode.state.holding = null;
                        newNode.updateName(); //Overhead but nice anyway
                        path.push({ node: newNode, edge: i });
                    }
                }
            }
            return path;
        }

        /**
		* Check if the transition is physically possible
		*
		* @param {number} number of the stack you want to check
		* @return {boolean} true if it is possible
		*/
        isPhysicallyPossible(n: number): boolean {
            //which object is on top?
            var topPos: number = this.state.stacks[n].length - 1;

            //destination object
            var dest;
            if (topPos >= 0) { //there is actually an object on this stack
                dest = this.state.objects[this.state.stacks[n][topPos]];
            } else { //otherwise use the floor object
                dest = this.state.objects["floor"];
            }

            //origin object from the crane
            var orig = this.state.objects[this.state.holding];

            //Balls must be in boxes or on the floor.
            if (orig.form == "ball" && dest.form != "floor" && dest.form != "box") {
                return false;
            }

            //Large boxes cannot be supported by large pyramids.
            if ((orig.size == "large" && orig.form == "box") && (dest.size == "large" && dest.size == "pyramid")) {
                return false;
            }

            //Small boxes cannot be supported by small bricks or pyramids.
            if ((orig.size == "small" && orig.form == "box") && (dest.size == "small" && (dest.form == "pyramid" || dest.form == "brick"))) {
                return false;
            }

            //Boxes cannot contain pyramids, planks or boxes of the same size.
            if ((orig.form == "pyramid" || orig.form == "box" || orig.form == "plank") && (orig.size == dest.size) && (dest.form == "box")) {
                return false;
            }

            //Balls cannot support other objects.
            if (dest.form == "ball") {
                return false;
            }

            //Small objects cannot support large objects.
            if (orig.size == "large" && dest.size == "small") {
                return false;
            }

            return true;
        }

        toString(): string {
            var str: string = "S:";
            for (var i = 0; i < this.state.stacks.length; ++i) {
                for (var j = 0; j < this.state.stacks[i].length; ++j) {
                    str += this.state.stacks[i][j] + ",";
                }
                str += ";"
            }
            str += ";H:" + this.state.holding + ";";

            return str;
        }

        private cloneOfWorld(): WorldState {
            var stackcopy: string[][] = [];

            for (var i = 0; i < this.state.stacks.length; ++i) {
                stackcopy[i] = [];
                for (var j = 0; j < this.state.stacks[i].length; ++j)
                    stackcopy[i][j] = this.state.stacks[i][j];
            }

            return {arm: this.state.arm, examples: this.state.examples, holding: this.state.holding, objects: this.state.objects, stacks: stackcopy };
        }
    }

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretations: Interpreter.Result[], currentState: WorldState): Result[] {
        var plans: Result[] = [];
        interpretations.forEach((intprt) => {
            var plan: Result = <Result>intprt;
            plan.plan = planInterpretation(plan.intp, currentState);
            plans.push(plan);
        });
        if (plans.length) {
            return plans;
        } else {
            throw new Planner.Error("Found no plans");
        }
    }

    export interface Result extends Interpreter.Result { plan: string[]; }


    export function planToString(res: Result): string {
        return res.plan.join(", ");
    }


    export class Error implements Error {
        public name = "Planner.Error";
        constructor(public message?: string) { }
        public toString() { return this.name + ": " + this.message }
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    function planInterpretation(intprt: Interpreter.Literal[][], state: WorldState): Array<string> {
        //Add my amazing code here!
        var currentNode: ShrdliteNode = new ShrdliteNode(state);
        var targetFilter: ShrdliteNodeFilter = new ShrdliteNodeFilter(intprt[0][0]);



        //var targetNode: ShrdliteNode = new ShrdliteNode(intprt);

        var g: Graph<ShrdliteNode, number> = new Graph<ShrdliteNode, number>([currentNode], null);
        var picks: { node: ShrdliteNode; edge: number }[] = <{ node: ShrdliteNode; edge: number }[]>g.fintPathToFilter<ShrdliteNodeFilter>(currentNode, targetFilter);

        // Overhead med noder... borde kanske edgen vara 'l', 'r', 'p', 'd' direkt? och bara returnera den?
        // This function returns a dummy plan involving a random stack
        var plan: Array<string> = [];

        if (picks == undefined)
            return ['r', 'l'];


        while (picks.length > 0) {
            var pick = picks.pop();
            var currentNode = pick.node;
            var pickstack = pick.edge;


            //Move arm!
            if (pickstack < currentNode.state.arm) {
                plan.push("Moving left");
                for (var i = currentNode.state.arm; i > pickstack; i--) {
                    plan.push("l");
                }
            } else if (pickstack > currentNode.state.arm) {
                plan.push("Moving right");
                for (var i = currentNode.state.arm; i < pickstack; i++) {
                    plan.push("r");
                }
            }

            if (currentNode.state.holding == null) {
                //Pick.. jaja.. hur fan ska vi veta om di pickar eller droppar. Kanske lika bra att göra edgena i string och köra med arm states? enklast att lösa med en bool antar jag så länge. DÅ slipper vi ett enormt stort statespace men frågan är om det är onödig optimering?
                var obj = currentNode.state.stacks[pickstack][currentNode.state.stacks[pickstack].length - 1];
                plan.push("Picking up the " + currentNode.state.objects[obj].form, "p");
            } else {
                var obj = currentNode.state.holding;
                plan.push("Dropping the " + currentNode.state.objects[obj].form, "d");
            }
        }

        return plan;
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
