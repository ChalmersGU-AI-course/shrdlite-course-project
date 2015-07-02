///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>

// For me, this was the most interesting part
// it was strange as the idea is that to see prerequisites or plans
// you could just plan and let the mini interpreter playPlan
// except or give costs or change the state.
//
// before I was doing manually what this did very automatically
// This was a precursor to do some kind of learning or modifying rules etc
// probabaly I should try this with lisp or forth which I like the self modifying nature
// for just this

/// Still it inherited too much manual coordinates and the representation from the interpreter
//  the fact is, I was focusing in using the interpreter literal structure from the refactorying I did
//  for the queen problem. I never grew out of that...

//  The representation is incomplete, it doesnt count the position of the arm or if its holding
//  something. The simple tweek is that its not. That arm movement is not as important, at least
//  in the same way that we account for our own main forces but disregard other as friction.
//  The assumption is that the object being hold is dropped where the arm is always. As te only
//  way to hold an object is by taking it from a valid position, dropping it, is also a valid position.
//  Works ok for me, change is trivial but reveals nothing new.

module InnerWorld {

        // A step is a procedure that soves one constrain like onTop or besides
        export interface Step {
            stepPlan : Interpreter.Literal[];
            cost : number;
            isPreRequisitesOk(goals : Interpreter.Literal, state:Representation, world : WorldState) : boolean; // Applicable?
            performStep(goals:Interpreter.Literal, state:Representation, world : WorldState) : number;          // modify state
        }

        export interface Representation {kb : Interpreter.Literal[];}
        export interface coor {pile:number; level:number;} // not surprising

        //just used during debugging
        export class Error implements Error {
            public name = "InnerWorld.Error";
            constructor(public message? : string) {}
            public toString() {return this.name + ": " + this.message}
        }

        ////////////////////////////////////////////////////////////////////////
        // These were used to check if the goal was achieved
        ///////////////////////////////////////////////////////////////////////

        export function ontop(args:string[], state : Representation): boolean {
            if(args[0] == 'floor')
                return false;
            var pos1 : coor = findPos(args[0], state);
            if(args[1] == 'floor')
                return pos1.level==1;
            var pos2 : coor = findPos(args[1], state);
            if((pos1 == null) || (pos2 == null))
                throw new InnerWorld.Error('ontop Not Everything has positions '+Array.prototype.concat.apply([], state.kb));
            if((pos1.pile == pos2.pile) && (pos1.level == pos2.level + 1))
                return true;
            return false;
        }

        export function leftof(args:string[], state : Representation): boolean {
            if((args[0] == 'floor') || (args[1] == 'floor'))
                return false;
            var pos1 : coor = findPos(args[0], state);
            var pos2 : coor = findPos(args[1], state);
            if((pos1 == null) || (pos2 == null))
                throw new InnerWorld.Error('leftof Not Everything has positions '+Array.prototype.concat.apply([], state.kb));
            if(pos1.pile < pos2.pile)
                return true;
            return false;
        }

        export function rightof(args:string[], state : Representation): boolean {
            if((args[0] == 'floor') || (args[1] == 'floor'))
                return false;
            var pos1 : coor = findPos(args[0], state);
            var pos2 : coor = findPos(args[1], state);
            if((pos1 == null) || (pos2 == null))
                throw new InnerWorld.Error('leftof Not Everything has positions '+Array.prototype.concat.apply([], state.kb));
            if(pos1.pile > pos2.pile)
                return true;
            return false;
        }

        export function beside(args:string[], state : Representation): boolean {
            if((args[0] == 'floor') || (args[1] == 'floor'))
                return false;
            var pos1 : coor = findPos(args[0], state);
            var pos2 : coor = findPos(args[1], state);
            if((pos1 == null) || (pos2 == null))
                throw new InnerWorld.Error('leftof Not Everything has positions '+Array.prototype.concat.apply([], state.kb));
            if(Math.abs(pos1.pile - pos2.pile) == 1)
                return true;
            return false;
        }

        export function take(args:string[], state : Representation): boolean {
            if((args[0] == 'floor'))
                return false;
            var pos1 : coor = findPos(args[0], state);
            if(pos1 == null)
                throw new InnerWorld.Error('leftof Not Everything has positions '+Array.prototype.concat.apply([], state.kb));
            var fromObject : string =  state.kb[findTop(pos1.pile, state)].args[0];
            if(fromObject != args[0])
                return false;
            for(var i:number = 0; i < state.kb.length; ++i)
                if(('take' == state.kb[i].rel) && (args[0] == state.kb[i].args[0]))
                    return true;
            return false;
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////7
        /// This helps estimating the heuristic cost
        ///
        export function estimatePlanCost(stepPlan : Interpreter.Literal[], state:Representation):number {
            var ret : number = 0;
            stepPlan.forEach((step) => {
                if(step.rel == 'move') {
                    var from : number = +step.args[1];
                    var to : number = +step.args[2];
                    var what : string = step.args[0];
                    ret += Math.abs(from - to); // you need to move this distance
                    var fromObject : string =  state.kb[findTop(from, state)].args[0];
                    if(fromObject != what) {
                        var i1 : coor = findPos(fromObject, state);
                        var i2 : coor = findPos(what, state);
                        ret +=  (i1.level - i2.level); // because you need to clear all this objects
                    }
                } else if(step.rel == 'take') {
                    var what : string = step.args[0];
                    var i2 : coor = findPos(what, state);
                    var fromObject : string =  state.kb[findTop(i2.pile, state)].args[0];
                    if(fromObject != what) {
                        var i1 : coor = findPos(fromObject, state);
                        ret += (i1.level - i2.level); // because you need to clear all this objects
                    }
                }
            });
            return ret;
        }

        //////////////////////////////////////////////////////////
        // This will be used with the estimation function to get
        //  an estimation of the distance in robot based motion
        //  it created a plan which will then be estimated by
        //  the above function estimatePlanCost
        export function simplestFromToNorm_Plan(from : string, to : string, state : Representation) : Interpreter.Literal[] {
            var i1 : InnerWorld.coor = InnerWorld.findPos(from, state);
            var i2 : InnerWorld.coor = InnerWorld.findPos(to, state);
            var stepPlan : Interpreter.Literal[] = [];
            stepPlan.push({pol: true, rel: 'move', args: [from, i1.pile.toString() ,i2.pile.toString()]});
            stepPlan.push({pol: true, rel: 'move', args: [to, i2.pile.toString() ,i1.pile.toString()]});
            return stepPlan;
        }

        ///////////////////////////////////////////////////////////////////////////
        // I hate to use the word immagination
        // but this function changes the knowledge base and detects if something
        // would not be possible. It throws an exeption if it cant do something
        //
        export function playPlan(stepPlan : Interpreter.Literal[], state:Representation, world : WorldState):number {
            var ret : number = 0;
            stepPlan.forEach((step) => {
                if(step.rel == 'move') { // only move and take actions
                    var from : number = +step.args[1];
                    var to : number = +step.args[2];
                    var what : string = step.args[0];       // To double checks
                    var toObject : ObjectDefinition =  world.objects[state.kb[findTop(to, state)].args[0]];
                    if(toObject != null) {
                      if (toObject.form == 'ball')
                        throw new InnerWorld.Error('Cant put an object on top of a Ball');
                      if (!Constrains.CanBeInside(world.objects[what], toObject))
                            throw new InnerWorld.Error('Cant put that object inside this box');
                    }
                    var i1 : coor = open(from, state);      // Open Both
                    var i2 : coor = open(to, state);        // Open Both
                    setPos(what, state, {pile:i2.pile, level:i2.level+1});
                    close(from, findObjAt({pile:i1.pile, level:i1.level-1}, state), state);
                    close(to, what, state);                 // Close Both
                    if(from != to)
                        ret += Math.abs(from-to) + 2;
                } else if(step.rel == 'take') {
                    var from : number = +step.args[1];
                    var what : string = step.args[0];
                    if(what != state.kb[findTop(from, state)].args[0])
                        throw new InnerWorld.Error('Cant take object');
                    state.kb.push({pol: true, rel: 'take', args: [what]});
                }
            });
            return ret;
        }

        // The knowledge base has a convenient verb taken from Winograd called clear
        //  that says that you are the top object in a pile.
        //  but it has to be mantained as we move objects from pile to pile
        function open(pile : number, state:Representation) : coor {
            var kbNum : number = findTop(pile, state);
            var i : coor = findPos(state.kb[kbNum].args[0], state);
            state.kb.splice(kbNum,1);
            return i;
        }

        function close(pile : number, what : string, state : Representation) : void {
            state.kb.push({pol: true, rel: 'clear', args: [what, pile.toString()]}); // Close it
        }

        //////////////////////////////////////////////////////////7
        // We use our own innerworld representation
        // so we have to translate from the stack representation
        export function flatten(stacks: string[][], holding: string, arm: number) : Representation {
            var oneIntprt : Interpreter.Literal[] = [];
            var pile : number = 0;
            stacks.forEach((stack) => {
                var prev : string = 'floor'+ pile;
                var level : number = 0;
                stack.forEach((ele) => {
                    oneIntprt.push({pol: true, rel: 'in', args: [pile.toString(), level.toString(), prev]});
                    level++;
                    prev = ele;
                });

                if((holding != null) && (holding != '') && (arm == pile)) {
                    oneIntprt.push({pol: true, rel: 'in', args: [pile.toString(), level.toString(), prev]});
                    level++;
                    prev = holding;
                }

                oneIntprt.push({pol: true, rel: 'in', args: [pile.toString(), level.toString(), prev]});
                oneIntprt.push({pol: true, rel: 'clear', args: [prev, pile.toString()]});
                ++pile;
            });

            if((holding != null) && (holding != ''))
                oneIntprt.push({pol: true, rel: 'take', args: [holding]});

            this.state = {kb:oneIntprt};
            return this.state;
        }

        //////////////// Miscelaneous find functions ///////////////////////////

        function findTop(pile : number, state : Representation) : number {
            for(var i:number = 0; i < state.kb.length; ++i)
                if(('clear' == state.kb[i].rel) && (pile == +state.kb[i].args[1]))
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
            return {pile : +state.kb[i].args[0], level : +state.kb[i].args[1]};
        }
        function setPos(arg : string, state : Representation, newCoor : coor) {
            var i : number = findIn(arg, state);
            if(i==-1)
                return;
            state.kb[i].args[0] = newCoor.pile.toString();
            state.kb[i].args[1] = newCoor.level.toString();
        }

        function findObjAt(newCoor : coor, state : Representation) : string {
            for(var i:number = 0; i < state.kb.length; ++i)
                if(('in' == state.kb[i].rel)
                    && (newCoor.pile == +state.kb[i].args[0])
                    && (newCoor.level == +state.kb[i].args[1]))
                    return state.kb[i].args[2];
            return null;
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

        // We are stack so we need to get the objects from the facts in the Knowledgebase reversed
        function reverseObjsOnTop(arg : string, state : Representation) : string[] {
            var pos : coor = findPos(arg, state);
            var res : string[] = [];
            var n : number = 0;
            do {
                ++n;
                var chg : boolean = false;
                for(var i:number = 0; i < state.kb.length; ++i)
                    if(('in' == state.kb[i].rel)
                       && (pos.pile == +state.kb[i].args[0])
                       && (pos.level + n == +state.kb[i].args[1]) ) {
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

        // this was the second option I would do if I think how to use the world
        // Im using the floor a lot
        export class basicStep1 implements Step {
            stepPlan : Interpreter.Literal[];
            cost : number = 0;

            isPreRequisitesOk(goal : Interpreter.Literal, state:Representation, world : WorldState) : boolean {
                if(!hasFloor(goal))
                    return false;
                var clearObj1 : boolean = findClear(goal.args[0], [], state) != -1;
                var clearObj2 : boolean = findClear(goal.args[1], [], state) != -1;
                if((!clearObj1) || (!clearObj2))
                    return false;
                return true;
            }
            performStep(goal : Interpreter.Literal, state:Representation, world : WorldState) : number {
                var i1 : coor = findPos(goal.args[0], state);
                var floor : number = findClear(goal.args[1], [], state);
                var floorName : string = state.kb[floor].args[0];
                var i2 : coor = findPos(floorName, state);
                this.stepPlan = [];
                this.stepPlan.push({pol: true, rel: 'move', args: [goal.args[0], i1.pile.toString() ,i2.pile.toString()]});
                this.cost = playPlan(this.stepPlan, state, world);
                return this.cost;
            }
        }

        // this was the third option I would do if I think how to use the world
        // Im using the floor a lot
        export class basicStep2 implements Step {
            stepPlan : Interpreter.Literal[];
            cost : number = 0;

            floorName : string;
            tempName : string;

            isPreRequisitesOk(goal : Interpreter.Literal, state:Representation, world : WorldState) : boolean {
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
            performStep(goal : Interpreter.Literal, state:Representation, world : WorldState) : number {
                var objsOntop : string[] = reverseObjsOnTop(goal.args[0], state);
                var itemp : coor = findPos(this.tempName, state);
                var prev : string;
                this.stepPlan = [];
                objsOntop.forEach((obj) => {
                    prev = obj;
                    var i1 : coor = findPos(obj, state);
                    this.stepPlan.push({pol: true, rel: 'move', args: [obj, i1.pile.toString() ,itemp.pile.toString()]});
                });

                this.cost = playPlan(this.stepPlan, state, world);

                var chainedStep : Step = new basicStep1();
                var tst : boolean = chainedStep.isPreRequisitesOk(goal, state, world);

                this.cost += chainedStep.performStep(goal, state, world);
                chainedStep.stepPlan.forEach((step) => {
                    this.stepPlan.push(step);
                });
                return this.cost;
            }
        }

        // this became more generic, obviously just one rule would be needed
        // but I wanted to test this multi rule thing to the limit
        export class basicStep3 implements Step {
            stepPlan : Interpreter.Literal[];
            cost : number = 0;

            tempName : string = null;

            isPreRequisitesOk(goal : Interpreter.Literal, state:Representation, world : WorldState) : boolean {
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
            performStep(goal : Interpreter.Literal, state:Representation, world : WorldState) : number {
                this.stepPlan = [];
                this.cost = 0;
                if(this.tempName != null) {
                    var prev : string;
                    var itemp : coor = findPos(this.tempName, state);
                    var objsOntop : string[] = reverseObjsOnTop(goal.args[0], state);
                    objsOntop.forEach((obj) => {
                        prev = obj;
                        var i1 : coor = findPos(obj, state);
                        this.stepPlan.push({pol: true, rel: 'move', args: [obj, i1.pile.toString() ,itemp.pile.toString()]});
                    });
                    this.cost += playPlan(this.stepPlan, state, world);
                }
                var i1 : coor = findPos(goal.args[0], state);
                var support : number = findClear(goal.args[1], [], state);
                var supportName : string = state.kb[support].args[0];
                var i2 : coor = findPos(supportName, state);
                this.stepPlan.push({pol: true, rel: 'move', args: [goal.args[0], i1.pile.toString() ,i2.pile.toString()]});
                this.cost += playPlan([{pol: true, rel: 'move', args: [goal.args[0], i1.pile.toString() ,i2.pile.toString()]}],
                                    state, world);
                return this.cost;
            }
        }

        // this is the generic rule, But doesnt catch exeptions
        export class basicStep4 implements Step {
            stepPlan : Interpreter.Literal[];
            cost : number = 0;

            tempName : string = null;

            isPreRequisitesOk(goal : Interpreter.Literal, state:Representation, world : WorldState) : boolean {
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
            performStep(goal : Interpreter.Literal, state:Representation, world : WorldState) : number {
                this.stepPlan = [];
                this.cost = 0;
                {
                    var prev : string;
                    var itemp : coor = findPos(this.tempName, state);
                    var objsOntop : string[] = reverseObjsOnTop(goal.args[1], state);
                    objsOntop.forEach((obj) => {
                        prev = obj;
                        var i1 : coor = findPos(obj, state);
                        this.stepPlan.push({pol: true, rel: 'move', args: [obj, i1.pile.toString() ,itemp.pile.toString()]});
                    });
                    this.cost += playPlan(this.stepPlan, state, world);
                }
                var chainedStep : Step = new basicStep3();
                var tst : boolean = chainedStep.isPreRequisitesOk(goal, state, world);

                this.cost += chainedStep.performStep(goal, state, world);
                chainedStep.stepPlan.forEach((step) => {
                    this.stepPlan.push(step);
                });
                return this.cost;
            }
        }

        // This is the only rule needed, it is very stubborn, itself this could be a A* search or anything
        // depending in the implementation it could be better torun the a* generic o optimize this to
        // the particular world physics
        // The main a* procedure is just trying to get rid of unfulfiled constrains.
        // My rationale here is that moving the robot arm is nice, I dont want to find the smallest smalles route
        export class basicStep5 implements Step {
            stepPlan : Interpreter.Literal[];
            cost : number = 0;

            tempName : string = null;
            notPossibleStacks : number[];
            maxStack : number = -1;
            rel : string;
            dest : number = -1;

            isPreRequisitesOk(goal : Interpreter.Literal, state:Representation, world : WorldState) : boolean {
                var i2 : coor;
                this.notPossibleStacks = [findPos(goal.args[0], state).pile];// not on top of yourself
                switch(this.rel) {
                case 'ontop':
                        if(goal.args[1] != 'floor')
                            this.notPossibleStacks.push(findPos(goal.args[1], state).pile);// or ontop of the destination
                        this.dest = + 1;
                        break;
                case 'leftof':
                        if((goal.args[0] == 'floor') || (goal.args[1] == 'floor'))
                            return false;
                        i2 = findPos(goal.args[1], state);
                        if(i2.pile == 0)
                            return false;
                        this.dest = - 1;
                        break;
                case 'rightof':
                        if((goal.args[0] == 'floor') || (goal.args[1] == 'floor'))
                            return false;
                        i2 = findPos(goal.args[1], state);
                        this.dest = + 1;
                        break;
                case 'beside':
                        if((goal.args[0] == 'floor') || (goal.args[1] == 'floor'))
                            return false;
                        i2 = findPos(goal.args[1], state);
                        if(i2.pile == 0)
                            this.dest = + 1;
                        else
                            this.dest = - 1;
                        break;
                case 'ontop':
                        break;
                otherwise:
                    throw new InnerWorld.Error('wrong relationship '+this.rel);
                }
                for(var i:number = 0; i < state.kb.length; ++i)
                    if('clear' == state.kb[i].rel) {
                        var pile : number = +state.kb[i].args[1];
                        if((world.objects[state.kb[i].args[0]] != null) &&
                           (world.objects[state.kb[i].args[0]].form == 'ball')) {
                            this.notPossibleStacks.push(pile);
                            continue;
                        }
                        if(pile > this.maxStack)
                            this.maxStack = pile;
                    }
                var i : number;
                if(this.dest >0)
                    i = this.getNonProblematicSpot();
                else
                    i = this.getNonProblematicSpotReverse();
                if(i != -1) {
                        this.tempName =  state.kb[findTop(i, state)].args[0];
                        this.notPossibleStacks.push(i);
                        return true;
                }
                return false;
            }
            getNonProblematicSpot() : number {
                for(var i:number = 0; i <= this.maxStack; ++i) {
                    var found : boolean = false;
                    for(var j:number = 0; j< this.notPossibleStacks.length; ++j)
                        if(i == this.notPossibleStacks[j]) {
                            found = true;
                            break;
                        }
                    if(!found)
                        return i;
                }
                return -1;
            }
            getNonProblematicSpotReverse() : number {
                for(var i:number = this.maxStack; i >=0; --i) {
                    var found : boolean = false;
                    for(var j:number = 0; j< this.notPossibleStacks.length; ++j)
                        if(i == this.notPossibleStacks[j]) {
                            found = true;
                            break;
                        }
                    if(!found)
                        return i;
                }
                return -1;
            }
            doOneStep(ele : Interpreter.Literal, state:Representation, world : WorldState) {
                for(var i : number = 0; i <= this.maxStack; ++i) {
                    var found : boolean = false;
                    for(var j:number = 0; j< this.notPossibleStacks.length; ++j)
                        if(i == this.notPossibleStacks[j]) {
                            found = true;
                            break;
                        }
                    if(found)
                        continue;
                    ele.args[2] = i.toString();
                    try {
                        this.cost += playPlan([ele], state, world);
                        this.stepPlan.push(ele);
                        return;
                    } catch(ex) {}
                }
                throw new InnerWorld.Error('No room to place Objects');
            }
            doEachStep(objsOntop : string[], state:Representation, world : WorldState) {
                var itemp : coor = findPos(this.tempName, state);
                objsOntop.forEach((obj) => {
                    var i1 : coor = findPos(obj, state);
                    var ele = {pol: true, rel: 'move', args: [obj, i1.pile.toString() ,itemp.pile.toString()]};
                    try {
                        this.cost += playPlan([ele], state, world);
                        this.stepPlan.push(ele);
                    } catch(ex) {
                        this.doOneStep(ele, state, world);
                    }
                });
            }
            performStep(goal : Interpreter.Literal, state:Representation, world : WorldState) : number {
                this.stepPlan = [];
                this.cost = 0;

                if(this.rel != 'take') {
                    var spotToClear : string = goal.args[1];
                    if(this.rel == 'ontop') {
                        if(spotToClear == 'floor') {// ok but what floor?
                            var i : number = this.getNonProblematicSpot();
                            if (i == -1)
                                throw new InnerWorld.Error('No space');
                            this.notPossibleStacks.push(i);
                            spotToClear = 'floor'+i;
                        }
                        var clearObj2 : boolean = findClear(spotToClear, [], state) != -1;
                        if(!clearObj2) // Clear destination
                            this.doEachStep(reverseObjsOnTop(spotToClear, state), state, world);
                    }
                    var clearObj1 : boolean = findClear(goal.args[0], [], state) != -1;
                    if(!clearObj1) // Clear source
                        this.doEachStep(reverseObjsOnTop(goal.args[0], state), state, world);
                    var i1 : coor = findPos(goal.args[0], state);
                    var i2 : coor = findPos(spotToClear, state);
                    if(this.rel == 'ontop') {
                        var ele = {pol: true, rel: 'move', args: [goal.args[0], i1.pile.toString() ,i2.pile.toString()]};
                        this.stepPlan.push(ele);
                        this.cost += playPlan([ele], state, world);
                    } else {
                        for(var i = i2.pile + this.dest; (i>=0) && (i<=this.maxStack); i+=this.dest) {
                            var found : boolean = false;
                            for(var j:number = 0; j< this.notPossibleStacks.length; ++j)
                                if(i == this.notPossibleStacks[j]) {
                                    found = true;
                                    break;
                                }
                            if(!found) {
                                var ele = {pol: true, rel: 'move', args: [goal.args[0], i1.pile.toString() ,i.toString()]};
                                this.stepPlan.push(ele);
                                this.cost += playPlan([ele], state, world);
                                break;
                            }
                        }
                    }
                } else {
                    var clearObj1 : boolean = findClear(goal.args[0], [], state) != -1;
                    if(!clearObj1) // Clear source
                        this.doEachStep(reverseObjsOnTop(goal.args[0], state), state, world);
                    var i1 : coor = findPos(goal.args[0], state);
                    var ele = {pol: true, rel: 'take', args: [goal.args[0], i1.pile.toString()]};
                    this.stepPlan.push(ele);
                    this.cost += playPlan([ele], state, world);
                }
                return this.cost;
            }
        }

    // I dont not now this language enough to know when to clone or not. I just clone everything...
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
