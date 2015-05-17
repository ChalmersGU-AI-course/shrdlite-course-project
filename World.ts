///<reference path="lib/lodash.d.ts"/>

// Interface definitions for worlds

interface ObjectDefinition {
    form: string;
    size?: string;
    color?: string;
}

interface WorldState {
    stacks: string[][];
    holding: string;
    arm: number;
    objects: { [s:string]: ObjectDefinition; };
    examples: string[];
}

interface World {
    currentState : WorldState;


    printWorld(callback? : () => void) : void;
    performPlan(plan: string[], callback? : () => void) : void;

    readUserInput(prompt : string, callback : (string) => void) : void;
    printSystemOutput(output : string, participant? : string) : void;
    printDebugInfo(info : string) : void;
    printError(error : string, message? : string) : void;
}

//Our own interfaces
interface ObjectDefinitionWithId extends ObjectDefinition {
    id: string;
}
interface PddlLiteral {pol:boolean; rel:string; args:string[];}

interface ExtendedWorldState extends WorldState {
    objStacks: ObjectDefinitionWithId[][];
    objectsWithId: { [s:string]: ObjectDefinitionWithId; };
    objectsByForm: { [s:string]: string[]; };
    pddlWorld: PddlWorld;
}

interface PddlWorld {
    rels: PddlLiteral[];
    arm: number;
    holding: string;
}
// Our extended versions :)

// Extends an ObjectDefinition to an ObjectDefinitionWithId
function assignObjectId(obj : ObjectDefinition, id : string) {
    var newObj : ObjectDefinitionWithId = {
        form: obj.form,
        size: obj.size,
        color: obj.color,
        id: id
    };
    return newObj;
}

// Extends a WorldState
function extendWorldState(state: WorldState) : ExtendedWorldState {

    // Create convenient world representation (store the objects in stacks, rather than id's)
    var objStacks : ObjectDefinitionWithId[][] = _.map(state.stacks, function (stack, i) {
        var newStack = _.map(stack, function (objId) {
            // Add 'id' property to each object
            var obj : ObjectDefinitionWithId = assignObjectId(state.objects[objId], objId);
            return obj;
            //return state.objects[objId];
        });
        // Add floor objects at beginning of each stack
        var floor = {form: 'floor', id: 'floor-'+i, color: null};
        newStack.unshift(floor);
        return newStack;
    });

    // Create array of all objects (also convenient)
    var objectsWithIdList : ObjectDefinitionWithId[] = concat(objStacks);
    // Convert to map, indexed by id
    var objectsWithId : { [s:string]: ObjectDefinitionWithId; } = {};
    for (var i in objectsWithIdList) {
        var obj = objectsWithIdList[i]
          , id  = obj.id;
        objectsWithId[id] = obj;
    }

    if(state.holding) {
        objectsWithId[state.holding] = assignObjectId(state.objects[state.holding], state.holding);  
    }

    // Create PPDL representation
    var pddlWorld : PddlLiteral[] = [];
    for (var x in objStacks) {
        // Add constraints
        for (var y = 0; y<objStacks[x].length; y++) {
            // On top / inside
            var obj     = objStacks[x][y]
              , nextObj =objStacks[x][y+1];
            if (nextObj) {
                var rel        = (obj.form == 'box') ? 'inside' : 'ontop'
                  , constraint = {pol: true, rel: rel, args: [nextObj.id, obj.id]};
                pddlWorld.push(constraint);
            }
        }
    }
    if (state.holding != null) {
        pddlWorld.push({ pol: true, rel: 'holding', args: [state.holding] });
    }

    // Another convenient representation
    // objectsByForm['ball'] is the list of all balls
    var objectsByForm : { [s:string]: string[]; } = {};
    for (var i in objectsWithIdList) {
        var obj  = objectsWithIdList[i]
          , form = obj.form;
        if (!objectsByForm[form]) objectsByForm[form] = [];
        objectsByForm[form].push(obj.id);
    }
    console.log("objsbytyp", objectsByForm);


    var newState : ExtendedWorldState = {
        objStacks: objStacks,
        objectsWithId: objectsWithId,
        objectsByForm: objectsByForm,
        pddlWorld: {rels: pddlWorld, arm: 0, holding: null},
        stacks: state.stacks,
        holding: state.holding,
        arm: state.arm,
        objects: state.objects,
        examples: state.examples
    };
    return newState;
}

// Concats a list of lists into a list
// TODO: move to util file
function concat(lists : any[][]) : any[] {
    return Array.prototype.concat.apply([], lists);
}
