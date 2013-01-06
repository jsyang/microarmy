// Predefined trees for various classes
// Maybe we can load these in from a server somewhere. So that it's not baked in
// and therefore tweaking can happen independent of game version.
// Though realisticly, they are pretty tied to Behavior.Custom{}
define([
  'core/Behavior'
],function(Behavior){

  var BattleShorthands = {
    CommanderIdle:
      "<[idleCommander]>",
      
    SquadAttack:
      "<[!isSquadDead]>",
  
    Projectile:
      "(<[isOutsideWorld],[stopProjectile]>,<[isProjectileOutOfRange],[stopProjectile]>,[!fly],<[tryHitProjectile],[stopProjectile]>)",
    MortarShell:
      "(<[isOutsideWorld],[hitGroundProjectile]>,<[fly],[fallGravity]>)",
    SmallMine:
      "<[tryHitProjectile],[stopProjectile]>",
  
    moveAndBoundsCheck:
      "<[move],[loopAnimation],(<[isOutsideWorld],[walkingOffMapCheck]>,[TRUE])>",
    
    APC:
      "([isReloading],<[foundTarget],(<[!isFacingTarget],[loopAnimation]>,<[seeTarget],[attack]>)>,[moveAndBoundsCheck])",
  
    // todo
    AttackHelicopter:
      "([isReloading],<[foundTarget],[seeTarget],[attack]>,[fly])",
  
    Infantry:
      "([isReloading],<[isBerserking],[moveAndBoundsCheck]>,[InfantryAttack],<[setFacingTarget],[moveAndBoundsCheck]>)",
    InfantryAttack:
      "<[foundTarget],[seeTarget],[setFacingTarget],[attack],[!tryBerserking],[loopAnimation]>",
    InfantryDead:
      "<[!hasCorpseTime],(<[!isDyingInfantry],[animateDyingInfantry]>,[rotCorpse])>",
      
    EngineerInfantry:
      "<[!tryBuilding],[setFacingTarget],[moveAndBoundsCheck]>",
  
    Structure:
      "<[checkStructureState],[tryCrewing],[tryReinforcing],<[isArmed],([isReloading],<[foundTarget],[seeTarget],[attack]>)>>",
    StructureDead:
      "<[!isCrumblingStructure],[crumbleStructure]>",
    StructureDeadExplode:
      "<[!isCrumblingStructure],[crumbleStructure],[throwShrapnel]>",
    
    AmmoDump:
      "<[!isOutOfSupplies],[!isReloading],<[foundSupplyTarget],[supply]>>",
    
    MissileRack:
      "<[!isReloading],<[foundTarget],[seeTarget],[attack]>>",
    Pillbox:
      "<[checkStructureState],[tryCrewing],[!isReloading],<[isCrewed],[foundTarget],<[isFacingTarget],<[seeTarget],[attack]>>>>",
    SmallTurret:
      "<[checkStructureState],[!isReloading],<[foundTarget],<[isFacingTarget],<[seeTarget],[attack]>>>>",
    Scaffold:
      "<[checkStructureState],[tryCrewing]>"
  
  };
  
  
  // Convert predefined shorthand code into btree code.
  for(var i in BattleShorthands) {
    BattleShorthands[i] = Behavior.ConvertShortHand(BattleShorthands[i]);
  }
  
  return BattleShorthands;
});