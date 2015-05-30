///<reference path="collections.ts"/>
///<reference path="../Planner.ts"/>

    interface goal_test<T> {
        (state: T): boolean;
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

    // Astar Search Function.
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