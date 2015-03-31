public class graphNode extends AbstractNode {

	private final int x, y;
	
	public graphNode(String name, int x, int y) {
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
		return (int) Math.sqrt(Math.pow((this.getX()-((graphNode) n2).getX()), 2)+Math.pow((this.getY()-((graphNode) n2).getY()), 2));
	}

	@Override
	public boolean equals(Object n) {
		return this.x == ((graphNode)n).getX() && this.y == ((graphNode)n).getY(); 
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
