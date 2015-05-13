///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="AStar.ts"/>

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

    export class Move {
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

    export module CheckPhysics {
        
        var objects: { [s:string]: ObjectDefinition; };
        
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
                    res = !(o1.form=="box" && (o2.size=="small" || o1.size=="large"));
                    break;
                default:
                    res = true;
            }
            return res && (o2.size =="large" || o1.size=="small") && (o1.form!="ball" || o2.form=="box");
        }
        
        export function possibleMoves(stacks: string[][]) : Move[] {
            var moves: Move[] = [];
            for(var p=0; p<stacks.length; p++) {
                for(var d=0; d<stacks.length; d++) {
                    if(p!=d && stacks[p].length>0) {
                        if(stacks[d].length==0 || this.canBeOn(objects[stacks[p][stacks[p].length-1]] , objects[stacks[d][stacks[d].length-1]])) {
                            moves.push(new Move(p,d));
                        }
                    }
                }
            }
            return moves;
        }
        
        export function setObjects(o: { [s:string]: ObjectDefinition; }) {
            objects = o;
        }

    }

    export class State {

        stacks: string[][];
        moves: Move[];
        hash: string;

        constructor(sta: string[][], mo: Move[]) {
            this.stacks = sta;
            this.moves = mo;
            this.computeHash();
        }
        
        public computeHash() {
            this.hash = this.stacks.join("|");
        }

    }

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
        CheckPhysics.setObjects(state.objects);
        var plans: Plan[] = [];
        var i_Min = 0;
        var len_Min = Number.POSITIVE_INFINITY;
        if(state.holding) { // We drop the hold object for the AStar resolution.
            state.stacks[state.arm].push(state.holding);
        }
        for(var i=0; i<intprt.length; i++) { // Plan each interpretation.
            var plan = new Plan(state.arm);
            var moves = solveByAStar(new State(state.stacks,[]), intprt[i]);
            if(state.holding && moves.length!=0) { // If the arm was holding something
                if(moves[0].pick==state.arm) {
                    var drop=moves.shift().drop;
                    if(drop!=-1) { // In the stupid case where the arm already holds the object.
                        plan.move(drop);
                        plan.drop();
                    }
                } else {
                    plan.drop();
                }
            }
            var pick=-1;
            if(moves.length!=0 && moves[moves.length-1].drop==-1) { // If the arm should hold something at the end.
                pick=moves.pop().pick;
            }
            plan.movesToPlan(moves); // We plan all the moves.
            if(pick!=-1) {
                plan.move(pick);
                plan.pick();
            }
            if(plan.plan.length<len_Min) { // To select the shorter planning.
                len_Min = plan.plan.length;
                i_Min=i;
            }
            plans.push(plan);
        }
        if(state.holding) { // We remove the hold object from the pile.
            state.stacks[state.arm].pop();
        }
        return plans[i_Min].plan;
    }
    
    /**
     * Return the location of an object in the stacks :
     * [column, row from bottom, row from top]
     * Each position starts from 0.
     * Return [-1,-1,-1] if not found.
     */
    export function getLocation(obj : string, stacks : string[][]) : number[] {
        var col : number = -1;
        var row : number = -1;
        if(obj=="floor") { // Return the location of the less loaded floor.
            row=stacks[0].length;
            col=0;
            for (var c=1; c<stacks.length; c++) {
                if(stacks[c].length<row) {
                    row=stacks[c].length;
                    col=c;
                }
            }
            return [col,-1,row];
        } else {
            for (col=0; col<stacks.length && row<0; col++) {
                row = stacks[col].indexOf(obj);
            }
            col--;
            return [(row==-1) ? -1 : col,row,(row==-1) ? -1 : stacks[col].length-1-row];
        }
    }

    /**
     * The heuristic ! It returns the minimal number of moves to solve the goals.
     * It basically relies on the number of objects piled over the concerned objects.
     * The calculation depends on the relation used for each goal.
     */
    function heuristic(state: Planner.State, goalConditions: Interpreter.Literal[]) : number {
        var score = 0;
        for (var goal=0; goal<goalConditions.length; goal++) {
            var g = goalConditions[goal];
            if (g.rel == "ontop" ) {
                var top : number[] = Planner.getLocation(g.args[0], state.stacks);
                if(!(top[1]==0 && g.args[1]=="floor")) {
                    var bottom : number[] = Planner.getLocation(g.args[1], state.stacks);
                    if(top[0]!=bottom[0]) {
                        score+=top[2]+bottom[2]+1;
                    } else if(top[1]!=bottom[1]+1) {
                        score+=Math.max(top[2],bottom[2])+1;
                    }
                }
            } else if(g.rel == "beside") {
                var o1 : number[] = Planner.getLocation(g.args[0], state.stacks);
                var o2 : number[] = Planner.getLocation(g.args[1], state.stacks);
                if(Math.abs(o1[0]-o2[0])!=1) {
                    score+=Math.min(o1[2],o2[2])+1;
                }
            } else if(g.rel == "above" || g.rel == "under") {
                var top : number[] = Planner.getLocation(g.args[(g.rel=="above") ? 0 : 1], state.stacks);
                var bottom : number[] = Planner.getLocation(g.args[(g.rel=="above") ? 1 : 0], state.stacks);
                if(!(top[0]==bottom[0] && bottom[1]<top[1])) {
                    score+=top[2]+1;
                }
            } else if(g.rel == "right" || g.rel == "left") {
                var right : number[] = Planner.getLocation(g.args[(g.rel=="right") ? 0 : 1], state.stacks);
                var left : number[] = Planner.getLocation(g.args[(g.rel=="right") ? 1 : 0], state.stacks);
                if(!(right[0]>left[0])) {
                    if(right[0]==0) {
                        score+=right[2]+1;
                    }
                    if(left[0]==state.stacks.length-1) {
                        score+=left[2]+1;
                    }
                    if(right[0]!=0 && left[0]!=state.stacks.length-1) {
                        score+=Math.min(right[2],left[2])+1;
                    }
                }
            } else if(g.rel == "holding") {
                var obj : number[] = Planner.getLocation(g.args[0], state.stacks);
                score+=obj[2];
            }
        }
        return score;
    }

    /**
     * Returns the moves to reach the goalConditions from the state Node.
     */
    function solveByAStar(state: State, goalConditions: Interpreter.Literal[]) : Move[] {
        return AStar.astar(new AStar.Node(state), goalConditions, heuristic);
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
