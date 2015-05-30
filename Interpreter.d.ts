///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

declare module Interpreter {
	export interface Result extends Parser.Result {intp:Literal[][];}
	export interface Literal {pol:boolean; rel:string; args:string[];}

	export function interpret (parses : Parser.Result[], currentState : WorldState) : Result[]
	export function interpretationToString(res : Result) : string
	export function literalToString(lit : Literal) : string

	export class Error implements Error {
		name: string;
		toString(): string
		constructor(message? : string);
	}
}

