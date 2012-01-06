// Behavior tree implementation here ///////////////////////////////////////////
var Behavior={

  Execute:function(tree,thisArg){
    if(!tree.id) return alert('No strategy specified!');
    switch(tree.id) {
      
      case 'sequence':  // Quit on first false
        for(var i=0; i<tree.children.length; i++)
          if(!Behavior.Execute(tree.children[i],thisArg)) return false;
        return true;
        break;
      
      case 'selector':  // Quit on first true
        for(var i=0; i<tree.children.length; i++)
          if(Behavior.Execute(tree.children[i],thisArg)) return true;
        return false;
        break;
      
      case 'lookup':    // to do: lookup decorator
        break;
      
      default:          // Custom node behavior and decorators.
        var realId=tree.id.charAt(0)==='!'?tree.id.slice(1):tree.id;
        if(!Behavior.Custom[realId])
          return alert('Custom behavior not found!');        
        return realId==tree.id?
          Behavior.Custom[realId](thisArg)
          : !Behavior.Custom[realId](thisArg);
    }
    return alert('ERROR: You are not supposed to see this!');
  },

/* notes on behavior tree shorthand:

() = selector
<> = sequence
!token = run the decorator but return with logically opposite result

you don't actually need chained decorators, since you can just use a sequence
and inverts to do the same thing

decorator-filter1
 decorator-filter2
   decorator-filter3
     shootMachineGun

is identical to
<decorator-filter1,decorator-filter2,decorator-filter3>

should not allow stuff to happen during corpse time, which is what
the if(isDead) clause catches.
if(isDead) { doCorpsething; } else: (do stuff in the behavior tree)

*/  
  
  ConvertShortHand:function(code){
    return code
    .replace(/\[/g,'{id:"')
    .replace(/\]/g,'"}')
    .replace(/\(/g,'{id:"selector",children:[')
    .replace(/</g,'{id:"sequence",children:[')
    .replace(/>/g,']}')
    .replace(/\)/g,']}');
  },
  
// Custom decorators and tasks /////////////////////////////////////////////////
  Custom:{
    
    isDead:function(obj) {
      return obj._.health<=0;
    },
    
    isOutsideWorld:function(obj) {
      return world.isOutside(obj);
    },
    
    isReloading:function(obj) { var _=obj._;
      if(_.reload.ing) {
        _.reload.ing--;
        return true;
      } else if(_.ammo.clip==0) {
        _.reload.ing=_.reload.time;
        _.ammo.clip=_.ammo.max;
        return true;
      }
      return false;
    },
    
    isVehicleMoving:function(obj) { var _=obj._;
      return  _.action==VEHICLE.ACTION.MOVING ||
              _.action==VEHICLE.ACTION.TURNING;
    },
    
    loopAnimation:function(obj) { var _=obj._;
      if(++_.frame.current>_.frame.last)
        _.frame.current=_.frame.first;
      return true;
    },
    
    seeTarget:function(obj) { var t=obj._.target;
      return t? !(Math.abs(t.x-obj.x)>>obj._.sight) : false;
    },
    
        
    foundTarget:function(obj) { var t=obj._.target, _=obj._;
      // Try to find a valid target!
      if(!t || Behavior.Custom.isDead(t) ||
         !Behavior.Custom.seeTarget(obj) || t.team==obj.team) {
        _.target=undefined;
        var h=world.xHash.getNBucketsByCoord(obj.x,(_.sight-5)*2+2)
        for(var i=0, minDist=Infinity; i<h.length; i++) {
          if(h[i].team==obj.team) continue;
          if(Behavior.Custom.isDead(h[i])) continue;
          var dist=Math.abs(h[i].x-obj.x);
          if(dist>>_.sight) continue;
          if(dist<minDist){ _.target=h[i]; minDist=dist; }
        }
      }
      return _.target? true:false;
    },
    
    // Only for Vehicles -- Handle rotation to face target
    isFacingTarget:function(obj) { var _=obj._;
      if(_.target && (_.target.x-obj.x)*_.direction<0) {
        if(!_.turn.ing) {            
          _.turn.ing=1;
          _.turn.current=0;
          _.action=VEHICLE.ACTION.TURNING;
        } else {
          _.turn.current++;
          if(_.turn.current>_.turn.last) {
            _.turn.ing=_.turn.current=0;
            _.direction*=-1;
            _.action=VEHICLE.ACTION.MOVING;
          }            
        }
        return false;
      }
      return true;
    },
    
    movePawn:function(obj) {
      obj.x+=obj._.direction;
      obj.y=world.getHeight(obj.x);
      return true;
    },
    
    // this attack function came from Vehicle class.
    attack:function(obj) { var _=obj._;
      //if(!_.projectile) return true;
      var dist=Math.abs(_.target.x-obj.x);      
      
      var accuracy=[0,0]; // chance to hit, [periphery, target bonus]
      var strayDY=0;      // deviation in firing angle.
      var fSpeed=0;       // projectile speed.
      
      if(_.projectile==MGBullet) {
        if(_.ammo.clip==_.ammo.max) soundManager.play('mgburst');
        accuracy=[0.65,0.35]; strayDY=$.R(-15,15)/100; fSpeed=4;
      }
      
      // Projectile origin relative to sprite
      var pDY=-obj.img.h>>1;
      var pDX=_.direction*4;
      
      // Distance penalties for chance to hit
      // this should probably be moved inside the projectile class
      if(dist>50){  accuracy[0]-=0.02; accuracy[1]-=0.15; }
      if(dist>120){ accuracy[0]-=0.01; accuracy[1]-=0.18; }
      if(dist>180){ accuracy[0]-=0.01; accuracy[1]-=0.08; }
      if(dist>200){ accuracy[0]-=0.01; accuracy[1]-=0.08; }
      
      // Flight speed = 1<<2.
      world.addPawn(
        new _.projectile(
          obj.x+pDX,obj.y+pDY,
          obj.team,
          _.target,
          _.direction*4,
          ((_.target.y-(_.target.img.h>>1)-(obj.y-(obj.img.h>>1))-pDY)*4)/dist+strayDY,
          accuracy
        )
      );
      _.ammo.clip--;
      return true;
    },
    
    walkingOffMapCheck:function(obj) {
      if(TEAM.GOALDIRECTION[obj.team]==obj._.direction) {
        soundManager.play('accomp');
        world.pause();
      }
      // just disappear, walked off the map
      obj.remove();
      return true;
    }
  }
};




function testConversion(){
var a="\
(\n\
  [isReloading],\n\
  <[foundTarget],(\n\
    <[!isFacingTarget],[loopAnimation]>,\n\
    <[seeTarget],[attack]>\n\
  )>,\n\
  <[movePawn],[loopAnimation],<\n\
    [isOutsideWorld],\n\
    [walkingOffMapCheck]\n\
  >>\n\
)";
return Behavior.ConvertShortHand(a);
}