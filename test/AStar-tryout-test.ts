///<reference path="../lib/node.d.ts"/>
///<reference path="../typings/mocha/mocha.d.ts" />
///<reference path="../typings/chai/chai.d.ts" />
///<reference path="../AStar-tryout.ts"/>

import chai = require('chai');
import ASt = require('../AStar-tryout');

var expect = chai.expect;

class City implements ASt.Heuristic {
  name: string;
  h: number;
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
var null_arad         = new ASt.Node<City>(arad, null, [arad_sibiu, arad_timisoara, arad_zerind], 0);

var arad_sibiu        = new ASt.Node<City>(sibiu, null_arad, [sibiu_arad, sibiu_fagaras, sibiu_oradea, sibiu_rimnicu], 140);
var arad_timisoara    = new ASt.Node<City>(timisoara, null_arad, [], 118);
var arad_zerind       = new ASt.Node<City>(zerind, null_arad, [], 75);

var sibiu_arad        = new ASt.Node<City>(arad, arad_sibiu, [], 280);
var sibiu_fagaras     = new ASt.Node<City>(fagaras, arad_sibiu, [fagaras_sibiu, fagaras_bucharest], 239); // list
var sibiu_oradea      = new ASt.Node<City>(oradea, arad_sibiu, [], 291);
var sibiu_rimnicu     = new ASt.Node<City>(rimnicu, arad_sibiu, [rimnicu_craiova, rimnicu_pitesti, rimnicu_sibiu], 220);

var fagaras_sibiu     = new ASt.Node<City>(sibiu, sibiu_fagaras, [], 338);
var fagaras_bucharest = new ASt.Node<City>(bucharest, sibiu_fagaras, [], 450);

var rimnicu_craiova   = new ASt.Node<City>(craiova, sibiu_rimnicu, [], 366);
var rimnicu_pitesti   = new ASt.Node<City>(pitesti, sibiu_rimnicu, [pitesti_bucharest, pitesti_craiova, pitesti_rimnicu], 317);
var rimnicu_sibiu     = new ASt.Node<City>(sibiu, sibiu_rimnicu, [], 300);

var pitesti_bucharest = new ASt.Node<City>(bucharest, rimnicu_pitesti, [], 418);
var pitesti_craiova   = new ASt.Node<City>(craiova, rimnicu_pitesti, [], 455);
var pitesti_rimnicu   = new ASt.Node<City>(rimnicu, rimnicu_pitesti, [], 414);


describe('AStar', () => {
  var city;

  before(function () {
    city = arad;
  });

  describe('heuristic', () => {
    it('should return the h value of the city', (done) => {
      expect(city.heuristic(null)).to.equals(366);
      done();
    });
  });

});



