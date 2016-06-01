var Planner;
(function (Planner) {
    function plan(interpretations, currentState) {
        var errors = [];
        var plans = [];
        interpretations.forEach(function (interpretation) {
            try {
                var result = interpretation;
                result.plan = planInterpretation(result.interpretation, currentState);
                if (result.plan.length == 0) {
                    result.plan.push("That is already true!");
                }
                plans.push(result);
            }
            catch (err) {
                errors.push(err);
            }
        });
        if (plans.length) {
            return plans;
        }
        else {
            throw errors[0];
        }
    }
    Planner.plan = plan;
    function stringify(result) {
        return result.plan.join(", ");
    }
    Planner.stringify = stringify;
    function planInterpretation(interpretation, state) {
        var plan = [];
        var graph = { outgoingEdges: getWorldStateEdges, compareNodes: null };
        var start = state;
        function goal(testState) {
            for (var i = 0; i < interpretation.length; i++) {
                for (var j = 0; j < interpretation[i].length; j++) {
                    if (checkLiteral(interpretation[i][j], testState)) {
                        if (j === interpretation[i].length - 1) {
                            return true;
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            return false;
        }
        function heuristic(testState) {
            var h = [];
            for (var i_1 = 0; i_1 < interpretation.length; i_1++) {
                h[i_1] = [];
                for (var j = 0; j < interpretation[i_1].length; j++) {
                    h[i_1][j] = distanceCalc(testState, interpretation[i_1][j]);
                }
            }
            var hMaxOfRows = [];
            for (var i = 0; i < h.length; i++) {
                hMaxOfRows[i] = Math.max.apply(Math, h[i]);
            }
            return Math.min.apply(Math, hMaxOfRows);
        }
        function distanceCalc(testState, literal) {
            if (checkLiteral(literal, testState)) {
                return 0;
            }
            var distance = 0;
            var objectA = literal.args[0];
            var objectsAboveA;
            var xA;
            var yA;
            var stackA;
            var coordsA;
            var coordsB;
            var armDistanceA;
            var armDistanceB;
            var tempCount;
            if (testState.holding == objectA) {
                xA = testState.arm;
                armDistanceA = 0;
                objectsAboveA = 0;
            }
            else {
                coordsA = getCoords(objectA, testState);
                xA = coordsA[0];
                armDistanceA = Math.abs(xA - state.arm);
                yA = coordsA[1];
                stackA = testState.stacks[xA];
                objectsAboveA = stackA.length - yA - 1;
                tempCount = 0;
                for (var i = 0; i < objectsAboveA - 2; i++) {
                    if (testState.objects[stackA[yA + i]].size == "large") {
                        tempCount += 1;
                    }
                }
                objectsAboveA += tempCount;
            }
            var objectB = literal.args[1];
            if (objectB == undefined) {
                distance += Math.abs(xA - testState.arm) + 3 * objectsAboveA;
                return distance;
            }
            var objectsAboveB;
            var xB;
            var yB;
            var stackB;
            if (testState.holding == objectB) {
                xB = testState.arm;
                armDistanceB = 0;
                objectsAboveB = 0;
            }
            else {
                coordsB = getCoords(objectB, testState);
                xB = coordsB[0];
                armDistanceB = Math.abs(xB - state.arm);
                yB = coordsB[1];
                stackB = testState.stacks[xB];
                objectsAboveB = stackB.length - yB - 1;
                tempCount = 0;
                for (var i = 0; i < objectsAboveB; i++) {
                    if (testState.objects[stackB[yB + i]].size == "large") {
                        tempCount += 1;
                    }
                }
                objectsAboveB += tempCount;
            }
            var relation = literal.relation;
            if (relation === "inside" || relation === "ontop" || relation === "under") {
                if (testState.holding === objectA || testState.holding === objectB) {
                    return Math.abs(xA - xB) + 3 * Math.max(objectsAboveA, objectsAboveB);
                }
                else {
                    distance += 3 * objectsAboveB + 5 * objectsAboveA + Math.min(armDistanceA, armDistanceB) + 10 * Math.abs(xA - xB) + 1;
                    return distance;
                }
            }
            else if (relation === "beside") {
                var moveA = 3 * objectsAboveA;
                var moveB = 3 * objectsAboveB;
                distance += +Math.min(moveA, moveB) + (Math.abs(Math.abs(xA - xB) - 1)) + 10 * Math.min(armDistanceA, armDistanceB);
                return distance;
            }
            else if (relation === "leftof") {
                var moveA = 3 * objectsAboveA + Math.abs(xB - xA - 1);
                var moveB = 3 * objectsAboveB + Math.abs(xB - xA + 1);
                distance += +Math.min(moveA, moveB) + Math.min(armDistanceA, armDistanceB);
                return distance;
            }
            else if (relation === "rightof") {
                var moveA = 3 * objectsAboveA + Math.abs(xB - xA + 1);
                var moveB = 3 * objectsAboveB + Math.abs(xB - xA - 1);
                distance += +Math.min(moveA, moveB) + Math.min(armDistanceA, armDistanceB);
                return distance;
            }
            else if (relation === "above") {
                distance += 3 * objectsAboveA + Math.abs(xA - xB) + armDistanceA;
                return distance;
            }
            return distance;
        }
        function getCoords(strKey, state) {
            var x;
            var y;
            if (strKey.substring(0, 6) === "floor-") {
                x = Number(strKey.substr(7));
                y = -1;
            }
            else {
                state.stacks.forEach(function (stack, index) {
                    if (stack.indexOf(strKey) != -1) {
                        x = index;
                        y = stack.indexOf(strKey);
                    }
                });
            }
            return [x, y];
        }
        var timeout = 10;
        var result = aStarSearch(graph, start, goal, heuristic, timeout);
        var previousState;
        var currentState;
        for (var i = 0; i < result.path.length; i++) {
            if (i === 0) {
                previousState = start;
            }
            else {
                previousState = result.path[i - 1];
            }
            currentState = result.path[i];
            if (currentState.arm > previousState.arm) {
                plan.push("r");
                continue;
            }
            if (currentState.arm < previousState.arm) {
                plan.push("l");
                continue;
            }
            if (previousState.holding == null) {
                plan.push("p");
                continue;
            }
            plan.push("d");
        }
        return plan;
    }
    function checkLiteral(literal, state) {
        var bool = false;
        if (literal.relation === "holding") {
            bool = (state.holding === literal.args[0]);
        }
        else {
            if (checkRelation(literal.args[0], literal.args[1], literal.relation, state)) {
                bool = true;
            }
        }
        if (literal.polarity === false) {
            if (bool === false) {
                return true;
            }
            else {
                return false;
            }
        }
        return bool;
    }
    function checkRelation(objA, objB, relation, state) {
        var coordinatesA = Interpreter.getCoords(objA, state);
        if (objB.substring(0, 6) === "floor-") {
            if (coordinatesA[0] === Number(objB.substring(6))) {
                if (relation === "above" && coordinatesA[0] === Number(objB.substring(6, 7))) {
                    return true;
                }
                if (relation === "ontop" && coordinatesA[0] === Number(objB.substring(6, 7))) {
                    if (coordinatesA[1] === 0) {
                        return true;
                    }
                }
            }
            return false;
        }
        var coordinatesB = Interpreter.getCoords(objB, state);
        if (relation === "leftof") {
            if (coordinatesA[0] < coordinatesB[0]) {
                return true;
            }
        }
        else {
            if (relation === "rightof") {
                if (coordinatesA[0] > coordinatesB[0]) {
                    return true;
                }
            }
            else {
                if (relation === "ontop") {
                    if (state.objects[objB].form !== "box") {
                        if (coordinatesA[0] === coordinatesB[0] && coordinatesA[1] === coordinatesB[1] + 1) {
                            return true;
                        }
                    }
                }
                else {
                    if (relation === "inside") {
                        if (state.objects[objB].form === "box") {
                            if (coordinatesA[0] === coordinatesB[0] && coordinatesA[1] === coordinatesB[1] + 1) {
                                return true;
                            }
                        }
                    }
                    else {
                        if (relation === "under") {
                            if (coordinatesA[0] === coordinatesB[0] && coordinatesA[1] < coordinatesB[1]) {
                                return true;
                            }
                        }
                        else {
                            if (relation === "beside") {
                                if (Math.abs(coordinatesA[0] - coordinatesB[0]) === 1) {
                                    return true;
                                }
                            }
                            else {
                                if (relation === "above") {
                                    if (coordinatesA[0] === coordinatesB[0] && coordinatesA[1] > coordinatesB[1]) {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
    function getWorldStateEdges(state) {
        var edges = [];
        var movementsCost = 1;
        if (state.holding != null && state.objects[state.holding].size === "large") {
            movementsCost = 2;
        }
        if (state.arm !== 0) {
            var newState1 = deepCloneWorldState(state);
            newState1.arm = newState1.arm - 1;
            var newEdge1 = { from: state, cost: movementsCost, to: newState1 };
            edges.push(newEdge1);
        }
        if (state.arm !== state.stacks.length - 1) {
            var newState2 = deepCloneWorldState(state);
            newState2.arm = newState2.arm + 1;
            var newEdge2 = { from: state, cost: movementsCost, to: newState2 };
            edges.push(newEdge2);
        }
        if (state.holding != null) {
            var grabbedObject = state.objects[state.holding];
            var topStackObject = state.objects[state.stacks[state.arm][state.stacks[state.arm].length - 1]];
            if (topStackObject == null) {
                topStackObject = { form: "floor", color: null, size: null };
            }
            if (Interpreter.checkPhysicLaws(grabbedObject, topStackObject, "ontop") || Interpreter.checkPhysicLaws(grabbedObject, topStackObject, "inside")) {
                var newState3 = deepCloneWorldState(state);
                newState3.stacks[newState3.arm].push(newState3.holding);
                newState3.holding = null;
                var newEdge3 = { from: state, cost: movementsCost, to: newState3 };
                edges.push(newEdge3);
            }
        }
        else {
            if (state.stacks[state.arm].length > 0) {
                var newState4 = deepCloneWorldState(state);
                newState4.holding = newState4.stacks[newState4.arm].pop();
                if (state.objects[newState4.holding].size === "large") {
                    movementsCost = 2;
                }
                var newEdge4 = { from: state, cost: movementsCost, to: newState4 };
                edges.push(newEdge4);
            }
        }
        return edges;
    }
    function deepCloneWorldState(state) {
        var stacksCopy = [[]];
        for (var i = 0; i < state.stacks.length; i++) {
            stacksCopy[i] = [];
            for (var j = 0; j < state.stacks[i].length; j++) {
                stacksCopy[i][j] = state.stacks[i][j];
            }
        }
        var newState = {
            arm: state.arm,
            holding: state.holding,
            stacks: stacksCopy,
            objects: state.objects,
            examples: state.examples
        };
        return newState;
    }
})(Planner || (Planner = {}));
