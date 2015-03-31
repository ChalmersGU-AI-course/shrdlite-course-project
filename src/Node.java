import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;


public class Node implements Comparable<Node>{
	private final String name;
	private final int x, y;
	private int fcost, gcost;
	private Node parent; // Previous node in the graph when using the algorithm
	private Map<Node, Integer> neighbors;
	
	public Node(String name, int x, int y){
		this.name = name;
		this.x = x;
		this.y = y;
		this.gcost = Integer.MAX_VALUE; //Initialize to make the algorithm work
		this.neighbors = new HashMap<Node, Integer>(); //Neighbors of the node
	}

	
	/*
	 * A* algorithm (a formal description can be found at http://en.wikipedia.org/wiki/A*_search_algorithm)
	 * 
	 * @start The start node
	 * @goal The end node
	 * @return The list of node that represents the path
	 * 
	 */
	public static List<Node> astar(Node start, Node goal){
		Set<Node> openset, closedset;
		openset = new HashSet<Node>();
		openset.add(start);
		
		start.setGcost(0);
		start.setFcost(start.getGcost() + heuristic(start, goal));
		closedset = new HashSet<Node>();
		
		while(!openset.isEmpty()){
			Node current = minFcost(openset);
			
//			DEBUG: who´s the minFcost
//			System.out.println("=============");
//			System.out.println("min F="+current);
//			END_DEBUG
//			
			if(current.equals(goal)){
				return Node.reconstructPath(start, goal);
			}
			openset.remove(current);
			
			closedset.add(current);
			for(Node n : current.getNeighbors()){
				if(closedset.contains(n)){
					continue;
				}
				int tmpGCost = current.getGcost() + current.distanceToNode(n);
				
				if(!openset.contains(n) || tmpGCost < n.getGcost()){
					n.setParent(current);
					n.setGcost(tmpGCost);
					n.setFcost(n.getGcost() + heuristic(n, goal));
					if(!openset.contains(n)){
						openset.add(n);
					}
				}
			}
//			DEBUG: Info about the openset
//
//			for(Node n: openset){
//				System.out.println("-----------");
//				System.out.println(n);
//				System.out.println("parent="+n.getParent());
//				System.out.println("g="+n.getGcost());
//				System.out.println("f="+n.getFcost());
//			}
//			END_DEBUG
		}
		return new LinkedList<Node>();
	}
	

	/*
	 * Example of heuristic: Euclidean distance
	 * 
	 * @n1 node 1
	 * @n2 node 2
	 * @return Euclidean distance between the two nodes
	 */
	public static int heuristic(Node n1, Node n2){
		return (int) Math.sqrt(Math.pow((n1.getX()-n2.getX()), 2)+Math.pow((n1.getY()-n2.getY()), 2));
	}

	/*
	 * Prints the path taken
	 * 
	 * @path the path
	 * @return
	 */
	public static void printPath(List<Node> path) {
		System.out.println("Path: ");
		for(Node n: path){
			System.out.print("->"+n);
		}
		
	}
	
	/*
	 * Reconstruct the path from the start to goal node.
	 * Take the parent of current node, add itself to the list and\
	 * then repeat with "current" as the parent until "current" is the start node.
	 * 
	 */
	public static List<Node> reconstructPath(Node start, Node goal){
		List<Node> path = new LinkedList<Node>();
		Node current = goal;
		while(current != start){
			path.add(0, current);
			current = current.parent;
		}
		path.add(0, start);

		return path;
	}
	
	/*
	 * Returns the element in @openset that has the least fcost
	 */
	public static Node minFcost(Set<Node> openset) {
		return (Node)(Collections.min(openset));
	}
	
	//GETTERS AND SETTERS
	
	public String getName() {
		return name;
	}


	public int getX() {
		return x;
	}


	public int getY() {
		return y;
	}


	public int getFcost() {
		return fcost;
	}

	public void setFcost(int fcost) {
		this.fcost = fcost;
	}

	public int getGcost() {
		return gcost;
	}

	public void setGcost(int gcost) {
		this.gcost = gcost;
	}

	public Node getParent() {
		return parent;
	}

	public void setParent(Node parent) {
		this.parent = parent;
	}

	public Set<Node> getNeighbors() {
		return neighbors.keySet();
	}
	
	public Integer distanceToNode(Node n){
		return neighbors.get(n);
	}

	public void addNeighbors(Node neighbour, Integer distances) {
		neighbors.put(neighbour, distances);
	}

	//END OF GETTERS AND SETTERS


	@Override
	public int compareTo(Node o) {
		if(fcost < o.fcost){
			return -1;
		}else if(fcost > o.fcost){
			return 1;
		}else{
			return 0;
		}
	}
	
	@Override
	public boolean equals(Object n) {
		return this.x == ((Node)n).getX() && this.y == ((Node)n).getY(); 
	}
	
	@Override
	public String toString() {
		return name;
	}
	
}
