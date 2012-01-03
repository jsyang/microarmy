// strategic view //////////////////////////////////////////////////////////////

var Campaign=new function () {
/* campaign map has elements:
  cities - civilian centers, funding, research
  factories -  heavy / special weapon production site
  bases - contain supplies for your operations, adjacent bases to mission will
          determine what you can use in the mission, all cities and factories
          are bases by default.
  
  
  
  
*/
  this.map;
  
  this.research
  
  this.City=function(x,y,team){
    this.x=x;
    this.y=y;
    this.team=team;
    this.funding=10;
    this.research=10;
  };
  
  this.makeMap=function(){
    //gffdggdd
  };
  
};