/// <reference path="./MySet"/>

module AStar {

    type THeuristicF = (start: Node, goalConditions: Interpreter.Literal[]) => number;

    /*
     * @returns Node[] or null
     */
    export function astar(start: Node, goalConditions: Interpreter.Literal[], heuristic: THeuristicF) : Node[] {
        var closedset = new MySet<Node>(); // The set of nodes already evaluated.
        var openset = new MySet<Node>(); // The set of tentative nodes to be evaluated, initially containing the start node
        openset.add(start);
        var came_from = new Map<Node, Node>(); // The map of navigated nodes.
        var g_score = new Map<Node, number>();
        var f_score = new Map<Node, number>();

        g_score.set(start, 0); // Cost from start along best known path.
        // Estimated total cost from start to goal through y.
        f_score.set(start, g_score.get(start) + heuristic(start, goalConditions));

        while (openset.size() > 0) { // openset is not empty
            var current: Node = lowestFScoreNode(openset, heuristic, goalConditions);
            if (isGoalReached(current.content, goalConditions)) {
                return reconstruct_path(came_from, current);
            }

            openset.delete(current); // remove current from openset
            closedset.add(current); // add current to closedset
            current.neighbours.forEach((arc) => {
                var neighbor = arc.destination;
                var weight = arc.weight;
                if (closedset.has(neighbor)) return; // continue

                var tentative_g_score = g_score.get(current) + weight;

                if (!openset.has(neighbor) || tentative_g_score < g_score.get(neighbor)) {
                    came_from.set(neighbor, current);
                    g_score.set(neighbor, tentative_g_score);
                    f_score.set(neighbor, g_score.get(neighbor) + heuristic(neighbor, goalConditions));
                    if (!openset.has(neighbor)) {
                        openset.add(neighbor);
                    }
                }
            });
        }
        return null;
    }

    export class Arc {

      constructor(public destination: Node, public weight: number) {
      }

    }

    export class Node {

      public neighbours: Arc[] = [];

      constructor(public content: any) {
      }

      addNeighbour(node: Node, weight: number) : void {
        var arc = new Arc(node, weight);
        this.neighbours.push(arc);
      }

      neighbourNodes(): Node[] {
        return this.neighbours.map((arc) => arc.destination);
      }
    }

    function lowestFScoreNode(set: MySet<Node>, heuristic: THeuristicF, goalConditions: Interpreter.Literal[]) : Node {
        // the node in openset having the lowest f_score[] value
        var scoreFn = (node: Node) => {
            return {score: heuristic(node, goalConditions), node: node}
        };

        return set.toArray()
            .map(scoreFn)
            .sort((a, b) => {return a.score - b.score})
            .shift().node;
    }

    function reconstruct_path(came_from: Map<Node, Node>, current: Node) : Node[] {
        var total_path = [current];
        while (came_from.has(current)) {
            current = came_from.get(current);
            total_path.push(current);
        }
        return total_path
    }

    function isGoalReached(state: Planner.State, goalConditions: Interpreter.Literal[][]) : boolean {
        for (var goal=0; goal<goalConditions.length; goal++) {
            if (goalConditions[1][goal].rel == "ontop" ) {
                var top : number[] = Planner.getLocation(goalConditions[1][goal].args[1], state.stacks);
                var bottom : number[] = Planner.getLocation(goalConditions[1][goal].args[2], state.stacks);
                if (!(top[1] == bottom[1] && top[2] == bottom[2]+1)) {
                    return false;
                }
            }
        }
        return true;
    }

}
