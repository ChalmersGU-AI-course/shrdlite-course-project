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
    export interface coor {row:number; col:number;}


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
                            new plannerViaSearch(intprt, flatten(state.stacks));
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

    function findObjAt(newCoor : coor, literals : Interpreter.Literal[]) : string {
        for(var i:number = 0; i < literals.length; ++i)
            if(('in' == literals[i].rel)
                && (newCoor.row == +literals[i].args[0])
                && (newCoor.col == +literals[i].args[1]))
                return literals[i].args[2];
        return null;
    }

    function findIn(arg : string, literals : Interpreter.Literal[]) : number {
        for(var i:number = 0; i < literals.length; ++i)
            if(('in' == literals[i].rel) && (arg == literals[i].args[2]))
                return i;
        return -1;
    }

    function reverseObjsOnTop(arg : string, literals : Interpreter.Literal[]) : string[] {
        var pos : coor = findPos(arg, literals);
        var res : string[] = [];
        var n : number = 0;
        do {
            ++n;
            var chg : boolean = false;
            for(var i:number = 0; i < literals.length; ++i)
                if(('in' == literals[i].rel)
                   && (pos.row == +literals[i].args[0])
                   && (pos.col + n == +literals[i].args[1]) ) {
                   var obj = literals[i].args[2];
                   res = Array.prototype.concat.apply([obj], res);
                   if(findClear(obj, [], literals) != -1)
                        return res;
                   chg = true;
                   break;
                }
            if(!chg) {
                this.printDebugInfo('Error');
                return res;
            }
        } while(true);
    }

    function findClear(arg : string, used : string[], literals : Interpreter.Literal[]) : number {
        for(var i:number = 0; i < literals.length; ++i)
            if('clear' == literals[i].rel) {
                if(arg == literals[i].args[0])
                    return i;
                if((arg == 'floor') && (literals[i].args[0].length > 1)) {
                    var exists : boolean = false;
                    for(var j:number = 0; j < literals.length; ++j)
                        if(used[j] == literals[i].args[0])
                            exists = true;
                    if(!exists)
                        return i;
                }
            }
        return -1;
    }

    function findPos(arg : string, literals : Interpreter.Literal[]) : coor {
        var i : number = findIn(arg, literals);
        if(i==-1)
            return null;
        return {row : +literals[i].args[0], col : +literals[i].args[1]};
    }
    function setPos(arg : string, literals : Interpreter.Literal[], newCoor : coor) {
        var i : number = findIn(arg, literals);
        if(i==-1)
            return;
        literals[i].args[0] = newCoor.row.toString();
        literals[i].args[1] = newCoor.col.toString();
    }

    function hasFloor(goals : Interpreter.Literal[]) : number {
        for(var j = 0; j < goals.length; ++j)
            if((goals[j].rel == 'ontop') && (goals[j].args[1] == 'floor'))
                return j;
        return -1;
    }

    function printStates(state:Interpreter.Literal[]) : void {
        state.forEach((literal) => {
        });
    }

    interface Step {
        stepPlan : Interpreter.Literal[];
        stepNumber() : number;
        isPreRequisitesOk(goals : Interpreter.Literal[], state:Interpreter.Literal[], suggest:number) : boolean;
        performStep(goals:Interpreter.Literal[], state:Interpreter.Literal[]) : void;
    }

    //////////////////////////////////////
    ///
    ///  Strategic Steps. Too simple right now

    class basicStep1 implements Step {
        stepPlan : Interpreter.Literal[];

        floorNumber : number = -1;
        goalToDo : number = -1;

        stepNumber() : number {return 1;}
        isPreRequisitesOk(goals : Interpreter.Literal[], state:Interpreter.Literal[], suggest:number) : boolean {
            var floorsNeeded : number = 0;
            this.floorNumber = hasFloor(goals);
            if(this.floorNumber == -1)
                return false;
            var goal : Interpreter.Literal = goals[this.floorNumber];
            var clearObj1 : boolean = findClear(goal.args[0], [], state) != -1;
            var clearObj2 : boolean = findClear(goal.args[1], [], state) != -1;
            if((!clearObj1) || (!clearObj2))
                return false;
            this.goalToDo = this.floorNumber;
            return true;
        }
        performStep(goals : Interpreter.Literal[], state:Interpreter.Literal[]) : void {
            var goal : Interpreter.Literal = goals[this.goalToDo];
            goals.splice(this.goalToDo,1);
            var i1 : coor = findPos(goal.args[0], state);
            var floor : number = findClear(goal.args[1], [], state);
            var floorName : string = state[floor].args[0];
            var i2 : coor = findPos(floorName, state);
            setPos(goal.args[0], state, {row:i2.row, col:i2.col+1});
            state.splice(floor,1);
            state.push({pol: true, rel: 'clear', args: [findObjAt({row:i1.row, col:i1.col-1}, state)]});
            this.stepPlan = [];
            this.stepPlan.push({pol: true, rel: 'move', args: [goal.args[0], i1.row.toString() ,i2.row.toString()]});
        }
    }

    class basicStep2 implements Step {
        stepPlan : Interpreter.Literal[];

        floorNumber : number = -1;
        goalToDo : number = -1;

        floorName : string;
        tempName : string;

        stepNumber() : number {return 1;}
        isPreRequisitesOk(goals : Interpreter.Literal[], state:Interpreter.Literal[], suggest:number) : boolean {
            var floorsNeeded : number = 0;
            this.floorNumber = hasFloor(goals);
            if(this.floorNumber == -1)
                return false;
            var goal : Interpreter.Literal = goals[this.floorNumber];
            var floor : number = findClear(goal.args[1], [], state);
            if(floor == -1)
                return false;
            this.floorName = state[floor].args[0];
            var tempFloor : number = findClear(goal.args[1], [this.floorName], state);
            if(tempFloor == -1)
                return false;
            this.tempName = state[tempFloor].args[0];
            this.goalToDo = this.floorNumber;
            return true;
        }
        performStep(goals : Interpreter.Literal[], state:Interpreter.Literal[]) : void {
            var goal : Interpreter.Literal = goals[this.goalToDo];
            var objsOntop : string[] = reverseObjsOnTop(goal.args[0], state);
            var itemp : coor = findPos(this.tempName, state);
            var col : number = 0;
            var prev : string;
            this.stepPlan = [];
            objsOntop.forEach((obj) => {
                ++col;
                prev = obj;
                var i1 : coor = findPos(obj, state);
                setPos(obj, state, {row:itemp.row, col:col});
                this.stepPlan.push({pol: true, rel: 'move', args: [obj, i1.row.toString() ,itemp.row.toString()]});
            });
            state.splice(findClear(objsOntop[0], [], state),1);
            state.splice(findClear(this.tempName, [], state),1);
            state.push({pol: true, rel: 'clear', args: [prev]});
            state.push({pol: true, rel: 'clear', args: [goal.args[0]]});
            var chainedStep : Step = new basicStep1();
            var tst : boolean = chainedStep.isPreRequisitesOk(goals, state, this.goalToDo);

            chainedStep.performStep(goals, state);
            chainedStep.stepPlan.forEach((step) => {
                this.stepPlan.push(step);
            });
        }
    }

    class basicStep3 implements Step {
        stepPlan : Interpreter.Literal[];

        tempName : string = null;
        goalToDo : number = -1;

        stepNumber() : number {return 1;}
        isPreRequisitesOk(goals : Interpreter.Literal[], state:Interpreter.Literal[], suggest:number) : boolean {
            var goal : Interpreter.Literal = goals[suggest];
            var clearObj2 : boolean = findClear(goal.args[1], [], state) != -1;
            if(!clearObj2)
                return false;
            var clearObj1 : boolean = findClear(goal.args[0], [], state) != -1;
            if(!clearObj1) {// need a floor
                var floor : number = findClear('floor', [], state);
                if(floor == -1)
                    return false;
                this.tempName = state[floor].args[0];
            }
            this.goalToDo = suggest;
            return true;
        }
        performStep(goals : Interpreter.Literal[], state:Interpreter.Literal[]) : void {
            var goal : Interpreter.Literal = goals[this.goalToDo];
            goals.splice(this.goalToDo,1);
            this.stepPlan = [];
            if(this.tempName != null) {
                var col : number = 0;
                var prev : string;
                var itemp : coor = findPos(this.tempName, state);
                var objsOntop : string[] = reverseObjsOnTop(goal.args[0], state);
                objsOntop.forEach((obj) => {
                    ++col;
                    prev = obj;
                    var i1 : coor = findPos(obj, state);
                    setPos(obj, state, {row:itemp.row, col:col});
                    this.stepPlan.push({pol: true, rel: 'move', args: [obj, i1.row.toString() ,itemp.row.toString()]});
                });
                state.splice(findClear(objsOntop[0], [], state),1);
                state.splice(findClear(this.tempName, [], state),1);
                state.push({pol: true, rel: 'clear', args: [prev]});
                state.push({pol: true, rel: 'clear', args: [goal.args[0]]});
            }
            var i1 : coor = findPos(goal.args[0], state);
            var support : number = findClear(goal.args[1], [], state);
            var supportName : string = state[support].args[0];
            var i2 : coor = findPos(supportName, state);
            setPos(goal.args[0], state, {row:i2.row, col:i2.col+1});
            state.splice(support,1);
            state.push({pol: true, rel: 'clear', args: [findObjAt({row:i1.row, col:i1.col-1}, state)]});
            this.stepPlan.push({pol: true, rel: 'move', args: [goal.args[0], i1.row.toString() ,i2.row.toString()]});
        }
    }

    class basicStep4 implements Step {
        stepPlan : Interpreter.Literal[];

        tempName : string = null;
        goalToDo : number = -1;

        stepNumber() : number {return 1;}
        isPreRequisitesOk(goals : Interpreter.Literal[], state:Interpreter.Literal[], suggest:number) : boolean {
            var goal : Interpreter.Literal = goals[suggest];
            {// need a floor
                var floor : number = findClear('floor', [], state);
                if(floor == -1)
                    return false;
                this.tempName = state[floor].args[0];
            }
            this.goalToDo = suggest;
            return true;
        }
        performStep(goals : Interpreter.Literal[], state:Interpreter.Literal[]) : void {
            var goal : Interpreter.Literal = goals[this.goalToDo];
            this.stepPlan = [];
            {
                var col : number = 0;
                var prev : string;
                var itemp : coor = findPos(this.tempName, state);
                var objsOntop : string[] = reverseObjsOnTop(goal.args[1], state);
                objsOntop.forEach((obj) => {
                    ++col;
                    prev = obj;
                    var i1 : coor = findPos(obj, state);
                    setPos(obj, state, {row:itemp.row, col:col});
                    this.stepPlan.push({pol: true, rel: 'move', args: [obj, i1.row.toString() ,itemp.row.toString()]});
                });
                state.splice(findClear(objsOntop[0], [], state), 1);
                state.splice(findClear(this.tempName, [], state), 1);
                state.push({pol: true, rel: 'clear', args: [prev]});
                state.push({pol: true, rel: 'clear', args: [goal.args[1]]});
            }
            var chainedStep : Step = new basicStep3();
            var tst : boolean = chainedStep.isPreRequisitesOk(goals, state, this.goalToDo);

            chainedStep.performStep(goals, state);
            chainedStep.stepPlan.forEach((step) => {
                this.stepPlan.push(step);
            });
        }
    }

    //////////////////////////////////////
    ///
    ///  State follow up

    interface mneumonicMeaning {plan : Step[];
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

        private currentPlan : Step[];

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

        getCostOfCurrentState(): number {
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
            var tests = {ontop: this.ontop};
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

        ontop(args:string[], literals : Interpreter.Literal[]): boolean {
            var pos1 : coor = findPos(args[0], literals);
            var pos2 : coor = findPos(args[1], literals);
            if((pos1 == null) || (pos2 == null))
                return false;
            if((pos1.row == pos2.row) && (pos1.col > pos2.col))
                return true;
            return false;
        }

        nextChildAndMakeCurrent(): Boolean {
            return this.nextSiblingAndMakeCurrent();
        }
        nextSiblingAndMakeCurrent(): Boolean {
            var a : Step;
            if(this.todo.length>0)
                for(var n:number = 0; n<4; ++n) {
                    switch(n) {
                        case 0:a = new basicStep1(); break;
                        case 1:a = new basicStep2(); break;
                        case 2:a = new basicStep3(); break;
                        case 3:a = new basicStep4(); break;
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

    function flatten(stacks: string[][]) : Interpreter.Literal[] {
        var oneIntprt : Interpreter.Literal[] = [];
        var row : number = 0;
        stacks.forEach((stack) => {
            var prev : string = 'floor'+row;
            var col : number = 0;
            stack.forEach((ele) => {
                oneIntprt.push({pol: true, rel: 'in', args: [row.toString(), col.toString(), prev]});
                col++;
                prev = ele;
            });
            oneIntprt.push({pol: true, rel: 'in', args: [row.toString(), col.toString(), prev]});
            oneIntprt.push({pol: true, rel: 'clear', args: [prev]});
            ++row;
        });
        return oneIntprt;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
