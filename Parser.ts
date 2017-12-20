
import {WorldState} from "./World";
import {Command, ShrdliteResult} from "./Types";
import {ParserRules, ParserStart} from "./Grammar";
import * as nearley from "./lib/nearley";

/********************************************************************************
** Parser

This module parses a command given as a string by the user into a
list of possible parses, each of which contains an object of type 'Command'.

You don't have to edit this file.
********************************************************************************/

//////////////////////////////////////////////////////////////////////
// exported functions, classes and interfaces/types

/* The main parse function.
 *
 * @param input: A string with the input from the user.
 * @returns: A list of parse results, each containing an object of type 'Command'.
 *           If there's a parsing error, it returns a string with a description of the error.
 */

export function parse(input:string) : string | ShrdliteResult[] {
    var NearleyParser = (typeof window !== "undefined") ? window.nearley.Parser : nearley.Parser;
    // The grammar does not recognise uppercase, whitespace or punctuation,
    // so we make it lowercase and remove all whitespace and punctuation:
    var parsestr = input.toLowerCase().replace(/\W/g, "");
    try {
        var results : Command[] = new NearleyParser(ParserRules, ParserStart).feed(parsestr).results;
    } catch(err) {
        if ('offset' in err) {
            return `Parsing failed after ${err.offset} characters`;
        } else {
            throw err;
        }
    }
    if (!results.length) {
        return 'Parsing failed, incomplete input';
    }
    // We need to clone the Nearley parse result, because some parts can be shared with other parses
    return results.map((res) => new ShrdliteResult(input, res.clone()));
}


// Additional declaration to make the parser work both in Node.js and in the browser.

declare global {
    interface Window {
        nearley: {Parser: {new (rules: {[s:string]:any}, start: string) : nearley.Parser}}
    }
}


