///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>

module InnerWorld {

        export interface Step {
            stepPlan : Interpreter.Literal[];
            isPreRequisitesOk(goals : Interpreter.Literal[], state:Interpreter.Literal[], suggest:number) : boolean;
            performStep(goals:Interpreter.Literal[], state:Interpreter.Literal[]) : void;
        }

        export interface representation {kb : Interpreter.Literal[];}

        interface coor {row:number; col:number;}

        export function ontop(args:string[], literals : Interpreter.Literal[]): boolean {
            var pos1 : coor = findPos(args[0], literals);
            var pos2 : coor = findPos(args[1], literals);
            if((pos1 == null) || (pos2 == null))
                return false;
            if((pos1.row == pos2.row) && (pos1.col > pos2.col))
                return true;
            return false;
        }

        export function estimatePlanCost(stepPlan : Interpreter.Literal[], state:Interpreter.Literal[]):void {
        }

        export function playPlan(stepPlan : Interpreter.Literal[], state:Interpreter.Literal[]):void {
            stepPlan.forEach((step) => {
                if(step.rel == 'move') {
                    var from : number = +step.args[1];
                    var to : number = +step.args[2];
                    var what : string = step.args[0];       // To double checks
                    var i1 : coor = open(from, state);      // Open Both
                    var i2 : coor = open(to, state);        // Open Both
                    setPos(what, state, {row:i2.row, col:i2.col+1});
                    state.push({pol: true, rel: 'clear', args: [findObjAt({row:i1.row, col:i1.col-1}, state),
                                                                i1.row.toString()]}); // Close it
                    state.push({pol: true, rel: 'clear', args: [what,
                                                                i2.row.toString()]}); // Close it
                }
            });
        }

        function open(row : number, state:Interpreter.Literal[]) : coor {
            var kbNum : number = findTop(row, state);
            var i : coor = findPos(state[kbNum].args[0], state);
            state.splice(kbNum,1);
            return i;
        }

        export function flatten(stacks: string[][]) : Interpreter.Literal[] {
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
                oneIntprt.push({pol: true, rel: 'clear', args: [prev, row.toString()]});
                ++row;
            });
            this.state = oneIntprt;
            return oneIntprt;
        }

        function findTop(row : number, literals : Interpreter.Literal[]) : number {
            for(var i:number = 0; i < literals.length; ++i)
                if(('clear' == literals[i].rel) && (row == +literals[i].args[1]))
                    return i;
            return -1;
        }

        function findIn(arg : string, literals : Interpreter.Literal[]) : number {
            for(var i:number = 0; i < literals.length; ++i)
                if(('in' == literals[i].rel) && (arg == literals[i].args[2]))
                    return i;
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

        function findObjAt(newCoor : coor, literals : Interpreter.Literal[]) : string {
            for(var i:number = 0; i < literals.length; ++i)
                if(('in' == literals[i].rel)
                    && (newCoor.row == +literals[i].args[0])
                    && (newCoor.col == +literals[i].args[1]))
                    return literals[i].args[2];
            return null;
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

        function hasFloor(goals : Interpreter.Literal[]) : number {
            for(var j = 0; j < goals.length; ++j)
                if((goals[j].rel == 'ontop') && (goals[j].args[1] == 'floor'))
                    return j;
            return -1;
        }

        //////////////////////////////////////
        ///
        ///  Strategic Steps. Too simple right now

        export class basicStep1 implements Step {
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
                this.stepPlan = [];
                this.stepPlan.push({pol: true, rel: 'move', args: [goal.args[0], i1.row.toString() ,i2.row.toString()]});
                playPlan(this.stepPlan, state);
            }
        }

        export class basicStep2 implements Step {
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
                var prev : string;
                this.stepPlan = [];
                objsOntop.forEach((obj) => {
                    prev = obj;
                    var i1 : coor = findPos(obj, state);
                    this.stepPlan.push({pol: true, rel: 'move', args: [obj, i1.row.toString() ,itemp.row.toString()]});
                });

                playPlan(this.stepPlan, state);

                var chainedStep : Step = new basicStep1();
                var tst : boolean = chainedStep.isPreRequisitesOk(goals, state, this.goalToDo);

                chainedStep.performStep(goals, state);
                chainedStep.stepPlan.forEach((step) => {
                    this.stepPlan.push(step);
                });
            }
        }

        export class basicStep3 implements Step {
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
                    var prev : string;
                    var itemp : coor = findPos(this.tempName, state);
                    var objsOntop : string[] = reverseObjsOnTop(goal.args[0], state);
                    objsOntop.forEach((obj) => {
                        prev = obj;
                        var i1 : coor = findPos(obj, state);
                        this.stepPlan.push({pol: true, rel: 'move', args: [obj, i1.row.toString() ,itemp.row.toString()]});
                    });
                    playPlan(this.stepPlan, state);
                }
                var i1 : coor = findPos(goal.args[0], state);
                var support : number = findClear(goal.args[1], [], state);
                var supportName : string = state[support].args[0];
                var i2 : coor = findPos(supportName, state);
                this.stepPlan.push({pol: true, rel: 'move', args: [goal.args[0], i1.row.toString() ,i2.row.toString()]});
                playPlan([{pol: true, rel: 'move', args: [goal.args[0], i1.row.toString() ,i2.row.toString()]}],
                                    state);
            }
        }

        export class basicStep4 implements Step {
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
                    var prev : string;
                    var itemp : coor = findPos(this.tempName, state);
                    var objsOntop : string[] = reverseObjsOnTop(goal.args[1], state);
                    objsOntop.forEach((obj) => {
                        prev = obj;
                        var i1 : coor = findPos(obj, state);
                        this.stepPlan.push({pol: true, rel: 'move', args: [obj, i1.row.toString() ,itemp.row.toString()]});
                    });
                    playPlan(this.stepPlan, state);
                }
                var chainedStep : Step = new basicStep3();
                var tst : boolean = chainedStep.isPreRequisitesOk(goals, state, this.goalToDo);

                chainedStep.performStep(goals, state);
                chainedStep.stepPlan.forEach((step) => {
                    this.stepPlan.push(step);
                });
            }
        }

}
