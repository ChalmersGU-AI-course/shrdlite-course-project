/// <reference path="../lib/typescript-collections/collections.d.ts" />
/// <reference path="graph.d.ts" />
/// <reference path="astar.d.ts" />
declare class Tuple {
    first: number;
    second: number;
    constructor(first: number, second: number);
}
/** A graph which has a tuple as data for the nodes, making them have position.
    The map is a grid which contains 1 or 0 if the node is an actual node or a wall */
declare class GridGraph {
    graph: graphmodule.Graph<Tuple>;
    /**Create a grid world. 1 is a node, 0 is a wall */
    map: number[][];
    constructor();
    computePath(startPos: string, endPos: string): graphmodule.Path<Tuple>;
    useStraightLineHeuristics(): void;
    useManhattanHeuristics(): void;
}
declare function runExample(): void;
