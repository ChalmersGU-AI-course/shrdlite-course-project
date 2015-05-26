///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
        var ambiguities : string[] = [];
        parses.forEach((parseresult) => {
            var intprt : Result = <Result>parseresult;
            try {
                intprt.intp = interpretCommand(intprt.prs, currentState);
                interpretations.push(intprt);
            } catch (err) {
                if (err instanceof Ambiguity) {
                    var form = err.message;
                    if (!contains(ambiguities, form)) {
                        ambiguities.push(form);
                    }
                }
            }
        });
        if (interpretations.length == 1) {
            console.log(interpretations);
            return interpretations;
        } else if (ambiguities.length > 0) {
            var msg : string = "Possibly ambiguous command. Try being more specific about the following objects: ";
            ambiguities.forEach((form) => {
                msg = msg + form + " ";
            });
            throw new Interpreter.Error(msg);
        } else if (interpretations.length == 0) {
            throw new Interpreter.Error("No valid interpretation found.");
        } else {
            // Scenario: the user used too many relative descriptors.
            // We can't say what they were ambiguous about.
            var msg : string = "Ambiguous command; " +
                interpretations.length + " interpretations found. Please use fewer relative descriptions.";
            throw new Interpreter.Error(msg);
        }
        
        
        function contains(a, obj) : boolean {
            for (var i = 0; i < a.length; i++) {
                if (a[i] === obj) {
                    return true;
                }
            }
            return false;
        }
    }


    export interface Goal {goal?:Literal; list?:Goal[]; isAnd?:boolean;}
    export interface Result extends Parser.Result {intp:Goal;}
    export interface Literal {pol:boolean; rel:string; args:string[];}
    



    export function interpretationToString(res : Result) : string {
        return goalToString(res.intp);
    }

    export class Error implements Error {
        public name = "Interpreter.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }
    
    //////////////////////////////////////////////////////////////////////
    // private classes and interfaces

    class Ambiguity implements Error {
        public name = "Interpreter.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }

    interface CandList {
        candidates : string[];
        quant : string;
    }



    //////////////////////////////////////////////////////////////////////
    // private functions
    
    
    function goalToString(goal : Goal) : string {
        console.log(goal);
        if (goal.goal != null) {
            return literalToString(goal.goal);
        } else {
            var goals = goal.list.slice();
            var str : string = "(" + goalToString(goals.pop());
            var joiningSymbol : string = goal.isAnd ? "&" : "|";
            goals.forEach((subGoal) => {
                str = str + " " + joiningSymbol + " " + goalToString(subGoal);
            });
            str = str + ")";
            return str;
        }
    }

    function literalToString(lit : Literal) : string {
        return (lit.pol ? "" : "-") + lit.rel + "(" + lit.args.join(",") + ")";
    }


    // Main function
    function interpretCommand(cmd : Parser.Command, state : WorldState) : Goal {


        function getCandListFromEnt(ent : Parser.Entity) : CandList {
            var cands : string[] = getCandidatesFromObj(ent.obj);
            return {candidates : cands, quant : ent.quant};
        }
        
        function getCandidatesFromObj(obj : Parser.Object) : string[] {
            var form = obj.form;
            if (form != null) {
                if (form == "floor") {
                    return [form];
                } else {
                    return getCandidatesFromDesc(form, obj.color, obj.size);
                }
            } else {
                var locationList : CandList = getCandListFromEnt(obj.loc.ent);
                var cands1 : string[] = getCandidatesFromObj(obj.obj);
                var cands2 : string[] = [];
                cands1.forEach((c) => {
                    if (isInLocation(c, obj.loc.rel, locationList)) {                        
                        cands2.push(c);
                    }
                });
                return cands2;
            }
        }
        
        // Returns all objects in the world which fit a given description
        // i.e. {form, ?color, ?size}
        function getCandidatesFromDesc(form : string, color : string, size : string)
                 : string[] {
            function isCandidate(objDef) : boolean {
                return ((form == "anyform" || objDef.form == form) && 
                        (color == null || objDef.color == color) &&
                        (size == null || objDef.size == size));
            }
            
            var objDef : ObjectDefinition;
            var candidates : string[] = [];

            if (state.holding != null){
                objDef = state.objects[state.holding];
                isCandidate(objDef) ? candidates.push(state.holding) : 0 ;
            }
            state.stacks.forEach((stack) => {
                stack.forEach((objectInStack) => {
                    objDef = state.objects[objectInStack];
                    isCandidate(objDef) ? candidates.push(objectInStack) : 0 ; 
                });
            });
            return candidates;
        }
        
        function isInLocation(candidate : string, relation : string, list : CandList) 
                 : boolean {
            var quant : string = list.quant;
            var result : boolean
            if (quant == "the" || quant == "any") {
                // E.g. is the ball "inside any box".
                // Check all boxes, if one is a match, return true.
                result = false;
                list.candidates.forEach((obj) => {
                    if (fulfilsCondition(relation, candidate, obj)) {
                        result = true;
                    }
                });
                return result;
            } else if (quant == "all") {
                result = true;
                // E.g. is the ball "left of all tables".
                // Check all tables, if one does not match, return false.
                list.candidates.forEach((obj) => {
                    if (!fulfilsCondition(relation, candidate, obj)) {
                        result = false;
                    }
                });
                return result;
            } else {
                throw new Error("Quantifier \""+quant+"\" not implemented yet.");
            }
        }
        
        
        function fulfilsCondition(rel : string, a : string, b : string) : boolean {
            if (state.holding == "a" || state.holding == "b") {
                return false;
            }
            var aPos : number[] = find_obj(state.stacks, a);
            var bPos : number[];
            
            if (b == "floor") {
              if (rel == "above") {
                return true;
              } else if (rel == "ontop") {
                return (aPos[1] == 0);
              } else {
                //Can't be under, beside, leftof, rightof, or inside the floor
                return false;
              }
              
            } else {
            
              bPos = find_obj(state.stacks, b);
              if (rel == "leftof") {
                return (aPos[0] < bPos[0]);
              } else if (rel == "rightof") {
                return (aPos[0] > bPos[0]);          
              } else if (rel == "beside") {
                return (Math.abs(aPos[0] - bPos[0]) == 1);
              } else if (rel == "under") {
                return ((aPos[0] == bPos[0]) &&
                        ((aPos[1] - bPos[1]) < 0));   
              } else if (rel == "above") {
                return ((aPos[0] == bPos[0]) &&
                        ((aPos[1] - bPos[1]) > 0));                      
              } else if (rel == "ontop") {
                return ((aPos[0] == bPos[0]) &&
                        ((aPos[1] - bPos[1]) == 1));          
              } else if (rel == "inside") {
                return ((aPos[0] == bPos[0]) &&
                        ((aPos[1] - bPos[1]) == 1) &&
                        state.objects[b].form == "box");
              } else {
              //something is wrong; every relation should be one of the above
                throw new Error("Unsupported relation");
              }
            }
        }
        
        function find_obj(stacks : string[][], obj : string) {
          for (var i = 0 ; i < stacks.length; i++){
            for (var ii = 0 ; ii < stacks[i].length ; ii++){
              if (obj == stacks[i][ii]){
                return [i,ii]  
              }
            } 
          }
          throw new Error("No such object");
        }
        
        function makeGoal(relation : string, objects : string[]) : Goal {
            var lit : Literal = {pol: true, rel: relation, args: objects};
            return {goal:lit};
        }
        
        function makeHoldingGoal(candList : CandList) : Goal {
            var candidates : string[] = candList.candidates;
            if (candidates.length == 0) {
                throw new Error("No objects of that description found.");
            } else if (candList.quant == "all" && candidates.length > 1) {
                throw new Error("Cannot hold more than one object.");
            } else if (candList.quant == "the" && candidates.length > 1) {
                var form : string = state.objects[candidates[0]].form;
                throw new Ambiguity(form);
            } else {
                var goals : Goal[] = [];
                candList.candidates.forEach((c) => {
                    goals.push(makeGoal("holding", [c]));
                });
                return {list:goals, isAnd:false};
            }
        }
        
        function makeMovingGoal(relation : string, subjList : CandList, objList : CandList)
                 : Goal {
            var subjCands : string[] = subjList.candidates;
            var subjQuant : string = subjList.quant;
            var objCands : string[] = objList.candidates;
            var objQuant : string = objList.quant;
            var goals : Goal[] = [];
            if (subjCands.length == 0 || objCands.length == 0) {
                throw new Error("No objects of that description found.");
            } else if (subjQuant == "the" && subjCands.length > 1) {
                    var form : string = state.objects[subjCands[0]].form;
                    throw new Ambiguity(form);
            } else if (objQuant == "the" && objCands.length > 1) {
                    var form : string = state.objects[objCands[0]].form;
                    throw new Ambiguity(form);
            } else if (subjQuant == "the") {
                // The ball
                var subject : string = subjCands[0];
                if (objQuant == "the") {
                    // Put the ball left of the brick
                    return makeGoal(relation, [subject, objCands[0]]);
                } else if (objQuant == "any") {
                    // Put the ball left of any brick
                    objCands.forEach((object) => {
                        goals.push(makeGoal(relation, [subject, object]));
                    });
                    return {list:goals, isAnd:false};
                } else if (objQuant == "all") {
                    // Put the ball left of all bricks
                    objCands.forEach((object) => {
                        goals.push(makeGoal(relation, [subject, object]));
                    });
                    return {list:goals, isAnd:true};
                } else {
                    throw new Error("Quantifier \""+objQuant+"\" not implemented yet.");
                }
            } else if (subjQuant == "any") {
                // Any ball
                if (objQuant == "the") {
                    // Put any ball left of the brick
                    var object = objCands[0];
                    subjCands.forEach((subject) => {
                        goals.push(makeGoal(relation, [subject, object]));
                    });
                    return {list:goals, isAnd:false};
                } else if (objQuant == "any") {
                    // Put any ball left of any brick
                    objCands.forEach((object) => {
                        subjCands.forEach((subject) => {
                            goals.push(makeGoal(relation, [subject, object]));
                        });
                    });
                    return {list:goals, isAnd:false};
                } else if (objQuant == "all") {
                    // Put any ball left of all bricks
                    var andGoals : Goal[];
                    var orGoals : Goal[] = [];
                    subjCands.forEach((subject) => {
                        andGoals = [];
                        objCands.forEach((object) => {
                            andGoals.push(makeGoal(relation, [subject, object]));
                        });
                        orGoals.push({list:andGoals, isAnd:true});
                    });
                    return {list:orGoals, isAnd:false};
                } else {
                    throw new Error("Quantifier \""+objQuant+"\" not implemented yet.");
                }
            } else if (subjQuant == "all") {
                // All balls
                var andGoals : Goal[];
                if (objQuant == "the") {
                    // Put all balls left of the brick
                    andGoals = [];
                    var object = objCands[0];
                    subjCands.forEach((subject) => {
                        andGoals.push(makeGoal(relation, [subject, object]));
                    });
                    return {list:andGoals, isAnd:true};
                } else if (objQuant == "any") {
                    // Put all balls left of any brick
                    var orGoals : Goal[];
                    var andGoals : Goal[] = [];
                    subjCands.forEach((subject) => {
                        orGoals = [];
                        objCands.forEach((object) => {
                            orGoals.push(makeGoal(relation, [subject, object]));
                        });
                        andGoals.push({list:orGoals, isAnd:false});
                    });
                    return {list:andGoals, isAnd:true};
                } else if (objQuant == "all") {
                    // Put all balls left of all bricks
                    andGoals = [];
                    subjCands.forEach((subject) => {
                        objCands.forEach((object) => {
                            andGoals.push(makeGoal(relation, [subject, object]));
                        });
                    });
                    return {list:andGoals, isAnd:true};
                } else {
                    throw new Error("Quantifier \""+objQuant+"\" not implemented yet.");
                }
            } else {
                    throw new Error("Quantifier \""+subjQuant+"\" not implemented yet.");
            }
        } 
        
        
        var verb : string = cmd.cmd;
        var loc : Parser.Location;
        var ent : Parser.Entity;
                
        var subjectCands : CandList;
        var goalCands : CandList;
        var goalEntity : Parser.Entity;
        
        var relation : string;
        var object1 : string;
        var object2 : string;
        var objects : string[];
        var goal : Goal;

        
        if (verb == "take") {
        // we shall pick up something and hold it;
            ent = cmd.ent;
            subjectCands = getCandListFromEnt(ent);
            goal = makeHoldingGoal(subjectCands);
       } else if (verb == "put") {
       // we are holding something, and shall place it somewhere
            if (state.holding == null) {
              throw new Error("The arm is not holding anything.");
            }
            loc = cmd.loc;
            relation = loc.rel;
            goalEntity = loc.ent;
            goalCands = getCandListFromEnt(goalEntity);
            var holdCands : CandList = {candidates : [state.holding], quant : "the"};
            goal = makeMovingGoal(relation, holdCands, goalCands);
       } else if (verb == "move") { 
       // we shall move something
            ent = cmd.ent;
            subjectCands = getCandListFromEnt(ent);
            loc = cmd.loc;
            relation = loc.rel;
            goalEntity = loc.ent;
            goalCands = getCandListFromEnt(goalEntity);
            goal = makeMovingGoal(relation, subjectCands, goalCands);
        }
        return goal;
        
    }

}

