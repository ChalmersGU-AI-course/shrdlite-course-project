
/// <reference path="lib/collections.ts" />


interface Neighbours<T>{
    (state : T) : T[] ;
}

interface Cost<T>{
    (stateA : T, stateB : T) : number ;
}

interface Heuristic<T>{
    (state : T) : number ;
}

interface Goal<T>{
    (state : T) : boolean ;
}

interface Vertex<T>{
    state : T ;
    cost : number ;
    previous : number ;
}

function postProcess<T>(order : Array<Vertex<T>>, finish : number){

    var stack = new collections.Stack<T>();

    // var iter = 0;
    for(var x : number = finish; x >= 0; x = order[x].previous){

        stack.push(order[x].state);
        // iter = iter + 1;
        // if(iter > 20){
        //     return "Ouch END. x = " + x ;
        // }

    }
    var str = "";
    while(! stack.isEmpty()){
        var s = stack.pop();
        str = str + " " + s ;
    }
    return str ;
}

function astar<T>(f : Neighbours<T>, c : Cost<T>, h : Heuristic<T>, start : T, isGoal : Goal<T>){

    var queue = new collections.PriorityQueue<Vertex<T>>( (a, b) => {
        return b.cost + h(b.state) - a.cost - h(a.state);
    } ) ;

    var order : Array<Vertex<T>> = [];

    // var visited = new collections.Set<T>() ;
    queue.enqueue({
        state : start,
        cost : 0,
        previous : -1
    });

    if(isGoal(start)){
        return "Already..." ;
    }

    var str = "";

    for( var x = 0 ; ! queue.isEmpty(); ++x){
        // if(x > 25){
        //     return "Not so good :P " + current.cost + "; " + str;
        // }

        var current : Vertex<T> = queue.dequeue();

        order[x] = current ;

        if(isGoal(current.state)){
            return postProcess<T>(order, x);
        }

        var neighbours = f(current.state);

        for(var n in neighbours){
            var next = neighbours[n];
            queue.enqueue({
                state : next,
                cost : current.cost + c(current.state, next),
                previous : x
            });
        }
    }

    return undefined;
}

//-----------------------------

var goal = 10;

function dummyF(x : number) : [number] {
    return [x+1,x-1];
}

function dummyCost(x, y) {
    return 1;
}

function dummyH(x : number) : number{
    return goal - x - 1;
}

function dummyGoal(x) : boolean{
    return x == goal;
}

function dummyCall(){
    return astar<number>(dummyF, dummyCost, dummyH, 0, dummyGoal)
}
