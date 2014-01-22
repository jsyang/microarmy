define ['core/Battle/Pawn'], (Pawn) ->

  VARIABLESTATS = [
    'damage'
    'dspeed'
  ]

  class Projectile extends Pawn
    dx          : null
    dy          : null
    accuracy    : null
    range       : null
    corpsetime  : 1
    target      : null
    explosion   : null
    targetable  : false
    hDist2      : 3
    constructor : (params) ->
      super params
      @_setVariableStats
    spriteName  : ''
    getName : ->
      "#{@spriteName}-#{@direction}"      
    _setVariableStats : ->
      @[stat] = $.R.apply(@, @[stat]) for stat in VARIABLESTATS when @[stat] instanceof Array
      
  class Bullet extends Projectile
    spriteName : 'pistolshell'
    range      : 35
    damage     : 15
  
  class MGBullet extends Projectile
    spriteName : 'pistolshell'
    range      : 35
    damage     : [21, 32]
    
  class SmallRocket extends Projectile
    spriteName : 'rocketshell'
    explosion  : 'SmallExplosion'
    range      : 90
    damage     : 24
    
  class MortarShell extends Projectile
    spriteName : 'turretshell'
    range      : 1
    ddy        : 0.41
      
  class SmallShell extends Projectile
    spriteName : 'turretshell'
    explosion  : 'SmallExplosion'
    range      : 70
    damage     : 90

  class SmallMine extends Projectile
    spriteName            : 'mine'
    accuracy              : 0.6               # Chance to hit other enemies
    accuracy_target_bonus : 0                 # Additional chance to hit when calculating for target
    explosion             : 'FragExplosion'
    damage                : 20
  
  class SmallChemMine extends Projectile
    #spriteName            : 'chemmine'
    accuracy              : 0.6
    accuracy_target_bonus : 0
    explosion             : 'ChemExplosion'
    damage                : 6
    blink_ing             : 0
    blink_time            : 4
    getName : ->
      frame = Math.abs(@blink_ing - 3) % 3
      "chemmine-#{@team}-#{frame}"
  
  class HomingMissile extends Projectile
    spriteName        : 'missilered'
    hDist2            : 81
    maxSpeed          : 90
    range             : 280
    rangeTravelled    : 0
    ddy               : 0.081
    dspeed            : 0.84
    sight             : 8
    homing_delay      : 12
    smokeTrailType    : 'SmokeCloud'
    smokeTrailLength  : 8
    dx                : 0.01
    dy                : 0.01
    getName : ->
      frame = @_getFrame()
      '#{@spriteName}-#{frame}'
    _getFrame : ->
      if @dx is 0 then @dx = 0.001
      if @dy is 0 then @dy = 0.001      
      dydx = Math.abs(@dy/@dx)
      # Set which frames we're going to be using depending on vector's quadrant
      if      @dx < 0 and @dy < 0 then  f = [4,  3,  2,  1,  0]
      else if @dx < 0 and @dy > 0 then  f = [4,  5,  6,  7,  8]
      else if @dx > 0 and @dy > 0 then  f = [12, 11, 10, 9,  8]
      else                              f = [12, 13, 14, 15, 0]
      frame = f[0]
      if  0.1989 <= dydx < 0.6681 then  frame = f[1]
      if  0.6681 <= dydx < 1.4966 then  frame = f[2]
      if  1.4966 <= dydx < 5.0273 then  frame = f[3]
      if  5.0273 <= dydx          then  frame = f[4]
      
      frame
    
  class HomingMissileSmall extends HomingMissile
    spriteName        : 'missilepurple'
    hDist2            : 64
    maxSpeed          : 110
    range             : 90
    rangeTravelled    : 0
    ddy               : 0.0173
    sight             : 8
    homing_delay      : 12
    smokeTrailType    : 'SmokeCloudSmall'
    smokeTrailLength  : 6
    constructor : (params) ->
      super params
      @dspeed = $.R(312,2650) * 0.001
  
  # future : Fired from helicopter, locks onto a location, not an entity
  class MediumRocketHE extends HomingMissile
    spriteName        : 'missilepurple'
    maxSpeed          : 65
    range             : 60
    rangeTravelled    : 0
    ddy               : 0.0241
    smokeTrailType    : 'SmokeCloudSmall'
    smokeTrailLength  : 12
    constructor : (params) ->
      super params
      @dspeed = $.R(600,2100) * 0.001
  
  exportClasses = {
    Projectile
    Bullet
    MGBullet
    SmallRocket
    MortarShell
    SmallShell
    
    SmallMine
    SmallChemMine
    
    HomingMissile
    HomingMissileSmall
    MediumRocketHE
  }
  
  # Attach all these classes to the "importer" object.
  (importer) -> importer[k] = v for k, v of exportClasses