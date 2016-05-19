///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

/**
* Interpreter module
*
* The goal of the Interpreter module is to interpret a sentence
* written by the user in the context of the current world state. In
* particular, it must figure out which objects in the world,
* i.e. which elements in the `objects` field of WorldState, correspond
* to the ones referred to in the sentence.
*
* Moreover, it has to derive what the intended goal state is and
* return it as a logical formula described in terms of literals, where
* each literal represents a relation among objects that should
* hold. For example, assuming a world state where "a" is a ball and
* "b" is a table, the command "put the ball on the table" can be
* interpreted as the literal ontop(a,b). More complex goals can be
* written using conjunctions and disjunctions of these literals.
*
* In general, the module can take a list of possible parses and return
* a list of possible interpretations, but the code to handle this has
* already been written for you. The only part you need to implement is
* the core interpretation function, namely `interpretCommand`, which produces a
* single interpretation for a single command.
*/
module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

/**
Top-level function for the Interpreter. It calls `interpretCommand` for each possible parse of the command. No need to change this one.
* @param parses List of parses produced by the Parser.
* @param currentState The current state of the world.
* @returns Augments ParseResult with a list of interpretations. Each interpretation is represented by a list of Literals.
*/
    export function interpret(parses : Parser.ParseResult[], currentState : WorldState) : InterpretationResult[] {
        var errors : Error[] = [];
        var interpretations : InterpretationResult[] = [];
        parses.forEach((parseresult) => {
            try {
                var result : InterpretationResult = <InterpretationResult>parseresult;
                result.interpretation = interpretCommand(result.parse, currentState);
                interpretations.push(result);
            } catch(err) {
                errors.push(err);
            }
        });
        if (interpretations.length) {
            return interpretations;
        } else {
            // only throw the first error found
            throw errors[0];
        }
    }

    export interface InterpretationResult extends Parser.ParseResult {
        interpretation : DNFFormula;
    }

    export type DNFFormula = Conjunction[];
    type Conjunction = Literal[];

    /**
    * A Literal represents a relation that is intended to
    * hold among some objects.
    */
    export interface Literal {
	/** Whether this literal asserts the relation should hold
	 * (true polarity) or not (false polarity). For example, we
	 * can specify that "a" should *not* be on top of "b" by the
	 * literal {polarity: false, relation: "ontop", args:
	 * ["a","b"]}.
	 */
        polarity : boolean;
	/** The name of the relation in question. */
        relation : string;
	/** The arguments to the relation. Usually these will be either objects
     * or special strings such as "floor" or "floor-N" (where N is a column) */
        args : string[];
    }

    export function stringify(result : InterpretationResult) : string {
        return result.interpretation.map((literals) => {
            return literals.map((lit) => stringifyLiteral(lit)).join(" & ");
            // return literals.map(stringifyLiteral).join(" & ");
        }).join(" | ");
    }

    export function stringifyLiteral(lit : Literal) : string {
        return (lit.polarity ? "" : "-") + lit.relation + "(" + lit.args.join(",") + ")";
    }

    // private functions
    ///**
    // * The core interpretation function. The code here is just a
    // * template; you should rewrite this function entirely. In this
    // * template, the code produces a dummy interpretation which is not
    // * connected to `cmd`, but your version of the function should
    // * analyse cmd in order to figure out what interpretation to
    // * return.
    // * @param cmd The actual command. Note that it is *not* a string, but rather an object of type `Command` (as it has been parsed by the parser).
    //* @param state The current state of the world. Useful to look up objects in the world.
    // * @returns A list of list of Literal, representing a formula in disjunctive normal form (disjunction of conjunctions). See the dummy interpetation returned in the code for an example, which means ontop(a,floor) AND holding(b).
    // */
    // function interpretCommand(cmd : Parser.Command, state : WorldState) : DNFFormula {
    //     // This returns a dummy interpretation involving two random objects in the world
    //     var objects : string[] = Array.prototype.concat.apply([], state.stacks);
    //     var a : string = objects[Math.floor(Math.random() * objects.length)];
    //     var b : string = objects[Math.floor(Math.random() * objects.length)];
    //     var interpretation : DNFFormula = [[
    //         {polarity: true, relation: "ontop", args: [a, "floor"]},
    //         {polarity: true, relation: "holding", args: [b]}
    //     ]];
    //     return interpretation;
    // }


//---------------- New Code ----------- New Code -------------- New Code -------------------------//
    // private functions
    /**
     * The core interpretation function. The code here is just a
     * template; you should rewrite this function entirely. In this
     * template, the code produces a dummy interpretation which is not
     * connected to `cmd`, but your version of the function should
     * analyse cmd in order to figure out what interpretation to
     * return. Throws "No valid interpretation" if that is the case.
     * @param cmd The actual command. Note that it is *not* a string, but rather an object of type `Command` (as it has been parsed by the parser).
     * @param state The current state of the world. Useful to look up objects in the world.
     * @returns A list of list of Literal, representing a formula in disjunctive normal form (disjunction of conjunctions). See the dummy interpetation returned in the code for an example, which means ontop(a,floor) AND holding(b).
     */

    function interpretCommand(cmd : Parser.Command, state : WorldState) : DNFFormula {
        var interpretation : DNFFormula = [[]];
        // a count of the number of interpretations we've added
        var interpCount : number = 0;
        //if it is a [take entity] command:
        if(cmd.command === "take" || cmd.command === "grasp" || cmd.command === "pick up"){
          //find all entities matching the given discription
          var possibleEntities : string[] = findEntity(cmd.entity,state);
          //add them to the interpetation list (with the exception of floor which cannot be grasped)
          possibleEntities.forEach((possibleEnt) => {
            if(possibleEnt !=="floor"){
              interpretation[interpCount] = [ {polarity : true, relation : "holding", args: [possibleEnt] }]
              interpCount++
            }
          })
        } else {
        if(cmd.command === "move" || cmd.command === "put" || cmd.command === "drop"){
            // if it is a [move/put/drop 'it' to a location] command (robot already holding an object)
            if(cmd.entity == null){
              //find all entities the location relation is in regards to
              var possibleEntities : string[] = findEntity(cmd.location.entity,state);
              possibleEntities.forEach((possibleEnt) => {
                var objectA = state.objects[state.holding]
                if(possibleEnt === "floor"){
                  objectB = {size : null, color : null, form : "floor"}
                }
                else{
                  var objectB = state.objects[possibleEnt]
                }
                // if the interpretation does not break any physic laws it gets added to the interpretation list
                if(checkPhysicLaws(objectA,objectB,cmd.location.relation)){
                  interpretation[interpCount] = [{polarity : true, relation : cmd.location.relation, args: [state.holding,possibleEnt]}]
                  interpCount++;
                }
              })
            }
            // else it is a [move/put/drop 'an entity' to a location] command
            else{
              //find all entities matching description to be moved: put THIS_ENTITY in relation to something
              var possibleEntities : string[] = findEntity(cmd.entity,state);
              possibleEntities.forEach((possibleEnt,index1) => {
                if(possibleEnt !== "floor" ){
                  //find all entities matching the description of which the location is in relation to: put something in relation to THIS_ENTITY
                  var possibleLocationEntities : string[] = findEntity(cmd.location.entity,state);
                    possibleLocationEntities.forEach((possibleLocationEnt) => {
                    //dont need to check physics if the floor is the placement
                    if(possibleLocationEnt === "floor"){
                      interpretation[interpCount] = [{polarity : true, relation : cmd.location.relation, args: [possibleEnt,possibleLocationEnt]}]
                      interpCount++;
                    }else{
                      //else check physic laws
                      var objectA = state.objects[possibleEnt]
                      var objectB = state.objects[possibleLocationEnt]
                      if(checkPhysicLaws(objectA,objectB,cmd.location.relation)){
                        interpretation[interpCount] = [{polarity : true, relation : cmd.location.relation, args: [possibleEnt,possibleLocationEnt]}]
                        interpCount++;
                      }
                    }
                  })
                }
              })
            }
          }
        }
        //throw error if no valid interpretation was found
        if(interpCount === 0){
          throw "No valid interpretation"
        }
        return interpretation;
    }
    //returns true if 'a relation b' fullfills the physic laws of the world
    export function checkPhysicLaws( a : ObjectDefinition, b : ObjectDefinition, relation : string){
      //cannot be in relation to itself
      if(a === b){
        return false
      }
      //can only be inside a box
      if(relation === "inside" && b.form !== "box"){
        return false
      }
      //cannot be ontop of a box
      if(relation === "ontop" && b.form === "box"){
        return false
      }
      // Balls must be in boxes or on the floor
      if(a.form === "ball" && relation === "ontop" && b.form !== "floor" ){
        return false
      }
      // Balls cannot support anything.
      if((a.form === "ball" && relation === "under") || b.form === "ball" && (relation ==="ontop" || relation === "above")){
        return false
      }
      // Small objects cannot support large objects.
      if((a.size === "small" && b.size === "large" && relation === "under") || (b.size === "small" && a.size==="large" && (relation ==="ontop" || relation === "inside" || relation ==="above"))){
        return false
      }
      // Boxes cannot contain pyramids, planks or boxes of the same size.
      if(relation === "inside" && b.form ==="box" && a.size === b.size && (a.form === "pyramids" || a.form === "planks" || a.form === "box")){
        return false
      }
      // Small boxes cannot be supported by small bricks or pyramids.
      if(relation === "ontop" && a.form === "box" && a.size === "small" && (b.form==="pyramid" || (b.form ==="brick" && b.size ==="small"))){
        return false
      }
      // Large boxes cannot be supported by large pyramids.
      if(relation === "ontop" && a.form==="box" && b.form === "pyramid" && a.size === "large" && b.size === "large"){
        return false
      }
      return true
    }

    /**
    * Finds the possible object-key-strings corresponding to an arbitrary entity
    * @param ent The entity being searched for
    * @param state The current world state
    * @returns A list of the string keys correspoding to objects in the world matching given entity description
    */
    function findEntity(ent : Parser.Entity , state : WorldState) : string[] {
      // Qunatifier assumed to be "the/any". Support for "all" extended later
      return findObject(ent.object , state)
    }
    /**
    * Finds the possible object-key-strings corresponding to an arbitrary object
    * @param obj The object being searched for
    * @param state The current world state
    * @returns A list of the string keys correspoding to objects in the world matching given object description
    */
    function findObject(obj : Parser.Object , state : WorldState) : string[] {
      //stores string keys to all found objects matching what we are looking for. Returned by the function
      var foundObjects : string[] = [];
      // string keys to all world objects
      var objects : string[] = Array.prototype.concat.apply([], state.stacks);
      // add the grasped object if it exists
      if(state.holding != null){
        objects.push(state.holding)
      }
      //If we are looking for a (color,form,size) object
      if(obj.location == null){
        //special case for floor
        if(obj.size == null && obj.color == null && obj.form == "floor"){
              return ["floor"]
        }
        //look through all world objects and add to the found-list if {size,color,form} match
        objects.forEach((eachWorldObj) => {
          if(obj.size == null || obj.size === state.objects[eachWorldObj].size){
            if(obj.color == null || obj.color === state.objects[eachWorldObj].color){
              if(obj.form === state.objects[eachWorldObj].form || obj.form === "anyform"){
                foundObjects.push(eachWorldObj)
              }
            }
          }
        })
        return foundObjects
      }
      // Then we are searching for a (object,location) based object:
      // loop through all the possible objects which are to fullfill the location relation
      var objList : string[] = findObject( obj.object , state )
      for(var i = 0 ; i < objList.length ; i++){
        var coordinates : number[] = getCoords(objList[i],state)
        //if location relation is fullfilled add object to the found-list
        if(checkLocation(coordinates,obj.location,state)){
          foundObjects.push(objList[i])
        }
      }
      return foundObjects
    }
    /** Checks if CoordinatesA fullfills LOCATION requirements in relation to
    * some entity B (the location.entity, which could correspond to multiple objects).
    * @returns true if requirements are fullfilled
    */

    function checkLocation(coordinatesA : number[],location : Parser.Location, state : WorldState) : boolean{
        var bList : string[] = findEntity( location.entity , state )
        //if the location.relation is fullfilled with respect to ANY other object
        //matching the entity description: return true
        for(var j = 0 ; j < bList.length ; j++){
          // special case: in relation to floor
          if(bList[j]==="floor"){
            if(location.relation==="above"){
              return true
            }
            if(location.relation==="ontop"){
              if(coordinatesA[1] === 0){
                return true
              }
            }
            continue
          }
          var coordinatesB : number[] = getCoords(bList[j],state)
          if(location.relation === "leftof"){
            if(coordinatesA[0]<coordinatesB[0]){
              return true
            }
          }
          else {if(location.relation === "rightof"){
            if(coordinatesA[0]>coordinatesB[0]){
              return true
            }
          }
          else {if(location.relation === "ontop"){
            if(state.objects[bList[j]].form !== "box"){
              if(coordinatesA[0]===coordinatesB[0] && coordinatesA[1] === coordinatesB[1]+1){
                return true
              }
            }
          }
          else {if(location.relation === "inside"){
            if(state.objects[bList[j]].form === "box"){
              if(coordinatesA[0]===coordinatesB[0] && coordinatesA[1] === coordinatesB[1]+1){
                return true
              }
            }
          }
          else {if(location.relation === "under"){
            if(coordinatesA[0]===coordinatesB[0] && coordinatesA[1]<coordinatesB[1]){
              return true
            }
          }
          else {if(location.relation === "beside"){
            if(Math.abs(coordinatesA[0]-coordinatesB[0])===1){
              return true
            }
          }
          else {if(location.relation === "above"){
            if(coordinatesA[0]===coordinatesB[0] && coordinatesA[1]>coordinatesB[1]){
              return true
            }
          }}}}}}}
        }
        return false
    }
    /** Finds coordinates of an object given a key. Assending coordinate system to the right and upwards
    * @param strKey string key of object being searched for
    * @param state current world state
    * @returns [x,y] coordinates
    */
    export function getCoords(strKey : string, state : WorldState) : number[]{
      var x : number;
      var y : number;
      state.stacks.forEach((stack,index) => {
        if(stack.indexOf(strKey) !=-1){
          x = index;
          y = stack.indexOf(strKey)
        }
      })
      return [x,y]
    }
}
