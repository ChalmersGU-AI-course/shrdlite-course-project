///<reference path="Graph.ts"/>
///<reference path="World.ts"/>

class ShrdliteNodeFilter implements GraphFilter {
    public constructor(protected intptr: Interpreter.Literal) {

    }
    public costTo(node: ShrdliteNode): number {
        switch (this.intptr.rel) {
            case 'holding':
                if (node.state.holding == this.intptr.args[0])
                    return 0;
                break;
            case 'ontop':
            case 'inside':
                for (var i = 0; i < node.state.stacks.length; ++i) {
                    var below = node.state.stacks[i].indexOf(this.intptr.args[1]);
                    var onTop = node.state.stacks[i].indexOf(this.intptr.args[0]);

                    if ((below != -1 || this.intptr.args[1] == 'floor') && onTop != -1 && below + 1 == onTop)
                        return 0;
                }
                break;
            case 'above':
                for (var i = 0; i < node.state.stacks.length; ++i) {
                    var below = node.state.stacks[i].indexOf(this.intptr.args[1]);
                    var onTop = node.state.stacks[i].indexOf(this.intptr.args[1]);

                    if ((below != -1 || this.intptr.args[1] == 'floor') && onTop != -1 && below < onTop)
                        return 0;
                }
                break;
            case 'beside':
                for (var i = 1; i < node.state.stacks.length; ++i) {

                    var arg0 = this.intptr.args[0];
                    var arg1 = this.intptr.args[1];

                    var obj11 = node.state.stacks[i-1].indexOf(arg0);
                    var obj21 = node.state.stacks[i].indexOf(arg1);

                    var obj12 = node.state.stacks[i - 1].indexOf(arg1);
                    var obj22 = node.state.stacks[i].indexOf(arg0);


                    //leftof or rightoff

                    if ((obj11 != -1 && obj21 != -1) || (obj12 != -1 && obj22 != -1))
                        return 0;
                }
                break;
            case 'leftof':
                for (var i = 1; i < node.state.stacks.length; ++i) {
                    var leftObject: boolean = node.state.stacks[i - 1].indexOf(this.intptr.args[0]) != -1;
                    var rightObject: boolean = node.state.stacks[i].indexOf(this.intptr.args[1]) != -1;
                    if (leftObject && rightObject)
                        return 0;
                }
                break;
            case 'rightof':
                for (var i = 1; i < node.state.stacks.length; ++i) {
                    var leftObject: boolean = node.state.stacks[i - 1].indexOf(this.intptr.args[1]) != -1;
                    var rightObject: boolean = node.state.stacks[i].indexOf(this.intptr.args[0]) != -1;
                    if (leftObject && rightObject)
                        return 0;
                }
                break;
            case 'under':
                for (var i = 0; i < node.state.stacks.length; ++i) {
                    var below = node.state.stacks[i].indexOf(this.intptr.args[1]);
                    var onTop = node.state.stacks[i].indexOf(this.intptr.args[1]);

                    if ((below != -1 || this.intptr.args[1] == 'floor') && onTop != -1 && below < onTop)
                        return 0;
                }
                break;
            case 'infront':
                for (var i = node.state.rowLength; i < node.state.stacks.length; ++i) {
                    var behind = node.state.stacks[i].indexOf(this.intptr.args[1]);
                    var infront = node.state.stacks[i - + node.state.rowLength].indexOf(this.intptr.args[0]);

                    if (infront != -1 && behind != -1)
                        return 0;
                }
                break;
            case 'behind':
                for (var i = node.state.rowLength; i < node.state.stacks.length; ++i) {
                    var behind = node.state.stacks[i].indexOf(this.intptr.args[0]);
                    var infront = node.state.stacks[i - + node.state.rowLength].indexOf(this.intptr.args[1]);

                    if (infront != -1 && behind != -1)
                        return 0;
                }
                break;
            case 'stack':
                var max = 0;
                for (var i = 0; i < node.state.stacks.length; ++i) {
                    var no = 0;
                    for (var j = 0; j < this.intptr.args.length; ++j)
                        if (node.state.stacks[i].indexOf(this.intptr.args[j]) != -1)
                            ++no;
                    if (no > max)
                        max = no;
                }
                return this.intptr.args.length - max;
                break;
            default:
                alert('no');
                return 0;
                break;
        }
        return 1;
    }
}