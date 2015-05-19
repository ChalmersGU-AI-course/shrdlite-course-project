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
        
        parses.forEach((parseresult) => {
            var intprt : Result = <Result>parseresult;
            intprt.intp = interpretCommand(intprt.prs, currentState);
            interpretations.push(intprt);
        });
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
    
    function findObject(object: Parser.Object){
        if(object == undefined) return "";
        
        var hasSize = object.size != null;
        var hasColor = object.color != null;
        var hasForm = object.form != null;
        
        //console.log("INTERPRETER findObject: size " + object.size + "| null? " + hasSize);
        //console.log("INTERPRETER findObject: color " + object.color + "| null? " + hasColor);
        //console.log("INTERPRETER findObject: form " + object.form + "| null? " + hasForm);
        
        return (hasSize ? object.size + " ": "") + (hasColor ? object.color + " " : "") + (hasForm ? object.form : "");
    }
    
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

    function interpretCommandAmbiguous(cmd : Parser.Command, state : WorldState): string {
        //console.log("--------------------- START INTERPRETER AMBIGUOUS ---------------------");
    
        var sentence: string[] = [];
    
        var command = cmd.cmd;
        
        var quant = cmd.ent.quant;
        
        var objectTemp = cmd.ent.obj;
        var objectToUse = objectTemp.obj == undefined ? objectTemp : objectTemp.obj;
        
        var objectStr = findObject(objectToUse);
        var objectLocation = objectTemp.loc;
        var objectHasLocation = objectTemp.loc != undefined;
        var objectLocationRelation = objectHasLocation ? objectLocation.rel : "";
        var objectLocationQuant = objectHasLocation ? objectLocation.ent.quant : "";
        var objectLocationStr = objectHasLocation ? findObject(objectLocation.ent.obj) : "";
        
        sentence.push(command);
        sentence.push(quant);
        sentence.push(objectStr);
        
        //console.log("INTERPRETER AMBIGUOUS: " + command);
        //console.log("INTERPRETER AMBIGUOUS: " + quant);
        //console.log("INTERPRETER AMBIGUOUS: " + objectStr);
        if(objectHasLocation){
            
            sentence.push("that is");
            sentence.push(objectLocationRelation);
            sentence.push(objectLocationQuant);
            sentence.push(objectLocationStr);
        
            //console.log("INTERPRETER AMBIGUOUS: that is");
            //console.log("INTERPRETER AMBIGUOUS: " + objectLocationRelation);
            //console.log("INTERPRETER AMBIGUOUS: " + objectLocationQuant);
            //console.log("INTERPRETER AMBIGUOUS: " + objectLocationStr);
        }
        
        var location = cmd.loc;
        
        var locationRelation = getRelation(location.rel);
        var locationQuant = location.ent.quant;
        
        var locationTemp = location.ent.obj;
        var locationToUse = locationTemp.obj == undefined ? locationTemp : locationTemp.obj;
        
        var locationStr = findObject(locationToUse);
        var locationLocation = locationTemp.loc;
        var locationHasLocation = locationTemp.loc != undefined;
        var locationLocationRelation = locationHasLocation ? getRelation(locationLocation.rel) : "";
        var locationLocationQuant = locationHasLocation ? locationLocation.ent.quant : "";
        var locationLocationStr = locationHasLocation ? findObject(locationLocation.ent.obj) : "";
        
        sentence.push(locationRelation);
        sentence.push(locationQuant);
        sentence.push(locationStr);
        
        //console.log("INTERPRETER AMBIGUOUS: " + locationRelation);
        //console.log("INTERPRETER AMBIGUOUS: " + locationQuant);
        //console.log("INTERPRETER AMBIGUOUS: " + locationStr);
        if(locationHasLocation){
            
            sentence.push("that is");
            sentence.push(locationLocationRelation);
            sentence.push(locationLocationQuant);
            sentence.push(locationLocationStr);
        
            //console.log("INTERPRETER AMBIGUOUS: that is");
            //console.log("INTERPRETER AMBIGUOUS: " + locationLocationRelation);
            //console.log("INTERPRETER AMBIGUOUS: " + locationLocationQuant);
            //console.log("INTERPRETER AMBIGUOUS: " + locationLocationStr);
        }
        
        var sentenceStr = "";
        
        sentence.forEach(
            (word: string) => {
                sentenceStr += word + " ";
            }
        );
        
        //console.log("--------------------- Sentence: " + sentenceStr + " ---------------------");
    
        //console.log("--------------------- END INTERPRETER AMBIGUOUS ---------------------");
        return sentenceStr;
    
        /*
        //All objects in the world
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        
        //The wanted object(s)
        var object = cmd.ent.obj;
        
        //First check if the object is inside the world
        var objectKeys = getObjectKey(object, objs, state.objects, state.stacks, false);
        
        //console.log("INTERPRETER AMBIGUOUS: objectKeys " + objectKeys.toString());
        
        objectKeys.forEach(
            (objectKey: string) => {
                var locationObjects = getObjectKeysWithoutObject(cmd.ent.obj.loc.ent.obj, objs, state.objects);
                //console.log("INTERPRETER AMBIGUOUS: The object " + objectKey + " should have a location: " + locationObjects.toString());
            }
        );
        
        
        
        var foundLocationKey = getObjectKey(cmd.loc.ent.obj, objs, state.objects, state.stacks, false);
        
        //console.log("INTERPRETER AMBIGUOUS foundLocationKey: " + foundLocationKey.toString());
        
        //console.log("--------------------- END INTERPRETER AMBIGUOUS ---------------------");
        */
    }

    //////////////////////////////////////////////////////////////////////
    // private functions
    function interpretCommand(cmd : Parser.Command, state : WorldState) : Literal[][] {
        //console.log("--------------------- START INTERPRETER ---------------------");
        var intprt : Literal[][] = [];
        
        //All objects in the world
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        
        //The wanted object(s)
        var object = cmd.ent.obj;
        
        //First check if the object is inside the world
        var objectKeys = getObjectKey(object, objs, state.objects, state.stacks, true);
        
        //console.log("INTERPRETER: objectKeys " + objectKeys.toString());

        //If this is not true, we did not find an object that matched
        if(rightNumberOfResults(cmd.ent.quant, objectKeys.length)){
            
            switch(cmd.cmd){
                case "take":
                    
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
                        //Just say that we should hold any of the found keys
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
                    
                    //Check the location
                    var foundLocationKey = getObjectKey(cmd.loc.ent.obj, objs, state.objects, state.stacks, true);
                    
                    //console.log("INTERPRETER foundLocationKey: " + foundLocationKey.toString());
                    
                    if(rightNumberOfResults(cmd.loc.ent.quant, foundLocationKey.length)){
                        
                        if(cmd.ent.quant == "all"){
                        
                            /*
                            var amountOfLocations = foundLocationKey.length;
                            
                            for(var i = 0; i < amountOfLocations; i++){
                                
                            }
                        
                            var temp: Literal[] = [];
                            temp.push(
                                {pol: true, rel: cmd.loc.rel, args: [objectKeys[0], foundLocationKey[0]]}
                            );
                            temp.push(
                                {pol: true, rel: cmd.loc.rel, args: [objectKeys[1], foundLocationKey[1]]}
                            );
                            intprt.push(temp);
                            
                            var temp: Literal[] = [];
                            temp.push(
                                {pol: true, rel: cmd.loc.rel, args: [objectKeys[0], foundLocationKey[1]]}
                            );
                            temp.push(
                                {pol: true, rel: cmd.loc.rel, args: [objectKeys[1], foundLocationKey[0]]}
                            );
                            intprt.push(temp);
                            */
                        
                            
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
                            
                        
                            /*
                            foundLocationKey.forEach(
                                (locationKey: string) => {
                                    var temp: Literal[] = [];
                                    objectKeys.forEach(
                                        (key: string) => {
                                            temp.push(
                                                {pol: true, rel: cmd.loc.rel, args: [key, locationKey]}
                                            );
                                        }
                                    );
                                    intprt.push(temp);
                                }
                            );
                            */
                        
                            /*
                            objectKeys.forEach(
                                (key: string) => {
                                    var temp: Literal[] = [];
                                    foundLocationKey.forEach(
                                        (locationKey: string) => {
                                            temp.push(
                                                {pol: true, rel: cmd.loc.rel, args: [key, locationKey]}
                                            );
                                        }
                                    );
                                    intprt.push(temp);
                                }
                            );
                            */
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
                        
                    }
                    
                    break;
            
            }
            
        } else {
            //console.log("INTERPRETER: Found object was not in right place or not in the world");
        }
        
        
        //console.log("--------------------- END INTERPRETER ---------------------");
        //console.log("intPrt #" + intprt.length);
        //console.log("--------------------- END INTERPRETER ---------------------");
        return intprt;
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
                            //console.log("INTERPRETER: Object did not have both properties!!");
                        } else if(hasColor && currentHasColor && !currentHasSize){
                            //console.log("INTERPRETER: hasColor, currentHasColor, !currentHasSize");
                            returnList.push(availableObject);
                        } else if(hasSize && currentHasSize && !currentHasColor){
                            //console.log("INTERPRETER: hasSize, currentHasSize, !currentHasColor");
                            returnList.push(availableObject);
                        } else if(!hasColor && !hasSize){
                            //console.log("INTERPRETER: !hasColor, !hasSize");
                            returnList.push(availableObject);
                        }
                    }
                    
                } else if(object.form == "floor"){
                    //Check if the location is the floor
                    //console.log("Interpreter ****** LOCATION IS FLOOR");
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
        
        //console.log("INTERPRETER return at getObjectKeysWithoutObject: " + returnList.toString());
        return returnList;
    }
    
    function getObjectKey(object: Parser.Object, availableObjects: string[], objects: {[s:string]: ObjectDefinition}, stacks: string[][], filter: boolean): string[]{
        
        //First check if the object contains any object
        if(object.obj){
            //console.log("Interpreter ---- Object has object!!!!!!");
            
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
        
        //console.log("Interpreter ****** LOCATIONS: " + locationObjects.toString());
        
        //console.log("Interpreter filterOnLocation: Will filter out " + foundKeys.toString() + " that is not " + locationObjects.toString());
        
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

