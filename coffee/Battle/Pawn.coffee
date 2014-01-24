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
    
    _setHalfDimensions : ->
      if not @constructor::_halfHeight?
        name = @getName()
        @constructor::_halfHeight = GFXINFO[name].height >> 1
        @constructor::_halfWidth  = GFXINFO[name].width >> 1
    
    _setVariableStats : (variablestats) ->
      for stat in variablestats when stat of @
        if @[stat] instanceof Array
          # ex: health_max is random int from 50 to 70
          @[stat] = $.R.apply(@, @[stat])
        else if @[stat] instanceof Function
          # ex: projectile hit bonus = -> $.r(2) # is not an int
          @[stat] = @[stat]()
    
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
    isPendingRemoval : ->
      @corpsetime <= 0 
    remove : ->
      @corpsetime = 0
      true
    setDamage : (dmg) ->
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
    getXDist : (pawn) ->
      Math.abs(@x - pawn.x)
    isHit : (pawn) ->
      dx = @x - pawn.x
      dy = @y - pawn.y
      # Use @hDist2 = 0 for points
      dx*dx + dy*dy <= pawn.hDist2 + @hDist2