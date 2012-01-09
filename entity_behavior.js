// Behavior tree implementation here ///////////////////////////////////////////
var Behavior={

  Execute:function(tree,thisArg){
    if(!tree.id) return alert('No strategy specified!');
    switch(tree.id) {
      
      case 'sequence':  // Quit on first false
        for(var i=0; i<tree.children.length; i++)
          if(!Behavior.Execute(tree.children[i],thisArg)) return false;
        return true;
      
      case 'selector':  // Quit on first true
        for(var i=0; i<tree.children.length; i++)
          if(Behavior.Execute(tree.children[i],thisArg)) return true;
        return false;
      
      default:          // Custom behavior and decorators
                        // lookup trees in the behavior tree library.
        var invert=tree.id.charAt(0)==='!';
        var realId=invert?tree.id.slice(1):tree.id;
        var behavior=Behavior.Custom[realId];
        if(behavior)
          return invert? !behavior(thisArg) : behavior(thisArg);
        var subtree=Behavior.Library[realId];
        if(subtree)
          return invert?
            !Behavior.Execute(subtree, thisArg)
            :Behavior.Execute(subtree, thisArg);
        return alert("Custom decorator / subtree not found!");
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
    return eval(code
    .replace(/\[/g,'{id:"')
    .replace(/\]/g,'"}')
    .replace(/\(/g,'{id:"selector",children:[')
    .replace(/</g,'{id:"sequence",children:[')
    .replace(/>/g,']}')
    .replace(/\)/g,']}'));
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
    
    /* Berserk: moving toward target for some time regardless of 
      self-preservation or target's current location! */
    isBerserking:function(obj) { var _=obj._;
      if(_.berserk.ing) {
        if(obj instanceof Infantry) _.action=INFANTRY.ACTION.MOVEMENT;
        if(obj instanceof Vehicle)  _.action=VEHICLE.ACTION.MOVING;
        _.berserk.ing--;
        return true;
      }
      return false;
    },
    
    tryBerserking:function(obj) { var _=obj._;
      if($.r()<_.berserk.chance)
        _.berserk.ing=_.berserk.time;      
      return true;
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
    
        
    foundTarget:function(obj) { var t=obj._.target;
      // Try to find a valid target!
      if(!t || Behavior.Custom.isDead(t) ||
         !Behavior.Custom.seeTarget(obj) || t.team==obj.team)
        world.xHash.getNearEnemy(obj);
      
      return obj._.target? true:false;
    },

    // Face the target -- Infantry
    setFacingTarget:function(obj) { var _=obj._;
      if(_.target) {
        _.direction=_.target.x>obj.x?1:-1;
        // Randomize attack stance -- Infantry
        if(_.action==INFANTRY.ACTION.MOVEMENT)
          _.action=$.R(
            INFANTRY.ACTION.ATTACK_STANDING,
            INFANTRY.ACTION.ATTACK_PRONE);
      } else {
        _.action=INFANTRY.ACTION.MOVEMENT;
        _.direction=TEAM.GOALDIRECTION[this.team];
      }
      
      _.frame.first=_.direction>0?  6 : 0;
      _.frame.last =_.direction>0?  11: 5;
      return true;
    },    
    
    // Handle rotation to face target -- Vehicles
    isVehicleFacingTarget:function(obj) { var _=obj._;
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
    
    move:function(obj) {
      obj.x+=obj._.direction;
      obj.y=world.getHeight(obj.x);
      return true;
    },

    // this attack function came from Vehicle class; added Infantry stuff.
    attack:function(obj) { var _=obj._;
      //if(!_.projectile) return true;
      var dist=Math.abs(_.target.x-obj.x);      
      
      if(obj instanceof Infantry) {
        // Melee distance: LESS than one body!
        if(dist<obj.img.w) {
          if($.r()<_.berserk.chance) {
            _.target.takeDamage(_.meleeDmg);
            // Pretty hard to ignore someone punching your face
            if(_.target._) _.target._.target=obj;
          }
          return true;
        }
      }
      
      var accuracy=[0,0]; // chance to hit, [periphery, target bonus]
      var strayDY=0;      // deviation in firing angle.
      var fSpeed=4;       // projectile speed.
      
      if(_.projectile==MGBullet) {
        if(_.ammo.clip==_.ammo.max) soundManager.play('mgburst');
        accuracy=[0.65,0.35]; strayDY=$.R(-15,15)/100;
      } else if(_.projectile==Bullet) {
        if(_.ammo.clip==_.ammo.max) soundManager.play('pistol');
        if(!INFANTRY.SHOTFRAME.PISTOL[_.frame.current]) return true;
        accuracy=[0.15,0.85]; strayDY=$.R(-15,15)/100;
      } else if(_.projectile==SmallRocket) {
        if(dist<48) return true;            // don't shoot rockets if too close!
        if(!INFANTRY.SHOTFRAME.ROCKET[_.frame.current]) return true;
        else soundManager.play('rocket');
        accuracy=[0.28,0.68]; strayDY=$.R(-21,21)/100;
      }
      
      // Projectile origin relative to sprite
      var pDY=-obj.img.h>>1;
      var pDX=_.direction*4;
      if(obj instanceof Infantry)
        var pDY=_.action==INFANTRY.ACTION.ATTACK_PRONE? -2: -4;
      
      // Distance penalties for chance to hit
      // this should probably be moved inside the projectile class
      if(dist>50){  accuracy[0]-=0.02; accuracy[1]-=0.15; }
      if(dist>120){ accuracy[0]-=0.01; accuracy[1]-=0.18; }
      if(dist>180){ accuracy[0]-=0.01; accuracy[1]-=0.08; }
      if(dist>200){ accuracy[0]-=0.01; accuracy[1]-=0.08; }
      
      world.addPawn(
        new _.projectile(
          obj.x+pDX,obj.y+pDY,
          obj.team,
          _.target,
          _.direction*fSpeed,
          ((_.target.y-(_.target.img.h>>1)-(obj.y-(obj.img.h>>1))-pDY)*fSpeed)
          /dist+strayDY,
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



// Predefined trees for various classes
Behavior.Library={
  moveAndBoundsCheck:"<[move],[loopAnimation],<[isOutsideWorld],[walkingOffMapCheck]>>",
  
  
  APC:"([isReloading],<[foundTarget],(<[!isFacingTarget],[loopAnimation]>,<[seeTarget],[attack]>)>,[moveAndBoundsCheck]>>)",
  Infantry:
  "(\
    [isReloading],\
    \
  )"
};

// Convert predefined shorthand code into btree code.
(function() {
  for(var i in Behavior.Library)
    Behavior.Library[i]=Behavior.ConvertShortHand(Behavior.Library[i]);
})();


/*




btree for APC

(
  [isReloading],
  <[foundTarget],(
    <[!isFacingTarget],[loopAnimation]>,
    <[seeTarget],[attack]>
  )>,
  <[movePawn],[loopAnimation],<
    [isOutsideWorld],
    [walkingOffMapCheck]
  >>
)

*/


