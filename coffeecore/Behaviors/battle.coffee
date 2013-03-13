# Behaviors for a Battle
define {
  
  Decorators :
    
    TRUE  : true
    FALSE : false
    
    setAboveGround : ->
      if world.isOutside @
        @_.x -= @_.dx>>1 if @_.dx?
        @_.y = world.getHeight @_.x
      true
    
    spawnLargeDetonation : (battle) ->
      world.add( new SmallExplosion({ x : @_.x, y : @_.y }) )
      [x, y] = [@_.x+$.R(12,20), @_.y+$.R(-20,20)]
      
      # todo: finish this.
      # todo: autoset the y when world.add is called.
      # if y>world.height(x) then y=world.
  
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