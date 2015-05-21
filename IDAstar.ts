
/// <reference path="lib/collections.ts" />
/// <reference path="Astar.ts"/>

module IDAstar{

    export class Error implements Error {
        public name = "IDAstar.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }

    var result : string[];

    export function idaSearch<T>(s : Astar.Search<T>) : string[] {
        console.log("Using IDAstar search...");
        result = [];
        var t = 0;
        while(t >= 0){
            t = searchUntil(s.startVertex, s);
            s.visited.clear();
            s.bound = t;
        }

        return result;
    }

    // Returns negative value if found the solution.
    // Otherwise, returns minimum f-value of its successors.
    function searchUntil<T>(node : Astar.Vertex<T>, s : Astar.Search<T>) : number{
        s.x = s.x + 1;

        var est : number = node.cost + node.heur;
        if(est > s.bound) return est;
        if(s.isGoal(node.state)) {
            return -1;
        }

        var neighbours : Astar.Neighb<T>[] = s.f(node.state);
        var min : number = Infinity;

        for(var n in neighbours){

            var neighb = neighbours[n];
            var vn : Astar.Vertex<T> = Astar.neighbourVertex<T>(s, node, neighb);

            if(s.multiPathPruning){
                if(s.visited.contains(vn.state)){
                    continue;
                }
                s.visited.add(vn.state);
            }

            var t = searchUntil<T>(vn, s);
            if( t < 0){
                result.unshift(vn.action);
                return t;
            }
            if( t < min){
                min = t;
            }
        }
        return min;
    }




}
