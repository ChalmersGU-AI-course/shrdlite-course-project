import java.util.List;


public class Main {

	public static void main(String[] args) {
		graphNode a = new graphNode("a",0,0);
		graphNode b = new graphNode("b",0,2);
		graphNode c = new graphNode("c",2,0);
		graphNode d = new graphNode("d",2,2);
		graphNode e = new graphNode("e",2,4);
		graphNode f = new graphNode("f",4,2);
		
		a.addNeighbors(b, 4);
		a.addNeighbors(c, 5);
		b.addNeighbors(d, 6);
		c.addNeighbors(d, 2);
		d.addNeighbors(f, 7);
		d.addNeighbors(e, 2);
		e.addNeighbors(f, 4);
		
		List<AbstractNode> path = AbstractNode.astar(a,f);
		AbstractNode.printPath(path);
	}

}
