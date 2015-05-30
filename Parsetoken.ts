///<reference path="Parser.ts"/>
///<reference path="Astar/collections.ts"/>


module Parsetoken {

    export interface DicToken {tokens : string[]; dic : collections.Dictionary<string,string>;}
    var globalDic  = new collections.Dictionary<string,string>();

    //convert Parser.Command into (Tokens,Dic) where
    //Tokens is the list of keyword from user
    //Dic is the key-value object store information about keyword and type of keyword in pair
    export function interpretToken (cmd : Parser.Command) : DicToken {

        var tokens : string[] = [];

        tokens.push(cmd.cmd);
        globalDic.setValue(cmd.cmd,"cmd");

        //case take||grasp||pickup entity === take ent
        //parse the result from cmd into new finite Array named tokens
        if(cmd.cmd == "take"){
            var currentEnt = cmd.ent;
            tokens.push(currentEnt.quant);
            globalDic.setValue(currentEnt.quant,"quant");

            if(currentEnt.obj != null){
                var objArrays = recursiveObject(currentEnt.obj);
                tokens = tokens.concat(objArrays);
            }
        }

        //case move||put||drop "it" loc === put loc
        //parse the result from cmd into new finite Array named tokens
        if(cmd.cmd == "put"){
            var currentLoc = cmd.loc;
            if(currentLoc != null){
                var objArrays = recursiveLocation(currentLoc);
                tokens = tokens.concat(objArrays);
            }

        }

        //case move||put||drop entity location === move ent loc
        //parse the result from cmd into new finite Array named tokens
        //separated by x to support ambiguous 
        if(cmd.cmd == "move"){
            var currentEnt = cmd.ent;
            var currentLoc = cmd.loc;
            tokens.push(currentEnt.quant);
            globalDic.setValue(currentEnt.quant,"quant");

            if(currentEnt.obj != null){
                var objArrays = recursiveObject(currentEnt.obj);
                tokens = tokens.concat(objArrays);
                tokens.push("(and move it)");
            }

            if(currentLoc != null){
                var objArrays = recursiveLocation(currentLoc);
                tokens = tokens.concat(objArrays);
            }
        }

        return {tokens:tokens, dic:globalDic};
    }

    //traverse through Object to get finite array
    function recursiveObject(currentObj : Parser.Object) : string[] {
        var temp : string[] = [];

        //case1 object
        if(currentObj.obj != null) {
            var objArrays = recursiveObject(currentObj.obj);
            temp = temp.concat(objArrays);
        }

        //case2 location
        if(currentObj.loc != null) {
            var objArrays = recursiveLocation(currentObj.loc);
            temp = temp.concat(objArrays);
        }

        //case3 size color form
        if(currentObj.size != null){
            temp.push(currentObj.size);
            globalDic.setValue(currentObj.size,"size");
        }
        
        if(currentObj.color != null){
            temp.push(currentObj.color);
            globalDic.setValue(currentObj.color,"color");

        }

        if(currentObj.form != null){
            temp.push(currentObj.form);
            globalDic.setValue(currentObj.form,"form");
        }

        return temp;

    }

    //traverse through Location to get finite array
    function recursiveLocation(currentLoc : Parser.Location) : string[] {
        var temp : string[] = [];

        if(currentLoc.rel != null){
            temp.push(currentLoc.rel);
            globalDic.setValue(currentLoc.rel,"rel");
        }

        if(currentLoc.ent != null){
            var newEnt = currentLoc.ent;
            temp.push(newEnt.quant);
            globalDic.setValue(newEnt.quant,"quant");
        
          if(newEnt.obj != null) {
                var objArrays = recursiveObject(newEnt.obj);
                temp = temp.concat(objArrays);
            }
        }

        return temp;
    }

}    