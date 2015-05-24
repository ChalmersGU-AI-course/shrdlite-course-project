///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="Utils.ts"/>

module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
        
        //Check if ambiguous
        if(parses.length > 1){
            var ambiguousInterpretations: string[] = [];
            //The utterance is ambiguous, find out the different interpretations
            parses.forEach((parseresult) => {
                var intprt : Result = <Result>parseresult;
                var sentence = interpretCommandAmbiguous(intprt.prs, currentState);
                ambiguousInterpretations.push(sentence);
            });
        
            throw new Interpreter.AmbiguousError("Ambiguous result from the parses!", ambiguousInterpretations);
        }
        
        //The parse is not ambiguous, interpret as normal
        parses.forEach((parseresult) => {
            var intprt : Result = <Result>parseresult;
            intprt.intp = interpretCommand(intprt.prs, currentState);
            interpretations.push(intprt);
        });
        
        //Check if any interpretations was found
        if (interpretations.length) {
            return interpretations;
        } else {
            throw new Interpreter.Error("Found no interpretation");
        }
    }


    export interface Result extends Parser.Result {intp:Literal[][];}
    export interface Literal {pol:boolean; rel:string; args:string[];}


    export function interpretationToString(res : Result) : string {
        return res.intp.map((lits) => {
            return lits.map((lit) => literalToString(lit)).join(" & ");
        }).join(" | ");
    }

    export function literalToString(lit : Literal) : string {
        return (lit.pol ? "" : "-") + lit.rel + "(" + lit.args.join(",") + ")";
    }


    export class Error implements Error {
        public name = "Interpreter.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }
    
    export class AmbiguousError implements Error {
        public name = "Interpreter.AmbiguousError";
        constructor(public message : string, public sentences : string[]) {}
        public toString() {return this.name + ": " + this.message}
    }
    
    /** Returns a string representation of the given object.
     *  Will use as much information that is available */
    function findObject(object: Parser.Object){
        if(object == undefined) return "";
        
        var hasSize  = object.size  != null;
        var hasColor = object.color != null;
        var hasForm  = object.form  != null;
        
        var objectForm = hasForm ? object.form == "anyform" ? "object" : object.form : "";
        
        return (hasSize ? object.size + " ": "") + (hasColor ? object.color + " " : "") + objectForm;
    }
    
    /** Returns a string representation of the given relationship. */
    function getRelation(rel: string){
        if(rel == undefined || rel == null) return "";
        
        switch (rel){
            case "ontop":
            case "right":
            case "left":
                return rel + " of";
            default:
                return rel;
        }
    }

    /** Interpret an ambiguous parse by extracting the parse to a sentence */
    function interpretCommandAmbiguous(cmd : Parser.Command, state : WorldState): string {
    
        var sentence: string[] = [];
    
        // What is the command?  (Move, pick up, etc)
        var command = cmd.cmd;
        
        // What is the quantifier?
        var quant = cmd.ent.quant;
        
        //Get hold of the object refered to, either
        // the objects object, or just the object itself
        var objectTemp = cmd.ent.obj;
        var objectToUse = objectTemp.obj == undefined ? objectTemp : objectTemp.obj;
        
        //Extract the information about the object
        var objectStr = findObject(objectToUse);
        var objectLocation = objectTemp.loc;
        var objectHasLocation = objectTemp.loc != undefined;
        var objectLocationRelation = objectHasLocation ? objectLocation.rel : "";
        var objectLocationQuant = objectHasLocation ? objectLocation.ent.quant : "";
        var objectLocationStr = objectHasLocation ? findObject(objectLocation.ent.obj) : "";
        objectLocationStr = objectLocationQuant == "all" ? objectLocationStr + "s" : objectLocationStr;
        
        //Push all the information to the final sentence
        sentence.push(command);
        sentence.push(quant);
        sentence.push(objectStr);
        
        //If the object also has a location, add that.
        if(objectHasLocation){
            sentence.push("that is");
            sentence.push(objectLocationRelation);
            sentence.push(objectLocationQuant);
            sentence.push(objectLocationStr);
        }
        
        //Then do nearly everything again, but for the location
        var location = cmd.loc;
        
        var locationRelation = getRelation(location.rel);
        var locationQuant = location.ent.quant;
        
        var locationTemp = location.ent.obj;
        var locationToUse = locationTemp.obj == undefined ? locationTemp : locationTemp.obj;
        
        var locationStr = findObject(locationToUse);
        locationStr = locationQuant == "all" ? locationStr + "s" : locationStr;
        var locationLocation = locationTemp.loc;
        var locationHasLocation = locationTemp.loc != undefined;
        var locationLocationRelation = locationHasLocation ? getRelation(locationLocation.rel) : "";
        var locationLocationQuant = locationHasLocation ? locationLocation.ent.quant : "";
        var locationLocationStr = locationHasLocation ? findObject(locationLocation.ent.obj) : "";
        
        sentence.push(locationRelation);
        sentence.push(locationQuant);
        sentence.push(locationStr);
        
        if(locationHasLocation){
            sentence.push("that is");
            sentence.push(locationLocationRelation);
            sentence.push(locationLocationQuant);
            sentence.push(locationLocationStr);
        }

        //Join the list of words into a sentence
        return sentence.join(" ");
    
    }

    //////////////////////////////////////////////////////////////////////
    // private functions
    function interpretCommand(cmd : Parser.Command, state : WorldState) : Literal[][] {
        var intprt : Literal[][] = [];
        
        //All objects in the world
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        
        //If the arm is holding something, add that too
        if(state.holding != null){
            objs.push(state.holding);
        }
        
        //The wanted object(s)
        var object = cmd.ent.obj;
        
        //First check if the object is inside the world...
        var objectKeys = getObjectKey(object, objs, state.objects, state.stacks, true);
        
        
        //...if this is not true, we did not find an object that matched
        if(rightNumberOfResults(cmd.ent.quant, objectKeys.length)){
        
            //We found the right number of results, depending on the quantifier
            
            switch(cmd.cmd){
                case "take":
                    
                    //If the quantifier is "all", then push all the found object keys
                    // to the interpreter list by using conjunction
                    if(cmd.ent.quant == "all"){
                        var temp: Literal[] = [];
                        objectKeys.forEach(
                            (key: string) => {
                                temp.push(
                                    {pol: true, rel: "holding", args: [key]}
                                );
                            }
                        );
                        intprt.push(temp);
                    } else {
                        //Just say that we should hold any of the found keys by
                        // pushing all the object keys using disjunction
                        objectKeys.forEach(
                            (key: string) => {
                                intprt.push(
                                    [{pol: true, rel: "holding", args: [key]}]
                                );
                            }
                        );
                    }
                    
                    break;
                case "move":
                    
                    //If we should move something, we need to know where to.
                    //So get the location(s)
                    var foundLocationKey = getObjectKey(cmd.loc.ent.obj, objs, state.objects, state.stacks, true);
                    
                    //Just as before, check if we got enough results. Since we should move
                    // something, we need to have found some location (depending on the quantifier)
                    if(rightNumberOfResults(cmd.loc.ent.quant, foundLocationKey.length)){
                        
                        //If the quantifier is "all", we should push all combinations of 
                        // object keys and location keys 
                        if(cmd.ent.quant == "all"){
                            
                            var locationLength = foundLocationKey.length;
                            for(var objectIndex = 0; objectIndex < objectKeys.length; objectIndex++){
                                for(var locationIndex = 0; locationIndex < locationLength; locationIndex++){
                                    
                                    var locationIndex2 = (locationIndex + objectIndex)%locationLength;
                                    
                                    var row = intprt[locationIndex];
                                    
                                    var lit: Literal = {pol: true, rel: cmd.loc.rel, args: [objectKeys[objectIndex], foundLocationKey[locationIndex2]]};
                                    
                                    if(row == undefined){
                                        row = [lit];
                                    } else {
                                        row.push(lit);
                                    }
                                     
                                    intprt[locationIndex] = row;
                                }
                            }
                            
                        } else {
                        
                            objectKeys.forEach(
                                (key: string) => {
                                    
                                    foundLocationKey.forEach(
                                        (locationKey: string) => {
                                            intprt.push(
                                                [{pol: true, rel: cmd.loc.rel, args: [key, locationKey]}]
                                            );
                                        }
                                    );
                                    
                                }
                            );
                        }
                        
                    } else {
                        //We did not get the right number of results regarding the locations
                        
                        var locationStr = findObject(cmd.loc.ent.obj);
                        
                        switch(cmd.loc.ent.quant){
                            case "the":
                                throw new Error("The parse is ambiguous! There are several " + locationStr + " locations in the current world. Please specify which one you meant");
                                break;
                            default:
                                break;
                        }
                    }
                    
                    break;
            
            }
            
        } else {
            //We did not get the right number of results regarding the objects
            
            var objectStr = findObject(object);
            
            switch(cmd.ent.quant){
                case "the":
                    throw new Error("The parse is ambiguous! There are several " + objectStr + "s in the current world. Please specify which one you meant");
                    break;
                default:
                    break;
            }
        }
        
        //Lastly, go over all the intepretations and filter out non valid ones
        var validInt = [];
        //First go over all the interpretations and filter out non-valid interpretations
        var numberOfOrs: number = intprt.length;
        intprt.forEach(
            (ints: Interpreter.Literal[]) => {
                var wasValid = true;
                numberOfOrs--;
                
                ints.forEach(
                    (int: Interpreter.Literal) => {
                        try{
                            var validIntFlag = validInterpretation(int, state.objects);
                        } catch(err){
                            //err instanceof ValidInterpretationError
                            if(err instanceof ValidInterpretationError && numberOfOrs==0 && validInt.length == 0){
                                throw err;
                            }
                        }
                        
                        if(!validIntFlag){
                            wasValid = false;
                        }
                        return true;
                    }
                );
                
                if(wasValid){
                    validInt.push(ints);
                }
                
                return true;
            }
        );
        
        return validInt;
    }
    
    
    /** Goes through all the available objects (availableObjects), using the object definitions, to check if the wanted object (object)
    *    is inside the current world. If so, the key (character) for that object is added to the returnList and then returned */
    function getObjectKeysWithoutObject(object: Parser.Object, availableObjects: string[], objects: {[s:string]: ObjectDefinition}): string[]{
        //Array to return in the end
        var returnList: string[] = [];
        
        //Number which will be 2 if an object has form, size and color right
        var checked: number = 0;
        
        //Flag if we want to find something of a specific size
        var hasSize: boolean = object.size != null;
        
        //Flag if we want to find something of a specific color
        var hasColor: boolean = object.color != null;
        
        //Flags that says if an object (available in the world) has the right property
        var currentHasColor: boolean = false;
        var currentHasSize: boolean = false;
        
        availableObjects.forEach(
            (availableObject: string) => {
                
                //Get the properties of the current available object
                var availableObjectDef = objects[availableObject];
                
                if(object.form == availableObjectDef.form || object.form == "anyform"){
                    
                    if(hasSize && object.size == availableObjectDef.size){
                        checked++;
                        currentHasSize = true;
                    }
                    
                    if(hasColor && object.color == availableObjectDef.color){
                        checked++;
                        currentHasColor = true;
                    }
                    
                    if(checked == 2){ //Perfect match
                        returnList = [];
                        returnList.push(availableObject);
                        return false;
                    } else {
                        if(hasColor && hasSize){
                        } else if(hasColor && currentHasColor && !currentHasSize){
                            returnList.push(availableObject);
                        } else if(hasSize && currentHasSize && !currentHasColor){
                            returnList.push(availableObject);
                        } else if(!hasColor && !hasSize){
                            returnList.push(availableObject);
                        }
                    }
                    
                } else if(object.form == "floor"){
                    //Check if the location is the floor
                    returnList = [];
                    returnList.push("floor");
                    return false;
                }
                
                currentHasColor = false;
                currentHasSize = false;
                checked = 0;
                return true;
            }
        );
        
        return returnList;
    }
    
    function getObjectKey(object: Parser.Object, availableObjects: string[], objects: {[s:string]: ObjectDefinition}, stacks: string[][], filter: boolean): string[]{
        
        //First check if the object contains any object
        if(object.obj){
            
            var foundKeys = getObjectKeysWithoutObject(object.obj, availableObjects, objects);
            
            if(foundKeys.length > 0 && filter){
                //Now, check which of all the objectKeys returned, fulfils
                // the location criteria.
                return filterOnLocation(foundKeys, object.loc, availableObjects, objects, stacks);
            } else {
                return foundKeys;
            }
            
        } else {
            return getObjectKeysWithoutObject(object, availableObjects, objects);
        }
        return [];
    }
    
    function filterOnLocation(foundKeys: string[], loc: Parser.Location, availableObjects: string[], objects: {[s:string]: ObjectDefinition}, worldStacks: string[][]): string[]{
        var returnList: string[] = [];
        //Get the object associated with the location
        var locationObjects = getObjectKeysWithoutObject(loc.ent.obj, availableObjects, objects);
        
        if(rightNumberOfResults(loc.ent.quant, locationObjects.length)){
            var breakTheLoops = false;
            var finalFoundKey: string = undefined;
            
            locationObjects.forEach(
                (locationObject: string) => {
                
                    foundKeys.forEach(
                        (foundKey: string) => {
                        
                            if(check(foundKey, loc.rel, locationObject, worldStacks)){
                                finalFoundKey = foundKey;
                                breakTheLoops = true;
                            }
                            
                            return !breakTheLoops;
                        }
                    );
                    return !breakTheLoops;
                }
            );
            
            if(finalFoundKey != undefined){
                returnList.push(finalFoundKey); 
            }
        }
        
        return returnList;
    }
    
    function rightNumberOfResults(quant: string, amount: number){
        return quant == "the" && amount == 1 || quant != "the" && amount > 0;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

