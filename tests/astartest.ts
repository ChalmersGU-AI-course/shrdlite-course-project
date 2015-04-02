/// <reference path="../vendor/tsUnit.ts" />
/// <reference path="../vendor/collections.ts" />
/// <reference path="../astarAlgorithm.ts" />

module Tests{

//Templates
  class Tuple {
    a: Astar.Node
    b: Astar.Node
  }
  
  //Extend Nodes with coordinates. 
  class Town extends Astar.Node{
    x: number
    y: number
  }
  
  function townTupleToString(t:Tuple){
    return t.a.id + t.b.id;
  }
  
  //Define Hieristic function
  function town_hier(t1:Town,t2:Town){
    return Math.round(Math.sqrt(Math.pow((t1.x - t2.x),2) + Math.pow((t1.y - t2.y),2))) // Pythagoras i.e the bird distance.
  }
  
  var dic;
  
  function get_town_dist(t1:Town,t2:Town){ //NYI
    console.log(dic.getValue({a:t1,b:t2}));
    var townTuple = new Tuple();
    townTuple.a = t1;
    townTuple.b = t2;
    return dic.getValue(townTuple);
  }
  
  function set_town_dist(t1:Town,t2:Town,dist:number){
    dic.setValue({a:t1,b:t2},dist)
    dic.setValue({a:t2,b:t1},dist)
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
    
    getDic(){
      return dic;
    }
    
    set_town_dist(t1:Town,t2:Town,dist:number){
      dic.setValue({a:t1,b:t2},dist)
    }
    
    
    townProblemTest(){ 

      var zerind = new Town("zerind");
      var oradea = new Town("oradea");
      var arad = new Town("arad"); 
      var sibiu = new Town("sibiu");
      var timisoar = new Town("timisoar");
      var lugoj = new Town("lugoj");
      var mehadia = new Town("mehadia"); 
      var vilcea = new Town("vilcea");
      var craiova = new Town("craiova"); 
      var drobeta = new Town("drobeta");

      oradea.children = [zerind,sibiu]
      oradea.x = 10;
      oradea.y = 100;
      zerind.children = [arad,oradea]
      zerind.x = 8;
      zerind.y = 90;
      arad.children =[sibiu,timisoar,zerind]
      arad.x = 6;
      arad.y = 80;
      timisoar.children = [arad,lugoj]
      timisoar.x = 8;
      timisoar.y = 70;
      lugoj.children = [timisoar,mehadia]
      lugoj.x = 18
      lugoj.y = 60
      mehadia.children=[lugoj,drobeta]
      mehadia.x = 19
      mehadia.y = 40
      drobeta.children=[mehadia,craiova]
      drobeta.x = 16
      drobeta.y = 1
      sibiu.children = [oradea,arad,vilcea]
      sibiu.x = 28
      sibiu.y = 75
      vilcea.children = [sibiu,craiova]
      vilcea.x = 30
      vilcea.y = 72
      craiova.children = [drobeta,vilcea]
      craiova.x = 25;
      craiova.y = 1;

      dic = new collections.Dictionary<Tuple, number>(townTupleToString);
      set_town_dist(oradea,zerind,71)
      set_town_dist(arad,zerind,75)
      set_town_dist(oradea,sibiu,151)
      set_town_dist(arad,sibiu,140)
      set_town_dist(arad,timisoar,118)
      set_town_dist(timisoar,lugoj,111)
      set_town_dist(lugoj,mehadia,70)
      set_town_dist(mehadia,drobeta,75)
      set_town_dist(drobeta,craiova,120)
      set_town_dist(sibiu,vilcea,80)
      set_town_dist(vilcea,craiova,146)
      

      var path = Astar.Astar(oradea,craiova,{heuristic_approx: town_hier,dist_between: get_town_dist})
      //this.areIdentical([],path)
      //[oradea,sibiu,vilcea,craiova]
      return path
      
      
      
    }

    eightPuzzleTest(){
      //NYI
    }
  }
};
