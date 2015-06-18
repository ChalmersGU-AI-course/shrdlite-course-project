///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="Constrains.ts"/>

// under was done as negation of ontop. bad results but good to try :)


module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
        parses.forEach((parseresult) => {
            var intprt : Result = <Result>parseresult;
            intprt.intp = interpretCommand(intprt.prs, currentState);
            if(intprt.intp != null)
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

    // get the goals to the limited domain using the constrain class
    function interpretCommand(cmd : Parser.Command, state : WorldState) : Literal[][] {
        // include the holded object in the stack under the arm
        if((state.holding != null) && (state.holding != '')) {
            state = clone(state);
            state.stacks[state.arm].push(state.holding);
        }
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        var fullDomain : collections.Set<string> = new collections.Set<string>();
        objs.forEach((obj) => { // defne the full domain of objects
            fullDomain.add(obj);
        });
        fullDomain.add('floor'); // include the floor as an object
        var constrained : Constrains.Result<string> = Constrains.constrain<string>(fullDomain, cmd, state);

        if(constrained.what.size() == 0) // no abject satisfies the restrictions
            return null;

        //cmd.ent.quant
        //cmd.loc.ent.quant

        var intprt : Literal[][] = [];

        if((cmd.cmd == 'take') && (constrained.whereTo == null)) {
            // take has no whereto
            constrained.what.forEach((ele) => {
                var finalGoal : Literal[] = [{pol: true, rel: cmd.cmd, args: [ele]}];
                intprt.push(finalGoal);
                return true;
            });
            return intprt;
        }

        var m_typ : string = cmd.loc.rel;
        if(m_typ == 'inside') // inside and ontop are the same thing
            m_typ = 'ontop';

        if((constrained.whereTo == null) || (constrained.whereTo.size() == 0))
            return null; // except for take, we do need to say whereto

        // create all the goals that satifies the user desires
        constrained.what.forEach((ele) => {
          constrained.whereTo.first().variable1.domain.forEach((v) => {
            var finalGoal : Literal[];
            if(m_typ == 'under')
                finalGoal = [{pol: true, rel: 'ontop', args: [v, ele]}];
            else
                finalGoal = [{pol: true, rel: m_typ, args: [ele, v]}];
            constrained.whereTo.forEach((arc) => {
              var typ : string = arc.constrain.type;
              if(typ == 'inside')
                 typ = 'ontop';
              if(arc.variable2 != null)
                  arc.variable2.domain.forEach((obj) => {
                      if(v != obj)
                        finalGoal.push({pol: true, rel: typ, args: [v, obj]});
                      return true;
                  });
              return true;
            });
            intprt.push(finalGoal);
            return true;
          });
          return true;
        });
        return intprt;
    }

    // utility function
    function clone<T>(obj: T): T {
        if (obj != null && typeof obj == "object") {
            var result : T = obj.constructor();
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result[key] = clone(obj[key]);
                }
            }
            return result;
        } else {
            return obj;
        }
    }
}

