
// Interface definitions for worlds

interface ObjectDefinition {
    form: string; 
    size: string; 
    color: string;
}

interface WorldState {
    stacks: string[][];
    holding: string;
    arm: number;
    objects: { [s:string]: ObjectDefinition; };
    examples: string[];
}

interface World {
    currentState : WorldState;

    printWorld(callback? : () => void) : void;
    performPlan(plan: string[], callback? : () => void) : void;

    readUserInput(prompt : string, callback : (string) => void) : void;
    printSystemOutput(output : string, participant? : string) : void;
    printDebugInfo(info : string) : void;
    printError(error : string, message? : string) : void;
}
module WorldFunc {

    
    export function world2String(w : WorldState) : string
    {
        var out : string = "";
        
        for (var i in w.stacks) 
        {
            out= out.concat(i);
            for(var j in w.stacks[i])
            {
                out = out.concat(w.stacks[i][j]);
            }
        }
        
        out = out.concat(w.arm.toString());
            
        if(w.holding !== null)
            out = out.concat(w.holding);
        
        return out;
    }

    export function compareWorld(w1 :WorldState,w2 :WorldState ) : boolean
    {
        for (var i in w1.stacks) 
        {
            for(var j in w1.stacks[i])
            {
                if(w1.stacks[i][j] !== w2.stacks[i][j])
                {
                    return false;
                }
            }
        }
        
        if(w1.arm !== w2.arm)
            return false;
            
        if(w1.holding !== w2.holding)
            return false;

        return true;
    }
}