///<reference path="../lib/node.d.ts"/>
///<reference path="../typings/mocha/mocha.d.ts" />
///<reference path="../typings/chai/chai.d.ts" />
///<reference path="../lib/collections.d.ts"/>

import C = require('../lib/collections');
import A = require('../astar/AStar');

import chai = require('chai');

module AStarRomania {

  var map = [];

  class City implements A.AS.Heuristic {
    name: string;
    g: number;
    h: number;
    match(goal: City) {
      return this.name === goal.name;
    }
    heuristic(goal: City) {
      return this.h
    }
    cost() {
      return this.g;
    }
    getNeighbours() {
      return map[this.name];
    }
    hash() {
      return A.AS.hash(this.name) + this.g + this.h;
    }
    constructor(name: string, g: number, h: number) {
      this.name = name;
      this.g = g;
      this.h = h;
    }
  }

  /*
   * Different states of cities depending on where the previous step comes from.
   *
   * Cities                         name         g    h
   */
  var arad              = new City( "Arad",      0,   366 );

  var arad_sibiu        = new City( "Sibiu",     140, 253 );
  var arad_timisoara    = new City( "Timisoara", 118, 329 );
  var arad_zerind       = new City( "Zerind",    75,  374 );

  var sibiu_arad        = new City( "Arad",      280, 366 );
  var sibiu_fagaras     = new City( "Fagaras",   239, 176 );
  var sibiu_oradea      = new City( "Oradea",    291, 380 );
  var sibiu_rimnicu     = new City( "Rimnicu",   220, 193 );

  var fagaras_sibiu     = new City( "Sibiu",     338, 253 );
  var fagaras_bucharest = new City( "Bucharest", 450, 0   );

  var rimnicu_craiova   = new City( "Craiova",   366, 160 );
  var rimnicu_pitesti   = new City( "Pitesti",   317, 100 );
  var rimnicu_sibiu     = new City( "Sibiu",     300, 253 );

  var pitesti_bucharest = new City( "Bucharest", 418, 0   );
  var pitesti_craiova   = new City( "Craiova",   455, 160 );
  var pitesti_rimnicu   = new City( "Rimnicu",   414, 193 );

  map['Pitesti'] = [pitesti_bucharest, pitesti_craiova, pitesti_rimnicu];
  map['Rimnicu'] = [rimnicu_craiova, rimnicu_pitesti, rimnicu_sibiu];
  map['Fagaras'] = [fagaras_sibiu, fagaras_bucharest];
  map['Sibiu']   = [sibiu_arad, sibiu_fagaras, sibiu_oradea, sibiu_rimnicu];
  map['Arad']    = [arad_sibiu, arad_timisoara, arad_zerind];

  var expect = chai.expect;

  describe('Romania map', () => {
    describe('Shortest path from Arad to Bucharest', () => {
      it('path should be: Arad -> Sibiu -> Rimnicu -> Pitesti -> Bucharest', (done) => {
        var path: City[] = A.AS.search(arad, pitesti_bucharest);
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



