///<reference path="../Astar.ts"/>
declare var chai:any;
declare var describe:any;
declare var it:any;
var assert = chai.assert;

class TestNode implements INode<TestNode> {
	constructor (
	) {}
	Neighbours(): Neighbour<TestNode>[] {
		return [];
	}
}

describe('Astar', function() {
	it('')
});