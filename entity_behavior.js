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
        if(typeof(behavior)==="boolean") return behavior;
        if(behavior)
          return invert? !behavior(thisArg) : behavior(thisArg);
        var subtree=Behavior.Library[realId];        
        if(subtree)
          return invert?
            !Behavior.Execute(subtree, thisArg)
            :Behavior.Execute(subtree, thisArg);
        return alert("Custom decorator / subtree '"+realId+"'not found!");
    }
    return alert('ERROR: You are not supposed to see this!');
  },
  
  ConvertShortHand:function(code){
    return eval('('+code
    .replace(/\[/g,'{id:"')
    .replace(/\]/g,'"}')
    .replace(/\(/g,'{id:"selector",children:[')
    .replace(/</g,'{id:"sequence",children:[')
    .replace(/>/g,']}')
    .replace(/\)/g,']}')+')');
  },
  
  Custom:{
    
    // Not usually used in BTrees; as this is not a behavior.
    takeDamage:function(obj,damage){ var _=obj._;
      if(damage<0 || !damage || Behavior.Custom.isDead(obj)) return true;
      _.health.current-=damage;
      
      if(obj instanceof Structure) {
        
        // Crewed structures
        if(_.crew && damage>_.crew.damageThreshold) {
          if($.r()<_.crew.damageChance) {
            var killed=$.R(2,_.crew.max);
            _.crew.current-=killed;
            if(_.crew.current-killed<0) _.crew.current=0;
          }
        }
        
        // Structures that supply troops
        if(_.reinforce && damage>_.reinforce.damageThreshold) {
          if($.r()<_.reinforce.damageChance) {
            var type=$.R(0,_.reinforce.types.length-1);
            var killed=$.R(2,16);
            _.reinforce.supply[type]-=killed;
            if(_.reinforce.supply[type]<0) _.reinforce.supply[type]=0;
          }
        }
      }
      
      return true;
    },
    
    isDead:function(obj) {
      return obj._.health.current<=0;
    },
    
    checkStructureState:function(structure){ var _=structure._;
      if(_.health.current<0.6*_.health.max) {
        structure.state=STRUCTURE.STATE.BAD;        
      }
      return true;
    },
    
    isOutsideWorld:function(obj) {
      return world.isOutside(obj);
    },
    
    isProjectileOutOfRange:function(projectile) { // Cannot travel any further      
      return projectile.range? !projectile.range--:true;
    },
    
    isArmed:function(obj) {
      return !!obj._.projectile;
    },
    
    isCrewed:function(obj) {
      return obj._.crew? obj._.crew.current: false;
    },
    
    isReloading:function(obj) { var _=obj._;
      if(_.reload.ing) {
        _.reload.ing--;
        if(_.reload.ing==0)
          _.ammo.clip=_.ammo.max;
        return true;
      } else if(_.ammo.clip==0) {
        _.reload.ing=_.reload.time;
        if(obj instanceof Infantry) // todo: get rid of this hack
          _.frame.current=_.frame.first;                
        return true;
      }
      return false;
    },
    
    // For really long range attacks: if we can't find a target, force
    // it to wait a bit before looking again: half the reload time.
    forceReload:function(obj) { var _=obj._;
      _.reload.ing=_.reload.time;
      _.ammo.clip=_.ammo.max;
      return true;
    },
    
    /* Berserk: move towards target for some time regardless of
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
    
    isVehicleMoving:function(obj) { var _=obj._;
      return  _.action==VEHICLE.ACTION.MOVING ||
              _.action==VEHICLE.ACTION.TURNING;
    },
    
    // Handle rotation to face target -- Vehicles
    isFacingTarget:function(obj) { var _=obj._;
      if(_.target && (_.target.x-obj.x)*_.direction<0) {
        if(!_.turn.ing) {            
          _.turn.ing=1;
          _.turn.current=0;
          if(obj instanceof Vehicle) _.action=VEHICLE.ACTION.TURNING;
        } else {
          _.turn.current++;
          if(_.turn.current>_.turn.last) {
            _.turn.ing=_.turn.current=0;
            _.direction*=-1;
            if(obj instanceof Vehicle) _.action=VEHICLE.ACTION.MOVING;
          }            
        }
        return false;
      }
      return true;
    },    
    
    remove:function(obj) {      
      obj._.health.current=obj.corpsetime=0;
      return true;
    },
    
    tryBerserking:function(obj) { var _=obj._;
      if($.r()<_.berserk.chance) {
        _.berserk.ing=_.berserk.time;
        return true;
      }
      return false;
    },    
    
    stopProjectile:function(projectile) {
      projectile.range=0;
      projectile.corpsetime=0;
      return true;
    },
    
    loopAnimation:function(obj) { var _=obj._;
      if(++_.frame.current>_.frame.last)
        _.frame.current=_.frame.first;
      return true;
    },
    
    // Sight is in multiples of XHash buckwidths!
    seeEntity:function(obj,t) { 
      return t? Math.abs(t.x-obj.x)<obj._.sight*world.xHash.BUCKETWIDTH : false;
    },
    
    seeTarget:function(obj) {
      return Behavior.Custom.seeEntity(obj,obj._.target);
    },
    
    
    
    foundTarget:function(obj) { var t=obj._.target;
      // Try to find a valid target!
      if(!t || Behavior.Custom.isDead(t) ||
         !Behavior.Custom.seeTarget(obj) || t.team==obj.team)
        if(obj instanceof Pillbox)
          world.xHash.getNearestEnemyRay(obj);
        else
          world.xHash.getNearestEnemy(obj);
      
      return obj._.target? true:false;
    },

    // Face the target -- Infantry
    setFacingTarget:function(obj) { var _=obj._;
      if(_.target) {
        _.direction=_.target.x>obj.x?1:-1;
        // Randomize attack stance -- Infantry
        if(!(obj instanceof EngineerInfantry) &&
           _.action==INFANTRY.ACTION.MOVEMENT)
          _.action=$.R(INFANTRY.ACTION.ATTACK_STANDING,
                       INFANTRY.ACTION.ATTACK_PRONE);
      } else {
        _.action=INFANTRY.ACTION.MOVEMENT;
        _.direction=TEAM.GOALDIRECTION[obj.team];
      }
      
      _.frame.first=_.direction>0?  6 : 0;
      _.frame.last =_.direction>0?  11: 5;
      return true;
    },    
        
    move:function(obj) {
      obj.x+=obj._.direction;
      obj.y=world.getHeight(obj.x);
      return true;
    },    
    
    // this attack function came from Vehicle class; added Infantry stuff.
    attack:function(obj) { var _=obj._;
      var dist=Math.abs(_.target.x-obj.x);      
      
      if(obj instanceof Infantry) {
        // Melee distance: LESS than one body!
        if(dist<obj.img.w) {
          if($.r()<_.berserk.chance) {
            Behavior.Custom.takeDamage(_.target,_.meleeDmg);
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
        if(dist<48) return true; // don't shoot it's going to blow us up!
        if(!INFANTRY.SHOTFRAME.ROCKET[_.frame.current]) return true;
        else soundManager.play('rocket');
        accuracy=[0.28,0.68]; strayDY=$.R(-19,19)/100;
        
      } else if(_.projectile==SmallShell) {
        soundManager.play('turretshot');
        fSpeed=7;
        accuracy=[0.60,0.50]; strayDY=$.R(-12,9)/100; // upwards tendency
      
      } else if(_.projectile==HomingMissile) {
        if(!_.target) {
          _.reload.time=$.R(_.reload.min,_.reload.max);
        } else {
          // Missile doesn't need a target: it finds its own!
          soundManager.play('missile1');
          world.addPawn(
            new HomingMissile(obj.x,obj.y-20,
                              obj.team,undefined,
                              _.direction*4.6,-8.36,0 )
          );
          _.ammo.clip--;
          _.reload.time=$.R(10,1220);
          
        }
        return true;
      }
      
      // Projectile origin relative to sprite
      var pDY=_.shootHeight? -_.shootHeight: -obj.img.h>>1;
      var pDX=_.direction*(obj.img.w>>1);
      
      /*if(obj instanceof Structure) {
        var pDY=-_.shootHeight;
        var pDX=_.direction>0? (obj.img.w>>1)-2 : -((obj.img.w>>1)-2);
      } */     
      
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
          ((_.target.y-(_.target.img.h>>1)-(obj.y+pDY))*fSpeed)
          /dist+strayDY,
          accuracy
        )
      );
      _.ammo.clip--;
      return true;
    },
    
    fly:function(obj){
      obj.y+=obj.dy;
      obj.x+=obj.dx;
      if(obj instanceof MortarShell) obj.dy+=obj.ddy;
      return true;
    },
    
    hitGroundProjectile:function(projectile){
      projectile.x-=projectile.dx>>1;
      world.addPawn(new FragExplosion(projectile.x,world.getHeight(projectile.x>>0)));
      Behavior.Custom.stopProjectile(projectile);
      return true;
    },
    
    tryBuilding:function(obj){ var _=obj._;
      if(_.build.x==obj.x) {
        var scaffold=new Scaffold(obj.x,world.getHeight(obj.x),obj.team);
        scaffold._.build.type=_.build.type;
        
        // How many workers do we need to construct this?
        var type=_.build.type;
        var crewCount=8;
             if(type instanceof Pillbox)      crewCount=4;
        else if(type instanceof SmallTurret)  crewCount=6;
        else if(type instanceof Barracks)     crewCount=16;
        else if(type instanceof CommCenter)   crewCount=60;
        
        scaffold._.crew.max=crewCount;
        scaffold._.crew.current=1;
        world.addPawn(scaffold);
        Behavior.Custom.remove(obj);
        poo=scaffold;
        return true;
      }
      return false;
    },
    
    tryHitProjectile:function(projectile){
      var h=world.xHash.getNBucketsByCoord(projectile.x,0);    
      for(var i=0; i<h.length; i++) {
        var unit=h[i];
        if(unit.team==projectile.team)  continue;
        if(Behavior.Custom.isDead(unit))         continue;      
        
        var dx=projectile.x-unit.x;
        var dy=projectile.y-(unit.y-(unit.img.h>>1));
        
        var chanceToHit=projectile.accuracy[0];
        chanceToHit+=(unit==projectile.target)?
          projectile.accuracy[1]:0;
        
        if(unit instanceof Infantry) {
          switch(unit._.action) { // Stance affects chance to be hit
            case INFANTRY.ACTION.ATTACK_PRONE:      chanceToHit-=0.11;
            case INFANTRY.ACTION.ATTACK_CROUCHING:  chanceToHit-=0.06;
          }        
        }      
  
        if(dx*dx+dy*dy>unit.img.hDist2)   continue;
        if($.r()>chanceToHit) continue;
        // We've hit something!
        if(projectile.explosion)
          world.addPawn(new projectile.explosion(projectile.x,projectile.y));
        Behavior.Custom.takeDamage(unit,projectile.damage);
        return true;
      }
      return false;
    },
    
    walkingOffMapCheck:function(obj) {
      if(TEAM.GOALDIRECTION[obj.team]==obj._.direction) {
        soundManager.play('accomp');
        world.pause();
      }
      Behavior.Custom.remove(obj);
      return true;
    },
    
    throwShrapnel:function(obj) {
      var w2=obj.img.w>>1, h2=obj.img.h>>1;
      world.addPawn(new SmallExplosion(obj.x,obj.y-h2));    
      for(var shrap=$.R(5,10); shrap; shrap--) world.addPawn(
        new MortarShell(
          obj.x+$.R(-w2,w2),obj.y-h2,0,0,
          $.R(-4,4)/2,$.R(-18,-12)/4,0)
      );
    },
    
    tryCrewing:function(structure) { var _=structure._;
      if(_.crew){
        if(_.crew.current<_.crew.max) {
          var h=world.xHash.getNBucketsByCoord(structure.x,2);
          for(var i=0; i<h.length; i++) {
            if(!(h[i] instanceof PistolInfantry) ||
               Behavior.Custom.isDead(h[i]) ||
               (Math.abs(h[i].x-structure.x)>structure.img.w>>1) )
               continue;
            
            if(h[i].team!=structure.team) {
              // new ownership!
              if(_.crew.current==0) {
                structure.team=h[i].team;
                _.direction=TEAM.GOALDIRECTION[structure.team];
              } else continue;
            }
            
            Behavior.Custom.remove(h[i]);
            _.crew.current++;
            if(structure instanceof Pillbox) soundManager.play('sliderack1');
            else soundManager.play('feed');
            break;
          }
        } else {
          if(structure instanceof Scaffold) {
            world.addPawn(
              new _.build.type(
                structure.x,
                world.getHeight(structure.x),
                structure.team
              )
            );
            Behavior.Custom.remove(structure);
            return true;
          }
        }
        if(!_.crew.current){
          // Enemies should not attack an empty pillbox
          structure.imgSheet=_.crew.empty;
        } else {
          structure.imgSheet=_.crew.occupied(structure);
        }        
      }
      return true;
    },
    


    tryReinforcing:function(structure) { var _=structure._;
      if(_.reinforce) {        
        if(_.reinforce.next>0) _.reinforce.next--; else {
          // Dump reinforcements faster if shit is hitting the fan.
          _.reinforce.next=_.reinforce.time;
          
          for(var i=0; i<=structure.state; i++) {            
            // Dirty, but working for now--we'll want to build this later
            var typePick=$.R(0,_.reinforce.types.length-1);
            if(_.reinforce.supply[typePick]
               && $.r()<_.reinforce.chances[typePick]) {
              _.reinforce.supply[typePick]--;
              world.addPawn(
                new _.reinforce.types[typePick]
                (structure.x,world.getHeight(structure.x),structure.team)
              );
            }
          }
        }
      }
      return true;
    },
    
    checkSupplyOrder:function(structure){ var _=structure._;
      if(_.reinforce.size.current==_.reinforce.size.max) {
        _.reinforce.size.current=0;
        _.behavior=Behavior.Library.Structure;
      }
      return true;
    },
    
    TRUE:true,
    FALSE:false
  }
};



// Predefined trees for various classes
// Maybe we can load these in from a server somewhere. So that it's not baked in
// and therefore tweaking can happen independent of game version.
Behavior.Library={

  Projectile:
    "(<[isOutsideWorld],[stopProjectile]>,<[isProjectileOutOfRange],[stopProjectile]>,[!fly],<[tryHitProjectile],[stopProjectile]>)",
  MortarShell:
    "(<[isOutsideWorld],[hitGroundProjectile]>,[fly])",
  SmallMine:
    "<[tryHitProjectile],[stopProjectile]>",

  moveAndBoundsCheck:
    "<[move],[loopAnimation],(<[isOutsideWorld],[walkingOffMapCheck]>,[TRUE])>",
  
  APC:
    "([isReloading],<[foundTarget],(<[!isFacingTarget],[loopAnimation]>,<[seeTarget],[attack]>)>,[moveAndBoundsCheck])",

  Infantry:
    "([isReloading],<[isBerserking],[moveAndBoundsCheck]>,<[foundTarget],[seeTarget],[setFacingTarget],[attack],[!tryBerserking],[loopAnimation]>,<[setFacingTarget],[moveAndBoundsCheck]>)",    
  EngineerInfantry:
    "<[!tryBuilding],[setFacingTarget],[moveAndBoundsCheck]>",
  
  StructureSupply:
    "<[checkStructureState],[checkSupplyOrder],[tryReinforcing]>",
  Structure:
    "<[checkStructureState],[tryCrewing],<[isArmed],([isReloading],<[foundTarget],[seeTarget],[attack]>)>>",
    
  MissileRack:
    "<[!isReloading],(<[foundTarget],[seeTarget],[attack]>,[forceReload])>",
  Pillbox:
    "<[checkStructureState],[tryCrewing],[!isReloading],<[isCrewed],[foundTarget],<[isFacingTarget],<[seeTarget],[attack]>>>>",
  SmallTurret:
    "<[checkStructureState],[!isReloading],<[foundTarget],<[isFacingTarget],<[seeTarget],[attack]>>>>",
  Scaffold:
    "<[checkStructureState],[tryCrewing]>"
  
};

// Convert predefined shorthand code into btree code.
(function() {
  for(var i in Behavior.Library)
    Behavior.Library[i]=Behavior.ConvertShortHand(Behavior.Library[i]);
})();