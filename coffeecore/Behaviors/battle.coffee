# Behaviors for a Battle
define {
  
  Decorators :
    
    TRUE  : true
    FALSE : false
    
  
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