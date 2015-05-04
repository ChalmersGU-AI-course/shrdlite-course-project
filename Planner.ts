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

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
        var plan : string[] = [];
        var planner : plannerViaSearch =
                        new plannerViaSearch(intprt, flatten(state.stacks), state.stacks.length);
        if(!Searcher.search(planner))
            return null;
        planner.printDebugInfo('start');
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
            planner.printDebugInfo(Interpreter.literalToString(instr));
        });
        planner.printDebugInfo('end');
        return plan;
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
//                this.printDebugInfo(' cost '+cost.toString() + ' syms ' + symbols.size().toString());
            });
//            this.printDebugInfo(' cost '+cost.toString());
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
                    if(ret)
                        return true;
                }
            return false;
        }

        nextChildAndMakeCurrent(): Boolean {
            ++this.columnFrom;
            this.columnFrom = this.findNextObject(this.columnFrom);
            this.printDebugInfo(' columnfrom '+this.columnFrom);
            if(this.columnFrom == -1) {
                this.undoTentativePlan();
                this.columnFrom = this.findNextObject(0);
                this.printDebugInfo('NEXT LAYER '+this.columnFrom);
                this.columnTo = -1;
                this.nextSiblingAndMakeCurrent();
                this.printDebugInfo('pushing plan');
                this.currentPlan.push(this.tentativePlan);
                this.tentativePlan = {pol: true, rel: 'nop', args: []};
                this.columnFrom = this.findNextObject(this.columnFrom);
            }
            this.columnTo = -1;
            this.printDebugInfo(' from,to '+this.columnFrom+' , '+this.columnTo);
            return this.nextSiblingAndMakeCurrent();
        }
        nextSiblingAndMakeCurrent(): Boolean {
            var obj : string;
            var stacks : string[][];
            this.undoTentativePlan();
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
        undoTentativePlan() {
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
        }

        getResult() : Interpreter.Literal[] {
            this.printDebugInfo(' getResult '+this.currentPlan.length+ ' plans and tentative '+Interpreter.literalToString(this.tentativePlan));
            if(this.tentativePlan.rel != 'nop')
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
