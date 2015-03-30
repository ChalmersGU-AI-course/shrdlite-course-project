/// <reference path="collections.ts" />
module AStar {

    export class Graph<S>{
	constructor(public children : Edge<S>[], public state : S){}

	addEdge (e : Edge<S>) {
	    this.children.push(e);
	}
    }

    export class Path<S>{
	cost : number;
	constructor(private path : Graph<S>[]){this.cost = 0;}
	push(e:Edge<S>):Path<S>{
            var p = new Path(this.path.concat([e.end])); 
            p.cost = this.cost + e.cost;
	    return p;
	}
	weight():number{
	    return this.cost;
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

    export interface Edge<S> {
	cost : number;
        end  : Graph<S>;
    }

    export function astarSearch<S>(graph:Graph<S>,h:Heuristic<S>,goal:Goal<S>){
	var frontier = new collections.PriorityQueue<Path<S>>(function(a,b) {
	    return (b.weight() + h(b.peek().state)) -  (a.weight() + h(a.peek().state))
	});
	frontier.add(new Path<S>([ graph]));

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
    

//Simple test
    export function test(){
	var g1 = new Graph<number>([],4);
	var g2 = new Graph([],3);
	var g = new Graph<number>([{ cost: 1, end: g1},
                                   {cost: 1, end: g2}], 0);
	g1.children.push({cost:1, end: g});

	var h = astarSearch<number>(g,function(a){return 0;},function(a : number){return a == 3;})
	return h;
    }
    

    //Complicated test geolocations
    export function geoTest() {
        var l1 = new Graph<string>([], "gothenburg");
        var l2 = new Graph<string>([], "boras");
        var l3 = new Graph<string>([], "jonkoping");
        var l4 = new Graph<string>([], "stockholm");


	l1.addEdge({cost: 4,  end: l2});
	l2.addEdge({cost: 8,  end: l3});
	l4.addEdge({cost: 15, end: l2});
	l3.addEdge({cost: 16, end: l4});
	l3.addEdge({cost: 23, end: l1});
	l2.addEdge({cost: 42, end: l4});

	return astarSearch<string>(l1
				   ,function(a : string){
				       if(a == "gothenburg") {
					   return Math.sqrt(4*4 + 15*15);
				       } else if(a == "boras") {
					   return 14;
				       } else if(a == "jonkoping") {
					   return 15;
				       } else if(a == "stockholm") {
					   return 0;
				       }
				   },
				   function(a : string){
                                       return a == "ilovelamp";
				   })
    }

}
