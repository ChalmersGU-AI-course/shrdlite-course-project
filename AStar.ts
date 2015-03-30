/// < reference path="collections">
module AStar {

  export class Graph<S>{
    constructor(public children : Graph<S>[], public state : S){}
  }

  export class Path<S>{
    constructor(private path : Graph<S>[]){}
    push(g:Graph<S>):number{
      return this.path.push(g);
    }
    wheight():number{
      return this.path.length;
    }
  }

  export interface Hueristic<S> {
    (S):number
  }

  export interface Goal<S> {
    (S):boolean
  }

  export function astarSearch<S>(graph:Graph<S>,h:Hueristic<S>,goal:Goal<S>){
    
  }

  export function test(){
    var g1 = new Graph<number>([],4);
    var g = new Graph<number>([g1,new Graph([],3)],1);
    g1.children.push(g);
    astarSearch<number>(g,function(a){return 0;},function(a){return true;})
  }

  export function prioTest(){
    var g1 = new Graph<number>([],4);
    var g2 = new Graph<number>([],3);
    var g = new Graph<number>([],1);
    var p = new Path([g,g1]);
    console.log(p);
    p.push(g2);
    console.log(p);
    console.log(p.pop());
    console.log(p);
  }

}