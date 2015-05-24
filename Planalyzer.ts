declare var _:any;

function PlanalyzeActions(plan: string[], world: WorldState): string[] {
	var result: string[] = [];
	var actionPlans = SplitToActionPlans(plan);
	var currentWorld = world;
	for (var i = 0; i < actionPlans.length; ++i) {
		var actionPlan = actionPlans[i];
		result.push(DescribeActionPlan(actionPlan, currentWorld));
		result = result.concat(actionPlan);
		currentWorld = ApplyPlanToWorld(actionPlan, currentWorld);
	}
	return result;
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
	actionPlans.push(currentGroup);
	return actionPlans;
}

function DescribeActionPlan(plan: string[], world: WorldState): string {
	var relevantObject = FindRelevantObject(plan, world);
	var actionDescription = DescribeAction(plan, world);
	var objectDescription = DescribeObject(relevantObject, world);
	return actionDescription + " the " + objectDescription;
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

function DescribeAction(plan: string[], world: WorldState): string {
	var pickUpIndex = plan.indexOf("p");
	var dropIndex = plan.indexOf("d");

	if (pickUpIndex >= 0 && dropIndex >= 0) {
		return "Moving";
	} else if (pickUpIndex >= 0) {
		return "Picking up";
	} else {
		return "Dropping";
	}
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
	return objects;
}