define ['core/Battle/Pawn'], (Pawn) ->

  HELI_ACTION =
    PITCH_HIGH  : 0
    PITCH_LEVEL : 1
    PITCH_LOW   : 2
    TURNING     : 3

  JET_ACTION =
    FLYING : 0

  VARIABLESTATS = [
    'health_current'
  ]
  
  class Aircraft extends Pawn
    corpsetime : 1
    constructor : (params) ->
      @[k]  = v for k, v of params
      @_setHalfDimensions()
      @_setVariableStats VARIABLESTATS
  
  class SmallJet extends Aircraft
    ACTION          : HELI_ACTION
    action          : HELI_ACTION.PITCH_LEVEL
    projectile      : 'HomingMissileSmall'
    ammo_current    : 3
    ammo_max        : 3
    tech_level      : 5
    turn_ing        : 0
    turn_max        : 6
    frame_current   : 0
    frame_first     : 0
    frame_last      : 1
    sight           : 5
    speed_max       : 40
    speed_delta     : 0.379
    dx              : 0.001
    dy              : 0.001
    reload_ing      : 0
    reload_time     : 70
    health_current  : [2000, 2500]
    health_max      : 2000
    passengers_max  : 3
    attack_x        : 0
    getName : ->
      "smalljet-#{@direction}"
    
  
  class Helicopter extends Aircraft
    ACTION          : HELI_ACTION
    action          : HELI_ACTION.PITCH_LEVEL
    projectile      : 'HomingMissileSmall'
    ammo_current    : 3
    ammo_max        : 3
    tech_level      : 5
    turn_ing        : 0
    turn_max        : 6
    frame_current   : 0
    frame_first     : 0
    frame_last      : 1
    sight           : 5
    speed_max       : 40
    speed_delta     : 0.379
    dx              : 0.001
    dy              : 0.001
    reload_ing      : 0
    reload_time     : 70
    health_current  : [2000, 2500]
    health_max      : 2000
    passengers_max  : 3
    constructor : (params) ->
      super params
      @passengers = []
    getName : ->
      action = @action
      action = @_getPitch() unless @action is @ACTION.TURNING
      "heli-#{@team}-#{@direction}-#{action}-#{@frame_current}"
    _getPitch : ->
      dx = @dx
      dx = 0.001 if dx is 0
      dy = @dy
      # Moving vertically
      return @ACTION.PITCH_LEVEL if Math.abs(dy/dx) > 3
      # Moving horizontally
      if dx*dx + dy*dy > @speed_max * 0.3
        if dx * @direction > 0
          return @ACTION.PITCH_LOW
        else
          return @ACTION.PITCH_HIGH
      else
        # Not going fast enough to pitch in any direction
        return @ACTION.PITCH_LEVEL
      
  exportClasses = {
    Aircraft
    SmallJet
    Helicopter
  }
  
  # Attach all these classes to the "importer" object.
  (importer) -> importer[k] = v for k, v of exportClasses