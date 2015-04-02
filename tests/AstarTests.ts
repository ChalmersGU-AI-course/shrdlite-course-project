///<reference path="../Astar.ts"/>
///<reference path="../lib/mocha.d.ts"/>
///<reference path="../lib/chai.d.ts"/>

var assert = chai.assert;

class TestNode implements INode<TestNode> {
    constructor (
        public x : number,
        public y : number,
        public neighbours : Neighbour<TestNode>[]
    ) {}
    Neighbours(): Neighbour<TestNode>[] {
        return this.neighbours;
    }
    toString(): string {
    	return this.x + ":" + this.y;
    }
}


describe('Astar', function() {
    it('Create a simple graph and test Astar on it', function(){
        /* Rough scetch

            n2---10---n3
            |          \
            |           \
            |        n4  10
            10     --/ \  \
            |    /      \  \
            | --10       7  \
            |/            \ /
            n1             t
        */
        var target : TestNode = new TestNode(15, 1, []);
        var n4 : TestNode = new TestNode(10, 5, [new Neighbour<TestNode>(target, 7)]);
        var n3 : TestNode = new TestNode(10, 10, [new Neighbour<TestNode>(target, 10)]);
        var n2 : TestNode = new TestNode(1, 10, [new Neighbour<TestNode>(n3, 10)]);
        var n1 : TestNode = new TestNode(1, 1, [new Neighbour<TestNode>(n2, 10),
                                 new Neighbour<TestNode>(n4, 10)]);

        assert.equal(n1.Neighbours().length, 2);
        assert.equal(n1.Neighbours()[0].Node, n2)

        var TestGoalFunc : GoalFunction<TestNode> = function(node: TestNode) {
            return node == target;
        };

        assert.isTrue(TestGoalFunc(n3.Neighbours()[0].Node));
        var TestHeuristicFunc : HeuristicFunction<TestNode> = function(nodeFrom: TestNode, nodeTo: TestNode){
            var x : number = nodeTo.x - nodeFrom.x;
            var y : number = nodeTo.y - nodeFrom.y;
            var r : number = Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
            return r;
        }
        assert.equal(TestHeuristicFunc(n1, target), 14);
        var result : AstarResult<INode<TestNode>> = Astar<TestNode>(n1, TestGoalFunc, TestHeuristicFunc);
        assert.equal(result.Path.Cost, 17);
        //TODO: test if entire path is correct, complicated now due to type strangeness,
        // result.Path.Nodes has type INode<TestNode>[] and each element has no x and y 
        // properties according to TypeScript
        // inspecing result in developer tools in browser after console.log(result) 
        // shows that they are the same and that the elements indeed have thos properties
        // Gotta love TypeScript and JavaScript 
    });
});