///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>

module Planner {

  ////////////////////////////////
  // global variables

  var currentWorldDescription = new C.collections.Dictionary<String, WorldObject>();


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

    function printLog(log : Object) : void {
        document.getElementById('log').innerHTML += JSON.stringify(log) + "<br/>";
    }

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
        var plan : string[] = [];
        printLog(state);

      var solution = A.Astar.search(convert(state), null, goal);
       
        var plan:string[] = new Array<string>();
        for (var i = 0; i < solution.path.length; i++) {
          //print out the path
          console.log(solution.path[i].toString());
          
        }
        for (var i = 1; i < solution.path.length; i++) {
          plan.concat(div(solution.path[i-1], solution.path[i]));
        }
        
        //print out the solution
        console.log(solution);
        console.log(plan);



        return plan;
    }

  function div(state1: WorldDescription, state2: WorldDescription): string[] {
    var ret: string[] = new Array<string>();
    for(var i = 0; i < state1.stacks.length; i++) {
      if(state1.stacks[i].length != state2.stacks[i].length) {
        var tmp = position - i;
        if(tmp>0) {
          for(var j = tmp; j > 0; j--) {
            position--;
            ret.push("l");
          }
        } else if(tmp < 0) {
          for(var j = tmp; j < 0; j++) {
            position++;
            ret.push("r");
          }
        }
        if(state1.stacks[i].length > state2.stacks[i].length) {
          ret.push("p");
        } else {
          ret.push("d");
        }
      }
    }
    return ret;
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }


  ////////////////////////////////////////////////////
  // private classes

  class PDDL {
    //the inner array describes literals connected with an AND,
    //the outer one connected with an OR
    alternatives : Lit[][];

    constructor (input : Lit[][]) {
      this.alternatives = input;
    }
  }

  //one expression describing a property of a goal
  class Lit implements I.Interpreter.Literal {
    //true/false: goal must/must not forfill the property
    pol:boolean; 
    //a relationship between objects as describet in the grammar
    //TODO: is this useful? Maybe TypeScript allows to have a smaller
    //space of relationsships
    rel:string; 
    //the objects on which the relationsship works
    args:string[]
    
    constructor(pol: boolean, rel: string, args: string[]) {
      this.pol = pol;
      this.rel = rel;
      this.args = args;
    }
  }

  class WorldDescription implements A.Astar.State {
    //heuristical value for this state. Useful if you don't want to call
    //the heuristical function each time
    h: number; 
    //represents an array of stacks 
    stacks: WorldObject[][];
    crane: WorldObject;
    
    //returns true if a PDDL matches on the current state

    //usage: either both parameter null, then create an empty WorldDescription
    // OR  : stacks not null, then create a WorldDescription with the given
    // stacks. 
    // WARNING: stacks null, but crane not null will throw an error.
    constructor(stacks: string[][], crane: string) {
      //if both parameter null, create an empty WorldDescription
      if( stacks == null && crane == null){
        this.crane = null;
        this.stacks = new Array<Array<WorldObject>>();
        this.h = 0;
      } else if (stacks != null){
        //if stacks are given, use them.
        this.stacks = new Array<Array<WorldObject>>();
        for (var i = 0; i < stacks.length; i++) {
          this.stacks[i] = new Array<WorldObject>();
        }
        for (var i = 0; i < stacks.length; i++) {
          for (var j = 0; j < stacks[i].length; j++) {
            this.stacks[i].push(exampleWorldDescription.getValue(stacks[i][j]));
          }
        }
        if(crane != null){
          //if stacks are given and crane is given, use also the crane
          this.crane = exampleWorldDescription.getValue(crane);
        } else {
          this.crane = null;
        }
        //predefive a heuristic value
        this.h = 0;
      } else {
        //if crane is given, but stacks is null
        throw new Error("You are stupid! You cant create a world without a stack but with a crane!");
      }
    }


    toString() {
      var s : string = "";
      for (var i = 0; i < this.stacks.length; i++) {
        s += "[";
        for (var j = 0; j < this.stacks[i].length; j++) {
          s += this.stacks[i][j] + ", ";
        }
        s += "]";
      }
      s += "\n" + this.crane + "\n\n";
      return s; 
    }


    clone() : WorldDescription {
      var braveNewWorld : WorldDescription = new WorldDescription(null, null);
      for (var i = 0; i < this.stacks.length; i++) {
        braveNewWorld.stacks[i] = new Array<WorldObject>();
        for (var j = 0; j < this.stacks[i].length; j++) {
          braveNewWorld.stacks[i].push(this.stacks[i][j]);
        }
      }
      braveNewWorld.crane = this.crane;
      return braveNewWorld;
    }

    match(goal: PDDL) {
      for (var i = 0; i < goal.alternatives.length; i++) {
        if(this.checkAlt(goal.alternatives[i])){
          return true;
        }
      }
      return false;
    }

    //returns true if ALL literals are true
    checkAlt(lits: Lit[]): boolean{
      var result: boolean = true;
      for(var i = 0; i < lits.length; i++) {
        result = result && this.eval(lits[i]);
      }
      return result;
    }

    eval(lit: Lit): boolean {
      var res: boolean = true;
      switch(lit.rel) {
        case "ontop":
          for (var i = 0; i < this.stacks.length; i++) {
            for (var j = 0; j < this.stacks[i].length; j++) {
              if (this.stacks[i][j-1]
                     && lit.args[0] == this.stacks[i][j].name
                     && lit.args[1] == this.stacks[i][j-1].name)
                return true;
            }
          }
          break;
        case "leftof":
          for (var i = 0; i < this.stacks.length; i++) {
            for (var j = 0; j < this.stacks[i].length; j++) {
              if (this.stacks[i][j].name == lit.args[0]) {
                for (var k = i-1; k < this.stacks.length; k--) {
                  for (var l = 0; l < this.stacks[k].length; l++) {
                    if (this.stacks[k][l].name == lit.args[1])
                      return true;
                  }
                }
              }
            }
          }
          break;
        case "rightof":
          for (var i = 0; i < this.stacks.length; i++) {
            for (var j = 0; j < this.stacks[i].length; j++) {
              if (this.stacks[i][j].name == lit.args[0]) {
                for (var k = i+1; k < this.stacks.length; k++) {
                  for (var l = 0; l < this.stacks[k].length; l++) {
                    if (this.stacks[k][l].name == lit.args[1])
                      return true;
                  }
                }
              }
            }
          }
          break;
        case "inside": // the same as ontop
          for (var i = 0; i < this.stacks.length; i++) {
            for (var j = 0; j < this.stacks[i].length; j++) {
              if (lit.args[0] == this.stacks[i][j].name
                  && this.stacks[i][j-1]
                  && lit.args[1] == this.stacks[i][j-1].name)
                return true;
            }
          }
          break;
        case "under":
          for (var i = 0; i < this.stacks.length; i++) {
            for (var j = 0; j < this.stacks[i].length; j++) {
              if (lit.args[0] == this.stacks[i][j].name) {
                for (var k = 0; k < j; k++) {
                  if (lit.args[1] == this.stacks[i][k].name)
                    return true;
                }
              }
            }
          }
          break;
        case "beside":
          for (var i = 0; i < this.stacks.length; i++) {
            for (var j = 0; j < this.stacks[i].length; j++) {
              if (lit.args[0] == this.stacks[i][j].name) {
                if (this.stacks[i-1]) {
                  for (var k = 0; k < this.stacks[i-1].length; k++) {
                    if (this.stacks[i-1][k].name == lit.args[1]) {
                      return true;
                    }
                  }
                }
                if (this.stacks[i+1]) {
                  for (var k = 0; k < this.stacks[i+1].length; k++) {
                    if (this.stacks[i+1][k].name == lit.args[1]) {
                      return true;
                    }
                  }
                }
              }
            }
          }
          break;
        case "above":
          for (var i = 0; i < this.stacks.length; i++) {
            for (var j = 0; j < this.stacks[i].length; j++) {
              if (lit.args[0] == this.stacks[i][j].name) {
                for (var k = j+1; k < this.stacks[i].length; k++) {
                  if (this.stacks[i][k] && this.stacks[i][k].name == lit.args[1])
                    return true;
                }
              }
            }
          }
          break;
      }
      return false;
    }
    

/*    match(goal: WorldDescription) {
      for (var i = 0; i < this.stacks.length; i++) {
        if (this.stacks[i].length == 0 && goal.stacks[i].length == 0) {
          continue;
        }
        if (this.stacks[i].length == 0 || goal.stacks[i].length == 0) {
          return false;
        }
        if (this.stacks[i].length != goal.stacks[i].length) {
          return false;
        }
        for (var j = 0; j < this.stacks[i].length; j++) {
           if (this.stacks[i][j].form != goal.stacks[i][j].form
               || this.stacks[i][j].size != goal.stacks[i][j].size
               || this.stacks[i][j].color != goal.stacks[i][j].color)
             return false;
        }
      }
      return true;
    }*/

    //guesses a distance from the current state to goals describet in a PDDL
    heuristic(goal: PDDL) {
      var curr = 0;
      var min = Number.MAX_VALUE;
      var found = false;
//      return 0;
     //go through all OR parts
      for(var i = 0; i < goal.alternatives.length; i++) {
        //go through all AND parts
        for(var j = 0; j < goal.alternatives[i].length; j++){
          //go through all touched argumends
            if(this.eval(goal.alternatives[i][j])){
              //if the AND-statement is already forfilled, don't
              //increase the heuristic
              break;
            }
          for(var k = 0; k < goal.alternatives[i][j].args.length; k++) {
//            console.log("check argument " + k);
            found = false;
            //go through all stacks to find it
            for(var l = 0; l < this.stacks.length && !found; l++) {
              for(var m = 0; m < this.stacks[l].length && !found; m++) {
                //add the number of things above the currend element to
                //the heuristic value
//                console.log(this.stacks[l][m].name + " vs. " + goal.alternatives[i][j].args[k]);                
                if(this.stacks[l][m] 
                   && this.stacks[l][m].name == goal.alternatives[i][j].args[k]) {
                  curr += (this.stacks[l].length - m);
                  found = true;
                }
              }
            }
          }
        }
        if( curr < min) {
          min = curr;
        }
        curr = 0;
      }
//      console.log("heuristic = " + min);
      return min;
    }
    
    //returns all possible neigbours of a state
    //TODO: reduce number of states by checking if they are valid
    expand() {
      var neighbours = new Array();
      if (this.crane == null) {
        for (var i = 0; i < this.stacks.length; i++) {
          if (this.stacks[i][0] == undefined)
            continue;
          var topObject : WorldObject = this.stacks[i][this.stacks[i].length - 1];
          
          var newWorld : WorldDescription = this.clone();
          newWorld.stacks[i].splice(this.stacks[i].length - 1, 1); 
          newWorld.crane = topObject;
          if (checkIfValid(newWorld))
            neighbours.push({cost: 1, state: newWorld});
        }
      } else {
        for (var i = 0; i < this.stacks.length; i++) {
          var newWorld : WorldDescription = this.clone();
          newWorld.stacks[i].push(this.crane);
          newWorld.crane = null;
          if (checkIfValid(newWorld))
            neighbours.push({cost: 1, state: newWorld});
        }
      }
      //console.log(neighbours);
      return neighbours;
    }
  }

  //describes an object in a world
  class WorldObject {
    form: String;
    size: String;
    color: String;
    name: String;

    constructor(form: String, size: String, color: String, name: String) {
      this.form = form;
      this.size = size;
      this.color = color;
      this.name = name;
    }

    toString() {
      return this.name;
    }
  }

  function convert(input: WorldState): WorldDescription {
    var stacks = new Array(new Array<WorldObject>());
    var crane =  new WorldObject();

    currentWorldDescription.setValue
    input.objects.forEach(s => {
      currentWorldDescription.setValue(s, input[objects][s]);
    });

    for(var i = 0; i < input.stacks.length; i++){
      for(var j = 0; j < input.stacks[i].length; j++) {
        stacks = currentWorldDescription.getValue(input.stacks[i][j]);
      }
    }
    crane = currentWorldDescription.getValue(input.holding);
    return new WorldDescription(stacks, crane);
//    input[objects]["a"]
//    var ret = new WorldDescription(input.stacks, )
  }
}
