/// <reference path="collections.ts" />
module AStar {

  export class Graph<S>{
    constructor(public children : Graph<S>[], public state : S){}
  }

  export class Path<S>{
    constructor(private path : Graph<S>[]){}
    push(g:Graph<S>):Path<S>{
	return new Path(this.path.concat([g]));
    }
    weight():number{
      return this.path.length;
    }
      peek():Graph<S> {
	  return this.path[this.path.length - 1];
      }
  }

  export interface Heuristic<S> {
    (s : S):number
  }

  export interface Goal<S> {
    (s : S):boolean
  }

  export function astarSearch<S>(graph:Graph<S>,h:Heuristic<S>,goal:Goal<S>){
      var frontier = new collections.PriorityQueue<Path<S>>(function(a,b) {
	  return (b.weight() + h(b.peek().state)) -  (a.weight() + h(a.peek().state))
      });
      frontier.add(new Path<S>([graph]));

      while(!frontier.isEmpty()) {
	  var p = frontier.dequeue();
	  if(goal(p.peek().state)) {
	      return p;
	  } else {
	      for( var i = 0; i < p.peek().children.length; i++ ) {
		  frontier.add( p.push(p.peek().children[i]));
	      }
	  }
      }
  }


  export function test(){
    var g1 = new Graph<number>([],4);
    var g = new Graph<number>([g1,new Graph([],3)],1);
    g1.children.push(g);

    var h = astarSearch<number>(g,function(a){return 0;},function(a : number){return a == 4;})
    return h;
  }


}
