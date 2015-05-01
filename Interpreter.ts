///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="Constrains.ts"/>

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

    function interpretCommand(cmd : Parser.Command, state : WorldState) : Literal[][] {
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        var fullDomain : collections.Set<string> = new collections.Set<string>();
        objs.forEach((obj) => {
            fullDomain.add(obj);
        });
        fullDomain.add('floor');
        var constrained : Constrains.Result<string> = Constrains.constrain<string>(fullDomain, cmd, state);

        if(constrained.what.size() == 0)
            return null;

        //cmd.ent.quant
        //cmd.loc.ent.quant

        var intprt : Literal[][] = [[]];
        constrained.what.forEach((ele) => {
            constrained.whereTo.domain.forEach((obj) => {
                otherConditions(obj,
                                intprt,
                                constrained.whereTo.constrains,
                                [{pol: true, rel: cmd.loc.rel, args: [ele, obj]}]);
                return true;
            });
            return true;
        });
        return intprt;
    }

    function otherConditions(ele:string,
                             intprt : Literal[][],
                             constrains : collections.LinkedList<Constrains.ConstrainNode<string>>,
                             finalGoal : Literal[]) {
        var n : number = 0;
        constrains.forEach((constrain) => {
            if(constrain.variables.size() > 0) {
                n++;
                constrain.variables.forEach((variable) => {
                    variable.domain.forEach((obj) => {
                        var oneIntprt : Literal[] = Array.prototype.concat.apply([], finalGoal);
                        oneIntprt.push({pol: true, rel: constrain.type, args: [ele, obj]});
                        otherConditions(obj,
                                 intprt,
                                 variable.constrains,
                                 oneIntprt)
                        return true;
                    })
                    return true;
                })
            }
            return true;
        });
        if(n == 0)
            intprt.push(finalGoal);
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

