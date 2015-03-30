var expect = chai.expect;
var assert = chai.assert;

describe('Board', function() {
	describe('RandomBoard', function() {
		it('create random board with correct width and height', function () {
			var board = RandomBoard(3, 3);
			expect(board.Width).to.equal(3);
			expect(board.Height).to.equal(3);
		});
		it('contains one of every number', function() {
			var board = RandomBoard(3, 3);
			var values = _.flatten(board.Rows).sort();
			expect(values.length).to.equal(9);
			expect(values).to.eql(_.range(9));
		});
	});
	describe('#TargetRow', function() {
		it('returns correct position', function() {
			var board = RandomBoard(3, 3);
			expect(board.TargetRow(0)).to.equal(0);
			expect(board.TargetRow(2)).to.equal(0);
			expect(board.TargetRow(5)).to.equal(1);
			expect(board.TargetRow(8)).to.equal(2);
		});
	});
	describe('#TargetColumn', function() {
		it('return correct position', function() {
			var board = RandomBoard(3, 3);
			expect(board.TargetColumn(0)).to.equal(0);
			expect(board.TargetColumn(1)).to.equal(1);
			expect(board.TargetColumn(3)).to.equal(0);
			expect(board.TargetColumn(4)).to.equal(1);
			expect(board.TargetColumn(5)).to.equal(2);
			expect(board.TargetColumn(8)).to.equal(2);
		});
	});
	describe('#Clone', function() {
		it('should equal the old object', function() {
			var board = RandomBoard(3, 3);
			expect(board).to.eql(board.Clone());
		});
		it('should not change old object when modified', function() {
			var board = RandomBoard(3, 3);
			var oldValue = board.Rows[0][0];
			var clone = board.Clone();
			clone.Rows[0][0] = oldValue + 1;
			expect(board.Rows[0][0]).to.equal(oldValue);
		});
	});
	describe('#Swap', function() {
		it('should swap the values', function() {
			var board = RandomBoard(3, 3);
			var newBoard = board.Swap(new BoardPosition(0, 0), new BoardPosition(0, 1));
			expect(newBoard.Rows[0][0]).to.equal(board.Rows[1][0]);
		});
	});
});