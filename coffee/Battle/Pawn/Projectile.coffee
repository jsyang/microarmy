define ['core/Battle/Pawn'], (Pawn) ->

  VARIABLESTATS = [
    'damage'
    'dspeed'
    'dist'
    'stray_dy'
    'dx'
  ]

  class Projectile extends Pawn
    spriteName            : ''
    sound                 : 0
    dx                    : null  # Speed
    dy                    : null
    accuracy              : null  # Base chance to hit enemies
    accuracy_target_bonus : null  # Bonus chance to hit for targeted enemy
    range_current         : null  # # of cycles to exist in world for
    corpsetime            : 1
    target                : null
    explosion             : null  # Does it explode upon hitting something? If so, what type?
    targetable            : false
    hDist2                : 3
    constructor : (params) ->
      super params
      @_setDirectionIfTargeting()
      @_setVariableStats VARIABLESTATS
      @_setBulletWeaponInaccuracy()
    _setDirectionIfTargeting : ->
      if @target?
        if @target.x > @x
          @direction = 1
        else
          @direction = 0
    getName : ->
      "#{@spriteName}-#{@direction}"      
    # Inaccuracy due to distance, call with thisArg = projectile stats
    _setBulletWeaponInaccuracy : ->
      dist = @getXDist @target
      if dist > 50
        @accuracy -= 0.02
        @accuracy_target_bonus -= 0.15
      if dist > 120
        @accuracy -= 0.01
        @accuracy_target_bonus -= 0.18
      if dist > 180
        @accuracy -= 0.01
        @accuracy_target_bonus -= 0.08
      if dist > 200
        @accuracy -= 0.01
        @accuracy_target_bonus -= 0.08
    
  class Bullet extends Projectile
    spriteName            : 'pistolshell'
    sound                 : 'pistol'
    range_current         : 35
    damage                : 15
    accuracy              : 0.15
    accuracy_target_bonus : 0.85
    speed                 : 4
    bullet_weapon         : true
    dist                  : -> @getXDist @target
    stray_dy              : -> $.R(-15, 15) * 0.01 # How much do we miss by?
  
  class MGBullet extends Projectile
    spriteName            : 'pistolshell'
    sound                 : 'mgburst'
    range_current         : 50
    damage                : [20, 35]
    accuracy              : 0.65
    accuracy_target_bonus : 0.35
    speed                 : 4
    bullet_weapon         : true
    dist                  : -> @getXDist @target
    stray_dy              : -> $.R(-15, 15) * 0.01 # How much do we miss by?
    
  class SmallRocket extends Projectile
    spriteName            : 'rocketshell'
    sound                 : 'rocket'
    explosion             : 'SmallExplosion'
    range_current         : 90
    damage                : 24
    accuracy              : 0.28
    accuracy_target_bonus : 0.68
    speed                 : 4
    bullet_weapon         : true
    dist                  : -> @getXDist @target
    stray_dy              : -> $.R(-15, 15) * 0.01 # How much do we miss by?
  
  class SmallShell extends Projectile
    spriteName            : 'turretshell'
    sound                 : 'turretshot'
    explosion             : 'SmallExplosion'
    range_current         : 70
    damage                : 50
    accuracy              : 0.60
    accuracy_target_bonus : 0.50
    speed                 : 7
    bullet_weapon         : true
    dist                  : -> @getXDist @target
    stray_dy              : -> $.R(-12, 9) * 0.01
    
  # todo: shrapnel
  class MortarShell extends Projectile
    spriteName    : 'turretshell'
    sound         : 'turretshot'
    range_current : 1
    ddy           : 0.41
    
  class SmallMine extends Projectile
    spriteName            : 'mine'
    accuracy              : 0.6               
    accuracy_target_bonus : 0
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
    spriteName    : 'missilered'
    sound         : 'missile1'
    hDist2        : 81
    maxSpeed      : 90
    range_current : 280             
    range_max     : 280
    ddy           : 0.081
    dspeed        : 0.84
    sight         : 8
    dx            : -> [-1, 1][@direction] * 4.6
    dy            : -8.36
    homing        : true
    homing_delay  : 12
    trail_type    : 'SmokeCloud'
    trail_length  : 280 - 8         # Has a smoke trail above this range
    dist          : -> @getXDist @target
    getName : ->
      frame = @_getFrame()
      "#{@spriteName}-#{frame}"
      
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
    sound             : 'rocket'
    hDist2            : 64
    maxSpeed          : 110
    range_current     : 90
    range_max         : 0
    ddy               : 0.0173
    sight             : 8
    homing_delay      : 12
    dx                : -> [-1, 1][@direction] * 5.12
    dy                : -6.35
    trail_type        : 'SmokeCloudSmall'
    trail_length      : 90 - 6
    constructor : (params) ->
      super params
      @dspeed = $.R(312,2650) * 0.001 # Gravity drift dampener
  
  # future : Fired from helicopter, locks onto a location, not an entity
  class MediumRocketHE extends HomingMissile
    spriteName        : 'missilepurple'
    sound             : 'rocket'
    maxSpeed          : 65
    range_current     : 60
    range_max         : 0
    ddy               : 0.0241
    trail_type        : 'SmokeCloudSmall'
    trail_length      : 60 - 12
    constructor : (params) ->
      super params
      @dspeed = $.R(600,2100) * 0.001
  
  exportClasses = {
    Projectile
    Bullet
    MGBullet
    SmallRocket
    SmallShell
    
    SmallMine
    SmallChemMine
    
    HomingMissile
    HomingMissileSmall
    MediumRocketHE
  }
  
  # Attach all these classes to the "importer" object.
  (importer) -> importer[k] = v for k, v of exportClasses