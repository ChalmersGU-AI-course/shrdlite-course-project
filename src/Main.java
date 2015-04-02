import java.util.List;


public class Main {

	public static void main(String[] args) {
		System.out.println("================================================");
		System.out.println("Ex1:");

		//example 1:
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
//		a->b=4	
//		a->c=5
//		c->d=2
//		b->d=6
//		d->f=7
//		e->f=4
//		
		
		GraphNode a = new GraphNode("a",0,0);
		GraphNode b = new GraphNode("b",0,2);
		GraphNode c = new GraphNode("c",2,0);
		GraphNode d = new GraphNode("d",2,2);
		GraphNode e = new GraphNode("e",2,4);
		GraphNode f = new GraphNode("f",4,2);
		
		a.addNeighbors(b, 4);
		a.addNeighbors(c, 5);
		b.addNeighbors(d, 6);
		c.addNeighbors(d, 2);
		d.addNeighbors(f, 7);
		d.addNeighbors(e, 2);
		e.addNeighbors(f, 4);
		
		List<AbstractNode> path = AbstractNode.astar(a,f);
		AbstractNode.printPath(path);
		
//---------------------------------------------------------------------
		System.out.println("\n================================================");
		System.out.println("Ex2:");
		//example 2:
//		
//		   4[    e       
//		   3[  / | \      
//		   2[b   d-->f   
//		   1[|   |    \  
//		   0[̣a-->c---->g  _ _ _
//		     0 1 2 3 4 5 6
//
//Weight on edges:
//
//		a->b=4	
//		a->c=5
//		c->d=2
//		c->g=4
//		b->e=6
//		d->f=7
//		d->e=5
//		e->f=4
//		e->d=5
//		g->f=5
		
		GraphNode a2 = new GraphNode("a2",0,0);
		GraphNode b2 = new GraphNode("b2",0,2);
		GraphNode c2 = new GraphNode("c2",2,0);
		GraphNode d2 = new GraphNode("d2",2,2);
		GraphNode e2 = new GraphNode("e2",2,4);
		GraphNode f2 = new GraphNode("f2",4,2);
		GraphNode g2 = new GraphNode("g2",5,0);
		
		a2.addNeighbors(b2, 4);
		a2.addNeighbors(c2, 5);
		b2.addNeighbors(e2, 6);
		c2.addNeighbors(d2, 2);
		c2.addNeighbors(g2, 4);
		d2.addNeighbors(f2, 7);
		d2.addNeighbors(e2, 5);
		e2.addNeighbors(f2, 4);
		e2.addNeighbors(d2, 5);
		g2.addNeighbors(f2, 5);
		
		List<AbstractNode> path2 = AbstractNode.astar(a2,f2);
		AbstractNode.printPath(path2);
	}

}
