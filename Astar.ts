
/// <reference path="lib/collections.ts" />

module Astar{
    //-- Interfaces -------------------------------------------

    /**
    * returns the neighbouring states from the current state.
    */
    interface Neighbours<T>{
        (state : T) : Neighb<T>[] ;
    }

    interface Neighb<T>{
        state : T,
        action : string
    }

    /**
    * returns the cost of moving from stateA to stateB.
    * Assmues that stateB is a neighbour of stateA.
    */
    interface Cost<T>{
        (stateA : T, stateB : T) : number ;
    }

    /**
    * Heuristic function.
    */
    interface Heuristic<T>{
        (state : T) : number ;
    }

    /**
    * returns true iff the state is accepting, ie is a goal state.
    * Thus, there can be several goal states.
    */
    interface Goal<T>{
        (state : T) : boolean ;
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

    //-- Algorithms -------------------------------------------

    /**
    * A-star algorithm.
    *
    * f = function returning the Neighbouring states of a certain state
    * c = function returning the cost of travelling from one state to another
    * h = heuristic function
    * start = initial state
    * isGoal = function returning true for every accepting state
    *          and false for every non-accepting state.
    * multiPathPruning = if allow pruning of multiple paths. Unless the heuristic
    *                    function is monotone, it may not give the very best solution
    *                    but may terminate (much) more quickly!
    *                    default value = true
    * maxIter = terminates function when surpassing this value.
    *
    * returns a list of states, ie the lowest cost path from the initial state.
    */
    function astar<T>(f : Neighbours<T>, c : Cost<T>, h : Heuristic<T>, start : T,
                      isGoal : Goal<T>, multiPathPruning : boolean = true,
                      maxIter : number = 25000 ) : string[]{
        var comp : Compare<T> = {
            icf : ((a, b) => {
                return b.cost + h(b.state) - a.cost - h(a.state);
            } )
        } ;
        return search<T>(comp, f, c, h, start, isGoal, multiPathPruning, maxIter);
    }

    /**
    * Best-first algorithm.
    *
    * Entirely disregards cost, only looking at the heuristic.
    *
    * f = function returning the Neighbouring states of a certain state
    * h = heuristic function
    * start = initial state
    * isGoal = function returning true for every accepting state
    *          and false for every non-accepting state.
    * multiPathPruning = if allow pruning of multiple paths. Unless the heuristic
    *                    function is monotone, it may not give the very best solution
    *                    but may terminate (much) more quickly!
    *                    default value = true
    * maxIter = terminates function when surpassing this value.
    *
    * returns a list of states, ie the a path from the initial state.
    */
    function bestFirst<T>(f : Neighbours<T>, h : Heuristic<T>, start : T, isGoal : Goal<T>,
                          multiPathPruning : boolean = true, maxIter : number = 25000 ) : string[]{
        var c : Cost<T> = ((a,b)=>0);
        var comp : Compare<T> = {
            icf : ((a, b) => {
                return h(b.state) - h(a.state);
            } )
        } ;
        return search<T>(comp, f, c, h, start, isGoal, multiPathPruning, maxIter);
    }

    /**
    * Lowest-cost algorithm.
    *
    * Entirely disregards heuristic, only looking at the cost.
    *
    * f = function returning the Neighbouring states of a certain state
    * c = function returning the cost of travelling from one state to another
    * start = initial state
    * isGoal = function returning true for every accepting state
    *          and false for every non-accepting state.
    * multiPathPruning = if allow pruning of multiple paths. Unless the heuristic
    *                    function is monotone, it may not give the very best solution
    *                    but may terminate (much) more quickly!
    *                    default value = true
    * maxIter = terminates function when surpassing this value.
    *
    * returns a list of states, ie the lowest cost path from the initial state.
    */
    function lowestCost<T>(f : Neighbours<T>, c : Cost<T>, start : T, isGoal : Goal<T>,
                           multiPathPruning : boolean = true, maxIter : number = 25000 ) : string[]{
        var h : Heuristic<T> = (s => 0);
        var comp : Compare<T> = {
            icf : ((a, b) => {
                return b.cost - a.cost;
            } )
        } ;
        return search<T>(comp, f, c, h, start, isGoal, multiPathPruning, maxIter);
    }

    /**
    * Breadth-first algorithm.
    *
    * Entirely disregards heuristic and assumes cost 1 on each state transition.
    *
    * f = function returning the Neighbouring states of a certain state
    * start = initial state
    * isGoal = function returning true for every accepting state
    *          and false for every non-accepting state.
    * multiPathPruning = if allow pruning of multiple paths. Unless the heuristic
    *                    function is monotone, it may not give the very best solution
    *                    but may terminate (much) more quickly!
    *                    default value = true
    * maxIter = terminates function when surpassing this value.
    *
    * returns a list of states, ie the lowest cost path from the initial state.
    */
    function breadthFirst<T>(f : Neighbours<T>, start : T, isGoal : Goal<T>,
                           multiPathPruning : boolean = true, maxIter : number = 25000 ) : string[]{
        var c : Cost<T> = ((a,b)=>1);
        return lowestCost<T>(f, c, start, isGoal, multiPathPruning, maxIter);
    }

    /**
    * General search algorithm using a PriorityQueue.
    * Used by above algoritms including `astar`.
    *
    * see documentation for `astar` above.
    */
    function search<T>(comp : Compare<T>, f : Neighbours<T>, c : Cost<T>, h : Heuristic<T>,
                       start : T, isGoal : Goal<T>, multiPathPruning : boolean = true,
                       maxIter : number = 25000 ) : string[]{
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
                alert("Stopping early after " + x + " iterations. Size of queue: " + queue.size() + " current cost: " + current.cost);
                return postProcess<T>(order, x-1);
                // return showVisited<T>(order);
            }

            var current : Vertex<T> = queue.dequeue();
            if(multiPathPruning){
                if(visited.contains(current.state)){
                    continue;
                }
                visited.add(current.state);
            }

            order[x] = current ;

            if(isGoal(current.state)){
                if(x > 1000){
                    alert("Completed but it took " + x + " iterations!");
                }
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

        alert("No solution found!");

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
