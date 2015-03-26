///<reference path="../lib/node.d.ts"/>
///<reference path="../typings/mocha/mocha.d.ts" />
///<reference path="../typings/chai/chai.d.ts" />

import chai = require('chai');

var assert = chai.assert,
    expect = chai.expect;

describe('User Model Unit Tests:', () => {

  describe('2 + 4', () => {
    it('should be 6', (done) => {
      assert.equal(2+4, 6);         // assert style
      done();
    });

    it('should not be 7', (done) => {
      expect(2+4).to.not.equals(7); // expect style
      done();
    });
  });

});

