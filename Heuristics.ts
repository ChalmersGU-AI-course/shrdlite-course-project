   
    interface heuristic_gen<T> {
        (current_node: T, 
         next_node: T
        ): number;
    }

    // Creates a heuristic function that is a combination of two heuristic functions.
   function create_heuristic(intprt: Interpreter.Literal[][]) {
        return function(fromWorld: State, state: State): number {
            var list_of_heuristics = intprt.map(function(literal) {
                var blocks_and_distance_ = [objects_stack_heuristic, arm_movement_heuristic].map(function(f) {
                    return f(literal, state);
                });
                return blocks_and_distance_.reduce(function(total, num){ return total + num }, 0);
            });
            return Math.min.apply(null,list_of_heuristics);
        }
    }

    // Heuristic function for the amount of goals to be achieved based on the number of objects
    // that are on top of the goal object.
    function objects_stack_heuristic(target: Interpreter.Literal[], state: State): number {
        var blocked: Interpreter.Literal[] = target.filter(function(literal) {
            return Planner.checkStateValidity(state.State, literal);
        })

        var objects: string[] = [];

        for (var i = 0; i < blocked.length; i++) {
            var literal = blocked[i];
            for (var j = 0; j < literal.args.length; j++) {
                objects.push(literal.args[i]);
            }
        }

        var objects_on_the_way = {};
        var objects_count = 0;

        for (var i = 0; i < objects.length; i++) {
            var blocking = state.get_objects_on_top(objects[i]);
            for (var j = 0; j < blocking.length; j++) {
                if (!objects_on_the_way[blocking[j]]) {
                    objects_on_the_way[blocking[j]] = true;
                    objects_count++;
                }
            }
        }

        return objects_count;
    }

    // Heuristic function for the distance of the arm from the goal object.
    function arm_movement_heuristic(target: Interpreter.Literal[], state: State): number {
        var movement = [];

        for (var i = 0; i < target.length; i++) {
            if (Planner.checkStateValidity(state.State, target[i])) {
                continue;
            }

            var distances = target[i].args.map(function(arg) {
                if (state.get_object_location(arg))
                    return Math.abs(state.get_object_location(arg) - state.State.arm);
                else
                    return 0;
            });

            var minimum_distance = Math.min.apply(null,distances);

            if (target[i].rel.indexOf("ontop") != -1 || target[i].rel.indexOf("inside") != -1) {
                for (var j = 1; j < target[i].args.length; j++) {
                    var firstPos = state.get_object_location(target[i].args[j - 1]);
                    var secondPos = state.get_object_location(target[i].args[j]);
                    if (firstPos && secondPos) {
                        minimum_distance += Math.abs(firstPos - secondPos);
                    }
                }
            }

            movement.push(minimum_distance);
        }

        return Math.max.apply(null,movement);
    }