///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="AStar.ts"/>

module Planner {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretations : Interpreter.Result[], currentState : WorldState) : Result[] {
        var plans : Result[] = [];
        interpretations.forEach((intprt) => {
            var plan : Result = <Result>intprt;
            plan.plan = planInterpretation(plan.intp, currentState);
            plans.push(plan);
        });
        if (plans.length) {
            return plans;
        } else {
            throw new Planner.Error("Found no plans");
        }
    }


    export interface Result extends Interpreter.Result {plan:string[];}


    export function planToString(res : Result) : string {
        return res.plan.join(", ");
    }


    export class Error implements Error {
        public name = "Planner.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }


    //////////////////////////////////////////////////////////////////////
    // private functions


	// state changing functions
	function moveRight(world: WorldState) : WorldState
	{
		return {stacks:world.stacks,holding:world.holding, arm:world.arm+1,objects:world.objects,examples:world.examples};
	}
	function moveLeft(world: WorldState) : WorldState
	{
		return {stacks:world.stacks,holding:world.holding, arm:world.arm-1,objects:world.objects,examples:world.examples};
	}
	function pickup(world:WorldState) : WorldState
	{
		var arr : string[][] = world.stacks.slice();
		for (var i = 0 ; i < world.stacks.length; i++)
		{
			arr[i] = world.stacks[i].slice();
		}
		var hold = arr[world.arm].pop();
		
		return {stacks:arr,holding:hold,arm:world.arm,objects:world.objects,examples:world.examples};
	}
	function putdown(world:WorldState) : WorldState
	{
		var arr = world.stacks.slice();
		for (var i = 0 ; i < world.stacks.length; i++)
		{
			arr[i] = world.stacks[i].slice();
		}
		arr[world.arm].push(world.holding);
		
		return {stacks:arr, holding:"",arm:world.arm,objects:world.objects,examples:world.examples};
	}
	
	function worldItteration(world: WorldState) : [WorldState]
	{
		if(world.arm == 0)
		{
			if(world.holding != null)
			{
				return [moveRight(world),putdown(world)]
			}
			else
			{
				return [moveRight(world),pickup(world)]
			}
		}
		if(world.arm == world.stacks.length-1)
		{
			if(world.holding != null)
			{
				return [moveLeft(world),putdown(world)]
			}
			else
			{
				return [moveLeft(world),pickup(world)]
			}
		}
		if (world.holding != null)
		{
			return [moveRight(world),moveLeft(world),putdown(world)]
		}
		else
		{
			return [moveRight(world),moveLeft(world),pickup(world)]
		}
		
	}
	
	
    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
        // This function returns a dummy plan involving a random stack
        		
		console.log(worldItteration(state), state);
		do {
            var pickstack = getRandomInt(state.stacks.length);
        } while (state.stacks[pickstack].length == 0);
        var plan : string[] = [];

        // First move the arm to the leftmost nonempty stack
        if (pickstack < state.arm) {
            plan.push("Moving left");
            for (var i = state.arm; i > pickstack; i--) {
                plan.push("l");
            }
        } else if (pickstack > state.arm) {
            plan.push("Moving right");
            for (var i = state.arm; i < pickstack; i++) {
                plan.push("r");
            }
        }

        // Then pick up the object
        var obj = state.stacks[pickstack][state.stacks[pickstack].length-1];
        plan.push("Picking up the " + state.objects[obj].form,
                  "p");

        if (pickstack < state.stacks.length-1) {
            // Then move to the rightmost stack
            plan.push("Moving as far right as possible");
            for (var i = pickstack; i < state.stacks.length-1; i++) {
                plan.push("r");
            }

            // Then move back
            plan.push("Moving back");
            for (var i = state.stacks.length-1; i > pickstack; i--) {
                plan.push("l");
            }
        }

        // Finally put it down again
        plan.push("Dropping the " + state.objects[obj].form,
                  "d");

        return plan;
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
