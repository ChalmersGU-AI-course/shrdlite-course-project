/// <reference path="../lib/typescript-collections/collections.d.ts" />
/// <reference path="graph.d.ts" />
declare module astar {
    function compute<T>(graph: graphmodule.Graph<T>, startID: string, endID: string): graphmodule.Path<T>;
}
