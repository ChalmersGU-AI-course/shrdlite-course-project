

module AmbiguityResolve {
	export function getClarifications(parses: Parser.Result[]): string {
        var allClarifications = "";
        var i = 1;
        parses.forEach((parseresult) => {
            allClarifications = allClarifications + " Interpertation " + i +": "+ clarifyParseTree(parseresult)+"\n";
            i++
        });
        return allClarifications;
	}

    //Checks that if the "the" quantifier is used, it only matches to one object and in that case returns false
    export function checkTheTheAmbiguity(ent :Parser.Entity, matching : string[], state : WorldState) : boolean {
        if(ent.quant === "the" && matching.length>1){
                var errString = "Object not unique, did you mean the ";
                for(var i = 0; i < matching.length; ++i){
                    var object = lookupLiteralArg(matching[i], state);
                    errString = errString +" "+ printObject(object);
                    if (i < matching.length-1){
                        errString = errString + " or the "
                    }
                }
                throw new Interpreter.Error(errString + "?");
            }
        return false;
    }

    //Ask for clarifications of the parse tree
    function clarifyParseTree(parse : Parser.Result) : string{
        //If entety and target location is defined?
        return parse.prs.cmd +" "+ parse.prs.ent.quant +" "+ 
               clarifyRecursive(parse.prs.ent.obj, parse.prs.ent.quant) +" TO " + parse.prs.loc.ent.quant +" "+ clarifyRecursive(parse.prs.loc.ent.obj, parse.prs.loc.ent.quant); //Add destination /other half of tree? this should be recirsive?
    }

    function clarifyRecursive(object: Parser.Object, quant : string) : string{
        var output = "";
        var isPlural = false;
        if (quant === "all") {
            var isPlural = true;
        }
        //if object is relative to something
        if(object.loc){
            var is = "is ";
            if (isPlural) {
                var is = "are "; 
            }
            return printObject(object.obj, isPlural) + " THAT " + is + object.loc.rel + " " +
                   object.loc.ent.quant + " " + clarifyRecursive(object.loc.ent.obj, object.loc.ent.quant);
            //add object "that is " clarifyRecursive(location.entity.object)
        }else if(object.obj){
            return clarifyRecursive(object, quant);
        }else if(object){
            return printObject(object, isPlural);
        }
    }
    
    //Returns a nice formated string of an object
    function printObject(object: Parser.Object, isPlural : boolean = false) : string{
        var output = "";
        if(object.size){
            output = output + object.size +" ";
        }
        if(object.color){
            output = output + object.color +" ";
        }
        if(object.form) {
            var form = object.form;
            if (form === "anyform" ) {
                form = "object";
            }
            if (isPlural) {
                form = form + "s";
            }
            output = output + form +" ";
        }
        if(object.loc){
            output = output + object.loc.rel +" ";
        }
        return output;
    }

    function lookupLiteralArg(arg : string, state : WorldState) : ObjectDefinition {
        if (arg === "floor") {
            return null;
        }
        return state.objects[arg];
    }
}