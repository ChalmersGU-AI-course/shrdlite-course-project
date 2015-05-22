///<reference path="collections.ts"/>
///<reference path="../Planner.ts"/>

    interface goal_test<T> {
        (state: T): boolean;
    }

    interface heuristic_gen<T> {
        (current_node: T, 
         next_node: T
        ): number;
    }

    interface State_Node<T> {
        get_Neighbour_Nodes(): Neighbour<State_Node<T>>[];
    }

    class Path<T> {
        constructor(
            public States: T[],
            public Operations: string[],
            public Cost: number,
            public Heuristic: number
        ){}
        Add_Node(node: T, operation: string, cost: number, heuristic: number): Path<T> {
            var states = this.States.slice();
            states.push(node);
            var operations = this.Operations.slice();
            operations.push(operation);
            return new Path(states, operations, this.Cost + cost, heuristic);
        }
        Last_Node(): T {
            return this.States[this.States.length - 1];
        }
    }

    class ShortestPath<T> {
        constructor(
            public Path: Path<T>
        ){}
    }

    function astar_search<T>(starting_state: State_Node<T>, check_if_goal_state: goal_test<State_Node<T>>, heuristic: heuristic_gen<State_Node<T>>): ShortestPath<State_Node<T>> {
        var frontier_nodes = new collections.PriorityQueue<Path<State_Node<T>>>(Best_Direction);
        var visited_nodes = new collections.Dictionary<State_Node<T>, number>();

        var first_node : Path<State_Node<T>> = new Path<State_Node<T>>([starting_state], [], 0, 0);
        frontier_nodes.enqueue(first_node);
        while (!frontier_nodes.isEmpty()) {
            var path = frontier_nodes.dequeue();
            var currentNode = path.Last_Node();
            if (check_if_goal_state(currentNode)) {
                return new ShortestPath<State_Node<T>>(path);
            }
            var neighbours = currentNode.get_Neighbour_Nodes();
            for (var i = 0; i < neighbours.length; i++) {
                var neighbour = neighbours[i];
                var visitedCost = visited_nodes.getValue(neighbour.State);
                if (visitedCost == undefined || visitedCost > path.Cost + neighbour.Cost) {
                    var heuristicCost = heuristic(currentNode, neighbour.State);
                    var newPath = path.Add_Node(neighbour.State, neighbour.Decission, neighbour.Cost, heuristicCost);
                    visited_nodes.setValue(neighbour.State, newPath.Cost);
                    frontier_nodes.enqueue(newPath);
                }
            }
        }
        return new ShortestPath<State_Node<T>>(null);
    }

    function Best_Direction<T>(first_path: Path<T>, second_path: Path<T>): number {
        if (first_path.Cost + first_path.Heuristic < second_path.Cost + second_path.Heuristic) {
            return 1;
        } else if (first_path == second_path) {
            return 0;
        }
        return -1;
    }

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