import java.util.List;


public class AstarMain  {

	public static void main(String[] args) {

//The example:
//		
//		   4[    e       
//		   3[    | \      
//		   2[b-->d-->f   
//		   1[|   |       
//		   0[̣a-->c _ _ _ _
//		     0 1 2 3 4 5 6
//
//Weight on edges:
//
//		a-b=4	
//		a-c=5
//		c-d=2
//		b-d=6
//		d-f=7
//		e-f=4
//		
		
		Node a = new Node("a",0,0);
		Node b = new Node("b",0,2);
		Node c = new Node("c",2,0);
		Node d = new Node("d",2,2);
		Node e = new Node("e",2,4);
		Node f = new Node("f",4,2);
		
		a.addNeighbors(b, 4);
		a.addNeighbors(c, 5);
		b.addNeighbors(d, 6);
		c.addNeighbors(d, 2);
		d.addNeighbors(f, 7);
		d.addNeighbors(e, 2);
		e.addNeighbors(f, 4);
		
		List<Node> path = Node.astar(a,f);
		Node.printPath(path);
		
		
	}
	
	
	

	
}
