declare var _:any;

module Planalyzer {
	//Analyzes the input plan and inserts descriptions of the actions made
	export function planalyzeActions(plan: string[], world: WorldState, literals: Interpreter.Literal[][]): string[] {
		var result: string[] = [];
		var actionPlans = splitToActionPlans(plan);
		var currentWorld = world;
		var allLiterals = _.flatten(literals);
		var unsatisfiedLiterals = getUnsatisfiedLiterals(allLiterals, world);

		//Adds a description to each found action plan
		for (var i = 0; i < actionPlans.length; ++i) {
			var actionPlan = actionPlans[i];
			var nextWorld = applyPlanToWorld(actionPlan, currentWorld);
			var nextUnsatisfiedLiterals = getUnsatisfiedLiterals(unsatisfiedLiterals, nextWorld);
			var satisfiedLiterals = _.difference(unsatisfiedLiterals, nextUnsatisfiedLiterals);

			var description = describeActionPlan(actionPlan, currentWorld, satisfiedLiterals);
			result.push(description);
			result = result.concat(actionPlan);
			currentWorld = nextWorld;
			unsatisfiedLiterals = nextUnsatisfiedLiterals;
		}
		return result;
	}

	//Private functions...

	//Applies all actions in the plan on the world and returns the resulting world state
	function applyPlanToWorld(plan: string[], world: WorldState): WorldState {
		var newState = {
			stacks: copyStacks(world.stacks),
			holding: world.holding,
			arm: world.arm,
			objects: world.objects,
			examples: world.examples
		};

		for (var i = 0; i < plan.length; ++i) {
			var action = plan[i];
			switch (action) {
				case "d":
					newState.stacks[newState.arm].push(newState.holding);
					newState.holding = null;
					break;
				case "p":
					newState.holding = newState.stacks[newState.arm].pop();
					break;
				case "l":
					newState.arm -= 1;
					break;
				case "r":
					newState.arm += 1;
					break;
			}
		}

		return newState;
	}

	//Splits the plan into separate action groups. An action group is a sequence of actions between drops.
	function splitToActionPlans(plan: string[]): string[][] {
		var actionPlans: string[][] = [];
		var currentGroup: string[] = [];

		for (var i = 0; i < plan.length; ++i) {
			var item = plan[i];

			if (item === "p") {
				currentGroup.push(item);
			} else if (item === "d") {
				currentGroup.push(item);
				actionPlans.push(currentGroup);
				currentGroup = [];
			} else {
				currentGroup.push(item);
			}
		}
		if (currentGroup.length > 0) {
			actionPlans.push(currentGroup);
		}
		return actionPlans;
	}

	//Prints a description of the current action plan 
	function describeActionPlan(plan: string[], world: WorldState, satisfiedLiterals: Interpreter.Literal[]): string {
		var relevantObject = findRelevantObject(plan, world);
		var actionDescription = describeAction(plan, world, satisfiedLiterals);
		var objectDescription = describeObject(relevantObject, world);
		var relevantLiteral = findRelevantLiteral(relevantObject, satisfiedLiterals);
		var targetDescription = describeTarget(relevantLiteral, world);
		return actionDescription + " the " + objectDescription + targetDescription;
	}

	//Based on the action plan, tries to identify the interesting object.
	//If there is a pick up command, the object picked up is considered the most interesting,
	//otherwise the dropped object is used.
	function findRelevantObject(plan: string[], world: WorldState): string {
		var pickUpIndex = plan.indexOf("p");
		if (pickUpIndex >= 0) {
			var planUntilPickup = plan.slice(0, pickUpIndex);
			var newWorld = applyPlanToWorld(planUntilPickup, world);
			var currentStack = newWorld.stacks[newWorld.arm];
			return currentStack[currentStack.length - 1];
		}
		var dropIndex = plan.indexOf("d");
		if (dropIndex >= 0) {
			return world.holding;
		}
		var newWorld = applyPlanToWorld(plan, world);
		var currentStack = newWorld.stacks[newWorld.arm];
		return currentStack[currentStack.length - 1];
	}

	//Based on a list of satisfied literals, finds a literal containing the relevant object
	function findRelevantLiteral(relevantObject: string, literals: Interpreter.Literal[]): Interpreter.Literal {
		for (var i = 0; i < literals.length; ++i) {
			var literal = literals[i];
			if (literal.args[0] == relevantObject) {
				return literal;
			}
		}
		return null;
	}

	//Creates a sparse description of the specified object. The description is as brief as possible
	//(but will always say the objects shape for clarity), it prefers to describe objects by color
	//rather than size.
	function describeObject(objectId: string, world: WorldState): string {
		if (objectId === "floor") {
			return "floor";
		}

		var objectDefinition = world.objects[objectId];

		var objectsBySize = findInWorldByProperty("size", objectDefinition.size, world);
		var objectsByColor = findInWorldByProperty("color", objectDefinition.color, world);
		var objectsByForm = findInWorldByProperty("form", objectDefinition.form, world);

		var bySizeAndForm = _.intersection(objectsByForm, objectsBySize);
		var byColorAndForm = _.intersection(objectsByForm, objectsByColor);

		if (objectsByForm.length == 1) {
			return objectDefinition.form;
		} else if (byColorAndForm.length == 1) {
			return objectDefinition.color + " " + objectDefinition.form;
		} else if (bySizeAndForm.length == 1) {
			return objectDefinition.size + " " + objectDefinition.form;
		} else {
			return objectDefinition.size + " " + objectDefinition.color + " " + objectDefinition.form;
		}
	}

	//Describes what kind of action is being performed (move, pick up, drop)
	function describeAction(plan: string[], world: WorldState, satisfiedLiterals: Interpreter.Literal[]): string {
		var pickUpIndex = plan.indexOf("p");
		var dropIndex = plan.indexOf("d");

		if (pickUpIndex >= 0 && dropIndex >= 0) {
			if (satisfiedLiterals.length == 0) {
				return "Moving away";
			} else {
				return "Moving";
			}
		} else if (pickUpIndex >= 0) {
			return "Picking up";
		} else {
			return "Dropping";
		}
	}

	//Decribes the target of the action based on the literal and also the relation of the relvant object
	//to the target.
	function describeTarget(literal: Interpreter.Literal, world: WorldState): string {
		if (!literal || literal.args.length <= 1) {
			return "";
		}
		return " " + describeRel(literal.rel) + " the " + describeObject(literal.args[1], world);
	}

	//A simple translation of the relation for prettier printing.
	function describeRel(rel: string): string {
		switch (rel) {
			case "ontop":
				return "on top of";
			case "rightof":
				return "to the right of";
			case "leftof":
				return "to the left of"
		}
		return rel;
	}

	//Searches for objects in the world where their property is the value
	function findInWorldByProperty(property: string, value: string, world: WorldState): string[] {
		var objects: string[] = [];
		for (var i = 0; i < world.stacks.length; ++i) {
			var stack = world.stacks[i];
			for (var j = 0; j < stack.length; ++j) {
				var object = stack[j];
				var definition = world.objects[object];
				if (definition[property] === value) {
					objects.push(object);
				}
			}
		}
		if (world.holding) {
			var definition = world.objects[world.holding];
			if (definition[property] === value) {
				objects.push(world.holding);
			}
		}
		return objects;
	}
}