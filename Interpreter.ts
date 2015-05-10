///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="collections.ts"/>
///<reference path="Rules.ts"/>
///<reference path="Helper.ts"/>

module Interpreter {
    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types
    
    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
        
        parses.forEach((parseresult) => {
            var intprt : Result = <Result>parseresult;
            intprt.intp = interpretCommand(intprt.prs, currentState);
            if(intprt.intp != null){
                interpretations.push(intprt);
            }
        });
        if (interpretations.length == 1) {
            return interpretations;
        }else if(interpretations.length == 0){
             throw new Error("Found no interpretation");
        }else{
            throw new Error("More than one parse gave an interpretation: ambiguity");    
        }
    }


    export interface Result extends Parser.Result {intp:Literal[][];}
    export interface Literal {pol:boolean; rel:string; args:string[]; }


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
        var tmp : ObjWCoord[];
        var tmp2: ObjWCoord[];
        var goalsAsMap = new collections.Dictionary<string, string[]>();
        var intprt : Literal[][];
        
        /*
            1st part: Identifying the object to move
        */
        
        //"move it" cmd
        if(cmd.ent == null){
            if(state.holding == null){
                throw new Error("No object is being held at the moment");
            }
            var obj: ObjectDefinition = state.objects[state.holding];
            var o: ObjWCoord = {id: state.holding, size: obj.size, form: obj.form, color: obj.color};
            
            tmp =[o];
        //other cmd
        }else{
            var myObj: Parser.Object = cmd.ent.obj.obj == null ? cmd.ent.obj : cmd.ent.obj.obj;
            if(Helper.isFloor(myObj)){
                throw new Error("Can't move the floor");
            }
            
            tmp = recursionCheck(cmd.ent, state);
            if(tmp.length == 0){
                //No such object
                return null;    
            }
            tmp = Helper.removeDuplicate(tmp);
            
        }
        
        //-----------------------------------------------------------
        /*
            2nd part: checking validity of location where to move the object
        */
        
        //Check if it´s a 'take' cmd
        if(cmd.loc == null){
            for(var i = 0; i < tmp.length; i++){
                goalsAsMap.setValue(tmp[i].id, []);
            }
            
            intprt = pddlTransformation(goalsAsMap, "holding", true);
        //Other cmd
        }else{
            var rel: string = cmd.loc.rel;
            var myObj: Parser.Object = cmd.loc.ent.obj.obj == null ? cmd.loc.ent.obj : cmd.loc.ent.obj.obj;
            
            tmp2 = recursionCheck(cmd.loc.ent, state);
            if(tmp2.length == 0){
                //No such object
                return null;    
            }
            tmp2 = Helper.removeDuplicate(tmp2);
            
            
            for(var i = 0; i < tmp.length; i++){
                var tmpGoal: string[] = checkPhysicalLaws(tmp[i], tmp2, rel);
                if(tmpGoal.length != 0){
                    goalsAsMap.setValue(tmp[i].id, tmpGoal);    
                }
            }
            
             if(tmpGoal.length == 0){
                //Impossible
                return null;    
            }
            
            intprt = pddlTransformation(goalsAsMap, rel, false);
        }
        
        return intprt;
    }
    
     
    function recursionCheck(ent: Parser.Entity, state: WorldState): ObjWCoord[]{
        var owc: ObjWCoord[] = [];    
        var o = ent.obj;
        
        if(o.obj != null){
            if(!Helper.isFloor(o)){
                owc = recursionCheck(o.loc.ent, state);
                var owcRelated: ObjWCoord[] = [];
               
                for(var i = 0; i < owc.length; i++){
                    var objs = getObjsWithSpatialRelation(o, owc[i], state);
                    for(var j = 0; j < objs.length; j++){
                        owcRelated.push(objs[j]);    
                    }
                }
                
                return owcRelated; 
            }else{
                throw new Error("Floor can't be related this way");    
            }
        }else{
            if(Helper.isFloor(o)){
                owc.push({id:"floor", form: "floor", size: null, color: null})
            }else{
                var ids: string[] = Helper.findIDs(o, state);   
                for(var i = 0; i < ids.length; i++){ 
                    var obj: ObjWCoord = {id: ids[i], size: state.objects[ids[i]].size, form: state.objects[ids[i]].form, color: state.objects[ids[i]].color};
                    if(ids[i] != state.holding){
                        obj.coord = Helper.findCoord(ids[i], state);
                    }
                    owc.push(obj);
                }
            }
            
            return owc;
        }
    }
    
    function pddlTransformation(map: collections.Dictionary<string, string[]>, rel: string, hold: boolean): Literal[][]{
        var lits: Literal[][] = [];
        var i = 0;
        
        if(hold){
            map.forEach((key: string, values: string[]) => {
                var lit: Literal[] = [{pol: true, rel: rel, args: [key]}];
                lits[i] = lit;
                i++;
            });
        }else{
            var j = 0;
            map.forEach((key: string, values: string[]) => {
                for(var i = 0; i < values.length; i++){
                    var lit: Literal = {pol: true, rel: rel, args: [key, values[i]]};    
                    lits[j] = [lit];
                    j++; 
                }   
            });
        }
           
        return lits;
    }
            
    function checkPhysicalLaws(o:ObjWCoord, objs:ObjWCoord[], rel:string):string[]{
        var valid: string[] = [];
        
        for(var i = 0; i < objs.length; i++){
            var curr: ObjWCoord = objs[i];
            if(!(curr.id == o.id ||
                Rules.breakRules(o, curr, rel))){
                valid.push(curr.id);                
            }
        }
        
        return valid;
    }    

    function getObjsWithSpatialRelation(o1: Parser.Object, o2:ObjWCoord, state:WorldState): ObjWCoord[]{
        var tmp: ObjWCoord[] = [];
        
        if(o2.form == "floor" && o1.loc.rel == "ontop"){
            for(var i = 0; i < state.stacks.length; i++){
                tmp = tmp.concat(Helper.getObjsInStack(i, 0, 1, state, o1));    
            }    
        }else if((o1.loc.rel == "inside" && o2.form == "box") ||(o1.loc.rel == "ontop" && o2.form != "box")){
            tmp = Helper.getObjsInStack(o2.coord.x, o2.coord.y+1, o2.coord.y+2, state, o1);
        }else if(o1.loc.rel == "above"){
            tmp = Helper.getObjsInStack(o2.coord.x, o2.coord.y+1, state.stacks[o2.coord.x].length, state, o1);
        }else if(!Helper.isFloor(o2) && o1.loc.rel == "under"){
            tmp = Helper.getObjsInStack(o2.coord.x, 0, o2.coord.y, state, o1);
        }else if(!Helper.isFloor(o2) && o1.loc.rel == "beside"){
            if(o2.coord.x > 0){
               tmp = Helper.getObjsInStack(o2.coord.x-1, 0, state.stacks[o2.coord.x-1].length, state, o1);
            }
            
            if(o2.coord.x < state.stacks.length-1){
               tmp =  tmp.concat(Helper.getObjsInStack(o2.coord.x+1, 0, state.stacks[o2.coord.x+1].length, state, o1));
            }
        }else if(!Helper.isFloor(o2) && o1.loc.rel == "leftof"){      
            for(var i = 0; i < o2.coord.x; i++){
               tmp = tmp.concat(Helper.getObjsInStack(i, 0, state.stacks[i].length, state, o1));
            }
        }else if(!Helper.isFloor(o2) && o1.loc.rel == "rightof"){
            for(var i = o2.coord.x+1; i < state.stacks.length; i++){
                tmp = tmp.concat(Helper.getObjsInStack(i, 0, state.stacks[i].length, state, o1));
            }
        }    
        
        return tmp;      
    }
    

}    


