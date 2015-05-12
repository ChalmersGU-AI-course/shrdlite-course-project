///<reference path="World.ts"/>

module Rules{    
     /**
      * Checks the rules that relate to the floor
      */
     export function breakFloorRules(o:ObjectDefinition, obj:ObjectDefinition, rel:string): boolean{
        var bol = false;
        
        if(o.form == "floor" ||
           (obj.form == "floor" && !(rel == "ontop" || rel == "above"))){
            bol = true;
            
        }

        return bol;    
    }
    
    /**
     * Checks the rules that relate to boxes
     */
    export function breakBoxRules(o:ObjectDefinition, obj:ObjectDefinition, rel:string): boolean{
        var bol = false;
        
        if(obj.form == "box" && rel == "ontop"){
            bol = true;
        }else if(obj.form == "box" && rel == "inside" && obj.size == o.size && 
                 (o.form == "pyramid" || o.form == "plank" || o.form == "box")){
            bol = true;
            
        }else if(o.form == "box" && rel == "ontop" &&
                ((obj.size == "small" && obj.form == "brick") || (obj.form == "pyramid"))){
            bol = true;
        }else if(rel == "inside" && obj.form != "box"){
            bol = true;    
        }
        
        return bol;
    }
    
    /**
     * Checks the rules that relate to balls
     */
    export function breakBallRules(o:ObjectDefinition, obj:ObjectDefinition, rel:string): boolean{
        var bol = false;
            
        if(o.form == "ball" && obj.form == "ball"){
            if(!(rel == "beside" || rel == "rightof" || rel == "leftof")){
                bol = true;    
            }
        }else if(o.form == "ball"){
            if(rel == "under"){
                bol = true;    
            }else if(!(rel == "leftof" || rel == "rightof" ||rel == "beside" || 
                       (rel == "inside" && obj.form == "box" ) || 
                       (rel == "ontop" && obj.form == "floor" ))){    
                bol = true;
            }
        }else if(obj.form == "ball"){
            if(rel == "ontop" || rel == "inside" || rel == "above"){
                bol = true;    
            }
        }
        
        return bol;
    }
    
    /**
     * Checks the rules that relate to the size of objects
     */
    export function breakSmallSupportingBig(o:ObjectDefinition, obj:ObjectDefinition, rel:string): boolean{
        var bol = false;
        if((rel == "ontop" || rel == "above" || rel == "inside") && 
           (o.size == "large" && obj.size == "small")){
            bol = true
        }else if(rel == "under" && 
                (obj.size == "large" && o.size == "small")){
            bol = true;
        }

        return bol;
    }
    
    /**
     * Union of all rules
     */
    export function breakRules(o:ObjectDefinition, obj:ObjectDefinition, rel:string){
        return (Rules.breakFloorRules(o, obj, rel) ||
                Rules.breakSmallSupportingBig(o, obj, rel) ||
                Rules.breakBoxRules(o, obj, rel) ||
                Rules.breakBallRules(o, obj, rel));    
    }

}
