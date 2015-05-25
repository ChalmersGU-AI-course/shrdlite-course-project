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
                for (var i = 0; i < node.state.stacks.length; ++i) {
                    var below = node.state.stacks[i].indexOf(this.intptr.args[1]);
                    var onTop = node.state.stacks[i].indexOf(this.intptr.args[0]);

                    //leftof or rightoff

                    if ((below != -1 || this.intptr.args[1] == 'floor') && onTop != -1 && below + 1 == onTop)
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
            default:
                break;
        }
        return 1;
    }
}