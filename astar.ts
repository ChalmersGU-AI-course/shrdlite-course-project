///<reference path="lib/jquery.d.ts"/>
///<reference path="europe.ts"/>
///<reference path="Graph.ts"/>

for (var n in Europe.NodeNames)
{
    $('#from').append('<option>' + Europe.NodeNames[n] + '</option>');
    $('#to').append('<option>' + Europe.NodeNames[n] + '</option>');
}

var G = new Graph(Europe.NoOfNodes, Europe.Edges);

$('#route').click(function () {
    var from = $('#from').find(":selected").index();
    var to = $('#to').find(":selected").index();
    var path = G.findPath(from, to);

    if (path != null)
    {
        $('#result').text('');
        $('#result').append(Europe.NodeNames[path[0][0]] + ' ');
        for (var i in path)
            $('#result').append(Europe.NodeNames[path[i][1]] + ' ');
    }
    else
    {
        $('#result').text('No route possible');
    }


});
