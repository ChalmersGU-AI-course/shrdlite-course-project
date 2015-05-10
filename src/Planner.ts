///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>

module Planner {

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

    class Move {
        pick: number;
        drop: number;

        constructor(p: number, d: number) {
            this.pick = p;
            this.drop = d;
        }
    }

    class Plan {
        plan : string[];
        arm : number;

        constructor(armPos : number) {
            this.plan = [];
            this.arm = armPos;
        }

        public move(dest : number) {
            var diff = dest-this.arm;
            var m = diff<0 ? "l" : "r";
            for(var i = 0; i<Math.abs(diff); i++) {
                this.plan.push(m);
            }
            this.arm=dest;
        }

        public pick() {
            this.plan.push("p");
        }

        public drop() {
            this.plan.push("d");
        }

        /**
         * Compute the plan for a given list of moves.
         * Ex : moves=[[2,3],[2,4]] ==> if arm==1 : r p r d l p r r d
         */
        public movesToPlan(moves : Move[]) {
            moves.forEach((move) => {
                this.move(move.pick);
                this.pick();
                this.move(move.drop);
                this.drop();
            });
        }
    }

    module checkPhysics {
        
        export function canBeOn(o1: ObjectDefinition, o2: ObjectDefinition) : boolean {
            var res = false;
            switch(o2.form) {
                case "ball":
                    res = false;
                    break;
                case "box":
                    var ob=["pyramid","plank","box"];
                    res = ob.indexOf(o1.form)==-1 || o1.size!=o2.size;
                    break;
                case "brick":
                    res = !(o1.form=="box" && o2.size=="small");
                    break;
                case "pyramid":
                    res = !(o1.form=="box" && o1.size=="large");
                    break;
                default:
                    res = true;
            }
            return res && (o2.size =="large" || o1.size=="small") && (o1.form!="ball" || o2.form=="box");
        }

    }

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
        var plan = new Plan(state.arm);
        var moves = possibleMoves(state.stacks, state.objects);
        var s="";
        console.log("Interpretation !");
        for(var i=0; i<moves.length; i++) {
            s+=moves[i].pick+" --> "+moves[i].drop+" ; ";
        }
        console.log("Possible moves : "+s);
        
        plan.movesToPlan([moves[getRandomInt(state.stacks.length)]]);
        
        //intprt.map((alternativeGoal) => solveByAStar([new Node(state.stacks,[])], alternativeGoal));
        return plan.plan;
        /*
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

        return plan;*/
    }

    function possibleMoves(stacks: string[][], objects: { [s:string]: ObjectDefinition; }) : Move[] {
        var moves: Move[] = [];
        for(var p=0; p<stacks.length; p++) {
            for(var d=0; d<stacks.length; d++) {
                if(p!=d && stacks[p].length>0) {
                    if(stacks[d].length==0 || checkPhysics.canBeOn(objects[stacks[p][stacks[p].length-1]] , objects[stacks[d][stacks[d].length-1]])) {
                        moves.push(new Move(p,d));
                    }
                }
            }
        }
        return moves;
    }

    function getCol(obj : string, stacks : string[][]) : number {
        var i : number;
        for (i=0; i<stacks.length && stacks[i].indexOf(obj)<0; i++) {

        }
        if (i==stacks.length) {i=-1;}
        return i;
    }

    function getLocation(obj : string, stacks : string[][]) : number[] {
        var col : number = -1;
        var row : number = -1;
        for (col=0; col<stacks.length && row<0; col++) {
            row = stacks[col].indexOf(obj);
        }
        return [col,row];
    }

    /**
     * Simply returns the sum of objects piled over the concerned objects defined in objectToMove.
     * The contribution of each oject could be depending on their constraints.
     * (Ex : ball > box > pyramid > table and small > large)
     */
    function heuristic(objToMove : string[], stacks : string[][]) : number {
        var score = 0;
        for(var i=0; i<stacks.length; i++) {
            for(var j=0; j<stacks[i].length; j++) {
                if (objToMove.indexOf(stacks[i][j])>-1) {
                    score+=j;
                }
            }
        }
        return score;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
