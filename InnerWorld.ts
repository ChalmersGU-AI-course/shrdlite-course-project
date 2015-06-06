///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>

module InnerWorld {

        export interface Step {
            stepPlan : Interpreter.Literal[];
            cost : number;
            isPreRequisitesOk(goals : Interpreter.Literal, state:Representation) : boolean;
            performStep(goals:Interpreter.Literal, state:Representation) : number;
        }

        export interface Representation {kb : Interpreter.Literal[];}
        export interface coor {row:number; col:number;}

        export class Error implements Error {
            public name = "InnerWorld.Error";
            constructor(public message? : string) {}
            public toString() {return this.name + ": " + this.message}
        }


        export function ontop(args:string[], state : Representation): boolean {
            if(args[0] == 'floor')
                return false;
            var pos1 : coor = findPos(args[0], state);
            if(args[1] == 'floor')
                return pos1.col==1;
            var pos2 : coor = findPos(args[1], state);
            if((pos1 == null) || (pos2 == null))
                throw new InnerWorld.Error('Everything has positions '+Array.prototype.concat.apply([], state.kb));
            if((pos1.row == pos2.row) && (pos1.col == pos2.col + 1))
                return true;
            return false;
        }

        export function estimatePlanCost(stepPlan : Interpreter.Literal[], state:Representation):number {
            var ret : number = 0;
            stepPlan.forEach((step) => {
                if(step.rel == 'move') {
                    var from : number = +step.args[1];
                    var to : number = +step.args[2];
                    var what : string = step.args[0];
                    ret += Math.abs(from - to);
                    var fromObject : string =  state.kb[findTop(from, state)].args[0];
                    if(fromObject != what) {
                        var i1 : coor = findPos(fromObject, state);
                        var i2 : coor = findPos(what, state);
                        ret +=  (i1.row - i2.row) * 2;
                    }
                }
            });
            return ret;
        }

        export function playPlan(stepPlan : Interpreter.Literal[], state:Representation):number {
            var ret : number = 0;
            stepPlan.forEach((step) => {
                if(step.rel == 'move') {
                    var from : number = +step.args[1];
                    var to : number = +step.args[2];
                    var what : string = step.args[0];       // To double checks
                    var i1 : coor = open(from, state);      // Open Both
                    var i2 : coor = open(to, state);        // Open Both
                    setPos(what, state, {row:i2.row, col:i2.col+1});

                    close(from, findObjAt({row:i1.row, col:i1.col-1}, state), state);
                    close(to, what, state);                 // Close Both
                    if(from != to)
                        ret += Math.abs(from-to) + 2;
                }
            });
            return ret;
        }

        function open(row : number, state:Representation) : coor {
            var kbNum : number = findTop(row, state);
            var i : coor = findPos(state.kb[kbNum].args[0], state);
            state.kb.splice(kbNum,1);
            return i;
        }

        function close(row : number, what : string, state : Representation) : void {
            state.kb.push({pol: true, rel: 'clear', args: [what, row.toString()]}); // Close it
        }

        export function flatten(stacks: string[][]) : Representation {
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
            this.state = {kb:oneIntprt};
            return this.state;
        }

        function findTop(row : number, state : Representation) : number {
            for(var i:number = 0; i < state.kb.length; ++i)
                if(('clear' == state.kb[i].rel) && (row == +state.kb[i].args[1]))
                    return i;
            return -1;
        }

        function findIn(arg : string, state : Representation) : number {
            for(var i:number = 0; i < state.kb.length; ++i)
                if(('in' == state.kb[i].rel) && (arg == state.kb[i].args[2]))
                    return i;
            return -1;
        }

        export function findPos(arg : string, state : Representation) : coor {
            var i : number = findIn(arg, state);
            if(i==-1)
                return null;
            return {row : +state.kb[i].args[0], col : +state.kb[i].args[1]};
        }
        function setPos(arg : string, state : Representation, newCoor : coor) {
            var i : number = findIn(arg, state);
            if(i==-1)
                return;
            state.kb[i].args[0] = newCoor.row.toString();
            state.kb[i].args[1] = newCoor.col.toString();
        }

        function findObjAt(newCoor : coor, state : Representation) : string {
            for(var i:number = 0; i < state.kb.length; ++i)
                if(('in' == state.kb[i].rel)
                    && (newCoor.row == +state.kb[i].args[0])
                    && (newCoor.col == +state.kb[i].args[1]))
                    return state.kb[i].args[2];
            return null;
        }

        function reverseObjsOnTop(arg : string, state : Representation) : string[] {
            var pos : coor = findPos(arg, state);
            var res : string[] = [];
            var n : number = 0;
            do {
                ++n;
                var chg : boolean = false;
                for(var i:number = 0; i < state.kb.length; ++i)
                    if(('in' == state.kb[i].rel)
                       && (pos.row == +state.kb[i].args[0])
                       && (pos.col + n == +state.kb[i].args[1]) ) {
                       var obj = state.kb[i].args[2];
                       res = Array.prototype.concat.apply([obj], res);
                       if(findClear(obj, [], state) != -1)
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

        export function findClear(arg : string, used : string[], state : Representation) : number {
            for(var i:number = 0; i < state.kb.length; ++i)
                if('clear' == state.kb[i].rel) {
                    if(arg == state.kb[i].args[0])
                        return i;
                    if((arg == 'floor') && (state.kb[i].args[0].length > 1)) {
                        var exists : boolean = false;
                        for(var j:number = 0; j < state.kb.length; ++j)
                            if(used[j] == state.kb[i].args[0])
                                exists = true;
                        if(!exists)
                            return i;
                    }
                }
            return -1;
        }

       function hasFloor(goal : Interpreter.Literal) : boolean {
            if((goal.rel == 'ontop') && (goal.args[1] == 'floor'))
                    return true;
            return false;
        }

        //////////////////////////////////////
        ///
        ///  Strategic Steps. Too simple right now

        export class emptyStep implements Step {
            constructor(aStepPlan : Interpreter.Literal[], aCost : number) {
                this.stepPlan = clone(aStepPlan);
                this.cost = aCost;
            }
            stepPlan : Interpreter.Literal[] = [];
            cost : number = 0;

            isPreRequisitesOk(goal : Interpreter.Literal, state:Representation) : boolean {
                return false;
            }
            performStep(goal : Interpreter.Literal, state:Representation) : number {
                return this.cost;
            }
        }

        export class basicStep0 implements Step {
            stepPlan : Interpreter.Literal[];
            cost : number = 0;

            isPreRequisitesOk(goal : Interpreter.Literal, state:Representation) : boolean {
                return false;
            }
            performStep(goal : Interpreter.Literal, state:Representation) : number {
                this.stepPlan = [];
                this.cost = 0;
                return this.cost;
            }
        }

        export class basicStep1 implements Step {
            stepPlan : Interpreter.Literal[];
            cost : number = 0;

            isPreRequisitesOk(goal : Interpreter.Literal, state:Representation) : boolean {
                if(!hasFloor(goal))
                    return false;
                var clearObj1 : boolean = findClear(goal.args[0], [], state) != -1;
                var clearObj2 : boolean = findClear(goal.args[1], [], state) != -1;
                if((!clearObj1) || (!clearObj2))
                    return false;
                return true;
            }
            performStep(goal : Interpreter.Literal, state:Representation) : number {
                var i1 : coor = findPos(goal.args[0], state);
                var floor : number = findClear(goal.args[1], [], state);
                var floorName : string = state.kb[floor].args[0];
                var i2 : coor = findPos(floorName, state);
                this.stepPlan = [];
                this.stepPlan.push({pol: true, rel: 'move', args: [goal.args[0], i1.row.toString() ,i2.row.toString()]});
                this.cost = playPlan(this.stepPlan, state);
                return this.cost;
            }
        }

        export class basicStep2 implements Step {
            stepPlan : Interpreter.Literal[];
            cost : number = 0;

            floorName : string;
            tempName : string;

            isPreRequisitesOk(goal : Interpreter.Literal, state:Representation) : boolean {
                if(!hasFloor(goal))
                    return false;
                var floor : number = findClear(goal.args[1], [], state);
                if(floor == -1)
                    return false;
                this.floorName = state.kb[floor].args[0];
                var tempFloor : number = findClear(goal.args[1], [this.floorName], state);
                if(tempFloor == -1)
                    return false;
                this.tempName = state.kb[tempFloor].args[0];
                return true;
            }
            performStep(goal : Interpreter.Literal, state:Representation) : number {
                var objsOntop : string[] = reverseObjsOnTop(goal.args[0], state);
                var itemp : coor = findPos(this.tempName, state);
                var prev : string;
                this.stepPlan = [];
                objsOntop.forEach((obj) => {
                    prev = obj;
                    var i1 : coor = findPos(obj, state);
                    this.stepPlan.push({pol: true, rel: 'move', args: [obj, i1.row.toString() ,itemp.row.toString()]});
                });

                this.cost = playPlan(this.stepPlan, state);

                var chainedStep : Step = new basicStep1();
                var tst : boolean = chainedStep.isPreRequisitesOk(goal, state);

                this.cost += chainedStep.performStep(goal, state);
                chainedStep.stepPlan.forEach((step) => {
                    this.stepPlan.push(step);
                });
                return this.cost;
            }
        }

        export class basicStep3 implements Step {
            stepPlan : Interpreter.Literal[];
            cost : number = 0;

            tempName : string = null;

            isPreRequisitesOk(goal : Interpreter.Literal, state:Representation) : boolean {
                var clearObj2 : boolean = findClear(goal.args[1], [], state) != -1;
                if(!clearObj2)
                    return false;
                var clearObj1 : boolean = findClear(goal.args[0], [], state) != -1;
                if(!clearObj1) {// need a floor
                    var nonUsable: string = state.kb[findClear(goal.args[1], [], state)].args[0];
                    var floor : number = findClear('floor', [nonUsable], state);
                    if(floor == -1)
                        return false;
                    this.tempName = state.kb[floor].args[0];
                } else this.tempName = null;
                return true;
            }
            performStep(goal : Interpreter.Literal, state:Representation) : number {
                this.stepPlan = [];
                this.cost = 0;
                if(this.tempName != null) {
                    var prev : string;
                    var itemp : coor = findPos(this.tempName, state);
                    var objsOntop : string[] = reverseObjsOnTop(goal.args[0], state);
                    objsOntop.forEach((obj) => {
                        prev = obj;
                        var i1 : coor = findPos(obj, state);
                        this.stepPlan.push({pol: true, rel: 'move', args: [obj, i1.row.toString() ,itemp.row.toString()]});
                    });
                    this.cost += playPlan(this.stepPlan, state);
                }
                var i1 : coor = findPos(goal.args[0], state);
                var support : number = findClear(goal.args[1], [], state);
                var supportName : string = state.kb[support].args[0];
                var i2 : coor = findPos(supportName, state);
                this.stepPlan.push({pol: true, rel: 'move', args: [goal.args[0], i1.row.toString() ,i2.row.toString()]});
                this.cost += playPlan([{pol: true, rel: 'move', args: [goal.args[0], i1.row.toString() ,i2.row.toString()]}],
                                    state);
                return this.cost;
            }
        }

        export class basicStep4 implements Step {
            stepPlan : Interpreter.Literal[];
            cost : number = 0;

            tempName : string = null;

            isPreRequisitesOk(goal : Interpreter.Literal, state:Representation) : boolean {
                if(goal.args[1] == 'floor')
                    return false;
                {// need a floor
                    var floor : number = findClear('floor', [], state);
                    if(floor == -1)
                        return false;
                    this.tempName = state.kb[floor].args[0];
                }
                return true;
            }
            performStep(goal : Interpreter.Literal, state:Representation) : number {
                this.stepPlan = [];
                this.cost = 0;
                {
                    var prev : string;
                    var itemp : coor = findPos(this.tempName, state);
                    var objsOntop : string[] = reverseObjsOnTop(goal.args[1], state);
                    objsOntop.forEach((obj) => {
                        prev = obj;
                        var i1 : coor = findPos(obj, state);
                        this.stepPlan.push({pol: true, rel: 'move', args: [obj, i1.row.toString() ,itemp.row.toString()]});
                    });
                    this.cost += playPlan(this.stepPlan, state);
                }
                var chainedStep : Step = new basicStep3();
                var tst : boolean = chainedStep.isPreRequisitesOk(goal, state);

                this.cost += chainedStep.performStep(goal, state);
                chainedStep.stepPlan.forEach((step) => {
                    this.stepPlan.push(step);
                });
                return this.cost;
            }
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
