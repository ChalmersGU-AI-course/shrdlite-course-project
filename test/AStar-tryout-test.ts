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

  var dict = new A.AS.ANodeDict<City>();

  dict.set("pitesti_bucharest",  new A.AS.ANode<City>(bucharest, "rimnicu_pitesti", [], 418));
  dict.set("pitesti_craiova",    new A.AS.ANode<City>(craiova, "rimnicu_pitesti", [], 455));
  dict.set("pitesti_rimnicu",    new A.AS.ANode<City>(rimnicu, "rimnicu_pitesti", [], 414));

  dict.set("rimnicu_craiova",    new A.AS.ANode<City>(craiova, "sibiu_rimnicu", [], 366));
  dict.set("rimnicu_pitesti",    new A.AS.ANode<City>(pitesti, "sibiu_rimnicu", ["pitesti_bucharest", "pitesti_craiova", "pitesti_rimnicu"], 317));
  dict.set("rimnicu_sibiu",      new A.AS.ANode<City>(sibiu, "sibiu_rimnicu", [], 300));

  dict.set("fagaras_sibiu",      new A.AS.ANode<City>(sibiu, "sibiu_fagaras", [], 338));
  dict.set("fagaras_bucharest",  new A.AS.ANode<City>(bucharest, "sibiu_fagaras", [], 450));

  dict.set("sibiu_arad",         new A.AS.ANode<City>(arad, "arad_sibiu", [], 280));
  dict.set("sibiu_fagaras",      new A.AS.ANode<City>(fagaras, "arad_sibiu", ["fagaras_sibiu", "fagaras_bucharest"], 239));
  dict.set("sibiu_oradea",       new A.AS.ANode<City>(oradea, "arad_sibiu", [], 291));
  dict.set("sibiu_rimnicu",      new A.AS.ANode<City>(rimnicu, "arad_sibiu", ["rimnicu_craiova", "rimnicu_pitesti", "rimnicu_sibiu"], 220));

  dict.set("arad_sibiu",         new A.AS.ANode<City>(sibiu, "arad", ["sibiu_arad", "sibiu_fagaras", "sibiu_oradea", "sibiu_rimnicu"], 140));
  dict.set("arad_timisoara",     new A.AS.ANode<City>(timisoara, "arad", [], 118));
  dict.set("arad_zerind",        new A.AS.ANode<City>(zerind, "arad", [], 75));

  dict.set("arad",               new A.AS.ANode<City>(arad, null, ["arad_sibiu", "arad_timisoara", "arad_zerind"], 0));


  var expect = chai.expect;

  describe('AStar', () => {
    describe('heuristic', () => {
      it('should return the correct heuristic value of the city', (done) => {
        expect(arad.heuristic(null)).to.equals(366);
        done();
      });
      it('should return a path to Bucharest', (done) => {
        var arad = dict.get("arad");
        var path = A.AS.search(arad, bucharest, dict);
        expect(path[path.length-1].name).to.equals("Bucharest");
        done();
      });
    });
  });

}


