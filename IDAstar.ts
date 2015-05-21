
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

        // TODO can "unnatural failure happen? ie exist no solution."
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

    function idaSearch<T>(s : Search<T>) : string[] {
        var nextAttempt : Vertex<T> = s.startVertex;
        while(! depthFirstUntil<T>(nextAttempt, s)){
            nextAttempt = s.prioQueue.dequeue();
            s.hLimit = 2*s.hLimit ;
        }
        return postProcess(s.order, s.x);
    }

    export class Search<T>{
        public prioQueue : collections.PriorityQueue<Vertex<T>>;
        public visited : collections.Set<T> = new collections.Set<T>();
        public x : number = 0;
        public order : Array<Vertex<T>> = [];
        public startVertex : Vertex<T>;

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
