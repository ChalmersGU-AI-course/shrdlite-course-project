declare var _:any;

class BoardPosition {
	constructor (
		public Column: number,
		public Row: number
	) {}
}

class Board {
	constructor (
		public Rows: number[][],
		public Width: number,
		public Height: number
	){}

	TargetRow(num: number): number {
		return Math.floor(num / this.Width);
	}
	TargetColumn(num: number): number {
		return num % this.Width;
	}
	Clone(): Board {
		var rows = this.Rows.slice();
		for (var i = 0; i < rows.length; ++i) {
			rows[i] = rows[i].slice();
		}
		return new Board(rows, this.Width, this.Height);
	}
	Swap(p0: BoardPosition, p1: BoardPosition): Board {
		var board = this.Clone();
		board.Rows[p0.Row][p0.Column] = this.Rows[p1.Row][p1.Column];
		board.Rows[p1.Row][p1.Column] = this.Rows[p0.Row][p0.Column];
		return board;
	}
	toString(): string {
		return this.Rows.toString();
	}
}

function ToMatrix(values, width, height) {
	var matrix = [];

	for (var i = 0; i < height; ++i) {
		var row = [];
		for (var j = 0; j < width; ++j) {
			row.push(values[i * width + j]);
		}
		matrix.push(row);
	}

	return matrix;
}

function RandomBoard(width: number, height: number): Board {
	var values = _.shuffle(_.range(width * height));

	return new Board(ToMatrix(values, width, height), width, height);
}

function FindEmptyCell(board: Board): BoardPosition {
	for (var i = 0; i < board.Width; ++i) {
		var row = board.Rows[i];
		for (var j = 0; j < row.length; ++j) {
			if (row[j] == 0) {
				return new BoardPosition(j, i);
			}
		}
	}
	return null;
}