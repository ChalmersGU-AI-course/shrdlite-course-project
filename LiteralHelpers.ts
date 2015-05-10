///<reference path="Interpreter.ts"/>

module LiteralHelpers {

    export function isLiteralFullfilled(lit: Interpreter.Literal, state: WorldState): boolean {
        if (lit.rel == "ontop" || lit.rel == "inside") {
            return LiteralHelpers.checkOntopLiteral(lit, state);
        }
        if (lit.rel == "holding") {
            return checkHoldingLiteral(lit, state);
        }
        if (lit.rel == "under") {
            //TODO: return checkUnderLiteral(lit, state);
        }
        if (lit.rel == "beside") {
            //TODO: return checkBesideLiteral(lit, state);
        }
        if (lit.rel == "above") {
            //TODO: return checkAboveLiteral(lit, state);
        }
        return false;
    }

    function checkOntopLiteral(lit: Interpreter.Literal, state: WorldState): boolean {
        var on = lit.args[0];
        var under = lit.args[1];

        // check all stacks
        for (var i = 0; i < state.stacks.length; ++i) {
            var stack = state.stacks[i];

            // if stack contains items
            if (stack) {
                var position = stack.indexOf(on);
                // item on floor
                if (position == 0 && under == "floor") {
                    return true;
                }
                // item on top of other item
                if (position > 0) {
                    var positionUnder = stack.indexOf(under);
                    if (positionUnder == position - 1) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    function checkHoldingLiteral(lit: Interpreter.Literal, state: WorldState): boolean {
        return state.holding == lit.args[0];
    }
}