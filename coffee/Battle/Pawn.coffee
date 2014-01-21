define ->
  class Pawn
    x           : 0
    y           : 0
    team        : 0
    corpsetime  : 1
    hitDist     : 0   # a point at less than sqrt(histDist) is considered inside the Pawn
    
    # For .draw()
    direction   : 0
    valign      : 'bottom'
    halign      : 'center'
    
    constructor : (params) ->
      @[k]  = v for k, v of params
      
    draw : ->
      
    

######################################################################################################################
# is*()
    
    isAlly          : (pawn) ->
      if @team is -1
        true
      else
        @team == pawn.team
    
    isDead          : -> !(@health?.current > 0)
    
    isCrewDead      : -> if @crew? then @crew.current < 0 else false
    
    isOutOfAmmo     : -> if @ammo? then @ammo.supply <=0 else false
    
    isAbleToTarget  : (pawn) ->
      if (pawn.fly? and !@canTargetAircraft)
        false
      else
        true
        
    isTargetable      : -> !(@targetable is false)
    
    isPendingRemoval  : -> @corpsetime <= 0 
    
######################################################################################################################

    remove : -> @corpsetime = 0
        
    takeDamage  : (damageValue) ->
      if damageValue > 0
        @health.current -= damageValue
        @health.current = 0 if @health.current < 0
    
    setTarget   : (t) -> if t? then @target = t else delete @target
    
    setRallyPoint : (x, y) -> @rally = [x, y]
    
    setDirection : ->
      switch @team
        when 0
          d = 1
        when 1
          d = -1
      @direction = d
    
    distX       : (pawn) -> Math.abs(@x - pawn.x)
    
    # Centers. Point to point.
    # Overwrite this func for certain classes when their sprites show that they should be 
    distHit     : (pawn) ->
      [dx, dy] = [pawn.x, pawn.y]
      [dx, dy] = [Math.abs(@x - dx), Math.abs(@y - dy)]
      
      dx*dx + dy*dy