define ->
  # todo: Each of these decorators is a unit... easily unit tested
  (World, Classes) ->
  # Prefix          Explanation
  # ----            -----------
  # has_            returns a boolean state, with possible side effects
  # get_            returns a state, without side effects (not used within behaviors)
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
        
        doFindTarget : ->
          World.XHash.getNearestEnemy(@)?
        
        setFaceTarget : ->
          @direction = if @target.x > @x then 1 else 0
          true

        setInfantryMoving : ->
          @action = @ACTION.MOVING
          true
          
        setInfantryAttackStance : ->
          @action = $.R(@ACTION.ATTACK_STANDING, @ACTION.ATTACK_PRONE)
          true
        
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
                t.takeDamage @damage
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
            t.takeDamage(@damage)
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
        
        addSmallFlakExplosion : ->
          # missile-purple explosion
          explode = World.Battle.Behaviors.Decorators.addChildExplosion
          addExplosion = explode.bind(@, 'FlakExplosion',   [-12, 12], [-12, 12])
          addSmoke     = explode.bind(@, 'SmokeCloudSmall', [-18, 18], [-18, 18])
          for i in [1..$.R(3, 5)]
            addExplosion()
            addSmoke()
          true
        
        addLargeDetonation : ->
          # missile-red explosion
          explode = World.Battle.Behaviors.Decorators.addChildExplosion
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
              @dy += @ddy # Gravity drift
          else
            @dy += @ddy # Gravity drift
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
          
        isLastFrame : ->
          @frame_current is @frame_last
          
        isPastLastFrame : ->
          @frame_current > @frame_last
        
        isFirstFrame : ->
          @frame_current is @frame_first
        
        isCyclingFrames : ->
          @cycles > 0
        
        doDecrementCycles : ->
          @cycles--
          true
        
        isReloading : ->
          @reload_ing > 0
        
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
        
        isTargeting : ->
          @target? and not @target.isDead()
        
        isOutsideWorld : ->
          !World.contains @
          
        # future: only works in 1D. make this work for 2D (aircraft)
        doSeeTarget : ->
          @getXDist @target <= @sight * (1 << World.XHash.BUCKETWIDTH)
        
        # Inaccuracy due to distance, call with thisArg = projectile stats
        setStructureBulletWeaponInaccuracy : ->
          if @dist > 50
            @accuracy -= 0.02
            @accuracy_target_bonus -= 0.15
          if @dist > 120
            @accuracy -= 0.01
            @accuracy_target_bonus -= 0.18
          if @dist > 180
            @accuracy -= 0.01
            @accuracy_target_bonus -= 0.08
          if @dist > 200
            @accuracy -= 0.01
            @accuracy_target_bonus -= 0.08
          true
        
        setInfantryBulletWeaponInaccuracy : ->
          if @dist > 50
            @accuracy -= 0.02
            @accuracy_target_bonus -= 0.15
          if @dist > 120
            @accuracy -= 0.01
            @accuracy_target_bonus -= 0.18
          if @dist > 180
            @accuracy -= 0.01
            @accuracy_target_bonus -= 0.08
          if @dist > 200
            @accuracy -= 0.01
            @accuracy_target_bonus -= 0.08
          true
        
        addChildProjectile : (className, params) ->
          if @direction is 0
            direction = -1
          else
            direction = 1
          
          pDx = @direction * @::_halfWidth
          pDy = @shoot_dy
          
          if params.bulletWeapon
            params.dx = direction * params.pSpeed
            params.dy = ((@target.y - @target::_halfHeight) - (@y + pDy)) * params.pSpeed) / params.dist + params.strayDy
          
          projectileClass = Classes[className]
          projectile = new projectileClass params
          World.add projectile
          true
        
        doStructureAttack : ->
          params = @SHOOTSETSTATS[@projectile].call @
          return true unless params?
          atom.playSound params.sound if @ammo_clip is @ammo_max and params?
          d = World.Battle.Behaviors.Decorators
          d.setBulletWeaponInaccuracy.call params if params.bulletWeapon
          d.addChildProjectile.call(@, params)
          @ammo_clip--
          true
        
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
        
        # todo: break this apart like with the structure
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
            
            if @ammo_clip == @ammo_max and sound? then soundManager.play(sound)
            
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
            
            @ammo_clip--
          true
        
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
          
        doRot : ->
          @corpsetime-- if @corpsetime > 0
          true
        
        isCrewed : ->
          @crew_current? and @crew_current > 0
        
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
          
        addScaffoldChild : ->
          childClass = Classes[@build_type]
          World.add(new childClass {
            x     : @x
            y     : World.height @
            team  : @team
          }) 
          true          
        
        isStructureCrumbling : ->
          @state is @STATE.WRECK
        
        isStructureCrumbled : ->
          @crumbled is true
        
        setUntargetable : ->
          @targetable = false
          true
        
        
        # todo: ai versions of user behaviors # stuff below has to do with AI, not yet in
        # proper format
        
        hasReinforcements : ->
          @ai_reinforce_ing?
        
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
        
        # Structures!!!
        Structure             : '([StructureDead],[StructureAlive])'
        StructureDead         : '<[isDead],(<[isCrumbled],[isCrumblingStructure],[setUntargetable],[crumbleStructure]>,[TRUE])>'
        StructureAlive        : '([StructureCrewing],[StructureReinforcing],[StructureAttack])'
        
        StructureReloading    : '(<[isReloading],[tryReloading]>,<[isOutOfAmmo],[beginReloading],[clearTarget]>)'
        StructureCrewing      : '<[isCrewed],[tryCrewing]>'
        StructureReinforcing  : '<[hasReinforcements],[tryReinforcing]>'
        StructureAttack       : '<[isArmed],([StructureReloading],<[hasTarget],[seeTarget],[tryStructureAttack]>,[findTarget])>'
        
        # todo: throw non-explosive shrapnel
        # todo: throw explosive shrapnel
        
        #StructureDeadExplode  : '<[!isCrumblingStructure],[crumbleStructure],[throwShrapnel]>'
        
        

        
        
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