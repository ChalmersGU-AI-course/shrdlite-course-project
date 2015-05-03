///<reference path="World.ts"/>

module Rules{    
     export function floorRules(o:ObjWCoord, obj:ObjWCoord, rel:string): boolean{
        var bol = false;
        
        if(o.form == "floor" ||
           (obj.form == "floor" && !(rel == "ontop" || rel == "above"))){
            bol = true;
            
        }

        return bol;    
    }
    
    export function boxRules(o:ObjWCoord, obj:ObjWCoord, rel:string): boolean{
        var bol = false;
        
        if(obj.form == "box" && rel == "ontop"){
            bol = true;
        }else if(obj.form == "box" && rel == "inside" && 
                 ((o.form == "pyramid" || o.form == "planck" || o.form == "box") && obj.size == o.size )){
            bol = true;
            
        }else if(o.form == "box" && rel == "ontop" &&
                ((obj.size == "small" && obj.form == "brick") || (obj.form == "pyramid"))){
            bol = true;
        }else if(rel == "inside" && obj.form != "box"){
            bol = true;    
        }
        
        return bol;
    }
    
    export function ballRules(o:ObjWCoord, obj:ObjWCoord, rel:string): boolean{
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
    
    export function smallSupportingBig(o:ObjWCoord, obj:ObjWCoord, rel:string): boolean{
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

}