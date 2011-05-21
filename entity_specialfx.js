// Explosions and Special Effects //////////////////////////////////////////////

function SmallExplosion(x,y)
{
  audio.s.expsmall.play();
  //updateMSGS("Rocket explosion at "+i.x+".");
  
  var _=new Pawn(x,y);
  _.lastFrame=12;     // inclusive
  _.width=41;
  _.height=35;
  _.damage=12;
  _.explode=function()
  {
    // Get our 3 closest spatialHash partitions.
    var sh=world.spatialHash;
    var x=this.x>>world.shWidth;
    var h=sh[x];
    if(sh[x-1]) h=h.concat(sh[x-1]);
    if(sh[x+1]) h=h.concat(sh[x+1]);
    
    for(var i in h)
    {
      var unit=h[i];
      var dx=this.x-unit.x; dx*=dx;
      var dy=this.y-unit.y; dy*=dy;
      if((dx+dy)>>9) continue;  // Not close enough!
      unit.health-=this.damage;
    }
    this.frame++;
  };
  return _;
}
