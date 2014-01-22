define ->
  
  class Pawn
    x           : 0
    y           : 0
    team        : null
    corpsetime  : 1
    hDist2      : 0   # a point at less than sqrt(histDist) is considered inside the Pawn
    direction   : 0
    
    constructor : (params) ->
      @[k]  = v for k, v of params
    
    isAlly : (pawn) ->
      @team is pawn.team
    isDead : ->
      @health_current <= 0
    isCrewDead : ->
      @crew_current <= 0
    isOutOfAmmo : ->
      @ammo_supply <= 0
    isTargetable : ->
      @targetable
    isAbleToTarget  : (pawn) ->
      if (pawn.fly? and !@canTargetAircraft)
        false
      else
        true
    isPendingRemoval : ->
      @corpsetime <= 0 
    remove : ->
      @corpsetime = 0
      true
    takeDamage : (dmg) ->
      return unless dmg > 0
      @health_current -= dmg
      if @health_current <= 0
        @health_current = 0      
    setTarget : (t) ->
      if t? then @target = t else delete @target
      true
    setRallyPoint : (x, y) ->
      @rally = {
        x
        y
      }
    isHit : (pawn) ->
      dx = Math.abs(@x - pawn.x)
      dy = Math.abs(@y - pawn.y)
      # Use @hDist2 = 0 for points
      dx*dx + dy*dy <= pawn.hDist2 + @hDist2