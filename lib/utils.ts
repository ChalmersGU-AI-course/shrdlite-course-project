module utils {
    /**
     * "Pauses" execution for approximately the specified ms, used for debugging purposes.
     * @param milliseconds Milliseconds to pause execution for.
     */
    export function sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    }

    /**
     * Returns a random integer between 0 and max.
     * @param max           Maximum of returned integer.
     * @returns {number}    Integer between 0 and max.
     */
    export function getRandomInt(max) {
        return Math.floor(Math.random() * max);

    }

    export function transpose(arrays) {
        return arrays[0].map(function (_, i) {
            return arrays.map(function (array) {
                return array[i]
            })
        });
    }

    export function permute(input:string[], usedChars:string[], permArr:string[][]) {
        var i:number, ch:string;
        for (i = 0; i < input.length; i++) {
            ch = input.splice(i, 1)[0];
            usedChars.push(ch);
            if (input.length == 0) {
                permArr.push(usedChars.slice());
            }
            permute(input, usedChars, permArr);
            input.splice(i, 0, ch);
            usedChars.pop();
        }
        return permArr;
    }

}