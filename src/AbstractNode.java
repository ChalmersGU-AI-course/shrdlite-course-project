import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;


public abstract class AbstractNode implements Comparable<AbstractNode>{
        private final String name;
        private double fcost, gcost;
        private AbstractNode parent; // Previous node in the graph when using the algorithm
        private Map<AbstractNode, Integer> neighbors;

        public AbstractNode(String name){
                this.name = name;
                this.gcost = Integer.MAX_VALUE; //Initialize to make the algorithm work
                this.neighbors = new HashMap<AbstractNode, Integer>(); //Neighbors of the node
        }


        /**
         * A* algorithm (a formal description can be found at http://en.wikipedia.org/wiki/A*_search_algorithm )
         * 
         * @start The start node
         * @goal The end node
         * @return The list of node that represents the path
         * 
         */
        public static List<AbstractNode> astar(AbstractNode start, AbstractNode goal){
                Set<AbstractNode> openset, closedset;
                openset = new HashSet<AbstractNode>();
                openset.add(start);

                start.setGcost(0);
                start.setFcost(start.getGcost() + start.heuristic(goal));
                closedset = new HashSet<AbstractNode>();

                while(!openset.isEmpty()){
                        AbstractNode current = AbstractNode.minFcost(openset);

                        if(current.equals(goal)){
                                return AbstractNode.reconstructPath(start, goal);
                        }
                        openset.remove(current);

                        closedset.add(current);
                        for(AbstractNode n : current.getNeighbors()){
                                if(closedset.contains(n)){
                                        continue;
                                }
                                double tmpGCost = current.getGcost() + current.distanceToNode(n);

                                if(!openset.contains(n) || tmpGCost < n.getGcost()){
                                        n.setParent(current);
                                        n.setGcost(tmpGCost);
                                        n.setFcost(n.getGcost() + n.heuristic(goal));
                                        if(!openset.contains(n)){
                                                openset.add(n);
                                        }
                                }
                        }
                }
                return new LinkedList<AbstractNode>();
        }

        /**
         * Heuristic function
         * 
         * @n2 node 2
         */
        public abstract double heuristic(AbstractNode n2);

        /**
         * Reconstruct the path from the start to goal node.
         * Take the parent of current node, add itself to the list and\
         * then repeat with "current" as the parent until "current" is the start node.
         * 
         */
        public static List<AbstractNode> reconstructPath(AbstractNode start, AbstractNode goal){
                List<AbstractNode> path = new LinkedList<AbstractNode>();
                AbstractNode current = goal;
                while(current != start){
                        path.add(0, current);
                        current = current.parent;
                }
                path.add(0, start);

                return path;
        }

        /**
         * Prints the path taken
         * 
         * @path the path
         * @return
         */
        public static void printPath(List<AbstractNode> path) {
                System.out.println("Path: ");
                for(AbstractNode n: path){
                        System.out.print("->"+n);
                }

        }

        /**
         * Returns the node with minimal fcost
         * 
         * @openset the open set for astar
         * @return the element in @openset that has the least fcost
         */
        public static AbstractNode minFcost(Set<AbstractNode> openset) {
                return (AbstractNode)(Collections.min(openset));
        }

        //GETTERS AND SETTERS

        public String getName() {
                return name;
        }

        public double getFcost() {
                return fcost;
        }

        public void setFcost(double fcost) {
                this.fcost = fcost;
        }

        public double getGcost() {
                return gcost;
        }

        public void setGcost(double gcost) {
                this.gcost = gcost;
        }

        public AbstractNode getParent() {
                return parent;
        }

        public void setParent(AbstractNode parent) {
                this.parent = parent;
        }

        public Set<AbstractNode> getNeighbors() {
                return neighbors.keySet();
        }

        public Integer distanceToNode(AbstractNode n){
                return neighbors.get(n);
        }

        public void addNeighbors(AbstractNode neighbour, Integer distances) {
                neighbors.put(neighbour, distances);
        }

        //END OF GETTERS AND SETTERS


        @Override
        public int compareTo(AbstractNode o) {
                if(fcost < o.fcost){
                        return -1;
                }else if(fcost > o.fcost){
                        return 1;
                }else{
                        return 0;
                }
        }

        @Override
        public String toString() {
                return name;
        }

}