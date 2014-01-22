define ->
  (World, Classes) ->
    {      
      Decorators :
        # todo: Each of these decorators is a unit... easily unit tested
        
        TRUE  : true
        FALSE : false
        
        isArmed : -> @projectile?
        
        hasHitGround : ->
          if !World.contains(@)
            @x -= @dx>>1 if @dx?
            @y = World.height(@)
            true
          else
            false
        
        findTarget : ->
          World.XHash.getNearestEnemy(@)?
        
        faceTarget : ->
          @direction = if @target.x > @x then  1 else -1
          true

        setInfantryMoving : ->
          @action = @CONST.ACTION.MOVING
          true
          
        faceGoalDirection : ->
          # todo: remove this once testing is done
          @direction = {
            '0' : -1
            '1' : 1
          }[@team]
          true
          
        gameOver : -> 
          # todo: this is not the only "game over"
          # todo: remove this and use mission handlers instead
          soundManager.play('accomp')
          true
        
        setFacingFrames : ->
          @frame_first = if @direction>0 then  6   else 0
          @frame_last  = if @direction>0 then  11  else 5
          
          # Make sure we're facing the correct direction immediately.
          if not( @frame_first <= @frame_current <= @frame_last )
            @frame_current = @frame_first + (@frame_current % 6)
          true
          
        setInfantryAttackStance : ->
          @action = $.R(@CONST.ACTION.ATTACK_STANDING,@CONST.ACTION.ATTACK_PRONE)
          true
        
        tryProjectileHit : ->
          potentialHits = World.XHash.getNBucketsByCoord(@, 0)
          InfantryClass = Classes['Infantry']
          (
            if !t.isAlly(@) and !t.isDead() and t.distHit(@) <= t.img.hDist2 + @img.hDist2
              chanceToHit = @accuracy[0]
              if t is @target then chanceToHit += @accuracy[1]
              if t instanceof InfantryClass
                # stance affects chance to be hit.
                if t.action is InfantryClass.prototype.CONST.ACTION.ATTACK_PRONE     then chanceToHit -= 0.11
                if t.action is InfantryClass.prototype.CONST.ACTION.ATTACK_CROUCHING then chanceToHit -= 0.06
              
              if $.r() < chanceToHit
                t.takeDamage(@damage)
                return true
          ) for t in potentialHits
          false
        
        tryProjectileExplode : ->
          if @explosion? and Classes[@explosion]?
            World.add(new Classes[@explosion]({
              x: @x
              y: @y
            }))
          true
        
        hasHitEnemy : ->
          potentialHits = World.XHash.getNBucketsByCoord(@, 1)
          (
            if !t.isAlly(@) and !t.isDead() and t.distHit(@) <= @img.hDist2 + t.img.hDist2
              return true
          ) for t in potentialHits
          
          false
        
        # Special version of hasHitEnemy for explosions
        explode : ->
          potentialHits = World.XHash.getNBucketsByCoord(@, 1)
          (
            # todo: might want to check if this is being triggered on the correct dist
            if t? and t.distHit(@) <= @hDist2
              t.takeDamage(@damage)
              @damage -= @damageDecay
              @damage = 0 if @damage<0
          ) for t in potentialHits
          true
        
        hasSmokeTrail : ->
          @rangeTravelled < @smokeTrailLength
          
        hasHomingAbility : ->
          @homing
        
        spawnSmokeTrail : ->
          World.add(new Classes[@smokeTrailType]({
            x: @x-@dx
            y: @y-@dy
          }))
          true
        
        spawnChildExplosion : (type, xrange, yrange) ->
          # Call this with .apply(thisArg, args)
          [x, y] = [@x+$.R.apply(null,xrange), @y+$.R.apply(null,yrange)]
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
          if @rangeTravelled > @homing.delay
            t = @target
            if t?
              @dx += if t.x < @x then -@dspeed else @dspeed
              
              if t.distX(@)>128 and @y>World.height(@x)-48
                # keep it flying steady until it gets close enough
                @dy -= @dspeed          
              else
                @dy += if t.y < @y then -@dspeed else @dspeed
              
              # Normalize speed with some feedback
              if @maxSpeed? and @dx*@dx + @dy*@dy > @maxSpeed
                @dy *= $.R(30,50)*0.01
                @dx *= $.R(70,80)*0.01
              
            else
              @dy += @ddy # Gravity
          else
            @dy += @ddy # Gravity
            
          true
            
        move : ->
          @x += @direction
          @y = World.height(@)
          true
        
        fly : ->
          @x += @dx
          @y += @dy
          @range-- if @range?
          if @rangeTravelled? then @rangeTravelled++
          true
      
        remove : ->
          if @range? then @range = 0
          @corpsetime = 0
          false
      
        nextFrame : ->
          @frame_current++
          true
          
        isLastFrame : ->
          @frame_current is @frame_last
          
        isPastLastFrame : ->
          @frame_current > @frame_last
        
        gotoFirstFrame : ->
          @frame_current = @frame_first
          true
        
        isFirstFrame : ->
          @frame_current is @frame_first
        
        hasCyclesRemaining : ->
          @cycles > 0
        
        decrementCycles : ->
          if @cycles? then @cycles--
          true
        
        isReloading : -> @reload.ing > 0
        
        tryReloading : ->
          @reload.ing--
          if @reload.ing is 0
            # Use ammo from our ammo supply if we're a unit limited by ammo supply
            if @ammo.maxsupply
              if @ammo.supply<@ammo.max
                @ammo.clip    = @ammo.supply
                @ammo.supply  = 0
              else
                @ammo.clip    = @ammo.max
                @ammo.supply  -= @ammo.max
            else
              @ammo.clip = @ammo.max
          true
          
        isOutOfAmmo : -> @ammo.clip <= 0
        
        beginReloading : ->
          @reload.ing = if @ammo.maxsupply then $.R(30, @reload.time) else @reload.time
          true
            
        isBerserking : ->
          if @berserk.ing > 0
            @action = @CONST.ACTION.MOVING
            @berserk.ing--
            true
          else
            false
            
          
        tryBerserking : ->
          if $.r() < @berserk.chance
            @berserk.ing = @berserk.time
          @berserk.ing > 0
          
        clearTarget : ->
          @setTarget()
          true
        
        hasTarget : ->
          @target? and !@target?.isDead()
        
        isOutsideWorld : ->
          !World.contains(@)
          
        seeTarget : ->
          @distX(@target) <= @sight*(1<<World.XHash.BUCKETWIDTH)
        
        # use weapons for this instead of a specific attack func?
        # attack -> attackWith[class.weapon]
        
        tryStructureAttack : ->
          dist          = @distX(@target)
          accuracy      = [0, 0]
          bulletWeapon  = false
          pSpeed        = 4
          
          switch @projectile
            
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
              dx            = @direction*5.12
              dy            = -6.35
              
            when 'HomingMissile'
              dx            = @direction*4.6
              dy            = -8.36
              
            else
              accuracy  = [0.2, 0.5]
              strayDy   = $.R(-30,30)*0.01
          
          if @ammo.clip == @ammo.max and sound? then soundManager.play(sound)
          
          
          pDx    = @direction*(@img.w>>1)
          pDy    = @shootDy
          
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
          
            projectile = new Classes[@projectile]({
              accuracy
              x       : @x + pDx
              y       : @y + pDy
              team    : @team
              target  : @target
              dx      : @direction*pSpeed
              dy      : ((@target.y-(@target.img.h>>1)-(@y+pDy))*pSpeed)/dist + strayDy
            })
          else
            projectile = new Classes[@projectile]({
                dx
                dy
                x       : @x + pDx
                y       : @y + pDy
                team    : @team
                target  : @target
            })
          
          World.add(projectile)
          @ammo.clip--
          true
        
        tryInfantryBuild : ->
          if @build.x is @x
            World.add(new Classes['Scaffold']({
              x     : @x
              y     : World.height(@)
              team  : @team
              build : @build
            }))
            return true
          false
        
        tryInfantryAttack : ->
          dist = @distX(@target)
          if dist < @img.w
            # melee range
            if $.r() < @berserk.chance
                @target.takeDamage(@meleeDmg)
                # Pretty hard to ignore someone punching your face
                @target._?.target = @
          else
          
            # todo: move this into its own decorator
            if @CONST.SHOTFRAME[@constructor.name][@frame_current % 6] is '0' then return true
            
            accuracy = [0, 0]
            
            switch @projectile
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
            
            if @ammo.clip == @ammo.max and sound? then soundManager.play(sound)
            
            pSpeed = 4
            pDx    = @direction*(@img.w>>1)
            pDy    = if @action is @CONST.ACTION.ATTACK_PRONE then -2 else -4
            
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
              new Classes[@projectile](
                {
                  accuracy
                  x       : @x + pDx
                  y       : @y + pDy
                  team    : @team
                  target  : @target
                  dx      : @direction*pSpeed
                  dy      : ((@target.y-(@target.img.h>>1)-(@y+pDy))*pSpeed)/dist + strayDy
                }
              )
            )
            
            @ammo.clip--
            
          true
        
        setInfantryDying : ->
          @action = $.R(@CONST.ACTION.DEATH1,@CONST.ACTION.DEATH2)
          soundManager.play('die'+$.R(1,4))
          true
        
        isInfantryDying : ->
          @CONST.ACTION.DEATH1 <= @action <= @CONST.ACTION.DEATH2
        
        isInfantryAttacking : ->
          @CONST.ACTION.ATTACK_STANDING <= @action <= @CONST.ACTION.ATTACK_PRONE
        
        isProjectileActive : ->
          @range > 0
        
        isDead : ->
          @isDead()
          
        rot : ->
          if @corpsetime > 0 then @corpsetime--
          true
        
        isCrewed : -> @crew? and @crew?.current? > 0
        
        isFullyCrewed : -> @crew? and @crew.current is @crew.max
        
        tryCrewing : ->
          if @crew.current < @crew.max
            potentialCrew = World.XHash.getNBucketsByCoord(@,1)
            (
              if t instanceof Classes['PistolInfantry'] and !t.isDead() and t.distX(@) <= (@img.w>>1) and t.isAlly(@)
                @crew.current++
                t.remove()
                soundManager.play('sliderack1')
                return true
            ) for t in potentialCrew
          false
        
        tryScaffoldSpawnChild : ->
          child = Classes[@build.type]
          if child?
            World.add(new child({
              x     : @x
              y     : World.height(@)
              team  : @team
            })) 
            true
            
          else
            false
          
        
        hasReinforcements : ->
          @reinforce?
        
        tryReinforcing : ->
          if @reinforce.ing
            if  @reinforce.supplyNumber > 0 and
                @reinforce.parentSquad?     and
                @reinforce.supplyType?      and
                @reinforce.types[@reinforce.supplyType] > 0
              # release a unit from the supply
              @reinforce.ing = @reinforce.time
              @reinforce.types[@reinforce.supplyType]--
              @reinforce.supplyNumber--
              
              # todo: spawned unit inherits parameters from the structure's reinforce obj
              instance = new Classes[@reinforce.supplyType]({
                x     : @x
                y     : World.height(@)
                team  : @team
                squad : @reinforce.parentSquad
              })
              
              World.add(instance)
              # todo: parentSquad should check if all its members have joined rather than the supplier
              @reinforce.parentSquad.add(instance)
              return true
            
          false
        
        isStructureCrumbling : -> @state is @CONST.STATE.WRECK
        
        isCrumbled : -> @crumbled is true
        
        setUntargetable : -> @targetable = false
        
        updateCommanderSquadsStatus : ->
          newSquads = []
          (
            if !squad.isPendingRemoval()
              newSquads.push(squad)
          ) for squad in @squads.length
          @squads = newSquads
          true

        tryCommanderCreateSquad : ->
          if @squads.length < @squadsLimit
            squadType = $.WR(@squadBias)
            
            newSquad = new World.Classes.Squad {
              team      : @team
              commander : @
            }

            # Issue requests to fill up the squad
            newSquad.addRequest(@memberBias[squadType]) for n in [0...@squadSizeLimit]
            
            @squads.push(newSquad)
            World.add(newSquad)

            true

          else 
            false

        # also calculate average member X
        isSquadDead : ->
          if @allMembersJoined
            numMembers = 0
            sumMemberX = 0
            (
              if !member.isDead()
                numMembers++
                sumMemberX+=member.x
            ) for member in @members
            
            if numMembers > 0
              @meanX = sumMemberX / numMembers

            return numMembers > 0
          else
            false

        tryFulfillingRequests : ->
          numRequests = 0
          (
            numRequests++
            break
          ) for k,v of @requests
          if numRequests > 0
            # todo: get depots from 
            if @commander?
              @commander.findDepotForRequest(@requests)
            else
              false
          else
            false


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
      
        SmallMine           : '[Projectile]'
        SmallChemMine       : '[Projectile]'
      
        corpseDecay     : '(<[!isLastFrame],[nextFrame]>,[rot])'
        animate         : '(<[isLastFrame],[decrementCycles],[gotoFirstFrame]>,[nextFrame])'
      
        Explosion       : '(<[isLastFrame],[remove]>,[!nextFrame],[explode])'
        SmallExplosion  : '[Explosion]'
        FragExplosion   : '[Explosion]'
        FlakExplosion   : '[Explosion]'
        HEAPExplosion   : '[Explosion]'
        ChemExplosion   : '[Explosion]'
        
        SmokeCloud      : '(<[isLastFrame],[remove]>,[!nextFrame])'
        SmokeCloudSmall : '[SmokeCloud]'

        Flame           : '(<[!hasCyclesRemaining],[remove]>,[animate])'
        ChemCloud       : '[Flame]'
                
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
        
        StructureReloading    : '(<[isReloading],[tryReloading]>,<[isOutOfAmmo],[beginReloading],[clearTarget]>)'
        StructureCrewing      : '<[isCrewed],[tryCrewing]>'
        StructureReinforcing  : '<[hasReinforcements],[tryReinforcing]>'
        StructureAttack       : '<[isArmed],([StructureReloading],<[hasTarget],[seeTarget],[tryStructureAttack]>,[findTarget])>'
        
        # todo: throw non-explosive shrapnel
        # todo: throw explosive shrapnel
        StructureDead         : '<[isDead],(<[isCrumbled],[isCrumblingStructure],[setUntargetable],[crumbleStructure]>,[TRUE])>'
        #StructureDeadExplode  : '<[!isCrumblingStructure],[crumbleStructure],[throwShrapnel]>'
        
        StructureAlive        : '([StructureCrewing],[StructureReinforcing],[StructureAttack])'

        Structure             : '([StructureDead],[StructureAlive])'
        
        ScaffoldAlive         : '(<[isFullyCrewed],[tryScaffoldSpawnChild],[remove]>,<[isCrewed],[tryCrewing]>)'
        Scaffold              : '([StructureDead],[ScaffoldAlive])'
        
        CommCenter            : '[Structure]' 
        Barracks              : '[Structure]'
        CommRelay             : '[Structure]'
        
        WatchTower            : '[Structure]'
        AmmoDump              : '[Structure]'
        AmmoDumpSmall         : '[Structure]'
        
        MineFieldSmall        : '[Structure]'
        Depot                 : '[Structure]'
        RepairYard            : '[Structure]'
        Helipad               : '[Structure]'
        
        Pillbox               : '[Structure]'
        SmallTurret           : '[Structure]'
        MissileRack           : '[Structure]'
        MissileRackSmall      : '[Structure]'

        Squad  : '[]'
        #Commander   : '[]'

    }