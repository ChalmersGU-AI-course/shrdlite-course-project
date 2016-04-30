///<reference path="lib/collections.ts"/>
///<reference path="lib/node.d.ts"/>

/** Graph module
*
*  Types for generic A\* implementation.
*
*  *NB.* The only part of this module
*  that you should change is the `aStarSearch` function. Everything
*  else should be used as-is.
*/

/** An edge in a graph. */
class Edge<Node> {
    from : Node;
    to   : Node;
    cost : number;
}

/** A directed graph. */
interface Graph<Node> {
    /** Computes the edges that leave from a node. */
    outgoingEdges(node : Node) : Edge<Node>[];
    /** A function that compares nodes. */
    compareNodes : collections.ICompareFunction<Node>;
}

/** Type that reports the result of a search. */
class SearchResult<Node> {
    /** The path (sequence of Nodes) found by the search algorithm. */
    path : Node[];
    /** The total cost of the path. */
    cost : number;
}

/**
* A\* search implementation, parameterised by a `Node` type.
*
* @param graph The graph on which to perform A\* search.
* @param start The initial node.
* @param goal A function that returns true when given a goal node. Used to determine if the algorithm has reached the goal.
* @param heuristics The heuristic function. Used to estimate the cost of reaching the goal from a given Node.
* @param timeout Maximum time (in seconds) to spend performing A\* search.
* @returns A search result, which contains the path from `start` to a node satisfying `goal` and the cost of this path.
*/
function aStarSearch<Node> (
    graph      : Graph<Node>,
    start      : Node,
    goal       : (n:Node) => boolean,
    heuristics : (n:Node) => number,
    timeout    : number
) : SearchResult<Node> {
    const eqFun = collections.compareToEquals( graph.compareNodes );

    const cameFrom : collections.Dictionary<Node, Edge<Node>> =
        new collections.Dictionary<Node, Edge<Node>>();

    const gScore : collections.Dictionary<Node, number> =
        new collections.Dictionary<Node, number>();
    gScore.setValue( start, 0 );

    const fScore : collections.Dictionary<Node, number> =
        new collections.Dictionary<Node, number>();
    fScore.setValue( start, heuristics( start ) );

    const getGScore = (n: Node) : number => {
        return gScore.getValue( n ) || 100000000;
    }
    const getFScore = (n: Node) : number => {
        return fScore.getValue( n );
    }

    // Ordered by lowest fScore first.
    const lowestFScore = (a: Node, b: Node) : number => {
        return getFScore( b ) - getFScore( a );
    };

    let closedSet : collections.Set<Node> = new collections.Set<Node>();

    let openSet   : collections.PriorityQueue<Node> =
        new collections.PriorityQueue<Node>( lowestFScore );
    openSet.add( start );

    while ( !openSet.isEmpty() ) {
        const current = openSet.dequeue();

        if ( goal( current ) ) return createResult( current, cameFrom );

        closedSet.add( current );

        const neigboors: Edge<Node>[] = graph.outgoingEdges( current );
        for ( let ne of neigboors ) {
            const to = ne.to;
            if ( closedSet.contains( to ) ) continue;

            const tentative_gScore = getGScore( current ) + ne.cost;
            const ne_gScore = getGScore( to );

            if ( !openSet.contains( to ) ) openSet.add( to );
            else if ( tentative_gScore >= ne_gScore ) continue

            cameFrom.setValue( to, ne );
            gScore.setValue( to, tentative_gScore );
            fScore.setValue( to, ne_gScore + heuristics( to ) )
        }
    }

    return null;
}

function createResult<Node>(
    current: Node,
    cameFrom: collections.Dictionary<Node, Edge<Node>> )
    : SearchResult<Node> {
    const result = {
        path: [current],
        cost: 0
    };

    let curr = current;
    while ( cameFrom.containsKey( curr ) ) {
        const edge = cameFrom.getValue( curr );
        curr = edge.from;
        result.cost += edge.cost;
        result.path.unshift( curr );
    }

    console.log( "reached goal!" );
    console.log( "result path is:" + result.path );
    console.log( "result cost is:" + result.cost );

    return result;
}

class Entry<K, V> {
    public key: K;
    public val: V;
    public constructor(k: K, v: V) {
        this.key = k;
        this.val = v;
    }
}

// Naive map implementation:
class Map<K, V>{
    private entries: Entry<K, V>[] = [];
    private eqFun : collections.IEqualsFunction<K>;

    constructor(eqFun: collections.IEqualsFunction<K>) {
        this.eqFun = eqFun;
    }

    getValue(k: K): V {
        const i = this.indexOf( k );
        return i === -1 ? undefined : this.entries[i].val;
    }

    containsKey(k: K): boolean {
        return this.indexOf( k ) !== -1;
    }

    setValue(k: K, v: V): V {
        const i = this.indexOf( k );
        if ( i === undefined ) {
            this.entries.push( new Entry( k, v ) );
            return undefined;
        } else {
            const curr = this.entries[i].val;
            this.entries[i].val = v;
            return curr;
        }
    }

    indexOf(k: K): number {
        for (let i = this.entries.length - 1; i >= 0; i--)
            if ( this.eqFun( k, this.entries[i].key ) ) return i;

        return -1;
    }
}

// Naive set implementation:
class Set<T>{
    private elems : T[] = [];
    private eqFun : collections.IEqualsFunction<T>;

    constructor(eqFun: collections.IEqualsFunction<T>) {
        this.eqFun = eqFun
    }

    contains(elem: T): boolean {
        return collections.arrays.contains( this.elems, elem, this.eqFun );
    }

    add(elem: T): boolean {
        if (this.contains(elem)) return false;
        this.elems.push(elem);
        return true;
    }

    remove(elem: T): boolean {
        return collections.arrays.remove(this.elems, elem, this.eqFun);
    }

    forEach(callback: collections.ILoopFunction<T>): void {
        collections.arrays.forEach(this.elems, callback);
    }

    toArray(): T[] { return this.elems; }

    isEmpty(): boolean { return this.size() === 0; }

    size(): number { return this.elems.length; }

    clear(): void { this.elems = []; }

    toString(): string {
        return collections.arrays.toString(this.elems);
    }
}