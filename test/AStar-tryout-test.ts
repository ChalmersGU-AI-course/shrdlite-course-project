///<reference path="../lib/node.d.ts"/>
///<reference path="../typings/mocha/mocha.d.ts" />
///<reference path="../typings/chai/chai.d.ts" />

import chai = require('chai');
import A = require('../astar/AStar-tryout');

export module AStarTest {

  export class CityState implements A.AS.State {
    name: string;
    h: number;
    match(goal: CityState) {
      return this.name === goal.name;
    }
    heuristic(goal) { // ignores the argument
      return this.h;
    }
    toNumber() {
      return A.AS.hash(this.name) + this.h;
    }
    constructor(name: string, h: number) {
      this.name = name;
      this.h = h;
    }
    toString() : string {
      return this.name;
    }
  }

  // Cities
  var arad      = new CityState( "Arad",      366 );
  var sibiu     = new CityState( "Sibiu",     253 );
  var timisoara = new CityState( "Timisoara", 329 );
  var zerind    = new CityState( "Zerind",    374 );
  var fagaras   = new CityState( "Fagaras",   176 );
  var oradea    = new CityState( "Oradea",    380 );
  var rimnicu   = new CityState( "Rimnicu",   193 );
  var craiova   = new CityState( "Craiova",   160 );
  var pitesti   = new CityState( "Pitesti",   100 );
  var bucharest = new CityState( "Bucharest", 0   );

  //cities in the graph
  var aradNode = new A.AS.CityStateNode(arad,           null, []); 
  var bucharestNode = new A.AS.CityStateNode(bucharest, null, []);
  var pitestiNode = new A.AS.CityStateNode(pitesti,     null, []); 
  var fagarasNode = new A.AS.CityStateNode(fagaras,     null, []); 
  var rimnicuNode  = new A.AS.CityStateNode(rimnicu,    null, []);
  var sibiuNode = new A.AS.CityStateNode(sibiu,         null, []);
  var oradeaNode = new A.AS.CityStateNode(oradea,       null, []); 
  var zerindNode = new A.AS.CityStateNode(zerind,       null, []); 
  var timisoaraNode = new A.AS.CityStateNode(timisoara, null, []); 
  var craiovaNode = new A.AS.CityStateNode(craiova, null, []); 

  //neighbours of each city
  pitestiNode.setNeighbour(bucharestNode, 101);
  pitestiNode.setNeighbour(craiovaNode, 138);
  pitestiNode.setNeighbour(rimnicuNode, 97);

  fagarasNode.setNeighbour(sibiuNode, 99);
  fagarasNode.setNeighbour(bucharestNode, 211);

  rimnicuNode.setNeighbour(craiovaNode, 146);
  rimnicuNode.setNeighbour(pitestiNode, 97);
  rimnicuNode.setNeighbour(sibiuNode, 80);

  sibiuNode.setNeighbour(aradNode, 140);
  sibiuNode.setNeighbour(fagarasNode, 99);
  sibiuNode.setNeighbour(oradeaNode, 151);
  sibiuNode.setNeighbour(rimnicuNode, 80);

  aradNode.setNeighbour(sibiuNode, 140);
  aradNode.setNeighbour(timisoaraNode, 118);
  aradNode.setNeighbour(zerindNode, 75);


  //check A*
  var expect = chai.expect;

  describe('AStar', () => {
    var aradn: A.AS.CityStateNode = aradNode;
    describe('heuristic', () => {
      it('path should be: Arad -> Sibiu -> Rimnicu -> Pitesti -> Bucharest', (done) => {
        var path: CityState[] = A.AS.search(aradn, bucharest);
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


