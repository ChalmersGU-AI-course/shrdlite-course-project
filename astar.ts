///<reference path="lib/jquery.d.ts"/>
///<reference path="europe.ts"/>
///<reference path="Graph.ts"/>
///<reference path="Maze.ts"/>

function init(): void {

    //plot map
    var mapCanvas = document.createElement("canvas");
    mapCanvas.width = 600;
    mapCanvas.height = 513;
    $('#map').append(mapCanvas);
    var mapCtx = mapCanvas.getContext('2d');

    var bild = new Image();
    bild.src = "europe.svg";
    bild.onload = function () { mapCtx.drawImage(bild, 0, 0, mapCanvas.width, mapCanvas.height); };

    for (var n in Europe.Nodes) {
        $('#from').append('<option>' + Europe.Nodes[n].name + '</option>');
        $('#to').append('<option>' + Europe.Nodes[n].name + '</option>');
    }

    var G = new Graph<PointNode, [number, number]>(Europe.Nodes, Europe.Edges);

    $('#route').click(function () {

        var from = $('#from').find(":selected").index();
        var to = $('#to').find(":selected").index();
        var path = G.findPath(from, to);

        if (path != undefined && path.length > 0) {
            var txt = '';
            var startNode: PointNode = Europe.Nodes[path[0][0]];
            txt += startNode.name + ', ';
            
            mapCtx.clearRect(0, 0, 600, 513);
            mapCtx.drawImage(bild, 0, 0, 600, 513);

            mapCtx.beginPath();
            mapCtx.moveTo(startNode.x, startNode.y);

            for (var i in path) {
                txt += Europe.Nodes[path[i][1]].name + ', ';
                mapCtx.lineTo(Europe.Nodes[path[i][1]].x, Europe.Nodes[path[i][1]].y);
            }
            mapCtx.strokeStyle = "black";
            mapCtx.stroke();

            txt = txt.substr(0, txt.length - 2);
            $('#europe-result').text(txt);

            //Draw blobs
            mapCtx.fillStyle = "black";
            mapCtx.beginPath();
            mapCtx.arc(Europe.Nodes[path[0][0]].x, Europe.Nodes[path[0][0]].y, 2, 0, 2 * Math.PI);
            mapCtx.fill();

            for (var i in path) {
                mapCtx.beginPath();
                mapCtx.arc(Europe.Nodes[path[i][1]].x, Europe.Nodes[path[i][1]].y, 2, 0, 2 * Math.PI);
                mapCtx.fill();
            }
        }
        else {
            $('#europe-result').text('No route possible');
        }
    });


    var mazeCanvasWidth = 640;
    var mazeCanvasHeight = 640;

    var mazeCanvas = document.createElement("canvas");
    mazeCanvas.width = mazeCanvasWidth + 1;
    mazeCanvas.height = mazeCanvasHeight + 1;
    $('#maze').append(mazeCanvas);

    var maze = new Maze();

    var mazeGraph: Graph<PointNode, [number, number]> = maze.generateGraph(32, 32, 1024, 0.5); //default values in html code
    var mazeCtx: CanvasRenderingContext2D = mazeCanvas.getContext('2d');
    mazeCtx.translate(0.5, 0.5);
    mazeCtx.msImageSmoothingEnabled = false;
    maze.drawMaze(mazeCtx);

    //Will be set by generateMaze
    var startNode: number = undefined;
    var stopNode: number = undefined;
    var mazeData: ImageData = undefined;
    genereateMaze();


    $('#generate').click(genereateMaze);
    mazeCanvas.addEventListener('mousedown', mazeClick, false);
    mazeCanvas.addEventListener('mousemove', mazeMove, false);

    function genereateMaze(): void {
        var seed: number = $('#seed').val();
        var width: number = $('#width').val();
        var height: number = $('#height').val();
        var balance: number = $('#balance').val();

        mazeGraph = maze.generateGraph(width, height, seed, balance);
        maze.drawMaze(mazeCtx);
        mazeData = mazeCtx.getImageData(0, 0, mazeCanvas.width, mazeCanvas.height);
        startNode = maze.xy2node(Math.floor(maze.width / 2), Math.floor(maze.height / 2));
        stopNode = startNode;
    }

    function mazeClick(e: MouseEvent) {
        var x = e.pageX - mazeCanvas.offsetLeft;
        var y = e.pageY - mazeCanvas.offsetTop;

        var path = mazeGraph.findPath(stopNode, startNode);
        mazeCtx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);
        mazeCtx.putImageData(mazeData, 0, 0);
        maze.drawPath(mazeCtx, path);
        var n = maze.coord2node(x, y);
        if (n != undefined)
            startNode = n;
        $('#maze-result').text('From ' + mazeGraph.Nodes[startNode].name + ' to ' + mazeGraph.Nodes[stopNode].name);
    }

    function mazeMove(e: MouseEvent) {
        var x = e.pageX - mazeCanvas.offsetLeft;
        var y = e.pageY - mazeCanvas.offsetTop;

        var node = maze.coord2node(x, y);
        if (node != undefined && node != stopNode) {
            stopNode = node;
            var path = mazeGraph.findPath(startNode, stopNode);
            mazeCtx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);
            mazeCtx.putImageData(mazeData, 0, 0);
            maze.drawPath(mazeCtx, path);

            $('#maze-result').text('From ' + mazeGraph.Nodes[startNode].name + ' to ' + mazeGraph.Nodes[stopNode].name);
        }
    }

};



$(document).ready(init);