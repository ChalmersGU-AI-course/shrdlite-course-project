///<reference path="../lib/node.d.ts"/>
///<reference path="../typings/mocha/mocha.d.ts" />
///<reference path="../typings/chai/chai.d.ts" />
///<reference path="../astar/Astar.d.ts"/>

import A = require('../astar/AStar');
import chai = require('chai');

module AStarRomania {

  var map:A.Astar.Transition[] = [];

  class City implements A.Astar.State {
    name: string;
    from: string; // only used for making node unique in hash function
    h: number;
    match(goal: City) {
      return this.name === goal.name;
    }
    heuristic(goal: City) {
      return this.h
    }
    expand() {
      return map[this.name];
    }
    toString() {
      return "City: " + this.name + " and came from " + this.from;
    }
    constructor(from: string, name: string, h: number) {
      this.name = name;
      this.from = from;
      this.h = h;
    }
  }

  /*
   * Different states of cities depending on where the previous step comes from.
   *
   * Cities                         from       name         heuristic
   */
  var arad              = new City( null,      "Arad",      366 );

  var arad_sibiu        = new City( "Arad",    "Sibiu",     253 );
  var arad_timisoara    = new City( "Arad",    "Timisoara", 329 );
  var arad_zerind       = new City( "Arad",    "Zerind",    374 );

  var sibiu_arad        = new City( "Sibiu",   "Arad",      366 );
  var sibiu_fagaras     = new City( "Sibiu",   "Fagaras",   176 );
  var sibiu_oradea      = new City( "Sibiu",   "Oradea",    380 );
  var sibiu_rimnicu     = new City( "Sibiu",   "Rimnicu",   193 );

  var fagaras_sibiu     = new City( "Fagaras", "Sibiu",     253 );
  var fagaras_bucharest = new City( "Fagaras", "Bucharest", 0   );

  var rimnicu_craiova   = new City( "Rimnicu", "Craiova",   160 );
  var rimnicu_pitesti   = new City( "Rimnicu", "Pitesti",   100 );
  var rimnicu_sibiu     = new City( "Rimnicu", "Sibiu",     253 );

  var pitesti_bucharest = new City( "Pitesti", "Bucharest", 0   );
  var pitesti_craiova   = new City( "Pitesti", "Craiova",   160 );
  var pitesti_rimnicu   = new City( "Pitesti", "Rimnicu",   193 );

  // Problem graph
  map['Pitesti'] = [
    {cost: 0,   state: pitesti_bucharest},
    {cost: 455, state: pitesti_craiova},
    {cost: 414, state: pitesti_rimnicu}
  ];
  map['Rimnicu'] = [
    {cost: 366, state: rimnicu_craiova},
    {cost: 317, state: rimnicu_pitesti},
    {cost: 300, state: rimnicu_sibiu}
  ];
  map['Fagaras'] = [
    {cost: 338, state: fagaras_sibiu},
    {cost: 450, state: fagaras_bucharest}
  ];
  map['Sibiu']   = [
    {cost: 280, state: sibiu_arad},
    {cost: 239, state: sibiu_fagaras},
    {cost: 291, state: sibiu_oradea},
    {cost: 220, state: sibiu_rimnicu}
  ];
  map['Arad']    = [
    {cost: 140, state: arad_sibiu},
    {cost: 118, state: arad_timisoara},
    {cost: 75,  state: arad_zerind}
  ];

  var expect = chai.expect;

  describe('Romania map', () => {
    describe('Shortest path from Arad to Bucharest', () => {
      it('path should be: Arad -> Sibiu -> Rimnicu -> Pitesti -> Bucharest', (done) => {
        var solution = A.Astar.search(arad, null, pitesti_bucharest);
        var path = solution.path;
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



