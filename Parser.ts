///<reference path="World.ts"/>
///<reference path="lib/node.d.ts"/>

module Parser {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function parse(input:string) : Result[] {
        var nearleyParser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);
        var parsestr = input.toLowerCase().replace(/\W/g, "");
        try {
            var results : Command[] = nearleyParser.feed(parsestr).results;
        } catch(err) {
            if ('offset' in err) {
                throw new Error('Parsing failed after ' + err.offset + ' characters');
            } else {
                throw err;
            }
        }
        if (!results.length) {
            throw new Error('Parsing failed, incomplete input');
        }
        return results.map((res) => {
            // We need to clone the parse result, because parts of it is shared with other parses
            return {input: input, parse: clone(res)};
        });
    }

    export interface Result {
        input : string;
        parse : Command;
    }

    export interface Command {
        command : string;
        entity? : Entity;
        location? : Location;
    }

    export interface Entity {
        quantifier : string;
        object : Object;
    }

    export interface Location {
        relation : string;
        entity : Entity;
    }

    // The following should really be a union type, but TypeScript doesn't support that:
    export interface Object {
        object? : Object;
        location? : Location;
        // Here is the union type divisor
        size? : string;
        color? : string;
        form? : string;
    }

    export function stringify(result : Result) : string {
        return JSON.stringify(result.parse);
    }

    //////////////////////////////////////////////////////////////////////
    // Utilities

    function clone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }

}


//////////////////////////////////////////////////////////////////////
// TypeScript declarations for external JavaScript modules

declare module "grammar" {
    export var ParserRules : { [s:string]: any };
    export var ParserStart : string;
}


declare module "nearley" {
    export class Parser {
        constructor(rules: {[s:string]:any}, start: string);
        feed(sentence: string) : {
            results : Parser.Command[];
        }
    }
}


if (typeof require !== 'undefined') {
    // Node.JS way of importing external modules
    // In a browser, they must be included from the HTML file
    var nearley = require('./lib/nearley.js');
    var grammar = require('./grammar.js');
}


