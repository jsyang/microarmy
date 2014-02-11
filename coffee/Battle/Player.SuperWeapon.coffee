define ->
  
  RECHARGE_TIMES =
    airstrike : 10 # 1000
    nuke      : 4000
    chemmine  : 1200
  
  class PlayerSuperWeapon
    # Tracks Player's super weapon status
    
    add : (p) ->
      if p.deployable_superweapons?
        # @battle.EVA.NEW_SUPERWEAPON_AVAILABLE() unless @AI
        for superweapon in p.deployable_superweapons
          if @deployer[superweapon]?
            @deployer[superweapon].push p
          else
            @deployer[superweapon] = [p]
          
          # Start recharging the super weapon immediately when it first becomes available
          @resetRechargeTime superweapon unless @recharge[superweapon]?
      return
    
    remove : (p) ->
      if p.deployable_superweapons?
        for superweapon in p.deployable_superweapons
          unless @deployer[superweapon].length is 1
            removeFilter = (d) -> d isnt p
            @deployer[superweapon] = @deployer[superweapon].filter removeFilter
            @recharge[superweapon] = @recharge[superweapon].filter removeFilter
          else
            delete @deployer[superweapon]
      return
    
    isDeployable : (name) ->
      @recharge[name]? and @recharge[name] is 0
    
    _airstrike : ->
      @battle.switchMode 'SuperWeapon', {
        superweapon : 'airstrike'
      }
    
    resetRechargeTime : (name) ->
      @recharge[name] = RECHARGE_TIMES[name]
    
    deploy : (name) ->
      console.log @recharge[name]
      if @isDeployable name
        @["_#{name}"]()
        @resetRechargeTime name
    
    tick : ->
      for name, time_remaining of @recharge
        unless time_remaining is 0
          @recharge[name]--
      return
    
    getSuperWeaponsStatus : ->
      @recharge
    
    constructor : (params) ->
      @[k] = v for k, v of params
      @deployer = {}
      @recharge = {}