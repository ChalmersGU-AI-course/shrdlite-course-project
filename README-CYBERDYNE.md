## Shrdlite DIT410 (VT15)
###How to run
*1)* Clone into the repository  
*2)* change current working directory to the project  
*3)* run **make all**  
*4)* open **shrdlite.html** in a JavaScript enabled browser of your choice (Preferably Mozilla Firefox or Google Chrome)  
*5)* Start writing utterances to the robot
GUI

###Interesting utterances
**Example 1**  
World: **Medium**  
Utterance: **Put all blue objects on the floor**  
Comment: *An utterance that force the robot to move several objects that block the primary objects, which makes the search harder but still doable.*  

**Example 2**  
World: **Complex**  
Utterance: **Put all yellow objects above a red object**  
Comment: *Althoug 33 steps are needed the search-time is impressive. The robot starts to move the blocks almost immediately.*  

**Example 3**  
World: **Complex**  
Utterance: First utterance: **Put all objects beside the small ball**  
Comment: The utterance take 55 steps and rather long time to compute. It is however a nice example of how complex of an utterance this program can understand and solve.  

**Example 3**  
World: **Impossible**  
Utterance: **Put all balls on the floor**  
Comment: This utterance is very fast to compute but takes 58 actions to perform. Although every move the arm makes is a valid physical and spatial move, due to the law breaking relations of the world in the beginning some minor rules break in this solution. Interesting comparison to Example 3 non the less (Same amount of moves, significantly less search-time)  
##Extensions
The extension we implemented was the handling of quantifiers, especially the all quantifier as seen in the examples. 
In the *convertToPDDL*-function we have some special cases for the all-quantifier. The *convertToPDDL*-function can be found in *Interpreter.ts* line *223 - 316*. We also added the special case for when making an *all-utterance* when there in fact is only a single possible object. Then we change the quantifier to the and run the program as usual. 
We also distinguish between *the* and *any* as in that the *the* quantifier must only have one possible object while the *any* quantifier may have several. 

Handle 'all'-quantifier

##Heuristic for the solution
DAVID SKRIVER

##Unexpected behaviour
In the current version there are some utterances that makes the computer to go out of memory.  
For example, in the **complex** world the utterance **put a box beside all objects** makes the program crash.

##A*
Information linked to A* is found in README-ASTAR 
