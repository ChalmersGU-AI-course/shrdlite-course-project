///<reference path="../lib/node.d.ts"/>
///<reference path="../typings/mocha/mocha.d.ts"/>
///<reference path="../typings/chai/chai.d.ts"/>
///<reference path="../Interpreter.ts"/>
///<reference path="../lib/collections.ts"/>
///<reference path="../astar/AStar.ts"/>

import chai = require('chai');

module PlannerTest {
  var position: number = 0;
  //a expression in the Planning Domain Definition Language
  class PDDL {
    //the inner array describes literals connected with an AND,
    //the outer one connected with an OR
    alternatives : Lit[][];

    constructor (input : Lit[][]) {
      this.alternatives = input;
    }
  }

  //one expression describing a property of a goal
  class Lit implements Interpreter.Literal {
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

  class WorldDescription implements Astar.State {
    //heuristical value for this state. Useful if you don't want to call
    //the heuristical function each time
    h: number; 
    //represents an array of stacks 
    stacks: WorldObject[][];
    crane: WorldObject;
    
    //returns true if a PDDL matches on the current state
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
        case "holding":
          return this.crane.name == lit.args[0];
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

  ////////////////////////////////////////
  // HERE THE TEST DESCRIPTION BEGINNS  //
  ///////////////////////////////////////

//[[a,b] [c] [] [d, e] []]
  var exampleWorldDescription = new collections.Dictionary<String, WorldObject>();
  exampleWorldDescription.setValue("a", new WorldObject("brick", "large", "green", "a"));
  exampleWorldDescription.setValue("b", new WorldObject("brick", "small", "white", "b"));
  exampleWorldDescription.setValue("c", new WorldObject("plank", "large", "red", "c"));
  exampleWorldDescription.setValue("d", new WorldObject("plank", "small", "green", "d"));
  exampleWorldDescription.setValue("e", new WorldObject("ball", "large", "white", "e"));
  exampleWorldDescription.setValue("f", new WorldObject("ball", "small", "black", "f"));
  exampleWorldDescription.setValue("g", new WorldObject("table", "large", "blue", "g"));
  exampleWorldDescription.setValue("h", new WorldObject("table", "small", "red", "h"));
  exampleWorldDescription.setValue("i", new WorldObject("pyramid", "large", "yellow", "i"));
  exampleWorldDescription.setValue("j", new WorldObject("pyramid", "small", "red", "j"));
  exampleWorldDescription.setValue("k", new WorldObject("box", "large", "yellow", "k"));
  exampleWorldDescription.setValue("l", new WorldObject("box", "large", "red", "l"));
  exampleWorldDescription.setValue("m", new WorldObject("box", "small", "blue", "m"));

  var exampleState = {
    "stacks": [["e"],["g","l"],[],["k","m","f"],[]],
    "holding":null,
    "arm":0
  };

  var exampleGoal = "inside(f, k)";
  var expect = chai.expect;

  function checkIfValid(state) {
    for (var i = 0; i < state.stacks.length; i++) {
      for (var j = 1; j < state.stacks[i].length; j++) {
        if (!state.stacks[i][j] || !state.stacks[i][j-1]) continue;
        var currentObjectDescription = state.stacks[i][j];
        var belowObjectDescription = state.stacks[i][j-1];
        // balls must be in boxes or on the floor, otherwise they roll away
        if (currentObjectDescription.form == "ball"
            && belowObjectDescription.form != "box") 
          return false;

        // balls cannot support anything
        if (belowObjectDescription.form == "ball")
          return false;

        // small objects cannot support large objects
	if (currentObjectDescription.size == "large"
            && belowObjectDescription.size == "small")
          return false;

        // boxes cannot contain pyramids, planks or boxes of the same size
        if ((currentObjectDescription.form == "pyramid"
             || currentObjectDescription.form == "plank"
             || currentObjectDescription.form == "boxes")
            && belowObjectDescription.form == "box"
            && belowObjectDescription.size == currentObjectDescription.size)
          return false;

        // small boxes cannot be supported by small bricks or pyramids
        if (currentObjectDescription.form == "box"
            && currentObjectDescription.size == "small"
            && belowObjectDescription.size == "small"
            && (belowObjectDescription.form == "brick" || belowObjectDescription.form == "pyramid"))
          return false;

        // large boxes cannot be supported by large pyramids
        if (currentObjectDescription.form == "box"
            && currentObjectDescription.size == "large"
            && belowObjectDescription.form == "pyramid"
            && belowObjectDescription.size == "large")
          return false;
      }
    }
    return true;
  }

  ////////////////////////////////////
  // HERE THE TEST SECTION BEGINNS  //
  ////////////////////////////////////


  describe('Planner', () => {

    //test to check if AStar is called
    describe('AStar in the Planner', () => {
      it('test if a-star runs', (done) => {
        var state: WorldDescription = new WorldDescription([["e"],["g","l"],["k", "m", "f"], new Array<string>(), new Array<string>()],
                                               null);
        var lit : Lit[][] = new Array( new Array( new Lit(true, "holding",
                                                          ["m"])));
        var goal: PDDL = new PDDL(lit);
        var solution = Astar.search(state, null, goal);
       
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
        done()
      })
    });
  });


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
}
