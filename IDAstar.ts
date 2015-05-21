
/// <reference path="lib/collections.ts" />

module IDAstar{
    //-- Interfaces -------------------------------------------

    export class Error implements Error {
        public name = "IDAstar.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }

    export interface Neighbours<T>{
        (state : T) : Neighb<T>[] ;
    }

    export interface Neighb<T>{
        state : T ;
        action : string ;
        transitionCost : number ;
    }

    /**
    * Heuristic function.
    */
    export interface Heuristic<T>{
        (state : T) : number ;
    }

    /**
    * returns true iff the state is accepting, ie is a goal state.
    * Thus, there can be several goal states.
    */
    export interface Goal<T>{
        (state : T) : boolean ;
    }

    /**
    * Used internally by the function `search`.
    */
    interface Vertex<T>{
        state : T ;
        cost : number ;
        heur : number ;
        previous : number ;
        action : string ;
    }

    // Depth first search until a heuristic limit.
    // Returns if the goal was found.
    // Goal vertex can be found in `s.order[s.x]`
    function depthFirstUntil<T>(start : Vertex<T>, s : Search<T>) : boolean{
        var stack = new collections.Stack<Vertex<T>>();
        stack.push(start);

        // TODO improvement: heuristic depth-first instead of simple depth first?
        while(! stack.isEmpty){
            var v : Vertex<T> = stack.pop();
            s.order[s.x] = v;

            if(s.isGoal(v.state)){
                return true;
            }

            var neighbours : Neighb<T>[] = s.f(v.state);
            for(var n in neighbours){
                var neighb = neighbours[n];
                var vn : Vertex<T> = {
                    state : neighb.state,
                    cost : v.cost + neighb.transitionCost,
                    heur : s.h(neighb.state),
                    previous : s.x,
                    action : neighb.action
                };

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

    function idaSearch<T>(s : Search<T>) : string[] {
        var nextAttempt : Vertex<T> = s.startVertex;
        while(! depthFirstUntil<T>(nextAttempt, s)){
            nextAttempt = s.prioQueue.dequeue();
            s.hLimit = 2*s.hLimit ;
        }
        return postProcess(s.order, s.x);
    }

    export class Search<T>{
        public prioQueue : collections.PriorityQueue<Vertex<T>> ;
        public x : number = 0;
        public order : Array<Vertex<T>> = [];
        public startVertex : Vertex<T>

        constructor(
            start : T,
            public hLimit : number,
            public f : Neighbours<T>,
            public h : Heuristic<T>,
            public isGoal : Goal<T>,
            public maxIter : number = 25000,
            public multiPathPruning : boolean = true
        ){
            this.prioQueue = new collections.PriorityQueue<Vertex<T>>(( (a, b) => {
                return b.cost + b.heur - a.cost - a.heur;
            } )) ;

            this.startVertex = {
                state : start,
                cost : 0,
                heur : h(start),
                previous : -1,
                action : "init"
            };
        }
    }

    /**
    * Type alias used for comparison in the PriorityQueue.
    */

    /*interface Compare<T> {
        icf : collections.ICompareFunction<Vertex<T>>;
    }

    export function OLDastar<T>(f : Neighbours<T>, c : Cost<T>, h : Heuristic<T>, start : T, isGoal : Goal<T>, multiPathPruning : boolean = true, maxIter : number = 25000 ) : string[]{
        var comp : Compare<T> = {
            icf : ((a, b) => {
                return b.cost + h(b.state) - a.cost - h(a.state);
            } )
        } ;
        return OLDsearch<T>(comp, f, c, h, start, isGoal, multiPathPruning, maxIter);
    }

    function OLDsearch<T>(comp : Compare<T>, f : Neighbours<T>, c : Cost<T>, h : Heuristic<T>, start : T, isGoal : Goal<T>, multiPathPruning : boolean = true, maxIter : number = 25000 ) : string[]{
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
                throw new IDError("Stopping early after " + x + " iterations. Size of queue: " + queue.size() + " current cost: " + current.cost);
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
        throw new IDError("No solution found!");

        return ["init"];
    }
    */

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
