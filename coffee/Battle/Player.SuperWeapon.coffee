define ->
  
  RECHARGE =
    AIRSTRIKE : 1000
    NUKE      : 4000
    CHEM_MINE : 1200
  
  class PlayerSuperWeapon
    # Tracks Player's super weapon status
    
    add : (name) ->
      @recharge[name].max     = RECHARGE[name.toUpperCase()]
      @recharge[name].current = @recharge[name].max
    
    deploy : (name) ->
      switch name
        when 'airstrike'
          stuff()
    
    tick : ->
      for k, v of @recharge
        @recharge[k]-- unless v is 0
    
    constructor : (params) ->
      @[k] = v for k, v of params
      @recharge = {}