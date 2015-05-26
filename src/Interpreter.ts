///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

interface Window { state: any; }

module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
        parses.forEach((parseresult) => {
            var intprt : Result = <Result>parseresult;
            intprt.intp = interpretCommand(intprt.prs, currentState);
            if (intprt.intp.length) interpretations.push(intprt);
        });
        if (interpretations.length) {
            return interpretations;
        } else {
            throw new Interpreter.Error("Found no interpretation");
        }
    }


    export interface Result extends Parser.Result {intp:Literal[][];}
    export interface Literal {pol:boolean; rel:string; args:string[];}


    export function interpretationToString(res : Result, state : WorldState) : string {
        return res.intp.map((lits) => {
            return lits.map((lit) => literalToString(lit, state)).join(" & ");
        }).join(" | ");
    }

    export function literalToString(lit : Literal, state : WorldState) : string {
        var argObjs = lit.args.map((key) => {
          if(key=="floor") {
              return "<"+key+">";
          }
          var obj = state.objects[key]
          return "<"+key+":"+obj.size+","+obj.color+","+obj.form+">";
        });
        // return (lit.pol ? "" : "-") + lit.rel + "(" + lit.args.join(",") + ")";
        return (lit.pol ? "" : "-") + lit.rel + "(" + argObjs.join(",") + ")";
    }


    export class Error implements Error {
        public name = "Interpreter.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    function interpretCommand(cmd : Parser.Command, state : WorldState) : Literal[][] {
        // var stateL = worldToLiteral(state);
        var worldLit = worldToLiteral(state);
        var objectMap = getWorldObjectsMap(state);

        // This returns a dummy interpretation involving two random objects in the world
        /*
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        var a = objs[getRandomInt(objs.length)];
        var b = objs[getRandomInt(objs.length)];

        var intprt : Literal[][] = [[
         {pol: true, rel: "ontop", args: [a, "floor"]},
         {pol: true, rel: "holding", args: [b]}
        ],[
         {pol: true, rel: "ontop", args: [b, "floor"]},
         {pol: true, rel: "holding", args: [a]}
        ]];
        */
       var test = checkList( [ {pol:true , rel:"ontop", args:['a','b']} , {pol:true, rel:"ontop", args:['a','c']}] );
       var test2 = checkList( [ {pol:true , rel:"ontop", args:['a','b']} , {pol:true, rel:"under", args:['a','b']}] );

        var getHolding = () => {
          if (!state.holding) throw new Interpreter.Error("Not holding anything.")
          debugger;
          return state.holding;
        }

        var intprt : Literal[][] = [];
        window.state = state;
        switch (cmd.cmd) {
            case "put":
            case "drop":
            case "move":
                var sourcesBranches : Key[][];
                if (cmd.ent) sourcesBranches = find(cmd.ent, worldLit, objectMap)
                else sourcesBranches = [[getHolding()]]
                var targetBraches = find(cmd.loc.ent, worldLit, objectMap);
                var literals : Literal[] = [];

                product(sourcesBranches, targetBraches).forEach((param) => {
                    var sources = param[0], targets = param[1];
                    var literals : Literal[] = [];
                    // TODO var possibleMatches : Literal [][];
                    sources.forEach((source) => {
                        // TODO var possibleLits: Literal [] = [];
                        targets.forEach((target) => {
                            var newLit = { pol: true, rel: cmd.loc.rel, args: [source, target] };
                            if (checkLiteral(objectMap, newLit).val) literals.push(newLit); //TODO takeout
                            // TODO if (checkLiteral(objectMap, newLit).val) possibleLits.push(newLit);
                        });
                        // TODO possibleMatches.push(possibleLits);
                    });
                    
                    // TODO if ( findMatch(possibleMatches[0],possibleMatches.slice(1),literals) && literals.length ) intprt.push(literals); //should end up with valid list of literals if such exists;
                    if (literals.length && checkList(literals).val) intprt.push(literals);
                });
                break;

            case "grasp":
            case "pick up":
            case "take":
                var branches = find(cmd.ent, worldLit, objectMap);
                branches.forEach((keys) => {
                    keys.forEach((key) => {
                        intprt.push([
                            { pol: true, rel: "holding", args: [key] }
                        ]);
                    });
                });
                break;
            default: throw new Interpreter.Error("Command not found: " + cmd.cmd);
        };
        return intprt;
    }
    
    // TODO
    // // The recursion will test out every combination of literals that satisfy the existence of one literal per 
    // // source;
    //
    //function findMatch( currentSet: Literal[] , remainingSets: Literal[][] , lits: Literal[] ) : Boolean
    //  {
    //    var testLiteral: Literal ;
    //
    //    for(var j=0 , j < currentSet.length , j++)
    //      {
    //        testLiteral=currentSet[j];
    //        lits.push(testLiteral);
    //
    //        if(next.length) flag=findMatch( remainingSets[0] , remainingSets.slice(1) , lits);
    //        else flag=checkList(lits);    
    //
    //        if(flag) return flag;
    //        else  lits.pop();  //remove the literal that didn't work to try another
    //      }
    //    return false;
    //  }
    //
    
    function find(ent : Parser.Entity, literals : Literal[], objects : ObjectMap) : Key[][] {
        switch (ent.quant) {
            case "the": return [findThe(ent.obj, literals, objects)];
            case "any": return findAny(ent.obj, literals, objects);
            case "all": return [findAll(ent.obj, literals, objects)];
            default:    throw new Interpreter.Error("Entity unknown");
        }
    }

    function findThe(obj : Parser.Object, literals : Literal[], objects : ObjectMap) : Key[] {
        var results = findAll(obj, literals, objects);
        switch (results.length) {
            case 0:
            case 1: return results;
            default: debugger; throw new Interpreter.Error("found multiple"); // TODO
        }
    }

    function findAny(obj : Parser.Object, literals : Literal[], objects : ObjectMap) : Key[][] {
        var results = findAll(obj, literals, objects);
        return results.map((k) => [k]);
    }

    function findAll(obj : Parser.Object, allLiterals : Literal[], objects : ObjectMap) : Key[] {
        if ("obj" in obj) {
            var relatedObjKeysBranches = find(obj.loc.ent, allLiterals, objects);
            // TODO this picks the first possible path
            // the find should always result in an arrays of branches
            for(var i in relatedObjKeysBranches) {
                var relatedObjKeys : Key[] = relatedObjKeysBranches[i];
                if (relatedObjKeys.length == 0) return []; //TODO takeout

                var targetObjKeys = searchObjects(obj.obj, objects);
                if (targetObjKeys.length == 0) return [];  //TODO takeout

                var matchingLiterals = allLiterals.filter((lit) => {
                    return (
                        lit.rel == obj.loc.rel &&
                        contains(targetObjKeys, lit.args[0]) &&
                        contains(relatedObjKeys, lit.args[1])
                    );
                });

                return matchingLiterals.map((lit) => lit.args[0]);
                // TODO litList=litList.concat(matchingLiterals.map((lit) => lit.args[0]));
            }
            return [];
            // TODO return litList;
        } else {
            return searchObjects(obj, objects);
        }
    }

    type Key = string;
    function searchObjects(query : Parser.Object, objects : ObjectMap) : Key[] {
        if (query.form == "floor") return ["floor"];
        // 1. get all objects with keys
        var flatMap : [Key, ObjectDefinition][] = Object.keys(objects)
            .map((key) => <[Key, ObjectDefinition]>[key, objects[key]]);
        // 2. filter with query
        var filteredFlatMap = flatMap.filter((pair) => {
            var obj = pair[1];
            return (
                (!query.size  || obj.size  == query.size) &&
                (!query.color || obj.color == query.color) &&
                (!query.form || query.form == "anyform"  || obj.form  == query.form)
            );
        });
        // 3. return keys
        return filteredFlatMap.map((pair) => pair[0]);
    }

    // Returns list of literals that represent a PDDL Representation of the world
    // portrait in state variable
    //
    // Relations considered:
    //    ontop  above  under  rightof    leftof  beside
    //
    // TODO - decide if we wish to use all of them
    //

    function worldToLiteral(state : WorldState) : Literal[] {
        var worldLiterals : Literal[] = [];
        var stcks= state.stacks;
        var leftObjs = [];
        var besideObjs = [];

        // Iterates through stacks
        for (var c in stcks) { // #1
            var col=stcks[c];
            var underObjs = [];
            var iter=0;

            // Iterates through objects in given stack
            for (var obj in col) { // #2
                var o=col[obj];
                var topRelation;

                if (iter==0) {
                    // adds ontop relation for 1st object (floor)
                    // TODO - Add number of floor space (number of column) - easy, gg
                    topRelation={pol: true, rel: "ontop", args: [o, "floor"]};
                    worldLiterals.push(topRelation);
                } else {
                    var last=underObjs.length-1;
                    var under=underObjs[last];

                    //only box can have inside objects, the remaining are ontop
                    //TODO - ask if two boxes of same size can be ontop of each other
                    if (state.objects[under].form=="box")  topRelation={pol: true, rel: "inside", args: [o, under]};  //box is the only form that can contain other objects
                    else topRelation={pol: true, rel: "ontop", args: [o, under]};  // any other (valid) form has objects ontop and not inside

                    worldLiterals.push(topRelation);

                    for (var uObj in underObjs) { // #3
                        var u=underObjs[uObj];
                        // TODO ??? what's inside is also above?
                        // ??? what's "outside" is also under?
                        // ??? decide if both are necessary
                        var abvRelation={pol: true, rel: "above", args: [o, u]};
                        var undRelation={pol: true, rel: "under", args: [u, o]};
                        worldLiterals.push(abvRelation);
                        worldLiterals.push(undRelation);
                    } //end for #3

              } //end else

              // add horizontal position relations
              for(var lObj in leftObjs) { //#4
                  var leftO=leftObjs[lObj];
                  var leftRelation={pol: true, rel: "leftof", args: [leftO , o]};
                  var rightRelation={pol: true, rel: "rightof", args: [o, leftO]};  // TODO ??? decide if both are necessary
                  worldLiterals.push(leftRelation);
                  worldLiterals.push(rightRelation);
              } //end for #4

              // add beside relations
              for(var besideO in besideObjs) { //#5
                  var besO=besideObjs[besideO]
                  var besideRelation={pol: true, rel: "beside", args: [besO , o]};
                  worldLiterals.push(besideRelation);
              } //end for #5

              iter++;
              underObjs.push(o);

            } //end inside for #2

            //update lists for next stack
            leftObjs=leftObjs.concat(underObjs);  //add objects from previously examined stack
            besideObjs=underObjs;

        } //end outside for #1
        return worldLiterals;
    }

    // Checks if a given literal is valid
    // This implements some of the physics laws (not all, since some are not aplicable to only one literal)

  interface Check {val: boolean; str: string;};
  function checkLiteral(objects : ObjectMap, lit: Literal) : Check {
      // var relations = ["ontop", "above", "under", "rightof", "leftof", "beside", "inside", "holding"];
      var rel = lit.rel;
      var objs = objects;
      // var rIndex =relations.indexOf(rel);
      var floor : ObjectDefinition = {form: "floor", size: null, color: null};
      
      if(lit.args[0]==lit.args[1])
        return { val: false , str:"Same object used twice in a relation."};
      var objA = lit.args[0] == "floor" ? floor : objs[ lit.args[0] ];
      var objB = lit.args[1] == "floor" ? floor : objs[ lit.args[1] ];

      if (objA.form == "floor" && rel != "under")
        return { val: false , str:"The floor can't be ontop, above, leftof, rightof, beside, inside or be hold"};
      if (objB.form == "floor" && !(rel == "above" || rel == "ontop"))
        return { val: false , str:"An Object can only be above or on top of the floor"};

      switch (rel) {
          case "ontop": //ontop
              if (objB.form=="ball")
                  return { val: false , str:"Balls can not support anything" };
              else if (objA.form=="ball" && objB.form!="floor")
                  return { val: false , str:"Balls can only be inside boxes or on top of the floor" };
              else if (objA.size=="large" && objB.size =="small")
                  return { val: false , str:"Small objects can not support large objects" };
              else if (objA.form=="box" && objA.size=="small" && objB.size=="small" && (objB.form=="pyramid" || objB.form=="brick") )
                return { val: false , str:"Small boxes can not be supported by small bricks or pyramids" };
              else   if (objA.form=="box" && objA.size=="large" && objB.size=="large" && objB.form=="pyramid" )
                return { val: false , str:"Large boxes can not be supported by large pyramids" };
              else return { val:true , str: "" };

          case "above":
          	  var o = objA;
              objA = objB;
              objB = o;

          case "under": //under
              if (objA.form=="ball") return { val: false , str:"Balls can not support anything" };
              else if(objA.size=="small" && objB.size =="large")
          	    return { val: false , str:"Small objects can not support large objects" };
              else return { val:true , str: "" };

          case "rightof": return { val:true , str: "" };
          case "leftof": return { val:true , str: "" };
          case "beside": return { val:true , str: "" };

          case "inside": //inside
              if (objB.form!="box")
                  return { val: false , str:"Only boxes can contain other objects" };
              else if (objA.size==objB.size && ( objA.form=="pyramid" || objA.form=="plank" ||objA.form=="box") )
                  return { val: false , str:"Boxes can not contain pyramids, planks or boxes of the same size" };
              else if (objA.size=="large" && objB.size=="small")
                  return { val: false , str:"Small boxes cannot contain any large object" };
              else return { val:true , str: "" };

          case "holding": return { val:true , str: "" };
          default: return { val:true , str: "" };
      } // end switch-case

      return { val:true , str: "" };
    }
    
    
    function checkList(list: Literal[]) : Check {
    
    var flag=true;
    var checked=[];
    var str="";
    
    list.forEach((lit) => { 
                
                if(!flag) return;
                
                var objA=lit.args[0]; // for each literal take out
                var objB=lit.args[1]; // the pair of objects and analyze them
                
                var pairList = [];      //list with all literals concerning  A->B
                var pairListInv = []; //list with all literals concerning  B->A
                var objA0List = [];   //list with all literals concerning  A->x   ,where x is any object
                var objA1List = [];   //list with all literals concerning  x->A   ,where x is any object
                var objB0List = [];   //list with all literals concerning  B->x   ,where x is any object
                var objB1List = [];   //list with all literals concerning  x->B   ,where x is any object
                
                
                
                pairList=list.filter((lit) => { return ( lit.args[0]== objA && lit.args[1]== objB ); } );
                pairListInv=list.filter((lit) => { return ( lit.args[1]== objA && lit.args[0]== objB ); } );
                
                if(!contains(checked,objA))  //A not analyzed
                  {
                    objA0List=list.filter((lit) => {  return (lit.args[0] == objA );  });    
                    objA1List=list.filter((lit) => {  return (lit.args[1] == objA );  });                      
                  }
                if(!contains(checked,objB)) //B not analyzed
                  {
                    objB0List=list.filter((lit) => {  return (lit.args[0] == objB );  });    
                    objB1List=list.filter((lit) => {  return (lit.args[1] == objB );  });    
                  }  
                  
                  // Check that for a pair a,b (or b,a) of objects, we don't have conflict relations 

                  if( !checkRelationsPairs(pairList.map((lit) => lit.rel) ) ) { flag=false; str+=objA+";"+objB+":";}
                  if( !checkRelationsPairs(pairListInv.map((lit) => lit.rel) ) ) { flag=false; str+=objB+";"+objA+":";}
                       
                  
                  // Check that an object (A or B) doesn't have conflict relations
                  if( ! checkRelationsObj( objA0List.map((lit) => lit.rel) ) ) { flag=false; str+=objA+":"; }
                  if( ! checkRelationsObj( objA1List.map((lit) => lit.rel) ) ) { flag=false; str+=objA+":"; }
                  if( ! checkRelationsObj( objB0List.map((lit) => lit.rel) ) ) { flag=false; str+=objB+":"; }
                  if( ! checkRelationsObj( objB1List.map((lit) => lit.rel) ) ) { flag=false; str+=objB+":"; }
                  
                checked.push(objA);
                checked.push(objB);

                return;
            });
    
      if(!flag) return {val:false , str: str+"Impossible request" };
      else return { val:true , str: " " };
    
    }
    

   function checkRelationsPairs(rel: String[]): Boolean {

     if( 
             contains(rel, "under") && ( contains(rel,"inside") || contains(rel,"above") || contains(rel,"ontop") ) ||
           ( contains (rel, "leftof") || contains (rel, "rightof") || contains (rel, "beside") ) && ( contains(rel,"inside") || contains(rel,"above") || contains(rel,"ontop") || contains(rel,"under") ) ||
             contains(rel, "leftof")     &&   contains(rel,"rightof")   
      ) return false;
      
      return true;
      
    }
    
    
   function checkRelationsObj(rel: String[]): Boolean {

    var filtList=[];
     if( contains(rel, "ontop") )  // an object cannot be ontop of two (different) objects or have two objects ontop
      {
      
           filtList=rel.filter((obj) => { return ( obj == "ontop" ); } );
           if (filtList.length>1) return false ;
       }
     if( contains(rel, "inside") )  // an object cannot be inside two (different) objects or have two objects inside
       {
            filtList=rel.filter((obj) => { return ( obj == "inside" ); } );
            if (filtList.length>1) return false ;
        }
        
        //TODO add restriction ontop+inside 
        
      return true;
      
    }
    


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function contains(array, item) {
        return array.indexOf(item) >= 0;
    }

    function product(arrayA, arrayB) {
        var result : [Key[], Key[]][] = [];
        arrayA.forEach((a) => {
            return arrayB.forEach((b) => {
                result.push([a, b]);
            });
        });
        return result;
    }

    interface ObjectMap {[s:string]: ObjectDefinition;};
    function getWorldObjectsMap(state : WorldState) : ObjectMap {
    var holding : string [][];
    var stacks : string [][];
    if(state.holding){
         holding=[[state.holding]];
         stacks = state.stacks.concat(holding);
    }else stacks=state.stacks;
   
      return stacks.reduce((akk, stack) => {
        stack.forEach((key) => akk[key] = state.objects[key]);
        return akk;
      }, <{[s:string]: ObjectDefinition;}>{});

    }

}
