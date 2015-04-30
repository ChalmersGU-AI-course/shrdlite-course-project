///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

module Interpreter {

    interface Coord{
        x: number; //x coordinate
        y: number; //y coordinate
    }
    
    interface ObjWCoord extends Parser.Object{
        coord?: Coord; //optional if an object is held
        id: string; //Identifier
    }
    
    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types
    
    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var interpretations : Result[][] = [[]];
        var i = 0;
        
        parses.forEach((parseresult) => {
            var intprt : Result = <Result>parseresult;
            intprt.intp = interpretCommand(intprt.prs, currentState);
            if(intprt.intp != null){
                interpretations[i].push(intprt);
            }
            i++;
        });
        if (interpretations.length == 1) {
            return interpretations[0];
        } else if(interpretations.length == 0){
            throw new Interpreter.Error("Found no interpretation");
        } else{
            throw new Interpreter.Error("More than one parse gave an interpretation: ambiguity");    
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
        var tmp : ObjWCoord[];
        var tmp2: ObjWCoord[];
        var goalsAsMap = new collections.Dictionary<string, string[]>();
        var intprt : Literal[][];
        
        /*
            1st part: Identifying the object to move
        */
        
        //"move it" cmd
        if(cmd.ent.obj == null){
            var obj: Parser.Object = state.objects[state.holding];
            var o: ObjWCoord = {id: state.holding, size: obj.size, form: obj.form, color: obj.color};
            tmp.push(o);
        //other cmd
        }else{
            var myObj: Parser.Object = cmd.ent.obj.obj == null ? cmd.ent.obj : cmd.ent.obj.obj;
            if(isFloor(myObj)){
                //Can't move the floor
                throw new Interpreter.Error("Can't move the floor");
            }
            
            tmp = recursionCheck(cmd.ent.obj, state);
            if(tmp.length == 0){
                //No such object
                return null;    
            }
            tmp = removeDuplicate(tmp);
            
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
            
            intprt = pddlTransformation(goalsAsMap, rel, true);
        //Other cmd
        }else{
            var rel: string = cmd.loc.rel;
            var myObj: Parser.Object = cmd.loc.ent.obj.obj == null ? cmd.loc.ent.obj : cmd.loc.ent.obj.obj;
            
            tmp2 = recursionCheck(cmd.loc.ent.obj, state);
            if(tmp2.length == 0){
                //No such object
                return null;    
            }
            tmp2 = removeDuplicate(tmp2);
            
            
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
    
    function pddlTransformation(map: collections.Dictionary<string, string[]>, rel: string, hold: boolean): Literal[][]{
        var lits: Literal[][] =[[]];
        var lit: Literal;
        var i: number = 0;
        
        if(hold){
            map.forEach((key: string, values: string[]) => {
                lit = {pol: true, rel: rel, args: [key]};
                lits[i].push(lit);
                i++
            });
        }else{
            map.forEach((key: string, values: string[]) => {
                for(var v in values){
                    lit = {pol: true, rel: rel, args: [key, v]};
                    lits[i].push(lit);    
                    i++;
                }    
            });
        }
           
        return lits;
    }
        
    
    //------------CHECK LAWS AGAIN---------------------//
    function checkPhysicalLaws(o:ObjWCoord, objs:ObjWCoord[], rel:string):string[]{
        var valid: string[] = [];
        
        for(var i = 0; i < objs.length; i++){
            var curr = objs[i];
            if(!(floorRules(curr, rel) ||
                smallSupportingBig(o, curr, rel) ||
                boxRules(o, curr, rel) ||
                ballRules(o, curr, rel))){
                
                valid.push(curr.id);                
            }
        }
        
        return valid;
    }
    
    function floorRules(o:ObjWCoord, rel:string): boolean{
        var bol = false;
        
        if(o.form == "floor" &&
           !(rel == "ontop" || rel == "above")){
            bol = true;
            
        }
        
        return bol;    
    }
    
    function boxRules(o:ObjWCoord, obj:ObjWCoord, rel:string): boolean{
        var bol = false;
        
        if(obj.form == "box" && rel == "ontop"){
            bol = true;
        }else if(obj.form == "box" && rel == "inside" && 
                 (o.form == "pyramid" || o.form == "planck" || o.form == "box") &&
                  obj.size == o.size  ){
            bol = true;
            
        }else if(o.form == "box" && rel == "ontop" &&
                ((obj.size == "small" && obj.form == "brick") || (obj.form == "pyramid"))){
            bol = true;
        }else if(rel == "inside" && obj.form != "box"){
            bol = true;    
        }
        
        return bol;
    }
    
    function ballRules(o:ObjWCoord, obj:ObjWCoord, rel:string): boolean{
        var bol = false;
            
        if(o.form == "ball" && obj.form == "ball"){
            if(!(rel == "beside" || rel == "rightof" || rel == "leftof")){
                bol = true;    
            }
        }else if(o.form == "ball"){
            if(rel == "under"){
                bol = true;    
            }else if(!((rel == "inside" && obj.form == "box" )||(rel == "ontop" && rel == "floor" ))){    
                bol = true;
            }
        }else if(obj.form == "ball"){
            if(rel == "ontop" || rel == "inside" || rel == "above"){
                bol = true;    
            }else if(rel == "under" && o.form != "box"){
                bol = true;
            }
        }
        
        return bol;
    }
    
    function smallSupportingBig(o:ObjWCoord, obj:ObjWCoord, rel:string): boolean{
        var bol = false;
        if((rel == "ontop" || rel == "above") && 
           (o.size == "large" && obj.size == "small")){
            bol = true
        }else if(rel == "under" && 
                (obj.size == "large" && o.size == "small")){
            bol = true;
        }
        return bol;
    }
    
    function recursionCheck(o1: Parser.Object, state: WorldState): ObjWCoord[]{
        var owc: ObjWCoord[] = [];    
        
        if(o1.obj != null){
            if(!isFloor(o1)){
                owc = recursionCheck(o1.loc.ent.obj, state);
                var owcRelated: ObjWCoord[] = [];
               
                for(var i = 0; i < owc.length; i++){
                    owcRelated.concat(getObjsWithSpatialRelation(o1, owc[i], state), owcRelated);
                }
                
                return owcRelated; 
            }else{
                throw new Interpreter.Error("Floor can't be related this way");    
            }
        }else{
            var ids: string[] = findIDs(o1, state);   
            
            for(var i = 0; i < ids.length; i++){ 
                var obj: Parser.Object = state.stacks[ids[i]];
                var o: ObjWCoord = {id: ids[i], size: obj.size, form: obj.form, color: obj.color};
                if(ids[i] != state.holding){
                    o.coord = findCoord(ids[i], state);
                }
                owc.push(o);
            }
   
            return owc;
        }
    }
    
    function findIDs(obj:Parser.Object, state:WorldState): string[]{
        var objectIDs: string[] = [];
        if(comparator(state.objects[state.holding], obj)){
            objectIDs.push(i);       
        }
        for(var i in state.objects){
            var o = state.objects[i];
            if(comparator(o, obj)){
               objectIDs.push(i);       
            }   
        }
        return objectIDs;
    }
    
    function getId(pos:Coord, state:WorldState): string{
        return state.stacks[pos.x][pos.y];    
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
    
    function getObjAtCoord(pos:Coord, state:WorldState): Parser.Object{
        if(pos.y == -1){
            return {"size":null,"color":null,"form":"floor"};
        }else if(pos.x >= state.stacks.length || pos.x < 0 || pos.y >= state.stacks[pos.x].length || pos.y < -1){
            //Out of bounds
            throw new Interpreter.Error("getObjAtCoord out of bounds");
        }else{
            var id :string = state.stacks[pos.x][pos.y];
            return state.objects[id];
        }
    }
    

    function getObjsWithSpatialRelation(o1: Parser.Object, o2:ObjWCoord, state:WorldState): ObjWCoord[]{
        var tmp: ObjWCoord[] = [];
        
        if((o1.loc.rel == "inside" && o2.form == "box") ||(o1.loc.rel == "ontop" && o2.form != "box")){
            tmp = getObjsInStack(o2.coord.x, o2.coord.y+1, o2.coord.y+2, state, o1);
        }else if(o1.loc.rel == "above"){
            tmp = getObjsInStack(o2.coord.x, o2.coord.y+1, state.stacks[o2.coord.x].length, state, o1);
        }else if(!isFloor(o2) && o1.loc.rel == "under"){
            tmp = getObjsInStack(o2.coord.x, 0, o2.coord.y, state, o1);
        }else if(!isFloor(o2) && o1.loc.rel == "beside"){
            if(o2.coord.x > 0){
               tmp = getObjsInStack(o2.coord.x-1, 0, state.stacks[o2.coord.x-1].length, state, o1);
            }
            
            if(o2.coord.x < state.stacks.length-1){
               tmp.concat(getObjsInStack(o2.coord.x+1, 0, state.stacks[o2.coord.x+1].length, state, o1), tmp);
            }
        }else if(!isFloor(o2) && o1.loc.rel == "leftof"){      
            for(var i = 0; i < o2.coord.x; i++){
                tmp = getObjsInStack(i, 0, state.stacks[i].length, state, o1);
            }
        }else if(!isFloor(o2) && o1.loc.rel == "rightof"){
            for(var i = o2.coord.x+1; i < state.stacks.length; i++){
                tmp = getObjsInStack(i, 0, state.stacks[i].length, state, o1);
            }
        }    
        
        return tmp;      
    }
    
    function getObjsInStack(x:number, from:number, to:number, state:WorldState, obj:Parser.Object): ObjWCoord[]{
        var owc: ObjWCoord[] = [];
        
        if(x < 0 || x >= state.stacks.length || from >= to || to <= -1 || to >= state.stacks[x].length ){
            throw new Interpreter.Error("getObjsInStack out of bound");
        }
        
        for(var i = from; i < to; i++){
            var pos: Coord = {x: x, y: i};
            var relObj: Parser.Object = getObjAtCoord(pos, state);  
            
            if(comparator(relObj, obj)){
                var o: ObjWCoord = {size: relObj.size, color: relObj.color, form: relObj.form, coord:pos, id:getId(pos, state)};
                owc.push(o);
            }
        }
        
        return owc;
    }
    
    function comparator(relObj: Parser.Object, obj: Parser.Object): boolean{
        return ((relObj.size == obj.size || obj.size == null) &&
                        (relObj.form == obj.form || obj.form == null) &&
                        (relObj.color == obj.color || obj.color == null));    
    }
    
    function isFloor(obj:Parser.Object): boolean{
        return obj.form == "floor";
    }
    
    function removeDuplicate(array: ObjWCoord[]): ObjWCoord[]{
        var s:string;
        for(var i = 0; i < array.length; i++){
            s = array[i].id;
            for(var j = i+1; j < array.length; j++){
                if(array[j].id == s){
                    array.splice(j, 1);
                    j--;    
                }    
            }
        }
        return array;
    }
}    


