///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>"/>
///<reference path="Searcher.ts"/>

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

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
        var plan : string[] = [];
        var planner : plannerViaSearch =
                        new plannerViaSearch(intprt, flatten(state.stacks), state.stacks.length);
        if(!Searcher.search(planner)) {
            plan.push("Moving right as I couldnt finish ");
            plan.push("r");
            return plan;
        }
        planner.printDebugInfo('start');
        var statearm = state.arm;
        planner.getResult().forEach((instr) => {
            plan.push("Fetching "+instr.args[0]);
            var pickstack = +instr.args[1];
            if (pickstack < statearm) {
                for (var i = statearm; i > pickstack; i--) {
                    plan.push("l");
                }
            } else if (pickstack > statearm) {
                for (var i = statearm; i < pickstack; i++) {
                    plan.push("r");
                }
            }
            var obj = instr.args[0];
            plan.push("Picking up the " + state.objects[obj].form,
                      "p");
            statearm = pickstack;
            pickstack = +instr.args[2];
            if (pickstack < statearm) {
                for (var i = statearm; i > pickstack; i--) {
                    plan.push("l");
                }
            } else if (pickstack > statearm) {
                for (var i = statearm; i < pickstack; i++) {
                    plan.push("r");
                }
            }
            plan.push("Dropping the " + state.objects[obj].form,
                      "d");
            planner.printDebugInfo(Interpreter.literalToString(instr));
        });
        planner.printDebugInfo('end');
        return plan;
    }

    interface mneumonicMeaning {plan:Interpreter.Literal[];
                                tentativePlan:Interpreter.Literal;
                                state:Interpreter.Literal[];
                                columnFromWorkedOn:number;
                                columnToWorkedOn:number;}
    class plannerViaSearch implements Searcher.searchInterface {
        constructor(
            public intprt : Interpreter.Literal[][],
            public aState : Interpreter.Literal[],
            public aMaxStacks : number
        ) {this.todo = intprt;
           this.currentState = aState;
           this.currentPlan  = [];
           this.columnFrom = -1;
           this.columnTo = -1;
           this.maxStacks = aMaxStacks;
           this.tentativePlan = {pol: true, rel: 'nop', args: []};
          }

        public currentPlan : Interpreter.Literal[];
        public tentativePlan : Interpreter.Literal;
        private currentState : Interpreter.Literal[];
        private columnFrom: number;
        private columnTo : number;
        private maxStacks : number;

        private todo : Interpreter.Literal[][];

        private mneumonicCollection : mneumonicMeaning[] = [];

        getMneumonicFromCurrentState(): number {
            for(var i:number = 0; i < this.mneumonicCollection.length; ++i)
                if(this.equalStates(this.mneumonicCollection[i].state, this.currentState) &&
                   (this.mneumonicCollection[i].columnFromWorkedOn == this.columnFrom) &&
                   (this.mneumonicCollection[i].columnToWorkedOn == this.columnTo))
                    return i;
            this.mneumonicCollection.push({plan:this.currentPlan,
                                            tentativePlan:this.tentativePlan,
                                            state:this.currentState,
                                            columnFromWorkedOn:this.columnFrom,
                                            columnToWorkedOn:this.columnTo});
            return i;
        }
        setCurrentStateFromMneumonic(mne:number) {
            this.currentPlan = this.mneumonicCollection[mne].plan;
            this.tentativePlan = this.mneumonicCollection[mne].tentativePlan;
            this.currentState = this.mneumonicCollection[mne].state;
            this.columnFrom = this.mneumonicCollection[mne].columnFromWorkedOn;
            this.columnTo = this.mneumonicCollection[mne].columnToWorkedOn;
        }

        getCostOfCurrentState(): number {
            var cost:number = 10000;
            var stacks : string[][] = unFlatten(this.currentState);
            this.todo.forEach((goal) => {
                var symbols : collections.Set<string> = new collections.Set<string>();
                goal.forEach((op) => {
                    if(op.rel == 'ontop')
                        symbols.add(op.args[0]);
                });
                var goalCost : number = 0;
                var col : number = 0;
                do {
                    for(var j = 0; j < stacks[col].length; ++j) {
                        var obj : string = stacks[col][j];
                        if(symbols.contains(obj)) {
                            symbols.remove(obj);
                            goalCost += stacks[col].length - j;
                        }
                    }
                    ++col;
                } while((col < stacks.length) && (symbols.size() > 0));
                cost = Math.min(cost, goalCost);
                this.printDebugInfo(' cost '+cost.toString() + ' syms ' + symbols.size().toString());
            });
            this.printDebugInfo(' cost '+cost.toString());
            return cost;
        }

        isGoalCurrentState(): Boolean {
            this.printDebugInfo('Goal?');
            for(var i:number = 0; i < this.todo.length; ++i)
                if(this.equalStates(this.todo[i], this.currentState))
                    return true;
            return false;
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
//                    this.printDebugInfo(' same rel '+literal.rel + ' lit1 ' + Interpreter.literalToString(literal)+ ' lit2 ' + Interpreter.literalToString(literals[i]));
                    var literalI : Interpreter.Literal = literals[i];
                    var ret : boolean = true;
                    for(var j:number = 0; j < literal.args.length; ++j)
                        if(literal.args[j] != literalI.args[j]) {
//                            this.printDebugInfo(' culprit ('+j+') '+literal.args[j]+' vs '+literalI.args[j]);
                            ret = false;
                            break;
                        }
                    if(ret) {
                        this.printDebugInfo('true');
                        return true;
                    }
                }
            this.printDebugInfo('false');
            return false;
        }

        nextChildAndMakeCurrent(): Boolean {
            this.columnTo = -1;
            ++this.columnFrom;
            do {
                var i : number = this.findVerb('clear',this.columnFrom);
                this.printDebugInfo(' i '+i+' columnfrom '+this.columnFrom);
                if(i==-1) {
                    return false;
                    this.columnFrom = 0;
                    this.nextSiblingAndMakeCurrent();
                    this.printDebugInfo('pushing plan');
                    this.currentPlan.push(this.tentativePlan);
                    this.tentativePlan = {pol: true, rel: 'nop', args: []};
                    i = this.findVerb('clear',this.columnFrom);
                }
                if(this.currentState[i].args[0] == 'floor') {
                    ++this.columnFrom;
                    this.printDebugInfo('this was a floor');
                }
            } while (this.currentState[i].args[0] == 'floor');
            this.columnTo = -1;
            this.printDebugInfo(' from,to '+this.columnFrom+' , '+this.columnTo);
            return this.nextSiblingAndMakeCurrent();
        }
        nextSiblingAndMakeCurrent(): Boolean {
            var obj : string;
            var stacks : string[][];
            if(this.tentativePlan.rel == 'move') {
                stacks = unFlatten(this.currentState);
                obj = stacks[+this.tentativePlan.args[2]].pop(); //to
                stacks[+this.tentativePlan.args[1]].push(obj); //from
                this.currentState = flatten(stacks);
                this.printDebugInfo(' restoring '+obj+' bck from '+this.tentativePlan.args[2]+' to '+this.tentativePlan.args[1]);
                this.tentativePlan = {pol: true, rel: 'nop', args: []};
            }
            var i : number = this.findVerb('clear', this.columnFrom);
            obj = this.currentState[i].args[0];
            if(obj == 'floor') {
                this.printDebugInfo(' sibling floor');
                return false;
            }
            ++this.columnTo;
            if(this.columnTo == this.columnFrom)
                ++this.columnTo;
            if(this.columnTo >= this.maxStacks) {
                this.printDebugInfo('columnto > max '+this.columnTo+'>'+this.maxStacks);
                return false;
            }
            this.tentativePlan = {pol: true, rel: 'move', args: [obj, this.columnFrom.toString() ,this.columnTo.toString()]};
            this.printDebugInfo(' sibling '+Interpreter.literalToString(this.tentativePlan));
            stacks = unFlatten(this.currentState);
            stacks[this.columnFrom].pop();
            stacks[this.columnTo].push(obj);
            this.currentState = flatten(stacks);
            return true;
        }

        getResult() : Interpreter.Literal[] {
            this.printDebugInfo(' getResult '+this.currentPlan.length+ ' plans and tentative '+Interpreter.literalToString(this.tentativePlan));
            this.currentPlan.push(this.tentativePlan);
            return this.currentPlan;
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

        printDebugInfo(info : string) : void {console.log(info);}
    }

    function flatten(stacks: string[][]) : Interpreter.Literal[] {
        var oneIntprt : Interpreter.Literal[] = [];
        stacks.forEach((stack) => {
            var prev : string = 'floor';
            stack.forEach((ele) => {
                oneIntprt.push({pol: true, rel: 'ontop', args: [ele, prev]});
                prev = ele;
            });
            oneIntprt.push({pol: true, rel: 'clear', args: [prev]});
        });
        return oneIntprt;
    }
    function unFlatten(defs: Interpreter.Literal[]) : string[][] {
        var stacks : string[][] = [];
        var stack : string[] = [];
        defs.forEach((ele) => {
            if(ele.rel == 'clear') {
                stacks.push(stack);
                stack = [];
            } else if(ele.rel == 'ontop')
                stack.push(ele.args[0]);
        });
        return stacks;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
