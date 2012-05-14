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
    
    isCrumblingStructure : function(obj) { return obj._.state==STRUCTURE.STATE.WRECK; },
    
    crumbleStructure : function(obj) { var _=obj._;
      _.state=STRUCTURE.STATE.WRECK;
      soundManager.play('crumble');
      return true;
    },
    
    hasCorpseTime : function(obj) { return !obj._.corpsetime; },
    
    isDyingInfantry : function(obj) { return !(obj._.action<INFANTRY.ACTION.DEATH1); },
    
    animateDyingInfantry : function(obj) { var _=obj._;
      _.action=$.R(INFANTRY.ACTION.DEATH1,INFANTRY.ACTION.DEATH2);
      _.frame.current=_.frame.first;
      soundManager.play('die1,die2,die3,die4'.split(',')[$.R(0,3)]);
      return true;
    },
    
    rotCorpse : function(obj) { var _=obj._;
      if(_.frame.current<_.frame.last) _.frame.current++;
      else _.corpsetime--;
      return true;
    },
    
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
          for(var i in _.reinforce.types)
            if($.r()<_.reinforce.damageChance) {
              var killed=$.R(2,16);
              _.reinforce.types[i].qty-=killed;
              if(_.reinforce.types[i].qty<0) _.reinforce.types[i].qty=0;
            }
        }
      }
      
      return true;
    },
    
    isDead:function(obj) { return obj._.health.current<=0; },
    
    checkStructureState:function(structure){ var _=structure._;
      if(_.health.current<0.6*_.health.max) {
        _.state=STRUCTURE.STATE.BAD;
      }
      return true;
    },
    
    isOutsideWorld:function(obj) {
      return world.isOutside(obj);
    },
    
    isProjectileOutOfRange:function(projectile) { // Cannot travel any further
      var _=projectile._;
      return _.range? !_.range-- : true;
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
      if(_.target && (_.target._.x-_.x)*_.direction<0) {
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
    seeEntity:function(obj,t) { var _=obj._;
      return t? Math.abs(t._.x-_.x)<_.sight*world.xHash.BUCKETWIDTH : false;
    },
    
    seeTarget:function(obj) {
      return Behavior.Custom.seeEntity(obj,obj._.target);
    },
    
    
    
    foundTarget:function(obj) { var t=obj._.target;
      // Try to find a valid target!
      if(!t || Behavior.Custom.isDead(t) ||
         !Behavior.Custom.seeTarget(obj) || t._.team==obj._.team)
        if(obj instanceof Pillbox)
          world.xHash.getNearestEnemyRay(obj);
        else
          world.xHash.getNearestEnemy(obj);
      
      return obj._.target? true:false;
    },

    // Face the target -- Infantry
    setFacingTarget:function(obj) { var _=obj._;
      if(_.target) {
        _.direction=_.target._.x>_.x?1:-1;
        // Randomize attack stance -- Infantry
        if(!(obj instanceof EngineerInfantry) &&
           _.action==INFANTRY.ACTION.MOVEMENT)
          _.action=$.R(INFANTRY.ACTION.ATTACK_STANDING,
                       INFANTRY.ACTION.ATTACK_PRONE);
      } else {
        _.action=INFANTRY.ACTION.MOVEMENT;
        _.direction=TEAM.GOALDIRECTION[obj._.team];
      }
      
      _.frame.first=_.direction>0?  6 : 0;
      _.frame.last =_.direction>0?  11: 5;
      return true;
    },    
        
    move:function(obj) { var _=obj._;
      _.x+=_.direction;
      _.y=world.getHeight(_.x);
      return true;
    },    
    
    // this attack function came from Vehicle class; added Infantry stuff.
    attack:function(obj) { var _=obj._;
      var dist=Math.abs(_.target._.x-_.x);      
      
      if(obj instanceof Infantry) {
        // Melee distance: LESS than one body!
        if(dist<_.img.w) {
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
            new HomingMissile({
              x:    _.x,
              y:    _.y-20,
              team: _.team,
              dx:   _.direction*4.6,
              dy:   -8.36
            })
          );
          _.ammo.clip--;
          _.reload.time=$.R(10,1220);
          
        }
        return true;
      }
      
      // Projectile origin relative to sprite
      var pDY=_.shootHeight? -_.shootHeight: -_.img.h>>1;
      var pDX=_.direction*(_.img.w>>1);
      
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
        new _.projectile({
          x:        _.x+pDX,
          y:        _.y+pDY,
          team:     _.team,
          target:   _.target,
          dx:       _.direction*fSpeed,
          dy:       ((_.target._.y-(_.target._.img.h>>1)-(_.y+pDY))*fSpeed)/dist+strayDY,
          accuracy: accuracy
        })
      );
      _.ammo.clip--;
      return true;
    },
    
    fly:function(obj){ var _=obj._;
      _.y+=_.dy;
      _.x+=_.dx;
      // Simulate gravity, add a speed limiter here later, for terminal velo.
      if(obj instanceof MortarShell) _.dy+=_.ddy;
      return true;
    },
    
    hitGroundProjectile:function(projectile){ var _=projectile._;
      _.x-=_.dx>>1;
      world.addPawn(
        new FragExplosion({
          x:  _.x,
          y:  world.getHeight(_.x>>0)
        })
      );
      Behavior.Custom.stopProjectile(projectile);
      return true;
    },
    
    tryBuilding:function(obj){ var _=obj._;
      if(_.build.x==_.x) {
        var scaffold=new Scaffold({
          x:      _.x,
          y:      world.getHeight(_.x),
          team:   _.team,
          build:  { type: _.build.type }
        });
        scaffold.setBuildCount.call(scaffold);
        world.addPawn(scaffold);
        Behavior.Custom.remove(obj);
        return true;
      }
      return false;
    },
    
    tryHitProjectile:function(projectile){ var _=projectile._;
      var h=world.xHash.getNBucketsByCoord(_.x,0); 
      for(var i=0; i<h.length; i++) {
        var unit=h[i];
        if(unit._.team==_.team) continue;
        if(Behavior.Custom.isDead(unit)) continue;      
        
        var dx=_.x-unit._.x;
        var dy=_.y-(unit._.y-(unit._.img.h>>1));
        
        var chanceToHit=_.accuracy[0];
        chanceToHit+=(unit==_.target)?
          _.accuracy[1]:0;
        
        if(unit instanceof Infantry) {
          switch(unit._.action) { // Stance affects chance to be hit
            case INFANTRY.ACTION.ATTACK_PRONE:      chanceToHit-=0.11;
            case INFANTRY.ACTION.ATTACK_CROUCHING:  chanceToHit-=0.06;
          }        
        }      
  
        if(dx*dx+dy*dy>unit._.img.hDist2)   continue;
        if($.r()>chanceToHit) continue;
        // We've hit something!
        if(_.explosion)
          world.addPawn(
            new _.explosion({
              x:  _.x,
              y:  _.y
            })
          );
        Behavior.Custom.takeDamage(unit,_.damage);
        return true;
      }
      return false;
    },
    
    walkingOffMapCheck:function(obj) { var _=obj._;
      // todo: this is not the only "game over"
      if(TEAM.GOALDIRECTION[_.team]==_.direction) {
        soundManager.play('accomp');
        world.pause();
      }
      Behavior.Custom.remove(obj);
      return true;
    },
    
    throwShrapnel:function(obj) { var _=obj._;
      var w2=_.img.w>>1, h2=_.img.h>>1;
      world.addPawn(new SmallExplosion({
        x:  _.x,
        y:  _.y-h2
      }));    
      for(var shrap=$.R(5,10); shrap; shrap--) world.addPawn(
        new MortarShell({
          x:  _.x+$.R(-w2,w2),
          y:  _.y-h2,
          dx: $.R(-4,4)/2,
          dy: $.R(-18,-12)/4
        })
      );
    },
    
    tryCrewing:function(structure) { var _=structure._;
      if(_.crew){
        if(_.crew.current<_.crew.max) {
          var h=world.xHash.getNBucketsByCoord(_.x,2);
          for(var i=0; i<h.length; i++) {
            var unit=h[i];
            if(!(unit instanceof PistolInfantry) ||
               Behavior.Custom.isDead(unit) ||
               (Math.abs(unit._.x-_.x)>_.img.w>>1) )
               continue;
            
            if(unit._.team!=_.team) {
              // change ownership!
              if(_.crew.current==0) {
                _.team=unit._.team;
                _.direction=TEAM.GOALDIRECTION[_.team];
              } else continue;
            }
            
            Behavior.Custom.remove(unit);
            _.crew.current++;
            if(structure instanceof Pillbox)  soundManager.play('sliderack1');
            if(structure instanceof Scaffold) soundManager.play('feed');
            break;
          }
        } else {
          if(structure instanceof Scaffold) {
            world.addPawn(
              new _.build.type({
                x:    _.x,
                y:    world.getHeight(_.x),
                team: _.team
              })
            );
            Behavior.Custom.remove(structure);
            return true;
          }
        }
        if(!_.crew.current){
          // Enemies should not attack an empty pillbox
          _.img.sheet=_.crew.empty;
        } else {
          _.img.sheet=_.crew.occupied(structure);
        }
      }
      return true;
    },
    


    tryReinforcing:function(structure) { var _r=structure._.reinforce, _=structure._;
      if(_r) {
        if(_r.ing>0) _r.ing--; else {
          if(_r.supplyNumber==0 || !_r.parentSquad || !_r.supplyType) return true;
          if(!_r.types[_r.supplyType].qty) return true;
          _r.ing=_r.time;
          _r.types[_r.supplyType].qty--;
          _r.supplyNumber--;
          var unit=new _r.types[_r.supplyType].make({
            x:    _.x,
            y:    world.getHeight(_.x),
            team: _.team
          });
          unit._.squad=_r.parentSquad;
          _r.parentSquad._.members.push(unit);
          if(!_r.supplyNumber) _r.parentSquad._.allMembersJoined=true;
          world.addPawn(unit);
        }
      }
      return true;
    },
    
    createSquad:function(commander,type) { var _=commander._;
      if(_.squads.length<_.strength){
        for(var i=0,d=_.depot; i<d.length; i++)
          if(!d[i]._.reinforce.supplyNumber)
            for(var j in d[i]._.reinforce.types)
              if(type==j) {
                
                var s=new Squad({ team: _.team });
                _.squads.push(s);
                world.addController(s);
                
                d[i]._.reinforce.supplyType=type;
                d[i]._.reinforce.supplyNumber=4;                
                d[i]._.reinforce.parentSquad=s;
                
                return true;
              }
      }
      return true;
    },
    
    idleCommander:function(commander) { var _=commander._;
      
      for(var i=0, newSquads=[];i<_.squads.length;i++)
        if(!Behavior.Custom.isSquadDead(_.squads[i]))
          newSquads.push(_.squads[i]);      
      _.squads=newSquads;
      
      // Build stuff...
      if($.r()<0.011) {
        Behavior.Custom.createSquad(
          commander,
          ["PistolInfantry","RocketInfantry"][$.R(0,Math.round($.r(0.7)))]
        );
      }
    },
    
    isSquadDead:function(squad) { var _=squad._;
      if(!_.allMembersJoined) return false;
      for(var i=0,newMembers=[]; i<_.members.length; i++)
        if(!Behavior.Custom.isDead(_.members[i])) {
          newMembers.push(_.members[i]);
          _.minX=_.members[i]._.x;
        }
      _.members=newMembers;
      
      /*/ Scroll to place where squad met its end.
      if(DEMO_ACTION.CHECKACTION && !_.members.length && isFinite(_.minX))
        DEMO_ACTION.X=_.minX;
      */
      
      return !_.members.length;
    },
    
    TRUE:true,
    FALSE:false
  }
};



// Predefined trees for various classes
// Maybe we can load these in from a server somewhere. So that it's not baked in
// and therefore tweaking can happen independent of game version.
// Though realisticly, they are pretty tied to Behavior.Custom{}
Behavior.Library={

  CommanderIdle:
    "<[idleCommander]>",
    
  SquadAttack:
    "<[!isSquadDead]>",

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
  InfantryDead:
    "<[hasCorpseTime],(<[!isDyingInfantry],[animateDyingInfantry]>,[rotCorpse])>",
    
  EngineerInfantry:
    "<[!tryBuilding],[setFacingTarget],[moveAndBoundsCheck]>",

  Structure:
    "<[checkStructureState],[tryCrewing],[tryReinforcing],<[isArmed],([isReloading],<[foundTarget],[seeTarget],[attack]>)>>",
  StructureDead:
    "<[!isCrumblingStructure],[crumbleStructure]>",
  StructureDeadExplode:
    "<[!isCrumblingStructure],[crumbleStructure],[throwShrapnel]>",
  
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