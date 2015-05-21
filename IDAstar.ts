
/// <reference path="lib/collections.ts" />
/// <reference path="Astar.ts"/>

module IDAstar{

    export class Error implements Error {
        public name = "IDAstar.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }

    export function idaSearch<T>(s : Astar.Search<T>) : string[] {
        var nextAttempt : Astar.Vertex<T> = s.startVertex;
        while(! depthFirstUntil<T>(nextAttempt, s)){

            if(s.prioQueue.isEmpty()){
                throw new IDAstar.Error("No solution found!");
            }
            nextAttempt = s.prioQueue.dequeue();
            s.hLimit = 2*s.hLimit ;
        }
        return Astar.postProcess(s.order, s.x);
    }

    // Depth first search until a heuristic limit.
    // Returns if the goal was found.
    // Goal vertex can be found in `s.order[s.x]`
    function depthFirstUntil<T>(start : Astar.Vertex<T>, s : Astar.Search<T>) : boolean{
        var stack = new collections.Stack<Astar.Vertex<T>>();
        stack.push(start);

        // TODO improvement: heuristic depth-first instead of simple depth first?
        while(! stack.isEmpty()){
            var v : Astar.Vertex<T> = stack.pop();
            s.order[s.x] = v;

            if(s.isGoal(v.state)){
                return true;
            }

            var neighbours : Astar.Neighb<T>[] = s.f(v.state);
            for(var n in neighbours){
                var neighb = neighbours[n];
                var vn : Astar.Vertex<T> = Astar.neighbourVertex<T>(s, v, neighb);

                if(s.multiPathPruning){
                    if(s.visited.contains(vn.state)){
                        continue;
                    }
                    s.visited.add(vn.state);
                }

                if(vn.heur < s.hLimit){
                    stack.push(vn);
                } else {
                    s.prioQueue.enqueue(vn);
                }

            }

            s.x = s.x + 1;
        }

        return false;
    }


}
