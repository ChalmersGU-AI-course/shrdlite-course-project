public class GraphNode extends AbstractNode {

	private final int x, y;
	
	public GraphNode(String name, int x, int y) {
		super(name);
		
		this.x = x;
		this.y = y;
		
	}
	
	/**
	 * Euclidean distance
	 * 
	 * @see AbstractNode#heuristic(AbstractNode)
	 */
	@Override
	public int heuristic(AbstractNode n2) {
		return (int) Math.sqrt(Math.pow((this.getX()-((GraphNode) n2).getX()), 2)+Math.pow((this.getY()-((GraphNode) n2).getY()), 2));
	}

	@Override
	public boolean equals(Object n) {
		return this.x == ((GraphNode)n).getX() && this.y == ((GraphNode)n).getY(); 
	}

	
	// GETTERS AND SETTERS
	private int getY() {
		return y;
	}

	private int getX() {
		return x;
	}
	// END OF GETTERS AND SETTERS
}
