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
                throw new Parser.Error(
                    'Parsing failed after ' + err.offset + ' characters', err.offset);
                // parsestr.slice(0, err.offset) + '<HERE>' + parsestr.slice(err.offset);
            } else {
                throw err;
            }
        }
        if (!results.length) {
            throw new Parser.Error('Incomplete input', parsestr.length);
        }
        return results.map((c) => {
            return {input: input, prs: clone(c)};
        });
    }


    export interface Result {input:string; prs:Command;}
    export interface Command {cmd:string; ent?:Entity; loc?:Location;}
    export interface Entity {quant:string; obj:Object;}
    export interface Location {rel:string; ent:Entity;}
    // The following should really be a union type, but TypeScript doesn't support that:
    export interface Object {obj?:Object; loc?:Location; 
                             size?:string; color?:string; form?:string;}

    export function objToString (obj : Object) : string {
        var description = "";
        if (obj.size) {
            description = description + obj.size + " ";
        }
        if (obj.color) {
            description = description + obj.color + " ";
        }
        if (obj.form) {
            description = description + obj.form;
        }
        return description;
    }

    export function parseToString(res : Result) : string {
        return JSON.stringify(res.prs);
    }


    export class Error implements Error {
        public name = "Parser.Error";
        constructor(public message? : string, public offset? : number) {}
        public toString() {return this.name + ": " + this.message}
    }

    //////////////////////////////////////////////////////////////////////
    // Utilities

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


