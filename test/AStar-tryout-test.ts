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
  var aradNode = new A.AS.CityStateNode(arad,           null, [], null); 
  var bucharestNode = new A.AS.CityStateNode(bucharest, null, [], null);
  var pitestiNode = new A.AS.CityStateNode(pitesti,     null, [], null); 
  var fagarasNode = new A.AS.CityStateNode(fagaras,     null, [], null); 
  var rimnicuNode  = new A.AS.CityStateNode(rimnicu,    null, [], null);
  var sibiuNode = new A.AS.CityStateNode(sibiu,         null, [], null);
  var oradeaNode = new A.AS.CityStateNode(oradea,       null, [], null); 
  var zerindNode = new A.AS.CityStateNode(zerind,       null, [], null); 
  var timisoaraNode = new A.AS.CityStateNode(timisoara, null, [], null); 
  var craiovaNode = new A.AS.CityStateNode(craiova, null, [], null); 

  //neighbours of each city
  pitestiNode.setNeighbour(bucharestNode, 418);
  pitestiNode.setNeighbour(craiovaNode, 455);
  pitestiNode.setNeighbour(rimnicuNode, 414);

  fagarasNode.setNeighbour(sibiuNode, 338);
  fagarasNode.setNeighbour(bucharestNode, 450);

  rimnicuNode.setNeighbour(craiovaNode, 366);
  rimnicuNode.setNeighbour(pitestiNode, 317);
  rimnicuNode.setNeighbour(sibiuNode, 300);

  sibiuNode.setNeighbour(aradNode, 280);
  sibiuNode.setNeighbour(fagarasNode, 239);
  sibiuNode.setNeighbour(oradeaNode, 291);
  sibiuNode.setNeighbour(rimnicuNode, 220);

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


