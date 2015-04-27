///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

module Interpreter {

    interface Coord{
        x: number; //x coordinate
        y: number; //y coordinate
    }
    
    interface ObjWCoord{
        obj: Parser.Object;
        coord: Coord;
        id: string; //Identifier
    }
    
    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types
    
    
    //----------------------------------------------------------------------------------------------------------
    //TODO: Handle ambiguity and non-interpretation case
    //----------------------------------------------------------------------------------------------------------
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
       // This returns a dummy interpretation involving two random objects in the world
  /*      var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        var a = objs[getRandomInt(objs.length)];
        var b = objs[getRandomInt(objs.length)];
        var intprt : Literal[][] = [[
            {pol: true, rel: "ontop", args: [a, "floor"]},
            {pol: true, rel: "holding", args: [b]}
        ]];
        return intprt;
 */
        
        
        /*
            Identify object that need to be moved
            (No need to take care of quantifier 'all', and 'any' as same meaning as 'the')
            So take the first good match.
        
        
            -Search and store the cmd.ent.obj that match if cmd.ent.obj.obj == null
            -else: store all obj that match in a set, then check if relations are ok (recursive)
                   return first good match
        */
        var objToMove : ObjWCoord;
        
        //Check if object is without relation
        if(cmd.ent.obj.obj == null){
           var id: string = findObjectId(cmd.ent.obj, state)   
           var c: Coord = findCoord(id, state);
           objToMove.coord = c;
           objToMove.id = id;
           objToMove.obj = state.objects[id];
           
        }else{
        }
        
        
        /*
            Two cases again:
            -if loc.ent.obj.obj == null (simple case)
              search and store loc.ent.obj
            -else:  store all obj that match in a set, then check if relations are ok
                return first good match
        */
        //Check if it´s a 'take' or 'move'
        if(cmd.loc == null){
        
        }else{
        
        }
        
        /*
            Now we have the two objects and the relation (goal)
            Transform in PDDL:
            [[
            {pol: true, rel: "relation", args: ["o1, o2"]},
            ]];

             
        */
      
        
       var intprt : Literal[][] = [[
            {pol: true, rel: "ontop", args: [ "floor"]},
            {pol: true, rel: "holding", args: []}
        ]];
        return intprt;
    }
    
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    
    function findObjectId(obj:Parser.Object, state:WorldState): string{
        for(var i in state.objects){
            var o = state.objects[i];
            if((o.size == obj.size || o.size == null) && 
               (o.form == obj.form || o.form == null) &&
               (o.color == obj.color || o.color == null)){
               return i;       
            }   
        }
        throw new Interpreter.Error("No such obj in the world");
    }
    
    function findCoord(id:string, state:WorldState): Coord{
        for(var x = 0; x < state.stacks.length; x++){
            for(var y = 0; y < state.stacks[x].length; y++){
                if(state.stacks[x][y] == id){
                    return {x:x, y:y};
                }
            }
        }
        throw new Interpreter.Error("No such id in stacks");
    }

    
}

