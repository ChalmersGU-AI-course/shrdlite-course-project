///<reference path="World.ts"/>
///<reference path="Interpreter.d.ts"/>

declare module Planner {
	export interface Result extends Interpreter.Result {plan:string[];}

	export function plan(interpretations : Interpreter.Result[], currentState : WorldState) : Result[]
	export function planToString(res : Result) : string


	export class Error implements Error {
		name: string;
		toString(): string
		constructor(message? : string);
	}
}


