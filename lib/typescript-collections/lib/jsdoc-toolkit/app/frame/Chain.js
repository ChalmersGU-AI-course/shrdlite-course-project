/**@constructor*/
function ChainNode(object, link) {
	this.value = object;
	this.link = link; // describes this endNode's relationship to the previous endNode
}

/**@constructor*/
function Chain(valueLinks) {
	this.nodes = [];
	this.cursor = -1;
	
	if (valueLinks && valueLinks.length > 0) {
		this.push(valueLinks[0], "//");
		for (var i = 1, l = valueLinks.length; i < l; i+=2) {
			this.push(valueLinks[i+1], valueLinks[i]);
		}
	}
}

Chain.prototype.push = function(o, link) {
	if (this.nodes.length > 0 && link) this.nodes.push(new ChainNode(o, link));
	else this.nodes.push(new ChainNode(o));
}

Chain.prototype.unshift = function(o, link) {
	if (this.nodes.length > 0 && link) this.nodes[0].link = link;
	this.nodes.unshift(new ChainNode(o));
	this.cursor++;
}

Chain.prototype.get = function() {
	if (this.cursor < 0 || this.cursor > this.nodes.length-1) return null;
	return this.nodes[this.cursor];
}

Chain.prototype.first = function() {
	this.cursor = 0;
	return this.get();
}

Chain.prototype.last = function() {
	this.cursor = this.nodes.length-1;
	return this.get();
}

Chain.prototype.next = function() {
	this.cursor++;
	return this.get();
}

Chain.prototype.prev = function() {
	this.cursor--;
	return this.get();
}

Chain.prototype.toString = function() {
	var string = "";
	for (var i = 0, l = this.nodes.length; i < l; i++) {
		if (this.nodes[i].link) string += " -("+this.nodes[i].link+")-> ";
		string += this.nodes[i].value.toString();
	}
	return string;
}

Chain.prototype.joinLeft = function() {
	var result = "";
	for (var i = 0, l = this.cursor; i < l; i++) {
		if (result && this.nodes[i].link) result += this.nodes[i].link;
		result += this.nodes[i].value.toString();
	}
	return result;
}


/* USAGE:

var path = "one/two/three.four/five-six";
var pathChain = new Chain(path.split(/([\/.-])/));
print(pathChain);

var lineage = new Chain();
lineage.push("Port");
lineage.push("Les", "son");
lineage.push("Dawn", "daughter");
lineage.unshift("Purdie", "son");

print(lineage);

// walk left
for (var endNode = lineage.last(); endNode !== null; endNode = lineage.prev()) {
	print("< "+endNode.value);
}

// walk right
var endNode = lineage.first()
while (endNode !== null) {
	print(endNode.value);
	endNode = lineage.next();
	if (endNode && endNode.link) print("had a "+endNode.link+" named");
}

*/