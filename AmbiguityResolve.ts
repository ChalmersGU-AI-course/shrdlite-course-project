

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
                    var uniqueAttributes = findUniqueAttributes(matching[i], matching, state);
                    errString = errString +" "+ printObject(object, false, uniqueAttributes);
                    if (i < matching.length-1){
                        errString = errString + " or the "
                    }
                }
                throw new Interpreter.Error(errString + "?");
            }
        return false;
    }

    interface UniqueAttributes {
        color : boolean;
        size : boolean;
    }

    // Returns the attributes that are unique for the supplied object obj
    function findUniqueAttributes(obj: string, matching : string[], state : WorldState) : UniqueAttributes {
        var attributes : UniqueAttributes = {color: true,
                                             size: true,
                                        };
        var object :ObjectDefinition = lookupLiteralArg(obj, state);
        for (var j=0; j < matching.length; ++j) {
            if (matching[j] === obj) {
                //the object won't be unique with regards to itself
                continue;
            }
            var second = lookupLiteralArg(matching[j], state);
            if (object.color === second.color) { 
                attributes.color = false;
            }

            if (object.size === second.size) {
                attributes.size = false;
            }
        }
        return attributes;
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
    function printObject(object: Parser.Object, isPlural : boolean = false, atr: UniqueAttributes = null) : string{
        var output = "";
        var sizeRequired = true;
        var colorRequired = true;
        if (atr) {
            sizeRequired = atr.size;
            colorRequired = !sizeRequired && atr.color;
        }
        if(!(sizeRequired || colorRequired)) {
            //no unique attribs, we need all
            sizeRequired = true;
            colorRequired = true;
        }

        if(object.size && sizeRequired){
            output = output + object.size +" ";
        }
        if(object.color && colorRequired){
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