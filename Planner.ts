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
                    break;
                case 'above':
                    break;
                case 'beside':
                    break;
                case 'leftof':
                    break;
                case 'rightof':
                    break;
                case 'under':
                    break;
                default:
                    break;
            }
            return 1;
        }
    }

    class ShrdliteNode implements GraphNode<number> {
        public name: string;
        private objects: { [s: string]: ObjectDefinition; };

        public constructor(public state: WorldState) {
            this.name = this.toString();
        }


        costTo(to: ShrdliteNode): number {
            return 1;
        }

        neighbours(): { node: ShrdliteNode; edge: number }[] {
            var path: Array<{ node: ShrdliteNode; edge: number }> = [];

            //take up object
            if (this.state.holding == null) {
                
                for (var i = 0; i < this.state.stacks.length; ++i)
                    if (this.state.stacks[i].length > 0)
                    {
                        var newNode = new ShrdliteNode(this.state);
                        //newNode.state.holding = i;

                        path.push({node: newNode, edge: i});

                        //TODO: ta bort från stack
                    }
            }
            else {
                //put down object
                for (var i = 0; i < this.state.stacks.length; ++i) {
										if (this.isPhysicallyPossible(i)) {
												path.push({node: new ShrdliteNode(this.state), edge: i});
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
			isPhysicallyPossible(n : number) : boolean {
				//which object is on top?
				var topPos : number = this.state.stacks[n].length - 1;
				
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
				if (orig.form == "ball" && (dest.form != "floor" || dest.form != "box")) {
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
            var str: string = "";
            for (var i = 0; i < this.state.stacks.length; ++i) {
                for (var j = 0; j < this.state.stacks[i].length; ++j) {
                    str += this.state.stacks[i][j] + ",";
                }
                str += ";"
            }
            str += ";;" + this.state.holding + ";;";

            return str;
        }
    }

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretations : Interpreter.Result[], currentState : WorldState) : Result[] {
        var plans : Result[] = [];
        interpretations.forEach((intprt) => {
            var plan : Result = <Result>intprt;
            plan.plan = planInterpretation(plan.intp, currentState);
            plans.push(plan);
        });
        if (plans.length) {
            return plans;
        } else {
            throw new Planner.Error("Found no plans");
        }
    }

    export interface Result extends Interpreter.Result {plan:string[];}


    export function planToString(res : Result) : string {
        return res.plan.join(", ");
    }


    export class Error implements Error {
        public name = "Planner.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    function planInterpretation(intprt: Interpreter.Literal[][], state: WorldState): string[]{
        //Add my amazing code here!
        var currentNode: ShrdliteNode = new ShrdliteNode(state);
        var targetFilter: ShrdliteNodeFilter = new ShrdliteNodeFilter(intprt[0][0]);



        //var targetNode: ShrdliteNode = new ShrdliteNode(intprt);

        var g: Graph<ShrdliteNode, number> = new Graph<ShrdliteNode, number>([currentNode], null);
        g.fintPathToFilter<ShrdliteNodeFilter>(currentNode, targetFilter);


        // This function returns a dummy plan involving a random stack
        do {
            var pickstack = getRandomInt(state.stacks.length);
        } while (state.stacks[pickstack].length == 0);
        var plan : string[] = [];

        // First move the arm to the leftmost nonempty stack
        if (pickstack < state.arm) {
            plan.push("Moving left");
            for (var i = state.arm; i > pickstack; i--) {
                plan.push("l");
            }
        } else if (pickstack > state.arm) {
            plan.push("Moving right");
            for (var i = state.arm; i < pickstack; i++) {
                plan.push("r");
            }
        }

        // Then pick up the object
        var obj = state.stacks[pickstack][state.stacks[pickstack].length-1];
        plan.push("Picking up the " + state.objects[obj].form,
                  "p");

        if (pickstack < state.stacks.length-1) {
            // Then move to the rightmost stack
            plan.push("Moving as far right as possible");
            for (var i = pickstack; i < state.stacks.length-1; i++) {
                plan.push("r");
            }

            // Then move back
            plan.push("Moving back");
            for (var i = state.stacks.length-1; i > pickstack; i--) {
                plan.push("l");
            }
        }

        // Finally put it down again
        plan.push("Dropping the " + state.objects[obj].form,
                  "d");

        return plan;
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
