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





    var width = 2;
    var height = 2;

    var canvas_width = 1024;
    var canvas_height = 1024;

    var grid_size = Math.min(canvas_width / width, canvas_height / height);

    var grid_width = grid_size * width;
    var grid_height = grid_size * height;

    var canv2 = document.createElement("canvas");
    canv2.width = canvas_width + 1;
    canv2.height = canvas_height + 1;
    $('#maze').append(canv2);
    var ctx2 = canv2.getContext('2d');

    var M = new Maze(width, height);

    var ME = M.getEdges(1);
    var MN = M.getNodes();

    var GM = new Graph(MN, ME);



    ctx2.lineWidth = 1;
    ctx2.shadowBlur = 1;

    ctx2.strokeStyle = "black";
    for (var x = 0; x <= width; ++x) {
        ctx2.beginPath();
        ctx2.moveTo(x * grid_size, 0);
        ctx2.lineTo(x * grid_size, grid_height);
        ctx2.stroke();
    }

    for (var y = 0; y <= height; ++y) {
        ctx2.beginPath();
        ctx2.moveTo(0, y * grid_size);
        ctx2.lineTo(grid_width, y * grid_size);
        ctx2.stroke();
    }
    
    ctx2.strokeStyle = "white";
    ctx2.lineWidth = 2;
    for (var x = 0; x < width; ++x) {
        for (var y = 0; y < height; ++y) {
            var nodeNo: number = M.xy2node(x, y);

            var edges: [number, number][] = ME[nodeNo];
            for (var i = 0; i < edges.length; ++i) {
                var e = edges[i];
                var c = M.node2xy(e[1]);

                if (c[0] > x) {
                    ctx2.beginPath();
                    ctx2.moveTo((x + 1) * grid_size, y * grid_size + 1);
                    ctx2.lineTo((x + 1) * grid_size, (y + 1) * grid_size - 1);
                    ctx2.stroke();
                }
                if (c[0] < x) {
                    ctx2.beginPath();
                    ctx2.moveTo(x * grid_size, y * grid_size + 1);
                    ctx2.lineTo(x * grid_size, (y + 1) * grid_size - 1);
                    ctx2.stroke();
                }
                if (c[1] < y) {
                    ctx2.beginPath();
                    ctx2.moveTo(x * grid_size + 1, y * 32);
                    ctx2.lineTo((x + 1) * grid_size - 1, y * 32);
                    ctx2.stroke();
                }
                if (c[1] > y) {
                    ctx2.beginPath();
                    ctx2.moveTo(x * grid_size + 1, (y + 1) * grid_size);
                    ctx2.lineTo((x + 1) * grid_size - 1, (y + 1) * grid_size);
                    ctx2.stroke();
                }
            }
        }
    }


    $('#route').click(function () {
        GM.findPath(0, MN.length - 1);

        var from = $('#from').find(":selected").index();
        var to = $('#to').find(":selected").index();
        var path = G.findPath(from, to);

        if (path != undefined) {
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
};

$(document).ready(init);