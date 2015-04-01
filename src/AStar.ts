module AStar {

    type THeuristicF = (start: Node, goal: Node) => number;

    /*
     * @returns Node[] or null
     */
    export function astar(start: Node, goal: Node, heuristic: THeuristicF) : Node[] {
        var closedset = new Set<Node>(); // The set of nodes already evaluated.
        var openset = new Set<Node>(); // The set of tentative nodes to be evaluated, initially containing the start node
        openset.add(start);
        var came_from = new Map<Node, Node>(); // The map of navigated nodes.
        var g_score = new Map<Node, number>();
        var f_score = new Map<Node, number>();

        g_score.set(start, 0); // Cost from start along best known path.
        // Estimated total cost from start to goal through y.
        f_score.set(start, g_score.get(start) + heuristic(start, goal));

        while (openset.size > 0) { // openset is not empty
            var current: Node = lowestFScoreNode(openset, heuristic, goal);
            if (current == goal) {
                return reconstruct_path(came_from, goal);
            }

            openset.delete(current); // remove current from openset
            closedset.add(current); // add current to closedset
            current.neighbor_nodes().forEach((neighbor) => {
                if (closedset.has(neighbor)) return; // continue

                var tentative_g_score = g_score.get(current) + dist_between(current, neighbor);

                if (!openset.has(neighbor) || tentative_g_score < g_score.get(neighbor)) {
                    came_from.set(neighbor, current);
                    g_score.set(neighbor, tentative_g_score);
                    f_score.set(neighbor, g_score.get(neighbor) + heuristic(neighbor, goal));
                    if (!openset.has(neighbor)) {
                        openset.add(neighbor);
                    }
                }
            });
        }

        return null;
    }

    interface Node {
        neighbor_nodes(): [Node];
    }

    function lowestFScoreNode(set: Set<Node>, heuristic: THeuristicF, goal: Node) : Node {
        // the node in openset having the lowest f_score[] value
        var scoreFn = (node: Node) => {
            return {score: heuristic(node, goal), node: node}
        };

        return setToArray(set)
            .map(scoreFn)
            .sort((a, b) => {return a.score - b.score})
            .shift().node;
    }

    function dist_between(current: Node, neighbor: Node) {
        return 1;
    }

    function reconstruct_path(came_from: Map<Node, Node>, current: Node) : Node[] {
        var total_path = [current];
        while (came_from.has(current)) {
            current = came_from.get(current);
            total_path.push(current);
        }
        return total_path
    }

    function setToArray<T>(set: Set<T>) : T[] {
        var items: T[] = [];
        set.forEach((item) => items.push(item));
        return items;
    }

}

declare var module;
if(typeof module !== 'undefined') {
    module.exports = AStar;
}
