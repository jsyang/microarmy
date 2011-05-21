// Projectiles /////////////////////////////////////////////////////////////////

function Bullet(x,y,team,target,dx,dy,accuracy)
//  dx          (double) X distance to cover per tick
//  dy          (double) Y distance to cover per tick
//  accuracy    (double[]) chance to hit [bystanders, target bonus]
{
  var _=new Pawn(x,y,team,target);
  _.dx=dx;
  _.dy=dy;
  _.accuracy=accuracy;
  
  _.type=Enum.ProjectileTypes.BULLET;
  _.range=35;
  _.damage=20;
  _.fly=function()
  {
    this.y+=this.dy;
    this.x+=this.dx;
    
    // Out of bounds or hit the ground!
    if( this.x<0 || this.x>world.width-1 || this.y>world.heightmap[this.x>>0] ) this.range=0;
    if(!this.range) return;
    this.range--;
    
    // Get our 3 closest spatialHash partitions.
    var sh=world.spatialHash;
    var x=this.x>>world.shWidth;
    var h=sh[x];
    if(sh[x-1]) h=h.concat(sh[x-1]);
    if(sh[x+1]) h=h.concat(sh[x+1]);
    
    for(var i in h)
    {
      var unit=h[i];
      if(unit.team==this.team) continue; // No explicit friendly fire!
      
      var dx=this.x-unit.x; dx*=dx;
      var dy=this.y-unit.y; dy*=dy;
      if((dx+dy)>>4) continue;  // Not close enough!
      
      if(unit.health<=0) continue;
      var chanceToHit=this.accuracy[0];
      if(unit==this.target) chanceToHit+=this.accuracy[1];
      
      if(unit.class==Enum.UnitClass.INFANTRY)
      {
        switch(unit.action)
        {// Deeper stance compounds bonus against chance to hit.
          case Enum.InfantryAction.ATTACK_PRONE:      chanceToHit-=0.07;
          case Enum.InfantryAction.ATTACK_CROUCHING:  chanceToHit-=0.05;
          break;                    
        }
      }
      
      if(Math.random()>chanceToHit) continue;            
      switch(this.type)
      {
        case Enum.ProjectileTypes.SMALLROCKET:  world.explosions.push(new SmallExplosion(this.x,this.y));  break;
        case Enum.ProjectileTypes.BULLET:       // default case.
      }
      unit.health-=this.damage;
      
      // Hit something, stop.
      this.range=0; return;
    }
  };
  return _;
}
    
function SmallRocket(x,y,team,target,dx,dy,accuracy)
{
  audio.s.rocket.play();
  
  var _=new Bullet(x,y,team,target,dx,dy,accuracy);
  _.type=Enum.ProjectileTypes.SMALLROCKET;
  _.range=90;
  return _;
}

function PillboxMGBullet(x,y,team,target,dx,dy,accuracy)
{
  var _=new Bullet(x,y,team,target,dx,dy,accuracy);
  _.range=70;
  _.damage=RAND(22,27);
  return _;
}
