declare var _:any;

function PlanalyzeActions(plan: string[], world: WorldState, literals: Interpreter.Literal[][]): string[] {
	var result: string[] = [];
	var actionPlans = SplitToActionPlans(plan);
	var currentWorld = world;
	var allLiterals = _.flatten(literals);
	var unsatisfiedLiterals = GetUnsatisfiedLiterals(allLiterals, world);

	for (var i = 0; i < actionPlans.length; ++i) {
		var actionPlan = actionPlans[i];
		var nextWorld = ApplyPlanToWorld(actionPlan, currentWorld);
		var nextUnsatisfiedLiterals = GetUnsatisfiedLiterals(unsatisfiedLiterals, nextWorld);
		var satisfiedLiterals = _.difference(unsatisfiedLiterals, nextUnsatisfiedLiterals);

		var description = DescribeActionPlan(actionPlan, currentWorld, satisfiedLiterals);
		result.push(description);
		result = result.concat(actionPlan);
		currentWorld = nextWorld;
		unsatisfiedLiterals = nextUnsatisfiedLiterals;
	}
	return result;
}

function GetUnsatisfiedLiterals(literals: Interpreter.Literal[], world: WorldState): Interpreter.Literal[] {
	var unsatisfiedLiterals = literals.filter(function(l) {
		return !Planner.stateSatisfiesLiteral(world, l);
	});
	return unsatisfiedLiterals;
}

function ApplyPlanToWorld(plan: string[], world: WorldState): WorldState {
	var newState = {
		stacks: CopyStacks(world.stacks),
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

function CopyStacks(stacks: string[][]): string[][] {
	return stacks.slice().map(function(stack) { return stack.slice()});
}

function SplitToActionPlans(plan: string[]): string[][] {
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

function DescribeActionPlan(plan: string[], world: WorldState, satisfiedLiterals: Interpreter.Literal[]): string {
	var relevantObject = FindRelevantObject(plan, world);
	var actionDescription = DescribeAction(plan, world, satisfiedLiterals);
	var objectDescription = DescribeObject(relevantObject, world);
	var relevantLiteral = FindRelevantLiteral(relevantObject, satisfiedLiterals);
	var targetDescription = DescribeTarget(relevantLiteral, world);
	return actionDescription + " the " + objectDescription + targetDescription;
}

function FindRelevantObject(plan: string[], world: WorldState): string {
	var pickUpIndex = plan.indexOf("p");
	if (pickUpIndex >= 0) {
		var planUntilPickup = plan.slice(0, pickUpIndex);
		var newWorld = ApplyPlanToWorld(planUntilPickup, world);
		var currentStack = newWorld.stacks[newWorld.arm];
		return currentStack[currentStack.length - 1];
	}
	var dropIndex = plan.indexOf("d");
	if (dropIndex >= 0) {
		return world.holding;
	}
	var newWorld = ApplyPlanToWorld(plan, world);
	var currentStack = newWorld.stacks[newWorld.arm];
	return currentStack[currentStack.length - 1];
}

function FindRelevantLiteral(relevantObject: string, literals: Interpreter.Literal[]): Interpreter.Literal {
	for (var i = 0; i < literals.length; ++i) {
		var literal = literals[i];
		if (literal.args[0] == relevantObject) {
			return literal;
		}
	}
	return null;
}

function DescribeObject(objectId: string, world: WorldState): string {
	var objectDefinition = world.objects[objectId];

	var objectsBySize = FindInWorldByProperty("size", objectDefinition.size, world);
	var objectsByColor = FindInWorldByProperty("color", objectDefinition.color, world);
	var objectsByForm = FindInWorldByProperty("form", objectDefinition.form, world);

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

function DescribeAction(plan: string[], world: WorldState, satisfiedLiterals: Interpreter.Literal[]): string {
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

function DescribeTarget(literal: Interpreter.Literal, world: WorldState): string {
	if (!literal || literal.args.length <= 1) {
		return "";
	}
	return " to the " + DescribeObject(literal.args[1], world);
}

function FindInWorldByProperty(property: string, value: string, world: WorldState): string[] {
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