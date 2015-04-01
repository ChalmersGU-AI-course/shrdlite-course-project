/// <reference path="../vendor/tsUnit.ts" />
/// <reference path="../vendor/collections.ts" />
/// <reference path="../astarAlgorithm.ts" />

module Tests{
//Templates
  class Tuple {
    0: Astar.Node
    1: Astar.Node
  }
  //Extend Nodes with coordinates. 
  class Town extends Astar.Node{
        x: number
        y: number
    }
  //Define Hieristic function
  function town_hier(t1:Town,t2:Town){
      return Math.sqrt(Math.pow((t1.x - t2.x),2) + Math.pow((t1.y - t2.y),2)) // Pythagoras i.e the bird distance.
    }
  var dic;   
  function get_town_dist(t1:Town,t2:Town){ //NYI
      return dic.getValue({0:t1,1:t2})
  }
  function set_town_dist(t1:Town,t2:Town,dist:number,dic){
    dic.setValue({0:t1,1:t2},dist)
    dic.setValue({0:t2,1:t1},dist)
  }
  //Extend Nodes with a number
  class Square extends Astar.Node{
      num: number
  }

  function puzzle_hier(t1:Square,t2:Square){ //NYI
      return 0 
  }

  function puzzle_dist(t1:Square,t2:Square){ //NYI
    return 0 
  }


  export class astarTest extends tsUnit.TestClass {
    /*
    The town problem : 
    "The trivial problem" - page68 AIAMA
    */
    testTownProblem(){ 

      var zerind = new Town();
      var oradea = new Town();
      var arad = new Town(); 
      var sibiu = new Town();
      var timisoar = new Town();
      var lugoj = new Town();
      var mehadia = new Town(); 
      var vilcea = new Town();
      var craiova = new Town(); 
      var drobeta = new Town();

      oradea.children = [zerind,sibiu]
      zerind.children = [arad,oradea]
      arad.children =[sibiu,timisoar,zerind]
      timisoar.children = [arad,lugoj]
      lugoj.children = [timisoar,mehadia]
      mehadia.children=[lugoj,drobeta]
      drobeta.children=[mehadia,craiova]
      sibiu.children = [oradea,arad,vilcea]
      vilcea.children = [sibiu,craiova]
      craiova.children = [drobeta,vilcea]

      dic = new collections.Dictionary<Tuple, number>();
      set_town_dist(oradea,zerind,71,dic)
      set_town_dist(arad,zerind,75,dic)
      set_town_dist(oradea,sibiu,151,dic)
      set_town_dist(arad,sibiu,140,dic)
      set_town_dist(arad,timisoar,118,dic)
      set_town_dist(timisoar,lugoj,111,dic)
      set_town_dist(lugoj,mehadia,70,dic)
      set_town_dist(mehadia,drobeta,75,dic)
      set_town_dist(drobeta,craiova,120,dic)
      set_town_dist(sibiu,vilcea,80,dic)
      set_town_dist(vilcea,craiova,146,dic)

      var path = Astar.Astar(oradea,craiova,{heuristic_approx: town_hier,dist_between: get_town_dist})
      this.areIdentical([oradea,sibiu,vilcea,craiova],path) 
    }

    testEightPuzzle(){
      //NYI
    }
  }
};