# todo: load in these tree strings from a text file so they're more easily editable?
# todo: resolve how to spawn an instance of an arbitrary class (given the class name)
# todo: find out how to reference stuff that's going on in the world and use battle world methods
define ->
  (World, Classes) ->
    {      
      Decorators :
        
        TRUE  : true
        FALSE : false
        
        hasHitGround : ->
          if World.isOutside @
            @_.x -= @_.dx>>1 if @_.dx?
            @_.y = World.getHeight @_.x
            true
          else
            false
        
        hasHitEnemy : ->
          potentialHits = World.fetchEveryTarget(@, 0)
          (
            if !t.isAlly(@) and !t.isDead() and t.distHit(@) <= @_.img.hDist2 # 81
              return true
          ) for t in potentialHits
          false
        
        hasSmokeTrail : ->
          @_.rangeTravelled < @_.smokeTrailLength
          
        hasHomingAbility : ->
          @_.homing
        
        spawnSmokeTrail : ->
          World.add(new (@_.smokeTrailType)({
            x: @_.x-@_.dx
            y: @_.y-@_.dy
          }))
          true
        
        spawnChildExplosion : (type, xrange, yrange) ->
          # Call this with .apply(thisArg, args)
          [x, y] = [@_.x+$.R.apply(xrange), @_.y+$.R.apply(yrange)]
          if y>World.height(x) then y = World.height(x)
          World.add(new Classes[type] { x:x, y:y })
        
        spawnSmallFlakExplosion : ->
          (
            Behaviors.Decorators.spawnChildExplosion.apply(@, ['FlakExplosion',   [-12, 12], [-12, 12]])
            Behaviors.Decorators.spawnChildExplosion.apply(@, ['SmokeCloudSmall', [-18, 18], [-18, 18]])
          ) for i in [0..$.R(3,5)]
        
        spawnLargeDetonation : ->
          Behaviors.Decorators.spawnChildExplosion.apply(@, ['SmallExplosion', [0,0], [0, 0]])
          Behaviors.Decorators.spawnChildExplosion.apply(@, ['HEAPExplosion', [-20, 20], [-20, 20]]) for i in [0..1]
          Behaviors.Decorators.spawnChildExplosion.apply(@, ['SmokeCloud',    [-60, 60], [-20, 20]]) for i in [0..12]
          Behaviors.Decorators.spawnChildExplosion.apply(@, ['HEAPExplosion', [-40, 40], [-20, 20]]) for i in [0..1]
        
        steerToEnemy : ->
          if @_.rangeTravelled > @_.homing.delay
            t = @_.target
            if t?
              @_.dx += if t._.x < @_.x then -@_.dspeed else @_.dspeed
              
              if t.distX(@)>128 and @_.y>World.height(@_.x)-48
                # keep it flying steady until it gets close enough
                @_.dy -= @_.dspeed          
              else
                @_.dy += if t._.y < @_.y then -@_.dspeed else @_.dspeed
              
              # Normalize speed with some feedback
              if @_.maxSpeed? and @_.dx*@_.dx + @_.dy*@_.dy > @_.maxSpeed
                @_.dy *= $.R(30,50)*0.01
                @_.dx *= $.R(70,80)*0.01
              
            else
              # Gravity
              @_.dy += @_.ddy
              
            true
          else
            false
        
        fly : ->
          # Keep this simple.
          @_.x += @_.dx
          @_.y += @_.dy
          if @_.range? then @_.range--
          if @_.rangeTravelled? then @_.rangeTravelled++
      
        remove : ->
          if @_.range? then @_.range = 0
          @_.corpsetime = 0
      
        
        
      Trees :
      
        CommanderIdle : "<[idleCommander]>"
          
        SquadAttack : "<[!isSquadDead]>"
      
        Projectile  : "(<[isOutsideWorld],[stopProjectile]>,<[isProjectileOutOfRange],[stopProjectile]>,[!fly],<[tryHitProjectile],[stopProjectile]>)"
        MortarShell : "(<[isOutsideWorld],[hitGroundProjectile]>,<[fly],[fallGravity]>)"
        SmallMine   : "<[tryHitProjectile],[stopProjectile]>"
      
        moveAndBoundsCheck : "<[move],[loopAnimation],(<[isOutsideWorld],[walkingOffMapCheck]>,[TRUE])>"
        
        APC : "([isReloading],<[foundTarget],(<[!isFacingTarget],[loopAnimation]>,<[seeTarget],[attack]>)>,[moveAndBoundsCheck])"
      
        AttackHelicopter : "([isReloading],<[foundTarget],[seeTarget],[attack]>,[fly])"
      
        Infantry        : "([isReloading],<[isBerserking],[moveAndBoundsCheck]>,[InfantryAttack],<[setFacingTarget],[moveAndBoundsCheck]>)"
        InfantryAttack  : "<[foundTarget],[seeTarget],[setFacingTarget],[attack],[!tryBerserking],[loopAnimation]>"
        InfantryDead    : "<[!hasCorpseTime],(<[!isDyingInfantry],[animateDyingInfantry]>,[rotCorpse])>"
        EngineerInfantry: "<[!tryBuilding],[setFacingTarget],[moveAndBoundsCheck]>"
      
        Structure           : "<[checkStructureState],[tryCrewing],[tryReinforcing],<[isArmed],([isReloading],<[foundTarget],[seeTarget],[attack]>)>>"
        StructureDead       : "<[!isCrumblingStructure],[crumbleStructure]>"
        StructureDeadExplode: "<[!isCrumblingStructure],[crumbleStructure],[throwShrapnel]>"
        
        AmmoDump : "<[!isOutOfSupplies],[!isReloading],<[foundSupplyTarget],[supply]>>"
        
        MissileRack : "<[!isReloading],<[foundTarget],[seeTarget],[attack]>>"
        Pillbox     : "<[checkStructureState],[tryCrewing],[!isReloading],<[isCrewed],[foundTarget],<[isFacingTarget],<[seeTarget],[attack]>>>>"
        SmallTurret : "<[checkStructureState],[!isReloading],<[foundTarget],<[isFacingTarget],<[seeTarget],[attack]>>>>"
        Scaffold    : "<[checkStructureState],[tryCrewing]>"
          
        #Tile : '<[!isStoreEmpty], [printXY], [tryMaintainResources]>'
      
    }