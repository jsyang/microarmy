define ->
  # future: Each of these is easily unit tested...

  (World, Classes) ->
  # Prefix          Explanation
  # ----            -----------
  # has_            returns a boolean state, with possible side effects
  # get_            returns a state, without side effects (used within logic only as helpers)
  # is_             returns a boolean state, without side effects
  # set_            returns TRUE, sets a property
  # add_            returns TRUE, adds entity to world
  # do_             returns TRUE, definite side effects, possible side effects on other entities
    {
      Decorators :
        TRUE  : true
        FALSE : false
        
        isArmed : ->
          @projectile?
        
        isGroundHit : ->
          return false if World.contains @
          # Adjust for hitting the ground.
          @x -= @dx >> 1 if @dx?
          @y = World.height @
          true
        
        isTargetVisibleRay : ->
          # Pillboxes and things that can only see in 1 direction
          return false if @direction is 0 and @target.x > @x
          return false if @direction is 1 and @target.x < @x
          sightDist = @sight * (1 << World.XHash.BUCKETWIDTH)
          @getXDist(@target) <= sightDist
          
        isTargetVisible : ->
          # future: only works in 1D. make this work for 2D (aircraft)
          @getXDist(@target) <= @sight * (1 << World.XHash.BUCKETWIDTH)
        
        isTargeting : ->
          @target? and not @target.isDead()
        
        doFindTargetRay : ->
          # Pillboxes
          World.XHash.getNearestEnemy(@, true)?
        
        doFindTarget : ->
          World.XHash.getNearestEnemy(@)?
        
        isFacingTarget : ->
          (@target.x > @x and @direction is 1) or
          (@target.x < @x and @direction is 0)
        
        setFaceTarget : ->
          @direction = if @target.x > @x then 1 else 0
          true
  
        setInfantryMoving : ->
          @action = @ACTION.MOVING
          true
          
        setInfantryAttackStance : ->
          @action = $.R(@ACTION.ATTACK_STANDING, @ACTION.ATTACK_PRONE)
          true
        
        doInfantryDying : ->
          @action = $.R(@ACTION.DEATH1, @ACTION.DEATH2)
          @frame_current = @frame_first
          atom.playSound "die#{$.R(1,4)}"
          true
        
        isInfantryDying : ->
          @action is @ACTION.DEATH1 or
          @action is @ACTION.DEATH2
        
        hasMissileHitTarget : ->
          if @target?
            @isHit @target
          else
            false
        
        hasProjectileHitEnemy : ->
          InfantryClass = Classes['Infantry']
          potentialHits = World.XHash.getNBucketsByCoord(@, 0)
          for t in potentialHits when not @isAlly t
            if !t.isDead() and t.isHit(@)
              chanceToHit =  @accuracy
              chanceToHit += @accuracy_target_bonus if t is @target
              if t instanceof InfantryClass
                # stance affects chance to be hit.
                if t.action is InfantryClass::ACTION.ATTACK_PRONE
                  chanceToHit -= 0.11
                else if t.action is InfantryClass::ACTION.ATTACK_CROUCHING
                  chanceToHit -= 0.06
              if $.r() < chanceToHit
                t.setDamage @damage
                return true
          false
        
        addProjectileExplosion : ->
          explosionClass = Classes[@explosion] if @explosion?
          World.add(new explosionClass {
            x : @x
            y : @y
          }) if explosionClass?
          true
        
        isHitEnemy : ->
          potentialHits = World.XHash.getNBucketsByCoord(@, 1)
          for t in potentialHits when not @isAlly t
            return true if !t.isDead() and t.isHit(@)
          false
        
        doExplosionHit : ->
          potentialHits = World.XHash.getNBucketsByCoord(@, 1)
          for t in potentialHits when t? and @isHit(t)
            t.setDamage @damage
            @damage -= @damageDecay
            @damage = 0 if @damage < 0
          true
        
        isTrailing : ->
          @range_current > @trail_length
          
        isHomingMissile : ->
          @homing? and @homing
        
        addTrail : ->
          trailClass = Classes[@trail_type]
          World.add(new trailClass {
            x: @x - @dx
            y: @y - @dy
          })
          true
        
        # Call this with .apply(thisArg, args)
        addChildExplosion : (className, boundsX = [0, 0], boundsY = [0, 0]) ->
          x = @x + $.R.apply(null, boundsX)
          y = @y + $.R.apply(null, boundsY)
          height = World.height(x)
          y = height if y > height
          explosionClass = Classes[className]
          World.add(new explosionClass {x, y})
          true
        
        addStructureSmallExplosion : ->
          explode = World.battle.behaviors.Decorators.addChildExplosion
          addExplosion = explode.bind(@, 'SmallExplosion', [-8, 8],   [-8, 8])
          addFlames    = explode.bind(@, 'Flame',          [-18, 18], [0, 20])
          addExplosion()
          addFlames() for i in [1..$.R(4, 8)]
          true
          
        addSmallFlakExplosion : ->
          # missile-purple explosion
          explode = World.battle.behaviors.Decorators.addChildExplosion
          addExplosion = explode.bind(@, 'FlakExplosion',   [-12, 12], [-12, 12])
          addSmoke     = explode.bind(@, 'SmokeCloudSmall', [-18, 18], [-18, 18])
          for i in [1..$.R(3, 5)]
            addExplosion()
            addSmoke()
          true
        
        addLargeDetonation : ->
          # missile-red explosion
          explode = World.battle.behaviors.Decorators.addChildExplosion
          explode.call(@, 'SmallExplosion', [0,0],     [0, 0])
          explode.call(@, 'HEAPExplosion',  [-20, 20], [-20, 20])
          explode.call(@, 'HEAPExplosion',  [-20, 20], [-20, 20])
          explode.call(@, 'HEAPExplosion',  [-40, 40], [-20, 20])
          explode.call(@, 'HEAPExplosion',  [-40, 40], [-20, 20])
          explode.call(@, 'SmokeCloud',     [-60, 60], [-20, 20]) for i in [0..12]
          true
        
        doProjectileSteer : ->
          if @range_max - @range_current > @homing_delay
            t = @target
            if t?
              @dx += if t.x < @x then -@dspeed else @dspeed
              # Keep it flying steady until it gets close enough
              if @getXDist(t) > 128 and @y > World.height(@x) - 48
                @dy -= @dspeed          
              else
                @dy += if t.y < @y then -@dspeed else @dspeed
              # Attempt to normalize speed with some feedback
              if @maxSpeed? and @dx*@dx + @dy*@dy > @maxSpeed
                @dy *= $.R(30,50) * 0.01
                @dx *= $.R(70,80) * 0.01
            else
              @dy += @d_dy # Gravity drift
          else
            @dy += @d_dy # Gravity drift
          true
            
        doMoveOnGround : ->
          if @direction > 0
            @x += 1
          else
            @x -= 1
          @y = World.height @
          true
        
        doProjectileFly : ->
          @x += @dx
          @y += @dy
          @range_current-- if @range_current?
          true
      
        doRemove : ->
          @range_current = 0 if @range_current?
          @corpsetime = 0
          true
      
        setNextFrame : ->
          @frame_current++
          true
        
        setFirstFrame : ->
          @frame_current = @frame_first
          true
        
        setBeforeFirstFrame : ->
          @frame_current = @frame_first - 1
          
        isLastFrame : ->
          @frame_current is @frame_last
          
        isPastLastFrame : ->
          @frame_current > @frame_last
        
        isFirstFrame : ->
          @frame_current is @frame_first
        
        isCyclingFrames : ->
          @cycles > 0
        
        setDecrementCycles : ->
          @cycles--
          true
        
        isReloading : ->
          @reload_ing > 0
        
        doTurning : ->
          @turn_ing += @turn_rate
          if @turn_ing > @turn_last
            @turn_ing = 0
            if @direction is 0
              @direction = 1
            else
              @direction = 0
          true
        
        doReloading : ->
          # Begin reloading if we need to reload
          if @reload_ing is 0
            if @ammo_maxsupply?
              @reload_ing = $.R(30, @reload_time) + 1
            else
              @reload_ing = @reload_time + 1
  
          @reload_ing--
          
          # Continue reloading
          if @reload_ing is 0
            # Use ammo from our ammo supply if we're a unit limited by ammo supply
            if @ammo_maxsupply?
              if @ammo_supply < @ammo_max
                @ammo_clip   = @ammo_supply
                @ammo_supply = 0
              else
                @ammo_clip   = @ammo_max
                @ammo_supply -= @ammo_max
            else
              @ammo_clip = @ammo_max
          true
          
        isOutOfAmmo : ->
          @ammo_clip <= 0
  
        isBerserking : ->
          @berserk_ing? and @berserk_ing > 0
        
        doBerserking : ->
          @action = @ACTION.MOVING
          @berserk_ing--
          true
  
        doTryBerserking : ->
          @berserk_ing = @berserk_time if $.r() < @berserk_chance
          true
          
        doClearTarget : ->
          @setTarget()
          true

        isOutsideWorld : ->
          !World.contains @
               
        isInfantryMeleeDistance : ->
          @getXDist(@target) < (@_halfWidth << 1)
       
       
        isInfantryMeleeSuccessful : ->
          $.r() < @berserk_chance
       
        doInfantryMeleeAttack : ->
          # Enemy cannot ignore melee attack
          # future: ninjas?
          @target.setDamage @melee_dmg
          @target.setTarget @
          true
        
        doRangedAttack : ->
          projectile = new Classes[@projectile] {
            x      : @x
            y      : @y
            team   : @team
            target : @target
          }
          
          if @ammo_clip is @ammo_max and projectile.sound?
            atom.playSound projectile.sound
          
          if projectile.bullet_weapon
            infantryClass = Classes['Infantry']
            direction = [-1,1][@direction]
            pDx = direction * @_halfWidth
            
            if @ instanceof infantryClass
              if @action is @ACTION.ATTACK_PRONE
                pDy = -2
              else
                pDy = -4
            else
              pDy = @shoot_dy
            
            projectile.x += pDx
            projectile.y += pDy
            projectile.dx = direction * projectile.speed
            projectile.dy = ((
              (@target.y - @target._halfHeight) - (@y + pDy)
            ) * projectile.speed) / projectile.dist + projectile.stray_dy
          
          World.add projectile
          @ammo_clip--
          true
        
        isInfantryInShotFrame : ->
          "#{@frame_current}" of @SHOTFRAMES
        
        setInfantryDying : ->
          @action = $.R(@ACTION.DEATH1, @ACTION.DEATH2)
          atom.playSound('die' + $.R(1, 4))
          true
        
        isInfantryDying : ->
          @action is @ACTION.DEATH1 or @action is @ACTION.DEATH2
        
        isInfantryAttacking : ->
          @action is @ACTION.ATTACK_STANDING  or
          @action is @ACTION.ATTACK_CROUCHING or
          @action is @ACTION.ATTACK_PRONE
        
        isProjectileActive : ->
          @range_current > 0
        
        isDead : ->
          @isDead()
          
        isBuildLocation : ->
          @build_x is @x
        
        addScaffold : ->
          World.add(new Classes['Scaffold'] {
            x           : @x
            y           : World.height(@)
            team        : @team
            build_type  : @build_type
          })
          atom.playSound 'tack'
          true
          
        doRotting : ->
          @corpsetime-- if @corpsetime > 0
          true
        
        isCrewed : ->
          @crew_current > 0
        
        isFullyCrewed : ->
          @crew_current is @crew_max
        
        doCrewing : ->
          potentialCrew = World.XHash.getNBucketsByCoord(@,1)
          PI = Classes['PistolInfantry']
          for t in potentialCrew when @isAlly @
            if t instanceof PI and !t.isDead() and @isHit(t)
              @crew_current++
              t.remove()
              atom.playSound 'sliderack1'
              return true
          true
          
        addBuiltEntity : ->
          childClass = Classes[@build_type]
          World.add(new childClass {
            x         : @x
            y         : World.height @
            team      : @team
            direction : @direction
          }) 
          true  
        
        isStructureCrumbling : ->
          @state is @STATE.WRECK
        
        isStructureCrumbled : ->
          @crumbled is true
        
        setStructureCrumbled : ->
          @crumbled = true
          atom.playSound 'crumble'
          true
        
        setUntargetable : ->
          @targetable = false
          true
          
        isBuilding : ->
          @build_current < @build_max
        
        doBuilding : ->
          @build_current++
        
  
      # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
      # Prefix          Result
      # ------          ------
      # !               Negate the boolean result
      # ~               Always return true
      
      Trees :
        
        # # #
        
        PawnTarget                  : '(<[isTargeting],[isTargetVisible]>,[doFindTarget])'
        PawnRetarget                : '<[doClearTarget],[PawnTarget]>'
        PawnNeedsReload             : '<[isOutOfAmmo],[doReloading]>'
        
        # # # 
        
        Structure                   : '([StructureDead],[StructureAlive])'
        StructureDeadExplode        : '<[isDead],[~StructureDeadCrumbleExplode]>'
        StructureDead               : '<[isDead],[~StructureDeadCrumble]>'
        StructureDeadRemove         : '<[isDead],[setStructureCrumbled],[setUntargetable],[doRemove]>'
        StructureDeadCrumble        : '<[!isStructureCrumbled],[setStructureCrumbled],[setUntargetable]>'
        StructureDeadCrumbleExplode : '<[StructureDeadCrumble],[addStructureSmallExplosion]>'
        
        StructureAlive              : '<[~StructureCrew],[!PawnNeedsReload],[PawnTarget],[doRangedAttack]>'
        StructureCrew               : '<[!isFullyCrewed],[doCrewing]>'
        
        ScaffoldAliveBuilding       : '<[isBuilding],[doBuilding]>'
        ScaffoldAlive               : '([ScaffoldAliveBuilding],<[addBuiltEntity],[setUntargetable],[doRemove]>)'
        Scaffold                    : '([StructureDeadRemove],[ScaffoldAlive])'
        
        PillboxTarget               : '(<[isTargeting],[isTargetVisibleRay]>,[doFindTargetRay])'
        PillboxAlive                : '<[~StructureCrew],[!PawnNeedsReload],[PillboxTarget],[doRangedAttack]>'
        Pillbox                     : '([StructureDeadExplode],[PillboxAlive])'
        
        SmallTurretNeedsTurn        : '<[!isFacingTarget], [doTurning]>'
        SmallTurretAlive            : '<[~StructureCrew],[!PawnNeedsReload],[PawnTarget],[!SmallTurretNeedsTurn],[doRangedAttack]>'
        SmallTurret                 : '([StructureDeadExplode],[SmallTurretAlive])'
        
        MissileRack                 : '([StructureDeadExplode],[StructureAlive])'
        MissileRackSmall            : '[MissileRack]'
        
        CommCenter                  : '[Structure]' 
        Barracks                    : '[Structure]'
        CommRelay                   : '[Structure]'
        WatchTower                  : '[Structure]'
        AmmoDump                    : '[Structure]'
        AmmoDumpSmall               : '([StructureDeadRemove],[StructureAlive])'
        MineFieldSmall              : '[Structure]'
        Depot                       : '[Structure]'
        RepairYard                  : '[Structure]'
        Helipad                     : '[Structure]'
        
        # # #
        
        Explosion                   : '<[ExplosionDoneRemove],[setNextFrame],[doExplosionHit]>'
        ExplosionDoneRemove         : '([!isLastFrame],[doRemove])'
        ExplosionCycleFrames        : '(<[isLastFrame],[setDecrementCycles],[setFirstFrame]>,[setNextFrame])'
        ExplosionDoneCycles         : '<[!isCyclingFrames],[doRemove]>'
        SmallExplosion              : '[Explosion]'
        FragExplosion               : '[Explosion]'
        FlakExplosion               : '[Explosion]'
        HEAPExplosion               : '[Explosion]'
        ChemExplosion               : '[Explosion]'
        SmokeCloud                  : '<[ExplosionDoneRemove],[setNextFrame]>'
        SmokeCloudSmall             : '[SmokeCloud]'
        Flame                       : '([ExplosionDoneCycles],[ExplosionCycleFrames])'
        ChemCloud                   : '[Flame]'
        
        # # #
        
        Projectile                  : '<[!ProjectileNotActive],[!ProjectileHitGround],[!ProjectileHitEntity],[doProjectileFly]>'
        ProjectileNotActive         : '<[!isProjectileActive],[doRemove]>'
        ProjectileHitGround         : '<[isGroundHit],[addProjectileExplosion],[doRemove]>'
        ProjectileHitEntity         : '<[hasProjectileHitEnemy],[addProjectileExplosion],[doRemove]>'
        Bullet                      : '[Projectile]'
        MGBullet                    : '[Projectile]'
        SmallRocket                 : '[Projectile]'
        SmallShell                  : '[Projectile]'
        
        # # #
        
        SmokeTrail                  : '<[isTrailing],[addTrail]>'
        
        HomingMissileSteer          : '<[PawnTarget],[doProjectileSteer]>'
        HomingMissile               : '<[!ProjectileNotActive],[!HomingMissileHitGround],[!HomingMissileHitEntity],[~HomingMissileSteer],[~SmokeTrail],[doProjectileFly]>'
        HomingMissileHitGround      : '<[isGroundHit],[addLargeDetonation],[doRemove]>'
        HomingMissileHitEntity      : '<[hasMissileHitTarget],[addLargeDetonation],[doRemove]>'
        
        HomingMissileSmall          : '<[!ProjectileNotActive],[!HomingMissileSmallHitGround],[!HomingMissileSmallHitEntity],[~HomingMissileSteer],[~SmokeTrail],[doProjectileFly]>'
        HomingMissileSmallHitGround : '<[isGroundHit],[addSmallFlakExplosion],[doRemove]>'
        HomingMissileSmallHitEntity : '<[hasMissileHitTarget],[addSmallFlakExplosion],[doRemove]>'
        
        # # #
        
        Infantry                    : '([InfantryDead],[InfantryAlive])'
        InfantryNeedsReload         : '<[isOutOfAmmo],[doReloading],[setFirstFrame],[~PawnRetarget]>'
        InfantryMove                : '<[setInfantryMoving],[doMoveOnGround],[~InfantryAnimate]>'
        InfantryAnimate             : '<[setNextFrame],[isPastLastFrame],[setFirstFrame]>'
        InfantryRangedAttack        : '<[isInfantryInShotFrame],[doRangedAttack]>'
        InfantryMeleeAttack         : '<[isInfantryMeleeDistance],[isInfantryMeleeSuccessful],[doInfantryMeleeAttack]>'
        InfantryCombat              : '<[~InfantryCombatBegin],[!InfantryMeleeAttack],[InfantryRangedAttack]>'
        InfantryCombatBegin         : '<[!isInfantryAttacking],[setInfantryAttackStance],[setFirstFrame]>'
        InfantryAttack              : '<[PawnTarget],[setFaceTarget],[~InfantryCombat],[~InfantryAnimate]>'
        
        InfantryBerserk             : '(<[isBerserking],[doBerserking],[InfantryMove]>,<[isTargeting],[!doTryBerserking]>)'
        
        InfantryAlive               : '([InfantryNeedsReload],[InfantryBerserk],[InfantryAttack],[InfantryMove])'
        InfantryDyingAnimate        : '(<[!isInfantryDying],[doInfantryDying]>,<[!isLastFrame],[setNextFrame]>)'
        InfantryDead                : '<[isDead],[~InfantryDyingAnimate],[doRotting]>'
        
        PistolInfantry              : '[Infantry]'
    }