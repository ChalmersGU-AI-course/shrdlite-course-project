public class graphNode extends AbstractNode {

	private final int x, y;
	
	public graphNode(String name, int x, int y) {
		super(name);
		
		this.x = x;
		this.y = y;
		
	}
	
	private int getY() {
		return y;
	}

	private int getX() {
		return x;
	}
	
	public static double heuristic(graphNode n1, graphNode n2) {
		return (int) Math.sqrt( Math.pow(n1.getX()-n2.getX(), 2) + 
					 			Math.pow(n1.getY()-n2.getY(), 2));
	}

	@Override
	public boolean equals(Object n) {
		return this.x == ((graphNode)n).getX() && this.y == ((graphNode)n).getY(); 
	}

	@Override
	public int heuristic(AbstractNode n2) {
		return (int) Math.sqrt(Math.pow((this.getX()-((graphNode) n2).getX()), 2)+Math.pow((this.getY()-((graphNode) n2).getY()), 2));
	}



}
