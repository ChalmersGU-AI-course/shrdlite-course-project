///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Searcher.ts"/>
///<reference path="InnerWorld.ts"/>


// The planner is very different
// as  would do it in a non - academic environ
// I wanted to test multiple rules etc but That was done only for
// the ontop rule.
//
// The left, right and besides was done in just one rule as ontop was enough
// to test the implications
//
// Under was done as negation of ontop with bad results although strictly correct
// I left that as a way to show different approaches
//

module Planner {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretations : Interpreter.Result[], currentState : WorldState) : Result[] {
        var plans : Result[] = [];
        var plan : Result = planInterpretation(interpretations, currentState);
        if(plan != null) {
            plans.push(plan);
            return plans;
        } else
            throw new Planner.Error("Found no plans");
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

    // if finds a Plan, just execute it
    function planInterpretation(interpretations : Interpreter.Result[], state : WorldState) : Result {
        var plan : string[] = [];
        var planner : plannerViaSearch =
                        new plannerViaSearch(interpretations, InnerWorld.flatten(state.stacks, state.holding, state.arm), state);
        if(Searcher.search(planner)) {
            var statearm = state.arm;
            var res : Interpreter.Literal[] = planner.getResult();
            if(((res.length == 1) && (res[0].rel == 'nop')) || (res.length == 0))
                plan.push("Already solved");
            else {
                if((state.holding != null) && (state.holding != ''))
                    plan.push("Dropping the " + state.objects[state.holding].form,
                              "d");
                res.forEach((instr) => {
                    var pickstack = +instr.args[1];
                    var obj = instr.args[0];
                    statearm = armMove(plan,pickstack,statearm);
                    plan.push("Picking up the " + state.objects[obj].form,
                              "p");
                    if(instr.rel != 'take') {
                        pickstack = +instr.args[2];
                        statearm = armMove(plan,pickstack,statearm);
                        plan.push("Dropping the " + state.objects[obj].form,
                                  "d");
                    }
                });
            }
            var ret : Result = <Result>planner.getWinningInterpretation();
            ret.plan = plan;
            return ret;
        }
        return null;
    }

    // utility function to move the arm with the primitive commands
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

    // used only for debugging
    function printStates(state:Interpreter.Literal[]) : void {
        state.forEach((literal) => {
        });
    }

    //////////////////////////////////////
    ///
    ///  State follow up

    // this is what is saved in the frontier
    interface mneumonicMeaning {plan : InnerWorld.Step[];
                                state : InnerWorld.Representation;
                                interpretationNumber : number;
                                subGoalNumber : number;
                                currentCost : number;
                                }

    //////////////////////////////////////
    ///
    ///  This decides what is the search space
    ///   Although I wanted to do a recursive version
    ///   it is more practial to do a search using the
    ///   different interpretations as different branches
    ///   and let the issue of getting the most efficient
    ///   move to the a* algorithm
    ///
    ///  This work because the rules are much more powerful than
    ///   what I wanted. also there are no restriction of
    ///   height for example which took out the need for a floor
    ///
    ///  There are many issues left untouched like learning etc
    ///   that Winograd had in his thesis
    ///   I took a shotjust at the present vs future issue he detailed
    ///   but his implementation is much more interesant
    ///

    class plannerViaSearch implements Searcher.searchInterface {
        constructor(
            public interpretations : Interpreter.Result[],
            public aState : InnerWorld.Representation,
            public aWorld : WorldState
        ) {this.currentState = aState;
           this.world = aWorld;
           this.currentPlan  = [];
           this.subGoalNumber = -1;
           this.interpretationNumber = -1;
           this.currentCost = 0;
           this.validGoals = [];
           this.interpretationXRef = [];
           interpretations.forEach((interpretation) => {
              interpretation.intp.forEach((possibleGoalState) => {
                 this.validGoals.push(this.withoutPasiveVerbs(possibleGoalState));
                 this.interpretationXRef.push(interpretation);
              });
           });
           this.nextInterprtationAndMakeCurrent(0);
          }

        // I dont think the non changing properties are passed
        // but they were passed at some time, as they dont change they are of no value for the planner
        withoutPasiveVerbs(goals : Interpreter.Literal[]) : Interpreter.Literal[] {
            var facts = {hasSize:false, hasColor:false, isA:false, CanBeInside:false,
                         Reverse_hasSize:false, Reverse_hasColor:false, Reverse_isA:false,
                         Reverse_CanBeInside:false};
            var ret : Interpreter.Literal[] = [];
            goals.forEach((goal) => {
                var a = facts[goal.rel.trim()];
                if((a == null) || (a))
                    ret.push(goal);
                return true;
            })
            return ret;
        }

        private world : WorldState;

        private currentPlan  : InnerWorld.Step[];
        private currentState : InnerWorld.Representation;
        private currentCost  : number;

        private validGoals   : Interpreter.Literal[][];

        private subGoalNumber : number;
        private interpretationNumber : number;

        // old States are saved in a collection to avoid cycles and to be able to refer to the
        // frontier by mneumenic, without saving states in the search class
        private mneumonicCollection  : mneumonicMeaning[] = [];

        // NOTE ALL THE CLONNING ETC
        // Should have done t like the strip representation but I was focusing in other aspects

        getMneumonicFromCurrentState(): number {
            for(var i:number = 0; i < this.mneumonicCollection.length; ++i)
                if(this.equalStates(this.mneumonicCollection[i].state, this.currentState) &&
                   (this.mneumonicCollection[i].subGoalNumber == this.subGoalNumber) &&
                   (this.mneumonicCollection[i].interpretationNumber == this.interpretationNumber))
                    return i;
            var ele : mneumonicMeaning = {plan:[],
                                            state:clone(this.currentState),
                                            interpretationNumber:this.interpretationNumber,
                                            subGoalNumber:this.subGoalNumber,
                                            currentCost:this.currentCost};
            this.currentPlan.forEach((step)=>{
                var simple : InnerWorld.emptyStep = new InnerWorld.emptyStep(step.stepPlan, step.cost);
                ele.plan.push(simple);
            })
            this.mneumonicCollection.push(ele);
            return i;
        }
        setCurrentStateFromMneumonic(mne:number) {
            this.currentPlan = [];
            this.mneumonicCollection[mne].plan.forEach((step)=>{
                var simple : InnerWorld.emptyStep = new InnerWorld.emptyStep(step.stepPlan, step.cost);
                this.currentPlan.push(simple);
            })
            this.currentState = clone(this.mneumonicCollection[mne].state);
            this.subGoalNumber = this.mneumonicCollection[mne].subGoalNumber;
            this.interpretationNumber = this.mneumonicCollection[mne].interpretationNumber;
            this.currentCost = this.mneumonicCollection[mne].currentCost;
        }


        getCostOfCurrentState(): number {
            return this.currentCost;
        }

        // many  heurisic functions would have worked...
        getHeuristicGoalDistanceFromCurrentState(): number {
            var cost:number = 0;
            var symbols : collections.Set<string> = new collections.Set<string>();
            this.validGoals[this.interpretationNumber].forEach((op) => {
                if(op.rel == 'ontop') {
                    var over : string = op.args[0];
                    var under : string = op.args[1];
                    if(over == 'floor') {
                        var floor : number = InnerWorld.findClear('floor', [], this.currentState);
                        if(floor == -1)
                            over = 'floor0';
                        else
                            over = this.currentState.kb[floor].args[0];
                    }
                    if(under == 'floor') {
                        var floor : number = InnerWorld.findClear('floor', [], this.currentState);
                        if(floor == -1)
                            under = 'floor0';
                        else
                            under = this.currentState.kb[floor].args[0];
                    }
                    var stepPlan : Interpreter.Literal[] = InnerWorld.simplestFromToNorm_Plan(over, under, this.currentState);
                    cost += InnerWorld.estimatePlanCost(stepPlan, this.currentState);
                } else if(op.rel == 'take') {
                    var over : string = op.args[0];
                    var stepPlan : Interpreter.Literal[] = [];
                    stepPlan.push({pol: true, rel: 'take', args: [over]});
                    cost += InnerWorld.estimatePlanCost(stepPlan, this.currentState);
                }
            });
            return cost;
        }

        // stop condition
        isGoalCurrentState(): Boolean {
            if(this.validGoals.length == 0)
                return true;
            if(this.equalGoalStates(this.validGoals[this.interpretationNumber],
                                    this.currentState))
                    return true;
            return false;
        }

        private tests = {ontop: InnerWorld.ontop,
                         rightof: InnerWorld.rightof,
                         leftof: InnerWorld.leftof,
                         beside: InnerWorld.beside,
                         take: InnerWorld.take,
                         };

        // goal state is a tree so we need to traverse
        equalGoalStates(A : Interpreter.Literal[], B : InnerWorld.Representation) : boolean {
            for(var j:number = 0; j < A.length; ++j) {
                var a = this.tests[A[j].rel.trim()];
                if((a != null) && (!a(A[j].args, B)))
                    return false;
            }
            return true;
        }

        // this is used not for goals but for double checking that the rule didnt failed
        // but is the same thing as checking the goal
        equalStates(A : InnerWorld.Representation, B : InnerWorld.Representation) : boolean {
            for(var j:number = 0; j < A.kb.length; ++j)
                if(!this.in(A.kb[j], B.kb))
                    return false;
            return true;
        }

        // the traverse part of the above function
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

        // moving in the search space
        private currentMneumonic : number;
        nextInterprtationAndMakeCurrent(n : number): Boolean {
            this.interpretationNumber = n;
            if(this.interpretationNumber >= this.validGoals.length)
                return false;
            this.currentMneumonic = this.getMneumonicFromCurrentState();
            this.subGoalNumber = -1;
            this.nextChildAndMakeCurrent();
            return true;
        }
        nextChildAndMakeCurrent(): Boolean {
            if(this.interpretationNumber >= this.validGoals.length)
                return false;
            this.currentMneumonic = this.getMneumonicFromCurrentState();
            this.subGoalNumber = -1;
            return this.nextSiblingAndMakeCurrent();
        }
        nextSiblingAndMakeCurrent(): Boolean {
            var s : InnerWorld.Step;

            var g : number = this.subGoalNumber;
            this.setCurrentStateFromMneumonic(this.currentMneumonic);
            this.subGoalNumber = g;

            var goals : Interpreter.Literal[] = this.validGoals[this.interpretationNumber];
            while(this.subGoalNumber < goals.length-1) {
                var goal : Interpreter.Literal = goals[++this.subGoalNumber];
                var a = this.tests[goal.rel.trim()];
                if((a != null) && (!a(goal.args, this.currentState)))
                  if(goal.rel.trim() == 'ontop') // just ontop is fully investigated
                    for(var n:number = 0; n<6; ++n) {
                        switch(n) {
                            case 0:s = new InnerWorld.basicStep0(); break;
                            case 1:s = new InnerWorld.basicStep1(); break;
                            case 2:s = new InnerWorld.basicStep2(); break;
                            case 3:s = new InnerWorld.basicStep3(); break;
                            case 4:s = new InnerWorld.basicStep4(); break;
                            case 5:s = new InnerWorld.basicStep5();
                                   (<InnerWorld.basicStep5>s).rel = goal.rel.trim();
                                   break;
                        }
                        if(s.isPreRequisitesOk(goal, this.currentState, this.world)) {
                            try {
                                this.currentCost += s.performStep(goal, this.currentState, this.world);
                                this.currentPlan.push(s);
                                if(!a(goal.args, this.currentState))
                                    throw new Planner.Error('Done wrong '
                                        +' '+goal.rel+' '+Array.prototype.concat.apply([], goal.args)+' via '+n.toString());
                                return true;
                            } catch(ex) {
                                var tmp : number = this.subGoalNumber;
                                this.setCurrentStateFromMneumonic(this.currentMneumonic);
                                this.subGoalNumber = tmp;
                            }
                        }
                    }
                  else {
                    var step : InnerWorld.basicStep5 = new InnerWorld.basicStep5();
                    step.rel = goal.rel.trim();
                    if(step.isPreRequisitesOk(goal, this.currentState, this.world)) {
                        try {
                            this.currentCost += step.performStep(goal, this.currentState, this.world);
                            this.currentPlan.push(step);
                            if(!a(goal.args, this.currentState))
                                throw new Planner.Error('Done wrong '
                                    +' '+goal.rel+' '+Array.prototype.concat.apply([], goal.args)+' via basicStep5()');
                            return true;
                        } catch(ex) {
                            var tmp : number = this.subGoalNumber;
                            this.setCurrentStateFromMneumonic(this.currentMneumonic);
                            this.subGoalNumber = tmp;
                        }
                    }
                  }
            }
            return false;
        }

        //
        // to Retrieve the results later
        //
        private interpretationXRef : Interpreter.Result[];
        getWinningInterpretation():Interpreter.Result {
            return this.interpretationXRef[this.interpretationNumber];
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

        printDebugInfo(info : string) : void {console.log(info);}
    }

    //////////////////////////////////////////////////////////////////////
    // Utilities

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function clone<T>(obj: T): T {
        if (obj != null && typeof obj == "object") {
            var result : T = obj.constructor();
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result[key] = clone(obj[key]);
                }
            }
            return result;
        } else {
            return obj;
        }
    }

}
