# todo: load in these tree strings from a text file so they're more easily editable?
define ->
  (World, Classes) ->
    {      
      Decorators :
        # todo: Each of these decorators is a unit... easily unit tested
        
        TRUE  : true
        FALSE : false
        
        isArmed : -> @_.projectile?
        
        hasHitGround : ->
          if !World.contains(@)
            @_.x -= @_.dx>>1 if @_.dx?
            @_.y = World.height(@)
            true
          else
            false
        
        findTarget : ->
          World.XHash.getNearestEnemy(@)?
        
        faceTarget : ->
          @_.direction = if @_.target._.x > @_.x then  1 else -1
          true

        setInfantryMoving : ->
          @_.action = @CONST.ACTION.MOVING
          true
          
        faceGoalDirection : ->
          # todo: remove this once testing is done
          @_.direction = {
            '0' : -1
            '1' : 1
          }[@_.team]
          true
          
        gameOver : -> 
          # todo: this is not the only "game over"
          # todo: remove this and use mission handlers instead
          soundManager.play('accomp')
          true
        
        setFacingFrames : ->
          @_.frame.first = if @_.direction>0 then  6   else 0
          @_.frame.last  = if @_.direction>0 then  11  else 5
          
          # Make sure we're facing the correct direction immediately.
          if not( @_.frame.first <= @_.frame.current <= @_.frame.last )
            @_.frame.current = @_.frame.first + (@_.frame.current % 6)
          true
          
        setInfantryAttackStance : ->
          @_.action = $.R(@CONST.ACTION.ATTACK_STANDING,@CONST.ACTION.ATTACK_PRONE)
          true
        
        tryProjectileHit : ->
          potentialHits = World.XHash.getNBucketsByCoord(@, 0)
          InfantryClass = Classes['Infantry']
          (
            if !t.isAlly(@) and !t.isDead() and t.distHit(@) <= t._.img.hDist2 + @_.img.hDist2
              chanceToHit = @_.accuracy[0]
              if t is @_.target then chanceToHit += @_.accuracy[1]
              if t instanceof InfantryClass
                # stance affects chance to be hit.
                if t._.action is InfantryClass.prototype.CONST.ACTION.ATTACK_PRONE     then chanceToHit -= 0.11
                if t._.action is InfantryClass.prototype.CONST.ACTION.ATTACK_CROUCHING then chanceToHit -= 0.06
              
              if $.r() < chanceToHit
                t.takeDamage(@_.damage)
                return true
          ) for t in potentialHits
          false
        
        tryProjectileExplode : ->
          if @_.explosion? and Classes[@_.explosion]?
            World.add(new Classes[@_.explosion]({
              x: @_.x
              y: @_.y
            }))
          true
        
        hasHitEnemy : ->
          potentialHits = World.XHash.getNBucketsByCoord(@, 1)
          (
            if !t.isAlly(@) and !t.isDead() and t.distHit(@) <= @_.img.hDist2 + t._.img.hDist2
              return true
          ) for t in potentialHits
          
          false
        
        # Special version of hasHitEnemy for explosions
        explode : ->
          potentialHits = World.XHash.getNBucketsByCoord(@, 1)
          (
            # todo: might want to check if this is being triggered on the correct dist
            if t? and t.distHit(@) <= @_.img.hDist2
              t.takeDamage(@_.damage)
              @_.damage -= @_.damageDecay
              @_.damage = 0 if @_.damage<0
          ) for t in potentialHits
          true
        
        hasSmokeTrail : ->
          @_.rangeTravelled < @_.smokeTrailLength
          
        hasHomingAbility : ->
          @_.homing
        
        spawnSmokeTrail : ->
          World.add(new Classes[@_.smokeTrailType]({
            x: @_.x-@_.dx
            y: @_.y-@_.dy
          }))
          true
        
        spawnChildExplosion : (type, xrange, yrange) ->
          # Call this with .apply(thisArg, args)
          [x, y] = [@_.x+$.R.apply(null,xrange), @_.y+$.R.apply(null,yrange)]
          if y>World.height(x) then y = World.height(x)
          World.add(new Classes[type]({x,y}))
        
        spawnSmallFlakExplosion : ->
          (
            World.Battle.Behaviors.Decorators.spawnChildExplosion.apply(@, ['FlakExplosion',   [-12, 12], [-12, 12]])
            World.Battle.Behaviors.Decorators.spawnChildExplosion.apply(@, ['SmokeCloudSmall', [-18, 18], [-18, 18]])
          ) for i in [0..$.R(3,5)]
          true
        
        spawnLargeDetonation : ->
          World.Battle.Behaviors.Decorators.spawnChildExplosion.apply(@, ['SmallExplosion', [0,0], [0, 0]])
          World.Battle.Behaviors.Decorators.spawnChildExplosion.apply(@, ['HEAPExplosion', [-20, 20], [-20, 20]]) for i in [0..1]
          World.Battle.Behaviors.Decorators.spawnChildExplosion.apply(@, ['SmokeCloud',    [-60, 60], [-20, 20]]) for i in [0..12]
          World.Battle.Behaviors.Decorators.spawnChildExplosion.apply(@, ['HEAPExplosion', [-40, 40], [-20, 20]]) for i in [0..1]
          true
        
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
              @_.dy += @_.ddy # Gravity
          else
            @_.dy += @_.ddy # Gravity
            
          true
            
        move : ->
          @_.x += @_.direction
          @_.y = World.height(@)
          true
        
        fly : ->
          @_.x += @_.dx
          @_.y += @_.dy
          @_.range-- if @_.range?
          if @_.rangeTravelled? then @_.rangeTravelled++
          true
      
        remove : ->
          if @_.range? then @_.range = 0
          @_.corpsetime = 0
          false
      
        nextFrame : ->
          @_.frame.current++
          true
          
        isPastLastFrame : ->
          @_.frame.current >= @_.frame.last
        
        gotoFirstFrame : ->
          @_.frame.current = @_.frame.first
          true
        
        isFirstFrame : ->
          @_.frame.current is @_.frame.first
        
        hasCyclesRemaining : ->
          @_.cycles > 0
        
        decrementCycles : ->
          if @_.cycles? then @_.cycles--
          true
        
        isReloading : -> @_.reload.ing > 0
        
        tryReloading : ->
          @_.reload.ing--
          if @_.reload.ing is 0
            # Use ammo from our ammo supply if we're a unit limited by ammo supply
            if @_.ammo.maxsupply
              if @_.ammo.supply<@_.ammo.max
                @_.ammo.clip    = @_.ammo.supply
                @_.ammo.supply  = 0
              else
                @_.ammo.clip    = @_.ammo.max
                @_.ammo.supply  -= @_.ammo.max
            else
              @_.ammo.clip = @_.ammo.max
          true
          
        isOutOfAmmo : -> @_.ammo.clip <= 0
        
        beginReloading : ->
          @_.reload.ing = if @_.ammo.maxsupply then $.R(30, @_.reload.time) else @_.reload.time
          true
            
        isBerserking : ->
          if @_.berserk.ing > 0
            @_.action = @CONST.ACTION.MOVING
            @_.berserk.ing--
            true
          else
            false
            
          
        tryBerserking : ->
          if $.r() < @_.berserk.chance
            @_.berserk.ing = @_.berserk.time
          @_.berserk.ing > 0
          
        clearTarget : ->
          @setTarget()
          true
        
        hasTarget : ->
          @_.target? and !@_.target?.isDead()
        
        isOutsideWorld : ->
          !World.contains(@)
          
        seeTarget : ->
          @distX(@_.target) <= @_.sight*(1<<World.XHash._.BUCKETWIDTH)
        
        # use weapons for this instead of a specific attack func?
        # attack -> attackWith[class.weapon]
        
        tryStructureAttack : ->
          dist          = @distX(@_.target)
          accuracy      = [0, 0]
          bulletWeapon  = false
          pSpeed        = 4
          
          switch @_.projectile
            
            when 'MGBullet'
              accuracy      = [0.65, 0.35]  # chanceToHit [periphery, target bonus]
              strayDy       = $.R(-15,15)*0.01
              sound         = 'mgburst'
              bulletWeapon  = true
              
            when 'Bullet'
              accuracy      = [0.15, 0.85]
              strayDy       = $.R(-15,15)*0.01
              sound         = 'pistol'
              bulletWeapon  = true
              
            when 'SmallRocket'
              if dist < 48 then return true
              accuracy      = [0.28, 0.68]
              strayDy       = $.R(-19,19)*0.01
              sound         = 'rocket'
              bulletWeapon  = true
            
            when 'SmallShell'
              accuracy      = [0.60,0.50]
              strayDy       = $.R(-12,9)*0.01
              sound         = 'pistol'
              pSpeed        = 7
              bulletWeapon  = true
              
            when 'HomingMissileSmall'
              dx            = @_.direction*5.12
              dy            = -6.35
              
            when 'HomingMissile'
              dx            = @_.direction*4.6
              dy            = -8.36
              
            else
              accuracy  = [0.2, 0.5]
              strayDy   = $.R(-30,30)*0.01
          
          if @_.ammo.clip == @_.ammo.max and sound? then soundManager.play(sound)
          
          
          pDx    = @_.direction*(@_.img.w>>1)
          pDy    = @_.shootDy
          
          if bulletWeapon
            if dist > 50
              accuracy[0]-=0.02
              accuracy[1]-=0.15
            if dist > 120
              accuracy[0]-=0.01
              accuracy[1]-=0.18
            if dist > 180
              accuracy[0]-=0.01
              accuracy[1]-=0.08
            if dist > 200
              accuracy[0]-=0.01
              accuracy[1]-=0.08
          
            projectile = new Classes[@_.projectile]({
              accuracy
              x       : @_.x + pDx
              y       : @_.y + pDy
              team    : @_.team
              target  : @_.target
              dx      : @_.direction*pSpeed
              dy      : ((@_.target._.y-(@_.target._.img.h>>1)-(@_.y+pDy))*pSpeed)/dist + strayDy
            })
          else
            projectile = new Classes[@_.projectile]({
                dx
                dy
                x       : @_.x + pDx
                y       : @_.y + pDy
                team    : @_.team
                target  : @_.target
            })
          
          World.add(projectile)
          @_.ammo.clip--
          true
        
        tryInfantryBuild : ->
          if @_.build.x is @_.x
            World.add(new Classes['Scaffold']({
              x     : @_.x
              y     : World.height(@)
              team  : @_.team
              build : @_.build
            }))
            return true
          false
        
        tryInfantryAttack : ->
          dist = @distX(@_.target)
          if dist < @_.img.w
            # melee range
            if $.r() < @_.berserk.chance
                @_.target.takeDamage(@_.meleeDmg)
                # Pretty hard to ignore someone punching your face
                @_.target._?.target = @
          else
          
            # todo: move this into its own decorator
            if @CONST.SHOTFRAME[@constructor.name][@_.frame.current % 6] is '0' then return true
            
            accuracy = [0, 0]
            
            switch @_.projectile
              when 'MGBullet'
                accuracy  = [0.65, 0.35]  # chanceToHit [periphery, target bonus]
                strayDy   = $.R(-15,15)*0.01
                sound     = 'mgburst'
              when 'Bullet'
                accuracy  = [0.15, 0.85]
                strayDy   = $.R(-15,15)*0.01
                sound     = 'pistol'
              when 'SmallRocket'
                if dist < 48 then return true
                accuracy  = [0.28, 0.68]
                strayDy   = $.R(-19,19)*0.01
                sound     = 'rocket'
              else
                accuracy  = [0.2, 0.5]
                strayDy   = $.R(-30,30)*0.01
            
            if @_.ammo.clip == @_.ammo.max and sound? then soundManager.play(sound)
            
            pSpeed = 4
            pDx    = @_.direction*(@_.img.w>>1)
            pDy    = if @_.action is @CONST.ACTION.ATTACK_PRONE then -2 else -4
            
            if dist > 50
              accuracy[0]-=0.02
              accuracy[1]-=0.15
            if dist > 120
              accuracy[0]-=0.01
              accuracy[1]-=0.18
            if dist > 180
              accuracy[0]-=0.01
              accuracy[1]-=0.08
            if dist > 200
              accuracy[0]-=0.01
              accuracy[1]-=0.08
            
            World.add(
              new Classes[@_.projectile](
                {
                  accuracy
                  x       : @_.x + pDx
                  y       : @_.y + pDy
                  team    : @_.team
                  target  : @_.target
                  dx      : @_.direction*pSpeed
                  dy      : ((@_.target._.y-(@_.target._.img.h>>1)-(@_.y+pDy))*pSpeed)/dist + strayDy
                }
              )
            )
            
            @_.ammo.clip--
            
          true
        
        setInfantryDying : ->
          @_.action = $.R(@CONST.ACTION.DEATH1,@CONST.ACTION.DEATH2)
          soundManager.play('die'+$.R(1,4))
          true
        
        isInfantryDying : ->
          @CONST.ACTION.DEATH1 <= @_.action <= @CONST.ACTION.DEATH2
        
        isInfantryAttacking : ->
          @CONST.ACTION.ATTACK_STANDING <= @_.action <= @CONST.ACTION.ATTACK_PRONE
        
        isProjectileActive : ->
          @_.range > 0
        
        isDead : ->
          @isDead()
          
        rot : ->
          if @_.corpsetime > 0 then @_.corpsetime--
          true
        
        isCrewed : -> @_.crew? and @_.crew?.current? > 0
        
        isFullyCrewed : -> @_.crew? and @_.crew.current is @_.crew.max
        
        tryCrewing : ->
          if @_.crew.current < @_.crew.max
            potentialCrew = World.XHash.getNBucketsByCoord(@,1)
            (
              if t instanceof Classes['PistolInfantry'] and !t.isDead() and t.distX(@) <= (@_.img.w>>1) and t.isAlly(@)
                @_.crew.current++
                t.remove()
                soundManager.play('sliderack1')
                return true
            ) for t in potentialCrew
          false
        
        tryScaffoldSpawnChild : ->
          child = Classes[@_.build.type]
          if child?
            World.add(new child({
              x     : @_.x
              y     : World.height(@)
              team  : @_.team
            })) 
            true
            
          else
            false
          
        
        hasReinforcements : ->
          @_.reinforce?
        
        tryReinforcing : ->
          if @_.reinforce.ing
            if  @_.reinforce.supplyNumber > 0 and
                @_.reinforce.parentSquad?     and
                @_.reinforce.supplyType?      and
                @_.reinforce.types[@_.reinforce.supplyType] > 0
              # release a unit from the supply
              @_.reinforce.ing = @_.reinforce.time
              @_.reinforce.types[@_.reinforce.supplyType]--
              @_.reinforce.supplyNumber--
              
              # todo: spawned unit inherits parameters from the structure's reinforce obj
              instance = new Classes[@_.reinforce.supplyType]({
                x     : @_.x
                y     : World.height(@)
                team  : @_.team
                squad : @_.reinforce.parentSquad
              })
              
              World.add(instance)
              # todo: parentSquad should check if all its members have joined rather than the supplier
              @_.reinforce.parentSquad.add(instance)
              return true
            
          false
        
        isStructureCrumbling : -> @_.state is @CONST.STATE.WRECK
        
        isCrumbled : -> @_.crumbled is true
        
        setUntargetable : -> @_.targetable = false
        
        log1 : ->
          console.log(111)
          true
          
        log2 : ->
          console.log(222)
          true
        
      Trees :

        removeIfOutsideWorld        : '<[isOutsideWorld],[remove]>'
        removeIfProjectileNotActive : '<[!isProjectileActive],[remove]>'

        Projectile          : '([removeIfOutsideWorld],[removeIfProjectileNotActive],[!fly],<[tryProjectileHit],[tryProjectileExplode],[remove]>)'
        Bullet              : '[Projectile]'
        MGBullet            : '[Projectile]'
        SmallRocket         : '[Projectile]'
        SmallShell          : '[Projectile]'
      
        SmokeTrail          : '(<[hasSmokeTrail],[spawnSmokeTrail]>,[TRUE])'
        
        HomingFindTarget    : '([hasTarget],[findTarget],[TRUE])'
        HomingAbility       : '([!HomingFindTarget],[steerToEnemy],[TRUE])'
        # todo : make the spawnExplosion stuff part of the model?
        HomingMissile       : '(<[isOutsideWorld],[spawnLargeDetonation],[remove]>,[removeIfProjectileNotActive],[!SmokeTrail],[!HomingAbility],[!fly],<[hasHitEnemy],[spawnLargeDetonation],[remove]>)'
        HomingMissileSmall  : '(<[isOutsideWorld],[spawnSmallFlakExplosion],[remove]>,[removeIfProjectileNotActive],[!SmokeTrail],[!HomingAbility],[!fly],<[hasHitEnemy],[log1],[spawnSmallFlakExplosion],[remove]>)'
      
        ################################################################################################################################################################
      
        corpseDecay     : '(<[!isPastLastFrame],[nextFrame]>,[rot])'
        animate         : '([!nextFrame],<[isPastLastFrame],[decrementCycles],[gotoFirstFrame]>,[TRUE])'
      
        Explosion       : '(<[isPastLastFrame],[remove]>,[!nextFrame],[explode])'
        SmallExplosion  : '[Explosion]'
        FragExplosion   : '[Explosion]'
        FlakExplosion   : '[Explosion]'
        HEAPExplosion   : '[Explosion]'
        ChemExplosion   : '[Explosion]'
        
        SmokeCloud      : '(<[isPastLastFrame],[remove]>,[!nextFrame])'
        SmokeCloudSmall : '[SmokeCloud]'

        Flame           : '(<[!hasCyclesRemaining],[remove]>,[animate])'
        ChemCloud       : '[Flame]'
        
        ################################################################################################################################################################
        
        # Berserk means Infantry charges towards target
        
        #InfantrySpawn           : '' # Make the spawned Infantry either parachute down or at ground level
        InfantryDead            : '<[!hasCorpseTime],(<[!isDyingInfantry],[animateDyingInfantry]>,[rotCorpse])>'
        InfantryReloading       : '(<[isReloading],[tryReloading]>,<[isOutOfAmmo],[beginReloading],[setInfantryAttackStance],[clearTarget],[gotoFirstFrame]>)'
        InfantryBerserking      : '<[isBerserking],[move],[animate]>'
        InfantryFindTarget      : '<[findTarget],[seeTarget]>'
        InfantrySetStance       : '([isInfantryAttacking],[setInfantryAttackStance])'
        InfantryDoAttack        : '<[tryInfantryAttack],[animate],([tryBerserking],[TRUE])>'
        InfantryTryAttack       : '(<[hasTarget],[seeTarget],[faceTarget],[setFacingFrames],[InfantryDoAttack]>,[InfantryFindTarget])'
        InfantryMoveToGoal      : '([!faceGoalDirection],[!setFacingFrames])'
        InfantryMove            : '(<[isOutsideWorld],[gameOver],[remove]>,[!setInfantryMoving],[!move],[animate])'
        
        InfantryAlive           : '([InfantryReloading],[InfantryBerserking],[InfantryTryAttack],[InfantryMoveToGoal],[InfantryMove])'
        InfantryDead            : '(<[!isInfantryDying],[setInfantryDying],[gotoFirstFrame]>,[corpseDecay])'
        
        Infantry                : '(<[isDead],[InfantryDead]>,[InfantryAlive])'
        
        PistolInfantry          : '[Infantry]'
        RocketInfantry          : '[Infantry]'
        
        InfantryMoveToBuild     : '([!faceTarget],[!setFacingFrames],<[tryInfantryBuild],[remove]>)'
        EngineerInfantryAlive   : '([InfantryMoveToBuild],[InfantryMove])'
        EngineerInfantry        : '(<[isDead],[InfantryDead]>,[EngineerInfantryAlive])'
      
        ################################################################################################################################################################
        
        StructureReloading    : '(<[isReloading],[tryReloading]>,<[isOutOfAmmo],[beginReloading],[clearTarget]>)'
        StructureCrewing      : '<[isCrewed],[tryCrewing]>'
        StructureReinforcing  : '<[hasReinforcements],[tryReinforcing]>'
        StructureAttack       : '<[isArmed],([StructureReloading],<[hasTarget],[seeTarget],[tryStructureAttack]>,[findTarget])>'
        
        StructureDead         : '<[isDead],(<[isCrumbled],[isCrumblingStructure],[setUntargetable],[crumbleStructure]>,[TRUE])>'
        #StructureDeadExplode  : '<[!isCrumblingStructure],[crumbleStructure],[throwShrapnel]>'
        
        StructureAlive        : '([StructureCrewing],[StructureReinforcing],[StructureAttack])'

        Structure             : '([StructureDead],[StructureAlive])'
        
        ScaffoldAlive         : '(<[isFullyCrewed],[tryScaffoldSpawnChild],[remove]>,<[isCrewed],[tryCrewing]>)'
        Scaffold              : '([StructureDead],[ScaffoldAlive])'
        
        MissileRack           : '[Structure]'
        MissileRackSmall      : '[Structure]'
        CommRelay             : '[Structure]'
        Pillbox               : '[Structure]'
        SmallTurret           : '[Structure]'
    }