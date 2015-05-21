
/// <reference path="lib/collections.ts" />
/// <reference path="Astar.ts"/>

// Finds non-optimal solution quickly?.
module NotIDAstar{

    export class Error implements Error {
        public name = "NotIDAstar.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }

    export function search<T>(s : Astar.Search<T>) : string[] {
        var nextAttempt : Astar.Vertex<T> = s.startVertex;
        while(! depthFirstUntil<T>(nextAttempt, s)){

            if(s.prioQueue.isEmpty()){
                throw new NotIDAstar.Error("No solution found!");
            }
            nextAttempt = s.prioQueue.dequeue();
            s.bound = 2*s.bound ;
        }
        return Astar.postProcess(s.order, s.x);
    }

    // Heuristic depth first search until a heuristic limit.
    // Returns if the goal was found.
    // Goal vertex can be found in `s.order[s.x]`
    function depthFirstUntil<T>(start : Astar.Vertex<T>, s : Astar.Search<T>) : boolean{
        var stack = new collections.Stack<Astar.Vertex<T>>();
        stack.push(start);
        var localQueue = new collections.PriorityQueue<Astar.Vertex<T>>(( (a, b) => {
            return b.cost + b.heur - a.cost - a.heur;
        } )) ;

        while(! stack.isEmpty()){
            localQueue.clear();
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

                if(vn.heur < s.bound){
                    localQueue.enqueue(vn);
                    // stack.push(vn);
                } else {
                    s.prioQueue.enqueue(vn);
                }

            }

            while(!localQueue.isEmpty()){
                stack.push(localQueue.dequeue());
            }

            s.x = s.x + 1;
        }

        return false;
    }


}
