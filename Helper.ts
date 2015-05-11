module Helper {
    /**
    * Return objects in the world that are at in the stack number x and that have their y coordinates in [from, to[
    */
    export function getObjsInStack(x:number, from:number, to:number, state:WorldState, obj:Parser.Object): ObjWCoord[]{
        var owc: ObjWCoord[] = [];
        
        if(!(x < 0 || x >= state.stacks.length || from >= to || to <= -1 || to > state.stacks[x].length)){
            for(var i = from; i < to; i++){
                var pos: Coord = {x: x, y: i};
                var relObj: ObjectDefinition = getObjAtCoord(pos, state);  
                
                if(comparator(relObj, obj)){
                    var o: ObjWCoord = {size: relObj.size, color: relObj.color, form: relObj.form, coord: pos, id: state.stacks[pos.x][pos.y]};
                    owc.push(o);
                }
            }
        }
        return owc;
    }
    
    /**
    * Compare if two objects matches
    */
    export function comparator(relObj: ObjectDefinition, obj: Parser.Object): boolean{
        var o = obj.obj == null ? obj : obj.obj;
        return ((relObj.size == o.size || o.size == null) &&
                        (relObj.form == o.form || o.form == "anyform") &&
                        (relObj.color == o.color || o.color == null));    
    }
    
    /**
    * Find out if an object is the floor
    */
    export function isFloor(obj:Parser.Object): boolean{
        return obj.form == "floor";
    }
    
    /**
    * Remove duplicates in an array
    */
    export function removeDuplicate(array: ObjWCoord[]): ObjWCoord[]{
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
    
    /**
    * return id of objects that correspond to the description
    */
    export function findIDs(obj:Parser.Object, state:WorldState): string[]{
        var objectIDs: string[] = [];
        
        if(state.holding != null && comparator(state.objects[state.holding], obj)){
            objectIDs.push(state.holding);       
        }
        
        for(var i = 0; i < state.stacks.length; i++){
            for(var j = 0; j < state.stacks[i].length; j++){
                var pos: Coord = {x: i, y: j};
                var o: ObjectDefinition = getObjAtCoord(pos, state);
                if(comparator(o, obj)){
                   objectIDs.push(state.stacks[i][j]);       
                }   
            }
        }
        return objectIDs;
    }

    /**
    * return the coordinates of an object with such id
    */
    export function findCoord(id:string, state:WorldState): Coord{
        for(var x = 0; x < state.stacks.length; x++){
            for(var y = 0; y < state.stacks[x].length; y++){
                if(state.stacks[x][y] == id){
                    return {x:x, y:y};
                }
            }
        }
        throw new Error("No such id in stacks");
    }
    
    /**
    * return the object that has those coordinates
    */
    export function getObjAtCoord(pos:Coord, state:WorldState): ObjectDefinition{
        if(pos.y == -1){
            return {"size":null,"color":null, form:"floor"};
        }else if(pos.x >= state.stacks.length || pos.x < 0 || pos.y >= state.stacks[pos.x].length || pos.y < -1){
            //Out of bounds
            throw new Error("getObjAtCoord out of bounds");
        }else{
            var id :string = state.stacks[pos.x][pos.y];
            return state.objects[id];
        }
    }

}