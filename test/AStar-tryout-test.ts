///<reference path="../lib/node.d.ts"/>
///<reference path="../typings/mocha/mocha.d.ts" />
///<reference path="../typings/chai/chai.d.ts" />

import chai = require('chai');
import A = require('../astar/AStar-tryout');

module AStarTest {

  class City implements A.AS.Heuristic {
    name: string;
    h: number;
    match(goal: City) {
      return this.name === goal.name;
    }
    heuristic(goal: City) { // ignores the argument
      return this.h;
    }
    toNumber() {
      return A.AS.hash(this.name) + this.h;
    }
    constructor(name: string, h: number) {
      this.name = name;
      this.h = h;
    }
  }

  // Cities
  var arad      = new City( "Arad",      366 );
  var sibiu     = new City( "Sibiu",     253 );
  var timisoara = new City( "Timisoara", 329 );
  var zerind    = new City( "Zerind",    374 );
  var fagaras   = new City( "Fagaras",   176 );
  var oradea    = new City( "Oradea",    380 );
  var rimnicu   = new City( "Rimnicu",   193 );
  var craiova   = new City( "Craiova",   160 );
  var pitesti   = new City( "Pitesti",   100 );
  var bucharest = new City( "Bucharest", 0   );

  // Romainia map (Start point Arad)
  var graph = new A.AS.Graph<City>();

  //                             state      previous                next        cost
  graph.set(new A.AS.ANode<City>(bucharest, A.AS.key(pitesti, 317), [],         418));
  graph.set(new A.AS.ANode<City>(craiova,   A.AS.key(pitesti, 317), [],         455));
  graph.set(new A.AS.ANode<City>(rimnicu,   A.AS.key(pitesti, 317), [],         414));

  graph.set(new A.AS.ANode<City>(craiova,   A.AS.key(rimnicu, 220), [],         366));
  graph.set(new A.AS.ANode<City>(pitesti,   A.AS.key(rimnicu, 220),
    [A.AS.key(bucharest, 418), A.AS.key(craiova, 455), A.AS.key(rimnicu, 414)], 317));
  graph.set(new A.AS.ANode<City>(sibiu,     A.AS.key(rimnicu, 220), [],         300));

  graph.set(new A.AS.ANode<City>(sibiu,     A.AS.key(fagaras, 239), [],         338));
  graph.set(new A.AS.ANode<City>(bucharest, A.AS.key(fagaras, 239), [],         450));

  graph.set(new A.AS.ANode<City>(arad,      A.AS.key(sibiu, 140),   [],         280));
  graph.set(new A.AS.ANode<City>(fagaras,   A.AS.key(sibiu, 140),
    [A.AS.key(sibiu, 338), A.AS.key(bucharest, 450)],                           239));
  graph.set(new A.AS.ANode<City>(oradea,    A.AS.key(sibiu, 140),   [],         291));
  graph.set(new A.AS.ANode<City>(rimnicu,   A.AS.key(sibiu, 140),
    [A.AS.key(craiova, 366), A.AS.key(pitesti, 317), A.AS.key(sibiu, 300)],     220));

  graph.set(new A.AS.ANode<City>(sibiu,     A.AS.key(arad, 0),
    [A.AS.key(arad, 280), A.AS.key(fagaras, 239), A.AS.key(oradea, 291), A.AS.key(rimnicu, 220)], 140));
  graph.set(new A.AS.ANode<City>(timisoara, A.AS.key(arad, 0),      [],         118));
  graph.set(new A.AS.ANode<City>(zerind,    A.AS.key(arad, 0),      [],         75));

  graph.set(new A.AS.ANode<City>(arad,      null,
    [A.AS.key(sibiu, 140), A.AS.key(timisoara, 118), A.AS.key(zerind, 75)],     0));

  var expect = chai.expect;

  describe('AStar', () => {
    var aradn: A.AS.ANode<City> = graph.get(A.AS.key(arad, 0));
    describe('heuristic', () => {
      it('path should be: Arad -> Sibiu -> Rimnicu -> Pitesti -> Bucharest', (done) => {
        var path: City[] = A.AS.search(aradn, bucharest, graph);
        expect(path[0].name).to.equals("Arad");
        expect(path[1].name).to.equals("Sibiu");
        expect(path[2].name).to.equals("Rimnicu");
        expect(path[3].name).to.equals("Pitesti");
        expect(path[4].name).to.equals("Bucharest");
        done();
      });
    });
  });

}


