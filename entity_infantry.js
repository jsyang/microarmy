function Infantry(x,y,team,type,target)
//  type    (string) unit class
{
  var _=new Pawn(x,y,team,target);
  var r=Math.random;
      
  var typeInfo=
  ({
  //type        health          berserkPotential    berserkTime     maxAmmo reloadTime  sightRange  GFXset          isFiring
    "rocket":[  RAND(60,80),    r()*0.5,            RAND(3,18),     1,      160,        9,          Enum.GFX.ROCKET,Enum.GFX.ISFIRING.ROCKET ],
    "pistol":[  RAND(30,70),    r()*0.19,           RAND(10,30),    2,      40,         7,          Enum.GFX.PISTOL,Enum.GFX.ISFIRING.PISTOL ]
  })[type];
  var i=0;
  _.health=           typeInfo[i++];
  _.berserkPotential= typeInfo[i++];
  _.berserkTime=      typeInfo[i++];
  _.maxAmmo=          typeInfo[i++];
  _.ammo=             _.maxAmmo;
  _.reloadTime=       typeInfo[i++];
  _.sightRange=       typeInfo[i++];
  _.GFXSET=           typeInfo[i++][team];
  _.isShotFrame=      typeInfo[i++];
  _.direction=        Enum.Directions[team];
  
  // Event flags / timers
  _.action=0;
  _.isReloading=0;
  _.isBerserk=0;
  _.corpseTime=180;                   // when this is 0, entity is deleted.
  _.class=Enum.UnitClass.INFANTRY;
  _.type=type;
  
  _.correctFacing=function()
  {
    if(this.target) this.direction=(this.target.x>this.x)?1:-1;
    else            this.direction=Enum.Directions[this.team];
    
    this.firstFrame=(this.direction>0)? 6 : 0;
    this.lastFrame=(this.direction>0)?  11: 5;
  };
    
  _.clearTarget=function()
  {
    this.target=undefined;
    this.action=0;
  };
    
  _.findTarget=function()
  // Find the enemy.
  {        
    var sh=world.spatialHash;
    var x=this.x>>world.shWidth;
    var h=sh[x];
    // Find the partitions to check to find potential enemies.
    for(var s=this.sightRange+1, i=1; s-->world.shWidth; i++) 
    {
      if(sh[x-i]) h=h.concat(sh[x-i]);
      if(sh[x+i]) h=h.concat(sh[x+i]);
    }

    // Sort by dist to self.
    h.sort( function(a,b) { var ab=Math.abs; return ab(this.x-a.x)-ab(this.x-b.x); } );
    for(var i in h)
    {
      if(h[i].health<=0) continue;
      if(Math.abs(h[i].x-this.x)>>this.sightRange) break;     // Can't see it!
      if(h[i].team!=this.team) { this.target=h[i]; break; }   // Target acquired!
    }
    
    // May need to filter h by team later, right now it's okay.        
    this.correctFacing();
  };
    
  _.active=function()
  {
    if(this.health>0)
    {
      this.correctFacing();
      
      // Reloading: exhausted the mag.
      if(this.isReloading){ return this.isReloading--; }
      
      // Berserk: moving toward the original target for some time without
      //          regard to self-preservation or where the current target location is!
      //          once berserk is done, standard actions resume. 
      if(this.isBerserk){ this.isBerserk--; }
      else
      {                
        //if(!this.target || this.target.health<=0) this.findTarget();
        if(!this.target || this.target.health<=0 || (Math.abs(this.x-this.target.x)>>this.sightRange) )
        {
          this.clearTarget();
          this.findTarget();
        }
        else
        {
          if(!this.action) this.action=RAND(Enum.InfantryAction.ATTACK_STANDING,Enum.InfantryAction.ATTACK_PRONE); 
        }
      }
      
      if(!this.ammo) { this.isReloading=this.reloadTime; this.ammo=this.maxAmmo; this.frame=this.firstFrame; return; }
      
      // Loop the animation by default if not dead.
      if(++this.frame>this.lastFrame) this.frame=this.firstFrame;
      
      if(this.action==Enum.InfantryAction.MOVEMENT) // Moving!
      {                
        this.x+=this.direction;
        var x=this.x;                
        
        if(!( x<0 || x>world.width-1 )) 
        {
          this.y=world.heightmap[x];
          return;
        }
        
        var d=Enum.Directions[this.team];
        // Out of bounds! Check win conditions
        if( (x<0 && d<0) || (x>world.width-1 && d>0) ) // Reach the enemy border: win
        {} // log.win(this.team);
        this.corpseTime=0;
        this.health=0;
      }
      else // Attacking!
      {
        var distTarget=Math.abs(this.x-this.target.x);
        if(distTarget<9)    // Melee distance: KILL OR BE KILLED
        {
          if(Math.random()<this.berserkPotential)
          {
            this.target.health=0;
            this.clearTarget();
            // log.meleeKill(this.team);
          }
          return;
        }
        
        // Berserk!-- better now than never!
        if(Math.random()<this.berserkPotential)
        {  this.action=Enum.InfantryAction.MOVEMENT; return this.isBerserk=this.berserkTime; }
        
        if(this.frame==this.firstFrame && this.type=="pistol") audio.s.pistol.play();
        if(!this.isShotFrame[this.frame]) return;                
        
        var bulletDY=(this.action==Enum.InfantryAction.ATTACK_PRONE)? -2: -4;
        var bulletDX=(this.direction>0)? 5 : -5;

        var shotType=({
        //            accuracy        projectileType  strayDY
          "rocket":[  [0.18,0.75],    SmallRocket,    RAND(-15,15)/100    ],
          "pistol":[  [0.1,0.45],     Bullet,         RAND(-21,21)/100    ]
        })[this.type];                
        var i=0;
        var accuracy=       shotType[i++];
        var projectileType= shotType[i++];
        var strayDY=        shotType[i++];
        if(distTarget>40){  accuracy[0]-=0.02; accuracy[1]-=0.15; }
        if(distTarget>80){  accuracy[0]-=0.01; accuracy[1]-=0.08; }
        if(distTarget>120){ accuracy[0]-=0.01; accuracy[1]-=0.08; }
        if(distTarget>160){ accuracy[0]-=0.01; accuracy[1]-=0.08; }
        
        // Flight speed = 1<<2.
        world.projectiles.push(
          new projectileType(this.x+bulletDX,this.y+bulletDY,this.team,this.target,this.direction<<2,((this.target.y-this.y-bulletDY)<<2)/distTarget+strayDY,accuracy)
        );
        
        this.ammo--;
      }
    }
    else
    {   
      if(this.action<Enum.InfantryAction.DEATH1)
      {
        [ audio.s.die1, audio.s.die2, audio.s.die3, audio.s.die4 ][RAND(0,3)].play();
        this.action=RAND(Enum.InfantryAction.DEATH1, Enum.InfantryAction.DEATH2);
        this.correctFacing();
        this.frame=this.firstFrame;
        // log.deaths[this.team]++;
        // log.unitLost(team,this.class);   // Enum.UnitClass.INFANTRY;                
      }
      else
      {
        if(this.frame<this.lastFrame) this.frame++;
        else this.corpseTime--;
      }
    }    
  };
  
  return _;
}
