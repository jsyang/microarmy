var MOUSEMODE={
  EXPLOSION:            0,
  APC:                  1,
  PRINTMOUSECOORDS:     2,
  ENGINEERBUILDPILLBOX: 3,
  SMALLMINE:            4,
  MISSILERACK:          5,
  PISTOL:               6,
  ATTACKHELI:           7
};

////////////////////////////////////////////////////////////////////////////////
/* Auto-scrolling

var DEMO_ACTION={
  X:0,
  SPACEBAR:32,
  CHECKACTION:undefined
};

function smoothAutoScroll() {
  var startX = document.body.scrollLeft;
  var stopX = DEMO_ACTION.X-(window.innerWidth>>1);
  if(stopX<0) return;
  var distance = stopX - startX;
  console.log("chiggity-check: "+[startX,stopX]);
  if(!distance) return;
  var speed = distance>>9;
  if (speed >= 20) speed = 20;
  var step = distance>>4;
  if(stopX>startX)
    for ( var i=startX, timer=0; i<stopX; i+=step, timer++ )
      setTimeout("window.scrollTo("+i+",0)", timer * speed);
  else
    for ( var i=startX, timer=0; i>stopX; i+=step, timer++ )
      setTimeout("window.scrollTo("+i+",0)", timer * speed);
}
*/
////////////////////////////////////////////////////////////////////////////////

var mode=MOUSEMODE.NONE;
var clicks=[];
window.onkeyup=function(e){
  /*
  if(e.which==DEMO_ACTION.SPACEBAR)
    if(DEMO_ACTION.CHECKACTION) {
      clearInterval(DEMO_ACTION.CHECKACTION);
      DEMO_ACTION.CHECKACTION=undefined;
      console.log("Auto-scrolling disabled.");
    } else {
      DEMO_ACTION.CHECKACTION=setInterval(smoothAutoScroll,3000);
      console.log("Auto-scrolling enabled.");
    }
  */
  switch(e.which) {
    case 32:
      console.log(world._.pawns.commander[0]._.attention+'/'+world._.pawns.commander[0]._.urgency+'<--->'+world._.pawns.commander[1]._.attention+'/'+world._.pawns.commander[1]._.urgency);
      console.log('Casualties '+_.totalDeaths);
  }
  
  if(e.which<48 || e.which>58) return;
  mode=e.which-49;
  
  for(var i in MOUSEMODE)
    if(MOUSEMODE[i]==mode) break;
  console.log("Click = "+i);
};

// BOOM! HEH.
window.onclick=function(e){
  var x=e.pageX, y=e.pageY;
  var a;
  switch(mode) {
    
    case MOUSEMODE.ATTACKHELI:
      a=new AttackHelicopter({x:x,y:y,team:$.R(0,1)});
      break;
    
    case MOUSEMODE.APC:
      a=new APC(x,world.height(x),TEAM.BLUE);
      break;
    
    case MOUSEMODE.EXPLOSION:
      a=new SmallExplosion({x:x,y:y});
      break;
    
    case MOUSEMODE.PISTOL:
      a=new PistolInfantry({x:x,y:world.height(x),team:1});
      break;
    
    case MOUSEMODE.PRINTMOUSECOORDS:
      console.log([x,y]);
      break;
    
    case MOUSEMODE.ENGINEERBUILDPILLBOX:
      if(clicks.length){
        a=new EngineerInfantry(x,world.height(x),TEAM.BLUE);
        a._.build={ type:Pillbox, x:clicks[0][0] };
        a._.target=a._.build;
        clicks=[];
      } else {
        console.log("Scaffold location selected. Click to deploy Engineer.");
        clicks.push([x,y]);
      }
      break;
    
    case MOUSEMODE.SMALLMINE:
      a=new SmallMine({
        x:    x,
        y:    world.height(x),
        team: TEAM.BLUE
      });
      break;
    
    case MOUSEMODE.MISSILERACK:
      a=new MissileRack({
        x:    x,
        y:    world.height(x),
        team: TEAM.GREEN
      });
      break;
  }  
  world.add(a);
};