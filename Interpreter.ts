///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var errors : Error[] = [];
        var interpretations : Result[] = [];
        parses.forEach((parseresult) => {
            try {
                var result : Result = <Result>parseresult;
                result.interpretation = interpretCommand(result.parse, currentState);
                interpretations.push(result);
            } catch(err) {
                errors.push(err);
            }
        });
        if (interpretations.length) {
            return interpretations;
        } else {
            // only throw the first error found
            throw errors[0];
        }
    }

    export interface Result extends Parser.Result {
        interpretation : Literal[][];
    }

    export interface Literal {
        polarity : boolean;
        relation : string;
        args : string[];
    }

    export function stringify(result : Result) : string {
        return result.interpretation.map((literals) => {
            return literals.map((lit) => stringifyLiteral(lit)).join(" & ");
            // return literals.map(stringifyLiteral).join(" & ");
        }).join(" | ");
    }

    export function stringifyLiteral(lit : Literal) : string {
        return (lit.polarity ? "" : "-") + lit.relation + "(" + lit.args.join(",") + ")";
    }

    //////////////////////////////////////////////////////////////////////
    // private functions

    function interpretCommand(cmd : Parser.Command, state : WorldState) : Literal[][] {
        // This returns a dummy interpretation involving two random objects in the world
        var objects : string[] = Array.prototype.concat.apply([], state.stacks);
        var a : string = objects[Math.floor(Math.random() * objects.length)];
        var b : string = objects[Math.floor(Math.random() * objects.length)];
        var interpretation : Literal[][] = [[
            {polarity: true, relation: "ontop", args: [a, "floor"]},
            {polarity: true, relation: "holding", args: [b]}
        ]];
        return interpretation;
    }

}

