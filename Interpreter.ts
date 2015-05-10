///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="Utils.ts"/>

module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
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


    //////////////////////////////////////////////////////////////////////
    // private functions

    function interpretCommand(cmd : Parser.Command, state : WorldState) : Literal[][] {
        var intprt : Literal[][] = [];
        //Take the white ball -->
        //{"cmd":"take",
        // "ent":{"quant":"the",
        //        "obj":{"size":null,
        //               "color":"white",
        //               "form":"ball"}}}
        
        //All objects in the world
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        console.log("Interpreter objs= " + objs.toString());
        
        var object = cmd.ent.obj;
        //First check if the object is inside the world
        var objectKeys = getObjectKey(object, objs, state.objects, state.stacks);
        console.log("Interpreter ***** found objectKeys: " + objectKeys.toString());
        
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
                    var foundLocationKey = getObjectKey(cmd.loc.ent.obj, objs, state.objects, state.stacks);
                    
                    if(rightNumberOfResults(cmd.loc.ent.quant, foundLocationKey.length)){
                        
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
                    
                    break;
            
            }
            
        }
        
        
        /*
        var a = objs[getRandomInt(objs.length)];
        var b = objs[getRandomInt(objs.length)];
        var intprt : Literal[][] = [[
            {pol: true, rel: "ontop", args: [a, "floor"]},
            {pol: true, rel: "holding", args: [b]}
        ]];*/
        
        
        return intprt;
    }
    
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
                var availableObjectDef = objects[availableObject];;
                
                if(object.form == availableObjectDef.form){
                    
                    if(hasSize && object.size == availableObjectDef.size){
                        checked++;
                        currentHasSize = true;
                    }
                    
                    if(hasColor && object.color == availableObjectDef.color){
                        checked++;
                        currentHasColor = true;
                    }
                    
                    if(checked == 2){
                        returnList = [];
                        returnList.push(availableObject);
                        return false;
                    } else {
                        if(hasColor && hasSize){
                            console.log("Object did not have both properties!!");
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
                    console.log("Interpreter ****** LOCATION IS FLOOR");
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
    
    function getObjectKey(object: Parser.Object, availableObjects: string[], objects: {[s:string]: ObjectDefinition}, stacks: string[][]): string[]{
        
        //First check if the object contains any object
        if(object.obj){
            console.log("Interpreter ---- Object has object!!!!!!");
            
            var foundKeys = getObjectKeysWithoutObject(object.obj, availableObjects, objects);
            
            if(foundKeys.length > 0){
                //Now, check which of all the objectKeys returned, fulfils
                // the location criteria.
                return filterOnLocation(foundKeys, object.loc, availableObjects, objects, stacks);
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
        
        console.log("Interpreter ****** LOCATIONS: " + locationObjects.toString());
        
        
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

