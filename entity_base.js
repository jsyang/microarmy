var TEAM={
  NONE:-1,  
  BLUE: 0,
  GREEN:1,
  
  MAX:2,
  
  GOALDIRECTION:[1,-1],
  NAMES:'blue,green'.split(',')
};

// Base Entity /////////////////////////////////////////////////////////////////
function Pawn() {
  this.x;
  this.y;
  this.team;
  this.corpsetime;
  this.img={
    w:undefined, h:undefined,
    hDist2: undefined,        // hit radius^2 for collision testing
    sheet: undefined          // sprite sheet
  };
  this.alive=function(){};
  this.getGFX=function(){};
}

// X-coord obj hash: avoid checking hits on faraway stuff //////////////////////
function XHash(worldWidth) {    
  var bucketWidth=6; // divide world into 1<<6 == 64 pixel buckets
  var buckets=[];
  for(var i=(worldWidth>>bucketWidth)+1; i--;) buckets.push([]);
  
  this.getNearEnemy=function(obj){
    var sight=obj._.sight;
    var center=obj.x>>bucketWidth;
    var minDist=Infinity;    
    obj._.target=undefined;    
    // buckets left,right of the center.
    for(var left=right=center; sight; left--,right++) {
      var shell=[];
      if(buckets[left])                 shell=shell.concat(buckets[left]);
      if(left!=right && buckets[right]) shell=shell.concat(buckets[right]);
      
      for(var i=0; i<shell.length; i++) {
        var entity=shell[i];          
        if(entity.team==obj.team || entity.isDead()) continue;
        var dist=Math.abs(entity.x-obj.x);
        if(!(dist>>sight) && dist<minDist){
          obj._.target=entity; minDist=dist;
        }
      }
      if(obj._.target) break;
    }
  };
  
  // todo: get farthest enemy
  this.getFarEnemy=function(obj){
    
  };
  
  
  // todo: optimize this code: usually we're looking for the closest
  // enemy / friendly to the current entity, so instead of getting the entire
  // range of buckets, we should go for layers, starting from the center...
  this.getNBucketsByCoord=function(x,n) {
    for(var bucketsN=[],i=-(n>>1),index=x>>bucketWidth; i<(n>>1)+1; i++)
      if(buckets[index+i]!=undefined)
        bucketsN=bucketsN.concat(buckets[index+i]);
    return bucketsN;
  };

  this.insert=function(obj){ buckets[obj.x>>bucketWidth].push(obj); };
}

// Game world //////////////////////////////////////////////////////////////////
var world;

function World() {
  if(!map) return alert("No map specified for world!");
  
  var w=2490, h=192;
  var heightmap=[];
  
  // instanceLists: gameworld's things
  var projectiles=[];
  var explosions=[];
  var infantry=[];  
  var vehicles=[];
  //var aircraft=[];
  var structures=[];
  
  this.xHash=new XHash(w);
  
  // Draw map terrain, find heightmap.
  var BG=(function(w,h,heightmap) {
    var cv=document.createElement("canvas");
    cv.width=w; cv.height=h;
    document.body.appendChild(cv);
    var ctx=cv.getContext("2d");
    ctx.drawImage(preloader.getFile("bgterrain"),0,0);
    var data=ctx.getImageData(0,0,w,h).data;
    for(var x=0;x<w;x++) {
      for(var y=h-1; data[(y*w+x)*4+3];) y--;
      heightmap.push(y);
    }
    ctx.drawImage(preloader.getFile("bgprops"),0,0);
    ctx.drawImage(preloader.getFile("bgterrain"),0,0);
    return ctx;
  })(w,h,heightmap);
  
  // Drawing context for all the stuff that moves around
  var FG=(function(w,h) {
    var cv=document.createElement("canvas");
    cv.width=w; cv.height=h;
    document.body.appendChild(cv);
    return cv.getContext("2d");    
  })(w,h);  
  
  // Msgbox to display combat messages
  var msgbox=(function(){
    var ta=document.createElement("div");
    ta.setAttribute('id','msgbox');
    var s=ta.style;
    s.position='absolute'; s.left=0; s.top=h;// s.height=100;
    var db=document.body, de=document.documentElement;
    s.width=Math.min(db.scrollWidth,db.offsetWidth,
                     de.clientWidth,de.scrollWidth,de.offsetWidth);
    s.fontFamily='lucida console'; s.fontSize='10px'; s.color='#ddd';
    window.onscroll=
      (function(s){return function(){s.left=document.body.scrollLeft;};})(s);
    document.body.appendChild(ta);
    return ta;
  })();
  
  // Process Pawns -- generic code
  function processInstances(newXHash,vx,vw,instances) {    
    for(var i=0, newInstances=[];i<instances.length;i++) {
      var a=instances[i];
      if(a.alive())           newXHash.insert(a);
      if(a.corpsetime>0)      newInstances.push(a);
      if(a.x>vx && a.x<vx+vw) {
        var gfx=a.getGFX();
        FG.drawImage(gfx.img,
          gfx.imgdx,  gfx.imgdy,  gfx.imgw,gfx.imgh,
          gfx.worldx, gfx.worldy, gfx.imgw,gfx.imgh
        );
      }
    }
    return newInstances;
  }
  
  // Run 1 cycle of the game loop.
  function cycle() {    
    FG.clearRect(0,0,w,h);
    var viewWidth=window.innerWidth, viewLeft=document.body.scrollLeft;
    var xHash_=new XHash(w);
    
    structures=processInstances(xHash_,viewLeft,viewWidth,structures);
    vehicles=processInstances(xHash_,viewLeft,viewWidth,vehicles);
    infantry=processInstances(xHash_,viewLeft,viewWidth,infantry);
    projectiles=processInstances(xHash_,viewLeft,viewWidth,projectiles);
    explosions=processInstances(xHash_,viewLeft,viewWidth,explosions);    
    
    world.xHash=xHash_;    
  }
  
  var timer;
  this.go=function()    { timer=setInterval(cycle,40); };
  this.pause=function() { clearInterval(timer); };
  
  this.getHeight=function(x) { return (x>=0 && x<w) ? heightmap[x>>0] : 0; };
  this.writeToMsgBox=function(t){ msgbox.innerText=t; };
  
  this.isOutside=function(obj) {
    var x=obj.x>>0, y=obj.y>>0;
    return x<0 || x>=w || y>heightmap[x]; // || y<0
  };
  
  
  this.addPawn=function(obj) {
    if(obj instanceof Vehicle)    return vehicles.push(obj);
    if(obj instanceof Structure)  return structures.push(obj);
    if(obj instanceof Infantry)   return infantry.push(obj);
    if(obj instanceof Projectile) return projectiles.push(obj);
    if(obj instanceof Explosion)  return explosions.push(obj);
  };
  
  // Add map's entities.
  while(map.entities.length) {
    var j=map.entities.shift(); if(j)
      this.addPawn( new (j.obj)(j.x,this.getHeight(j.x),j.team) );
  }
  
};
