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

    var canv2 = document.createElement("canvas");
    canv2.width = 1030;
    canv2.height = 1030;
    $('#maze').append(canv2);
    var ctx2 = canv2.getContext('2d');

    var bild = new Image();
    bild.src = "europe.svg";
    bild.onload = function () { ctx.drawImage(bild, 0, 0, 600, 513); };

    for (var n in Europe.Nodes) {
        $('#from').append('<option>' + Europe.Nodes[n].name + '</option>');
        $('#to').append('<option>' + Europe.Nodes[n].name + '</option>');
    }

    var G = new Graph(Europe.Nodes, Europe.Edges);
    var M = new Maze(32, 32);

    var ME = M.getEdges(1);

    ctx2.lineWidth = 1;

    for (var x = 0; x <= 32; ++x) {
        ctx2.beginPath();
        ctx2.moveTo(x * 32, 0);
        ctx2.lineTo(x * 32, 32 * 32);
        ctx2.strokeStyle = "black";
        ctx2.stroke();
    }

    for (var y = 0; y <= 32; ++y) {
        ctx2.beginPath();
        ctx2.moveTo(0, y * 32);
        ctx2.lineTo(32 * 32, y * 32);
        ctx2.strokeStyle = "black";
        ctx2.stroke();
    }

    ctx2.lineWidth = 2;

    for (var x = 0; x < 32; ++x) {
        for (var y = 0; y < 32; ++y) {
            var nodeNo: number = M.xy2node(x, y);

            var edges: [number, number][] = ME[nodeNo];
            for (var i = 0; i < edges.length; ++i) {
                var e = edges[i];
                var c = M.node2xy(e[1]);

                if (c[0] > x) {
                    ctx2.beginPath();
                    ctx2.moveTo(x * 32 + 32, y * 32 + 1);
                    ctx2.lineTo(x * 32 + 32, y * 32 + 32 - 1);
                    ctx2.strokeStyle = "white";
                    ctx2.stroke();
                }
                if (c[0] < x) {
                    ctx2.beginPath();
                    ctx2.moveTo(x * 32, y * 32 + 1);
                    ctx2.lineTo(x * 32, y * 32 + 32 - 1);
                    
                    ctx2.strokeStyle = "white";
                    ctx2.stroke();
                }
                if (c[1] < y) {
                    ctx2.beginPath();
                    ctx2.moveTo(x * 32 + 1, y * 32);
                    ctx2.lineTo(x * 32 + 32 - 1, y * 32);
                    ctx2.strokeStyle = "white";
                    ctx2.stroke();
                }
                if (c[1] > y) {
                    ctx2.beginPath();
                    ctx2.moveTo(x * 32 + 1, y * 32 + 32);
                    ctx2.lineTo(x * 32 + 32 - 1, y * 32 + 32);
                    ctx2.strokeStyle = "white";
                    ctx2.stroke();
                }
            }
        }
    }

    $('#route').click(function () {
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