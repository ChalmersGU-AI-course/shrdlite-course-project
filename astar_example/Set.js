
    function Set() {
        this.items = [];
    }
    Set.prototype.add = function (item) {
        if (this.has(item))
            throw "Duplicate item";
        this.items.push(item);
    };
    Set.prototype.delete = function (item) {
        var index = this.items.indexOf(item);
        if (index > -1)
            this.items.splice(index, 1);
    };
    Set.prototype.has = function (item) {
        return this.items.indexOf(item) > -1;
    };
    Set.prototype.size = function () {
        return this.items.length;
    };
    Set.prototype.toArray = function () {
        return this.items.slice(0);
    };

