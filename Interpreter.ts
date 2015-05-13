///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

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
    interface Sayings {rel:string; objs:string[]};

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
        console.log(":::::::::::NEW INTERPRETATION:::::::::::::");
        var lit : Literal[][] = [[]];
        if(cmd.cmd === "move" || cmd.cmd === "put"){
            var objs : string[] = interpretEntity(cmd.ent, state);
            var locs : Sayings = interpretLocation(cmd.loc, state);
            var it : number = 0;
            for(var i : number = 0; i < objs.length; i++){
                for(var j : number= 0; j< locs.objs.length; j++){
                    lit[it] = [];
                    //TODO:: AND between interpretations
                    lit[it++][0] = {pol: true, rel : locs.rel, args : [objs[i],locs.objs[j]]};    
                }

            }
            console.log("yolo");
            //check if valid.
            return lit;    
        }
        else{
            var objs : string[] = interpretEntity(cmd.ent, state);
            for(var i : number = 0; i < objs.length; i++){
                    //lit[i][0] = {pol: false, rel : ontop, args : [objs[i],]};
                    lit[i][0] = {pol: true, rel : "holding", args : [objs[i]]};   
            }
            return lit;
        }
    }

    function interpretEntity(ent : Parser.Entity, state : WorldState) : string[] {
        //Assuming only single objects. 
        //TODO: quant == all, any.
        var objs : string[] = interpretObject(ent.obj, state);
        //TODO:: FILTER objects that aren't on their locations 
        //console.log(ent+": "+ objs.length);
        
        return objs;
    }

    function interpretObject(obj : Parser.Object, state : WorldState) : string[] {
        if(obj.obj != null){
            var objs : string[] = interpretObject(obj.obj, state);
            var locs : Sayings = interpretLocation(obj.loc, state);
            console.log(locs.rel + locs.objs.length);
            if(locs.rel === "ontop"){
                console.log("ontop: " + locs.objs.length);
                console.log(objs[0]);
                console.log(locs.objs[0]);
                for(var i : number = 0; i < objs.length;i++){
                    var works : boolean = false;
                    for(var j : number = 0; j < locs.objs.length && !works; j++){
                        if(locs.objs[j] === "floor"){
                            works = state.stacks.some(e => e.indexOf(objs[i]) === 0);
                        } else{
                            works = state.stacks.some(
                                function(e){ 
                                    console.log("loc: "+locs.objs[j] + " obj: "+objs[i]);
                                    //if not in stack indexOf returns -1.
                                    var bottomIndex = e.indexOf(locs.objs[j]);
                                    var topIndex = e.indexOf(objs[i]);
                                    console.log("top: "+topIndex + " bottom: "+bottomIndex);
                                    return bottomIndex >=0 && topIndex >=0 && topIndex - bottomIndex === 1;
                                });
                            //test the rest
                        }
                    }
                    if(!works){
                        console.log("removing obj: "+objs[i]);
                        objs.splice(i--,1);
                    }
                }
            } else if(locs.rel === "inside"){
                //console.log("inside: " + locs.objs.length);

            } else if(locs.rel === "beside"){
                //todo all other rels.
            }
            //if rel === ontop index obj == index loc+1 && same column
            //if rel === above index of obj > loc && same column
            //if rel === nextto     not same column. obj.column == loc.column -(or+) 1
               
            //Todo :: check loc
            return objs;
            
        }else{
            //identify obj from woldstatt-
            if(obj.form === "floor"){
                return ["floor"];
            }
            var objsindexes : string[] = Array.prototype.concat.apply([], state.stacks);
            //console.log("prefilter:"+objsindexes.length);
            if(obj.size != null){
                objsindexes = objsindexes.filter(e=> state.objects[e].size === obj.size);
            }
            //console.log("afterfilersize: "+objsindexes.length);
            if(obj.form != null){
                objsindexes = objsindexes.filter(e=> state.objects[e].form === obj.form);
            }
            //console.log("afterfilerform: "+objsindexes.length);
            if(obj.color != null){
                objsindexes = objsindexes.filter(e=> state.objects[e].color === obj.color);
            }
            //console.log("afterfilercolor: "+objsindexes.length);
            return objsindexes;
        }
    }

    function interpretLocation(loc : Parser.Location, state : WorldState) : Sayings {
        var locs : Sayings = {rel:loc.rel, objs:interpretEntity(loc.ent, state)} 
        return locs;
    }



    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

