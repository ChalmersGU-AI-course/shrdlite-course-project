//Returns a function that validates if the current state is a goal state based on the literals
function getGoalFunc(relTargets: Interpreter.Literal[][]) {
    return function IsWorldGoal(world: WorldNode) : boolean {
        for (var i=0; i < relTargets.length; ++i) {
            var relTarget : Interpreter.Literal[] = relTargets[i]
            var isMatch : boolean = true;
            for (var j=0; j< relTarget.length; ++j) {
                if (!stateSatisfiesLiteral(world.State, relTarget[j])) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                return true;
            }

        }
        return false;
    }
}

//Returns a heuristic function for the specified literals. This heuristic is using
//the sum of a list of sub-heuristics (which should all be summable with the heuristic still being admissable).
function getHeuristicFunction(targetLiteral: Interpreter.Literal[][]) {
    var heuristicSubFunctions = [numBlockingObjectsHeuristic, distanceHeuristic];

    return function(fromWorld: WorldNode, world: WorldNode): number {
        var heuristics = targetLiteral.map(function(literal) {
            var subHeuristics = heuristicSubFunctions.map(function(f) {
                return f(literal, world);
            });
            return sum(subHeuristics);
        });
        return min(heuristics);
    }
}

// A heuristic that calculates the total number of objects blocking the objects we are interested in
// in the world.
function numBlockingObjectsHeuristic(target: Interpreter.Literal[], world: WorldNode): number {
    var blockingObjects = {};
    var numBlocking = 0;

    var unsatisfied: Interpreter.Literal[] = target.filter(function(literal) {
        return !stateSatisfiesLiteral(world.State, literal);
    });

    var relevantObjects: string[] = getAllArgs(unsatisfied);
    for (var i = 0; i < relevantObjects.length; ++i) {
        var blocking = getBlockingObjects(relevantObjects[i], world.State);
        for (var j = 0; j < blocking.length; ++j) {
            if (!blockingObjects[blocking[j]]) {
                blockingObjects[blocking[j]] = true;
                numBlocking++;
            }
        }
    }

    return numBlocking;
}

//Returns all args that are "ontop"
function getAllArgs(target: Interpreter.Literal[]): string[] {
    var allArgs: string[] = [];
    for (var i = 0; i < target.length; ++i) {
        var literal = target[i];
        for (var j = 0; j < literal.args.length; ++j) {
            if (literal.rel == "ontop") {
                allArgs.push(literal.args[i]);
            }
        }
    }
    return allArgs;
}

//Calculates the minimum distance needed for each of the literals, and then returns the largest of these distances.
function distanceHeuristic(target: Interpreter.Literal[], world: WorldNode): number {
    var distances = [0];

    for (var i = 0; i < target.length; ++i) {
        var literal = target[i];
        if (stateSatisfiesLiteral(world.State, literal)) {
            continue;
        }

        //Get the distance to each arg in the literal
        var argDistances = literal.args.map(function(arg) {
            var position = getObjectColumn(arg, world.State);
            if (position !== null) {
                return Math.abs(position - world.State.arm);
            }
            return 0;
        });

        var distance = min(argDistances);

        if (literal.rel == "ontop" || literal.rel == "inside") {
            for (var j = 1; j < literal.args.length; ++j) {
                var firstPos = getObjectColumn(literal.args[j - 1], world.State);
                var secondPos = getObjectColumn(literal.args[j], world.State);
                if (firstPos !== null && secondPos !== null) {
                    distance += Math.abs(firstPos - secondPos);
                }
            }
        }

        distances.push(distance);
    }

    return max(distances);
}

//Sums the numbers in the array
function sum(list: number[]): number {
    var total = 0;
    for (var i = 0; i < list.length; ++i) {
        total += list[i];
    }
    return total;
}

//Returns the minimum number in the array
function min(list: number[]): number {
    var min = list[0];

    for (var i = 1; i < list.length; ++i) {
        if (list[i] < min) {
            min = list[i];
        }
    }
    return min;
}

//Returns the largest number in the array
function max(list: number[]): number {
    var max = list[0];
    for (var i = 1; i < list.length; ++i) {
        if (list[i] > max) {
            max = list[i];
        }
    }
    return max;
}
