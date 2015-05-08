///<reference path="../lib/node.d.ts"/>
///<reference path="../typings/mocha/mocha.d.ts"/>
///<reference path="../typings/chai/chai.d.ts"/>
///<reference path="../lib/collections.d.ts"/>

import chai = require('chai');
import A = require('../astar/AStar');


module PlannerTest {
	class WorldState implements A.Astar.State {
        h: number;
        stacks: Object[];
        match(goal: WorldState) {
          return this.stacks === goal.stacks;
        }
        heuristic(goal: WorldState) {
          return 0;
        }
        expand() {
          // TODO
          return [];
        }
        toString() {
          return "";
        }
        constructor(stacks: Object[], h: number) {
          this.stacks = stacks;
          this.h = h;
        }
    }

    var exampleState = {
        "stacks": [["e"],["g","l"],[],["k","m","f"],[]],
        "holding":null,
        "arm":0,
        "objects":{
            "a":{"form":"brick","size":"large","color":"green"},
            "b":{"form":"brick","size":"small","color":"white"},
            "c":{"form":"plank","size":"large","color":"red"},
            "d":{"form":"plank","size":"small","color":"green"},
            "e":{"form":"ball","size":"large","color":"white"},
            "f":{"form":"ball","size":"small","color":"black"},
            "g":{"form":"table","size":"large","color":"blue"},
            "h":{"form":"table","size":"small","color":"red"},
            "i":{"form":"pyramid","size":"large","color":"yellow"},
            "j":{"form":"pyramid","size":"small","color":"red"},
            "k":{"form":"box","size":"large","color":"yellow"},
            "l":{"form":"box","size":"large","color":"red"},
            "m":{"form":"box","size":"small","color":"blue"}
            },
        "examples":[]
    };

    var exampleGoal = "inside(f, k)";

    var expect = chai.expect;

  describe('Planner', () => {

    describe('Private function', () => {
      it('1=1', (done) => {
        done();
      });
    });

  });
}