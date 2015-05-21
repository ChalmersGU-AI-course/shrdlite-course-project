

/// <reference path="lib/collections.ts" />
/// <reference path="Astar.ts"/>

module IDAstar{
    //-- Interfaces -------------------------------------------

    export class Error implements Error {
        public name = "IDAstar.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }

    /**
    * Used internally by the function `search`.
    */
    interface Vertex<T>{
        state : T ;
        cost : number ;
        previous : number ;
        action : string ;
    }

    /**
    * Type alias used for comparison in the PriorityQueue.
    */
    interface Compare<T> {
        icf : collections.ICompareFunction<Vertex<T>>;
    }

    export function OLDastar<T>(f : Astar.Neighbours<T>, c : Astar.Cost<T>, h : Astar.Heuristic<T>, start : T, isGoal : Astar.Goal<T>, multiPathPruning : boolean = true, maxIter : number = 25000 ) : string[]{
        var comp : Compare<T> = {
            icf : ((a, b) => {
                return b.cost + h(b.state) - a.cost - h(a.state);
            } )
        } ;
        return OLDsearch<T>(comp, f, c, h, start, isGoal, multiPathPruning, maxIter);
    }

    function OLDsearch<T>(comp : Compare<T>, f : Astar.Neighbours<T>, c : Astar.Cost<T>, h : Astar.Heuristic<T>, start : T, isGoal : Astar.Goal<T>, multiPathPruning : boolean = true, maxIter : number = 25000 ) : string[]{
        var queue = new collections.PriorityQueue<Vertex<T>>(comp.icf) ;

        var order : Array<Vertex<T>> = [];

        var visited = new collections.Set<T>() ;
        queue.enqueue({
            state : start,
            cost : 0,
            previous : -1,
            action : "init"
        });

        for( var x = 0; ! queue.isEmpty(); ++x){

            if(x > maxIter){
                throw new IDAstar.Error("Stopping early after " + x + " iterations. Size of queue: " + queue.size() + " current cost: " + current.cost);
                return postProcess<T>(order, x-1);
                // return showVisited<T>(order);
            }

            var current : Vertex<T> = queue.dequeue();
            // console.log("DEBUG - Astar queue: "+current.state);

            if(multiPathPruning){
                if(visited.contains(current.state)){
                    continue;
                }
                visited.add(current.state);
            }

            order[x] = current ;

            if(isGoal(current.state)){
                // if(x > 1000){
                //     console.log("Completed but it took " + x + " iterations!");
                // }
                console.log("Completed in " + x + " iterations.");
                return postProcess<T>(order, x);
            }

            var neighbours = f(current.state);

            for(var n in neighbours){
                var next = neighbours[n];
                queue.enqueue({
                    state : next.state,
                    cost : current.cost + c(current.state, next.state),
                    previous : x,
                    action : next.action
                });
            }
        }

        // console.log("No solution found!");
        throw new IDAstar.Error("No solution found!");

        return ["init"];
    }

    /**
    * Backtracks from the final state to the original state.
    *
    * returns the path as a list, ie from start to goal.
    */
    function postProcess<T>(order : Array<Vertex<T>>, finish : number) : string[]{

        var result = Array<string>();

        for(var x : number = finish; x >= 0; x = order[x].previous){
            result.unshift(order[x].action);
        }
        return result;
    }

    /**
    * returns an ordered list of explored states. They do not form a path
    * but shows in which order the states were explored, starting with the inital state.
    */
    function showVisited<T>(order : Array<Vertex<T>>) : T[]{
        var result = [];
        for (var n in order){
            result.push(order[n].state);
        }
        return result;
    }

}
