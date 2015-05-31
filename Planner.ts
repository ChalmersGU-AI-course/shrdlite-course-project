///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>"/>
///<reference path="Searcher.ts"/>
///<reference path="InnerWorld.ts"/>

module Planner {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretations : Interpreter.Result[], currentState : WorldState) : Result[] {
        var plans : Result[] = [];
        interpretations.forEach((intprt) => {
            var plan : Result = <Result>intprt;
            plan.plan = planInterpretation(plan.intp, currentState);
            if(plan.plan != null)
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

    function planInterpretation(intprts : Interpreter.Literal[][], state : WorldState) : string[] {
        for(var i:number = 0; i < intprts.length; ++i) {
            var intprt = intprts[i];
            var plan : string[] = [];
            var planner : plannerViaSearch =
                            new plannerViaSearch(intprt, InnerWorld.flatten(state.stacks));
            if(Searcher.search(planner)) {
                var statearm = state.arm;
                var res : Interpreter.Literal[] = planner.getResult();
                if(((res.length == 1) && (res[0].rel == 'nop')) || (res.length == 0))
                    plan.push("Already solved");
                else res.forEach((instr) => {
                    var pickstack = +instr.args[1];
                    var obj = instr.args[0];
                    statearm = armMove(plan,pickstack,statearm);
                    plan.push("Picking up the " + state.objects[obj].form,
                              "p");
                    pickstack = +instr.args[2];
                    statearm = armMove(plan,pickstack,statearm);
                    plan.push("Dropping the " + state.objects[obj].form,
                              "d");
                });
                return plan;
            }
        }
        return null;
    }

    function armMove(plan : string[],pickstack : number, statearm : number) : number {
        if (pickstack < statearm) {
            for (var i = statearm; i > pickstack; i--)
                plan.push("l");
        } else if (pickstack > statearm) {
            for (var i = statearm; i < pickstack; i++)
                plan.push("r");
        }
        return pickstack;
    }

    function printStates(state:Interpreter.Literal[]) : void {
        state.forEach((literal) => {
        });
    }

    //////////////////////////////////////
    ///
    ///  State follow up

    interface mneumonicMeaning {plan : InnerWorld.Step[];
                                state : Interpreter.Literal[];
                                todo : Interpreter.Literal[];
                                goalNumber : number;}

    //////////////////////////////////////
    ///
    ///  Class

    class plannerViaSearch implements Searcher.searchInterface {
        constructor(
            public intprt : Interpreter.Literal[],
            public aState : Interpreter.Literal[]
        ) {this.todo = this.withoutPasiveVerbs(intprt);
           this.currentState = aState;
           this.currentPlan  = [];
           this.goalNumber = -1;
          }
        withoutPasiveVerbs(goals : Interpreter.Literal[]) : Interpreter.Literal[] {
            var facts = {hasSize:false, hasColor:false, isA:false, CanBeInside:false,
                         Reverse_hasSize:false, Reverse_hasColor:false, Reverse_isA:false, Reverse_CanBeInside:false};
            var ret : Interpreter.Literal[] = [];
            goals.forEach((goal) => {
                var a = facts[goal.rel.trim()];
                if((a == null) || (a))
                    ret.push(goal);
                return true;
            })
            return ret;
        }

        private currentPlan : InnerWorld.Step[];

        private currentState : Interpreter.Literal[];
        private todo : Interpreter.Literal[];

        private goalNumber: number;

        private mneumonicCollection : mneumonicMeaning[] = [];

        getMneumonicFromCurrentState(): number {
            for(var i:number = 0; i < this.mneumonicCollection.length; ++i)
                if(this.equalStates(this.mneumonicCollection[i].state, this.currentState) &&
                   (this.mneumonicCollection[i].todo == this.todo) &&
                   (this.mneumonicCollection[i].goalNumber == this.goalNumber))
                    return i;
            this.mneumonicCollection.push({plan:this.currentPlan,
                                            state:this.currentState,
                                            todo:this.todo,
                                            goalNumber:this.goalNumber});
            return i;
        }
        setCurrentStateFromMneumonic(mne:number) {
            this.currentPlan = this.mneumonicCollection[mne].plan;
            this.currentState = this.mneumonicCollection[mne].state;
            this.todo = this.mneumonicCollection[mne].todo;
            this.goalNumber = this.mneumonicCollection[mne].goalNumber;
        }

        getHeuristicCostOfCurrentState(): number {
            var cost:number = 10000;
            var symbols : collections.Set<string> = new collections.Set<string>();
            this.todo.forEach((op) => {
                if(op.rel == 'ontop')
                    symbols.add(op.args[0]);
            });
            var goalCost : number = 0;
            do {
                for(var j = 0; j < this.currentState.length; ++j) {
                    var obj : Interpreter.Literal = this.currentState[j];
                    if((obj.rel == 'in') && (symbols.contains(obj.args[2]))) {
                        symbols.remove(obj.args[2]);
                        goalCost += +obj.args[1]; // col
                    }
                }
            } while(symbols.size() > 0);
            cost = Math.min(cost, goalCost);
            return cost;
        }

        isGoalCurrentState(): Boolean {
            if(this.todo.length == 0)
                return true;
            if(this.equalGoalStates(this.todo, this.currentState))
                return true;
            return false;
        }
        equalGoalStates(A : Interpreter.Literal[], B : Interpreter.Literal[]) : boolean {
            var tests = {ontop: InnerWorld.ontop};
            for(var j:number = 0; j < A.length; ++j) {
                var a = tests[A[j].rel.trim()];
                if((a != null) && (!a(A[j].args, B)))
                    return false;
            }
            return true;
        }

        equalStates(A : Interpreter.Literal[], B : Interpreter.Literal[]) : boolean {
            for(var j:number = 0; j < A.length; ++j)
                if(!this.in(A[j], B))
                    return false;
            return true;
        }
        in(literal: Interpreter.Literal, literals : Interpreter.Literal[]): boolean {
            for(var i:number = 0; i < literals.length; ++i)
                if(literal.rel == literals[i].rel) {
                    var literalI : Interpreter.Literal = literals[i];
                    var ret : boolean = true;
                    for(var j:number = 0; j < literal.args.length; ++j)
                        if(literal.args[j] != literalI.args[j]) {
                            ret = false;
                            break;
                        }
                    if(ret)
                        return true;
                }
            return false;
        }

        nextChildAndMakeCurrent(): Boolean {
            return this.nextSiblingAndMakeCurrent();
        }
        nextSiblingAndMakeCurrent(): Boolean {
            var a : InnerWorld.Step;
            if(this.todo.length>0)
                for(var n:number = 0; n<4; ++n) {
                    switch(n) {
                        case 0:a = new InnerWorld.basicStep1(); break;
                        case 1:a = new InnerWorld.basicStep2(); break;
                        case 2:a = new InnerWorld.basicStep3(); break;
                        case 3:a = new InnerWorld.basicStep4(); break;
                    }
                    if(a.isPreRequisitesOk(this.todo, this.currentState, 0)) {
                        a.performStep(this.todo, this.currentState);
                        this.currentPlan.push(a);
                        return true;
                    }
                }
            return false;
        }

        getResult() : Interpreter.Literal[] {
            var plan : Interpreter.Literal[] = [];
            this.currentPlan.forEach((step) => {
              step.stepPlan.forEach((pln) => {
                  plan.push(pln);
                  return true;
              });
              return true;
            });
            return plan;
        }

        findVerb(rel:string, n:number) {
            for(var i:number = 0; i<this.currentState.length ; ++i)
                if(this.currentState[i].rel == rel) {
                    if(n<=0)
                        return i;
                    --n
                }
            return -1;
        }
        findNextObject(n:number) :number {
            do {
                var i : number = this.findVerb('clear', n);
                if(i == -1)
                    return -1;
                if(this.currentState[i].args[0] != 'floor')
                    return n;
                ++n;
            } while(true);
        }

        printDebugInfo(info : string) : void {console.log(info);}
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
