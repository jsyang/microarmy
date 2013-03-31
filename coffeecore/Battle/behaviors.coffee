# todo: load in these tree strings from a text file so they're more easily editable?
# todo: resolve how to spawn an instance of an arbitrary class (given the class name)
# todo: find out how to reference stuff that's going on in the world and use battle world methods
define ->
  (World, Classes) ->
    {      
      Decorators :
        # todo: Each of these decorators is a unit... easily unit tested
        
        TRUE  : true
        FALSE : false
        
        hasHitGround : ->
          if !World.contains(@)
            @_.x -= @_.dx>>1 if @_.dx?
            @_.y = World.height(@)
            true
          else
            false
        
        findTarget : -> World.XHash.getNearestEnemy(@)?
        
        faceTarget : ->
          @_.direction = if @_.target._.x > @_.x then  1 else -1
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
            @_.frame.current = @_.frame.first
          true
          
        setAttackingStance : ->
          @_.action = $.R(@CONST.ACTION.ATTACK_STANDING,@CONST.ACTION.ATTACK_PRONE)
          true
        
        hasHitEnemy : ->
          potentialHits = World.XHash.getNBucketsByCoord(@, 1)
          (
            if !t.isAlly(@) and !t.isDead() and t.distHit(@) <= @_.img.hDist2 # 81
              return true
          ) for t in potentialHits
          false
        
        # Special version of hasHitEnemy for explosions
        explode : ->
          potentialHits = World.XHash.getNBucketsByCoord(@, 1)
          (
            # todo: might want to check if this is being triggered on the correct dist
            if t.distHit(@) <= @_.img.hDist2
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
          World.add(new (@_.smokeTrailType)({
            x: @_.x-@_.dx
            y: @_.y-@_.dy
          }))
          true
        
        spawnChildExplosion : (type, xrange, yrange) ->
          # Call this with .apply(thisArg, args)
          [x, y] = [@_.x+$.R.apply(xrange), @_.y+$.R.apply(yrange)]
          if y>World.height(x) then y = World.height(x)
          World.add(new Classes[type]({x,y}))
        
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
            
        move : ->
          @_.x += @_.direction
          @_.y = World.height(@)
          true
        
        fly : ->
          # Keep this simple.
          @_.x += @_.dx
          @_.y += @_.dy
          if @_.range? then @_.range--
          if @_.rangeTravelled? then @_.rangeTravelled++
      
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
        
        hasCyclesRemaining : ->
          @_.cycles > 0
        
        decrementCycles : ->
          if @_.cycles? then @_.cycles--
          true
        
        isReloading : -> @_.reload.ing
        
        tryReloading : ->
          @_.reload.ing--
          if !@_.reload.ing
          
            if @_.ammo?
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
          
        isOutOfAmmo : -> @_.ammo.clip is 0
        
        beginReloading : ->
          @_.reload.ing = if @_.ammo.maxsupply then $.R(30, @_.reload.time) else @_.reload.time
          true
            
        isBerserking : ->
          @_.berserk.ing
          
        tryBerserking : ->
          @_.action = @CONST.ACTION.MOVING
          @_.berserk.ing--
          true
        
        beginBerserking : ->
          if $.R() < @_.berserk.chance
            @_.berserk.ing = @_.berserk.time
            true
          else
            false
        
        hasTarget : ->
          @_.target? and @_.target.isDead() and @seeTarget()
        
        isOutsideWorld : ->
          !World.contains(@)
        
        log : ->
          console.log(111)
          true
        
      Trees :
      
        animate         : '([!nextFrame],<[isPastLastFrame],[decrementCycles],[gotoFirstFrame]>,[TRUE])'
      
        Explosion       : '(<[isPastLastFrame],[remove]>,[!nextFrame],[explode])'
        SmallExplosion  : '[Explosion]'
        FragExplosion   : '[Explosion]'
        FlakExplosion   : '[Explosion]'
        HEAPExplosion   : '[Explosion]'
        ChemExplosion   : '[Explosion]'
        
        SmokeCloud      : '(<[isPastLastFrame],[!remove]>,[!nextFrame])'
        SmokeCloudSmall : '[SmokeCloud]'

        Flame           : '(<[!hasCyclesRemaining],[remove]>,[animate])'
        ChemCloud       : '[Flame]'
        
        #InfantrySpawn           : '' # Make the spawned Infantry either parachute down or at ground level
        InfantryDead            : '<[!hasCorpseTime],(<[!isDyingInfantry],[animateDyingInfantry]>,[rotCorpse])>'
        InfantryReloading       : '(<[isOutOfAmmo],[beginReloading],[setAttackingStance]>,<[isReloading],[tryReloading]>)'
        InfantryBerserking      : '<[isBerserking],[tryBerserking],[InfantryMove]>'
        InfantryAttack          : '(<[hasTarget],[faceTarget],[setFacingFrames],[attack],[!beginBerserking],[animate]>,[findTarget])'
        InfantryMove            : '(<[isOutsideWorld],[gameOver],[remove]>,<[faceGoalDirection],[setFacingFrames],[move],[animate]>)'
        
        Infantry                : '([InfantryMove])' #'([InfantryReloading],[InfantryBerserking],[InfantryAttack],[InfantryMove])'
        
        PistolInfantry          : '[Infantry]'
        EngineerInfantry        : '[Infantry]'
      
    }