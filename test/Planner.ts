///<reference path="../lib/node.d.ts"/>
///<reference path="../typings/mocha/mocha.d.ts"/>
///<reference path="../typings/chai/chai.d.ts"/>
///<reference path="../lib/collections.d.ts"/>

import chai = require('chai');
import A = require('../astar/AStar');
import C = require('../lib/collections'); 


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

    class WorldObject {
    	form: String;
    	size: String;
    	color: String;
    	constructor(form: String, size: String, color: String) {
    		this.form = form;
    		this.size = size;
    		this.color = color;
    	}
    	toString() {
    		return this.form + " " + this.size + " " + this.color;
    	}
    }

    var exampleWorldDescription = new C.collections.Dictionary<String, WorldObject>();
    exampleWorldDescription.setValue("a", new WorldObject("brick", "large", "green"));
    exampleWorldDescription.setValue("b", new WorldObject("brick", "small", "white"));
    exampleWorldDescription.setValue("c", new WorldObject("plank", "large", "red"));
    exampleWorldDescription.setValue("d", new WorldObject("plank", "small", "green"));
    exampleWorldDescription.setValue("e", new WorldObject("ball", "large", "white"));
    exampleWorldDescription.setValue("f", new WorldObject("ball", "small", "black"));
    exampleWorldDescription.setValue("g", new WorldObject("table", "large", "blue"));
    exampleWorldDescription.setValue("h", new WorldObject("table", "small", "red"));
    exampleWorldDescription.setValue("i", new WorldObject("pyramid", "large", "yellow"));
    exampleWorldDescription.setValue("j", new WorldObject("pyramid", "small", "red"));
    exampleWorldDescription.setValue("k", new WorldObject("box", "large", "yellow"));
    exampleWorldDescription.setValue("l", new WorldObject("box", "large", "red"));
    exampleWorldDescription.setValue("m", new WorldObject("box", "small", "blue"));

    var exampleState = {
        "stacks": [["e"],["g","l"],[],["k","m","f"],[]],
        "holding":null,
        "arm":0
    };

    var exampleGoal = "inside(f, k)";

    var expect = chai.expect;

    function checkIfValid(state) {
    	for (var i = 0; i < state.stacks.length; i++) {
    		for (var j = 1; j < state.stacks[i].length; j++) {
    			var currentObjectDescription = exampleWorldDescription.getValue(state.stacks[i][j]);
    			var belowObjectDescription = exampleWorldDescription.getValue(state.stacks[i][j-1]);
    			// balls must be in boxes or on the floor, otherwise they roll away
    			if (currentObjectDescription.form == "ball"
    			  && belowObjectDescription.form != "box") 
    				return false;

    			// balls cannot support anything
    			if (belowObjectDescription.form == "ball")
    				return false;

    			// small objects cannot support large objects
    			if (currentObjectDescription.size == "large"
    			  && belowObjectDescription.size == "small")
    				return false;

    			// boxes cannot contain pyramids, planks or boxes of the same size
    			if ((currentObjectDescription.form == "pyramid"
    			  || currentObjectDescription.form == "plank"
    			  || currentObjectDescription.form == "boxes")
    			  && belowObjectDescription.form == "box"
    			  && belowObjectDescription.size == currentObjectDescription.size)
    				return false;

    			// small boxes cannot be supported by small bricks or pyramids
    			if (currentObjectDescription.form == "box"
    			  && currentObjectDescription.size == "small"
    			  && belowObjectDescription.size == "small"
    			  && (belowObjectDescription.form == "brick" || belowObjectDescription.form == "pyramid"))
    				return false;

    			// large boxes cannot be supported by large pyramids
    			if (currentObjectDescription.form == "box"
    			  && currentObjectDescription.size == "large"
    			  && belowObjectDescription.form == "pyramid"
    			  && belowObjectDescription.size == "large")
    			return false;
    		}
    	}
    	return true;
    }

	describe('Planner', () => {

		describe('Private function', () => {
		  it('checkValidState', (done) => {
		  	var example = {
		  		"stacks": [["e"],["g","l"],[],["k","m","f"],[]],
        		"holding":null,
        		"arm":0
		  	};
		  	var valid = checkIfValid(example);
		  	expect(valid).to.equal(true);
		    done();
		  });
		  it('checkInvalidState', (done) => {
		  	var example = {
		  		"stacks": [["e"],["g","l"],["e","f"],["k","m","f"],[]],
        		"holding":null,
        		"arm":0
		  	};
		  	var valid = checkIfValid(example);
		  	expect(valid).to.equal(false);
		  	done();
		  });
		});

	});
}