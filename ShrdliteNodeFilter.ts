///<reference path="Graph.ts"/>
///<reference path="World.ts"/>

class ShrdliteNodeFilter implements GraphFilter {
    public constructor(protected intptr: Interpreter.Literal) {

    }
    public costTo(node: ShrdliteNode): number {
        switch (this.intptr.rel) {
            case 'holding':
                if (node.state.holding == this.intptr.args[0]) {
                    return 0;
                }
                else {
                    //Cost is the number of objects above the object to take
                    for (var i = 0; i < node.state.stacks.length; ++i) {
                        var pos = node.state.stacks[i].indexOf(this.intptr.args[0])
                        if (pos != -1)
                            return node.state.stacks[i].length - pos;
                    }
                }
            case 'ontop':
            case 'inside':
                var noOfObjectsAbove = 1; //Must be one (it can hold the object)
                for (var i = 0; i < node.state.stacks.length; ++i) {
                    var below = node.state.stacks[i].indexOf(this.intptr.args[1]);
                    var onTop = node.state.stacks[i].indexOf(this.intptr.args[0]);

                    if ((below != -1 || this.intptr.args[1] == 'floor') && onTop != -1 && below + 1 == onTop)
                        return 0;

                    if (below != -1)
                        noOfObjectsAbove += node.state.stacks.length - below - 1; //-1 because last index is not equally to length (this will not be called if below is the floor)
                    if (onTop != -1)
                        noOfObjectsAbove += node.state.stacks.length - onTop - 1; //Now we want one more for the cost
                }
                return noOfObjectsAbove;
                break;
            case 'above':
                var noOfObjectsAboveTarget = 1; //Must be one
                for (var i = 0; i < node.state.stacks.length; ++i) {
                    var below = node.state.stacks[i].indexOf(this.intptr.args[1]);
                    var onTop = node.state.stacks[i].indexOf(this.intptr.args[0]);

                    if ((below != -1 || this.intptr.args[1] == 'floor') && onTop != -1 && below < onTop)
                        return 0;
                    else if (onTop != -1) {
                        noOfObjectsAbove += node.state.stacks.length - onTop - 1;
                    }
                }
                return 1;
                return noOfObjectsAboveTarget;
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
                    if (i % node.state.rowLength == 0)
                        continue;
                    var leftObject: boolean = node.state.stacks[i - 1].indexOf(this.intptr.args[0]) != -1;
                    var rightObject: boolean = node.state.stacks[i].indexOf(this.intptr.args[1]) != -1;
                    if (leftObject && rightObject)
                        return 0;
                }
                break;
            case 'rightof':
                for (var i = 1; i < node.state.stacks.length; ++i) {
                    if (i % node.state.rowLength == 0)
                        continue;
                    var leftObject: boolean = node.state.stacks[i - 1].indexOf(this.intptr.args[1]) != -1;
                    var rightObject: boolean = node.state.stacks[i].indexOf(this.intptr.args[0]) != -1;
                    if (leftObject && rightObject)
                        return 0;
                }
                break;
            case 'under':
                var noOfObjectsAboveTarget = 1; //Must be one
                for (var i = 0; i < node.state.stacks.length; ++i) {
                    var below = node.state.stacks[i].indexOf(this.intptr.args[0]);
                    var onTop = node.state.stacks[i].indexOf(this.intptr.args[1]);

                    if ((below != -1 || this.intptr.args[0] == 'floor') && onTop != -1 && below < onTop)
                        return 0;
                    else if (onTop != -1)
                        noOfObjectsAbove += node.state.stacks.length - onTop - 1;
                }
                return 1;
                return noOfObjectsAbove;
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
                    for (var k = 0; k < node.state.stacks[i].length; ++k) {
                        var obj = node.state.stacks[i][k];
                        if (this.intptr.args.indexOf(obj) == -1)
                            break;
                        else
                            ++no;
                    }
                    if (no > max)
                        max = no;
                }

                return this.intptr.args.length - max;
                break;
            default:
                throw new Error("I do not know what that is.");
                return 0;
                break;
        }
        return 1;
    }
}