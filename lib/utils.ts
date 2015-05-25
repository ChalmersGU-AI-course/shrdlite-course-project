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
}