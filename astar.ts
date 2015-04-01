///<reference path="lib/jquery.d.ts"/>
///<reference path="europe.ts"/>
///<reference path="Graph.ts"/>
///<reference path="Maze.ts"/>

function init(): void {

    //plot map
    var canv = document.createElement("canvas");
    canv.width = 600;
    canv.height = 513;
    $('#map').append(canv);
    var ctx = canv.getContext('2d');

    var bild = new Image();
    bild.src = "europe.svg";
    bild.onload = function () { ctx.drawImage(bild, 0, 0, 600, 513); };

    for (var n in Europe.Nodes) {
        $('#from').append('<option>' + Europe.Nodes[n].name + '</option>');
        $('#to').append('<option>' + Europe.Nodes[n].name + '</option>');
    }

    var G = new Graph(Europe.Nodes, Europe.Edges);

    $('#route').click(function () {

        var from = $('#from').find(":selected").index();
        var to = $('#to').find(":selected").index();
        var path = G.findPath(from, to);

        if (path != undefined && path.length > 0) {
            $('#result').text('');
            var startNode: GraphNode = Europe.Nodes[path[0][0]];
            $('#result').append(startNode.name + ' ');

            ctx.clearRect(0, 0, 600, 513);
            ctx.drawImage(bild, 0, 0, 600, 513);

            ctx.beginPath();
            ctx.moveTo(startNode.x, startNode.y);

            for (var i in path) {
                $('#result').append(Europe.Nodes[path[i][1]].name + ' ');
                ctx.lineTo(Europe.Nodes[path[i][1]].x, Europe.Nodes[path[i][1]].y);
            }
            ctx.strokeStyle = "black";
            ctx.stroke();
        }
        else {
            $('#result').text('No route possible');
        }
    });


    var mazeCanvasWidth = 640;
    var mazeCanvasHeight = 640;

    var mazeCanvas = document.createElement("canvas");
    mazeCanvas.width = mazeCanvasWidth + 1;
    mazeCanvas.height = mazeCanvasHeight + 1;
    $('#maze').append(mazeCanvas);

    var maze = new Maze();

    var mazeGraph: Graph = maze.generateGraph(32, 32, 1024, 0.5); //default values in html code
    var mazeCtx: CanvasRenderingContext2D = mazeCanvas.getContext('2d');
    maze.drawMaze(mazeCtx);

    var startNode = maze.xy2node(Math.floor(maze.width / 2), Math.floor(maze.height / 2));
    var stopNode = startNode;

    $('#generate').click(function () {
        var seed: number = $('#seed').val();
        var width: number = $('#width').val();
        var height: number = $('#height').val();
        var balance: number = $('#balance').val();

        mazeGraph = maze.generateGraph(width, height, seed, balance);
        maze.drawMaze(mazeCtx);
        startNode = maze.xy2node(Math.floor(maze.width / 2), Math.floor(maze.height / 2));
        stopNode = startNode;
    });

    mazeCanvas.addEventListener('mousedown', mazeClick, false);
    mazeCanvas.addEventListener('mousemove', mazeMove, false);

    function mazeClick(e: MouseEvent) {
        var x = e.pageX - mazeCanvas.offsetLeft;
        var y = e.pageY - mazeCanvas.offsetTop;

        var path = mazeGraph.findPath(stopNode, startNode);
        maze.drawMaze(mazeCtx);
        maze.drawPath(mazeCtx, path);
        var n = maze.coord2node(x, y);
        if (n != undefined)
            startNode = n;
    }

    function mazeMove(e: MouseEvent) {
        var x = e.pageX - mazeCanvas.offsetLeft;
        var y = e.pageY - mazeCanvas.offsetTop;

        var node = maze.coord2node(x, y);
        if (node != undefined && node != stopNode) {
            stopNode = node;
            var path = mazeGraph.findPath(startNode, stopNode);
            maze.drawMaze(mazeCtx);
            maze.drawPath(mazeCtx, path);
        }
    }
    
};



$(document).ready(init);