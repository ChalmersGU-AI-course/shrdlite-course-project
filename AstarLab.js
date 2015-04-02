///<reference path="Astar.ts"/>
var BoardPosition = (function () {
    function BoardPosition(Column, Row) {
        this.Column = Column;
        this.Row = Row;
    }
    return BoardPosition;
})();
var Board = (function () {
    function Board(Rows, Width, Height) {
        this.Rows = Rows;
        this.Width = Width;
        this.Height = Height;
    }
    Board.prototype.TargetRow = function (num) {
        return Math.floor(num / this.Width);
    };
    Board.prototype.TargetColumn = function (num) {
        return num % this.Width;
    };
    Board.prototype.Clone = function () {
        var rows = this.Rows.slice();
        for (var i = 0; i < rows.length; ++i) {
            rows[i] = rows[i].slice();
        }
        return new Board(rows, this.Width, this.Height);
    };
    Board.prototype.Swap = function (p0, p1) {
        var board = this.Clone();
        board.Rows[p0.Row][p0.Column] = this.Rows[p1.Row][p1.Column];
        board.Rows[p1.Row][p1.Column] = this.Rows[p0.Row][p0.Column];
        return board;
    };
    Board.prototype.Neighbours = function () {
        var emptyCell = FindEmptyCell(this);
        var result = [];
        if (emptyCell.Row > 0) {
            result.push(new Neighbour(this.Swap(emptyCell, new BoardPosition(emptyCell.Column, emptyCell.Row - 1)), 1));
        }
        if (emptyCell.Row < this.Height - 1) {
            result.push(new Neighbour(this.Swap(emptyCell, new BoardPosition(emptyCell.Column, emptyCell.Row + 1)), 1));
        }
        if (emptyCell.Column > 0) {
            result.push(new Neighbour(this.Swap(emptyCell, new BoardPosition(emptyCell.Column - 1, emptyCell.Row)), 1));
        }
        if (emptyCell.Column < this.Width - 1) {
            result.push(new Neighbour(this.Swap(emptyCell, new BoardPosition(emptyCell.Column + 1, emptyCell.Row)), 1));
        }
        return result;
    };
    Board.prototype.toString = function () {
        return this.Rows.toString();
    };
    return Board;
})();
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
function RandomBoard(width, height) {
    var board = new Board(ToMatrix(_.range(width * height), width, height), width, height);
    for (var i = 0; i < 5000; ++i) {
        var neighbours = board.Neighbours();
        var rnd = Math.floor(Math.random() * neighbours.length);
        board = neighbours[rnd].Node;
    }
    return board;
}
function IsGoalBoard(board) {
    var target = 0;
    for (var i = 0; i < board.Rows.length; ++i) {
        var row = board.Rows[i];
        for (var j = 0; j < row.length; ++j) {
            if (row[j] != target++) {
                return false;
            }
        }
    }
    return true;
}
function FindEmptyCell(board) {
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
function TotalManhattanDistance(fromBoard, board) {
    var distance = 0;
    for (var i = 0; i < board.Rows.length; ++i) {
        var row = board.Rows[i];
        for (var j = 0; j < row.length; ++j) {
            var num = row[j];
            if (num == 0) {
                continue;
            }
            var targetRow = board.TargetRow(num);
            var targetColumn = board.TargetColumn(num);
            distance += Math.abs(targetRow - i) + Math.abs(targetColumn - j);
        }
    }
    return distance;
}
function NumBricksOutOfPlace(fromBoard, board) {
    var matchedArray = _.zip(_.range(1, board.Width * board.Height - 1), _.rest(_.flatten(board.Rows)));
    var count = _.countBy(matchedArray, function (item) {
        return String(item[0] === item[1]);
    });
    return count['false'];
}
