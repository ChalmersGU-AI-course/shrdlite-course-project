///<reference path="../lib/node.d.ts"/>
///<reference path="../typings/mocha/mocha.d.ts" />
///<reference path="../typings/chai/chai.d.ts" />
///<reference path="../AStar-tryout.ts"/>

import chai = require('chai');

var expect = chai.expect;

// Example test
describe('User Model Unit Tests:', () => {

  describe('2 + 4', () => {
    it('should be 6', (done) => {
      expect(2+4).to.equals(6);
      done();
    });

    it('should not be 7', (done) => {
      expect(2+4).to.not.equals(7);
      done();
    });
  });

});



