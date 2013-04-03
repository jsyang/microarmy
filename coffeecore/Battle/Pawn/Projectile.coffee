define [
  'core/Battle/Pawn'
], (Pawn) ->

  class Projectile extends Pawn
    constructor : (_) ->
      @_ = $.extend {
        dx          : null
        dy          : null
        accuracy    : null
        range       : null
        corpsetime  : 1
        target      : null
        explosion   : null
        img :
          sheet   : preloader.getFile('shells')
          hDist2  : 9
          w       : 3
          h       : 3
          row     : 0
      }, _
      super @_
    
    gfx : ->
      {
        img     : @_.img.sheet
        imgdx   : if @_.dx>0 then 3 else 0
        imgdy   : @_.img.row*@_.img.h
        worldx  : @_.x-(@_.img.w>>1)
        worldy  : @_.y-(@_.img.h>>1)
        imgw    : @_.img.w
        imgh    : @_.img.h
      }

      
# # # # Dumb projectiles # # # #
      
  class Bullet extends Projectile
    constructor : (_) ->
      @_ = $.extend {
        range   : 35
        damage  : 15
      }, _
      super @_
      @_.img.row = 0
  
  class MGBullet extends Projectile
    constructor : (_) ->
      @_ = $.extend {
        range   : 60
        damage  : $.R(21,32)
      }, _
      super @_
      @_.img.row = 0
  
  class SmallRocket extends Projectile
    constructor : (_) ->
      @_ = $.extend {
        explosion : 'SmallExplosion'
        range     : 90
        damage    : 24
      }, _
      super @_
      @_.img.row = 1
  
  class MortarShell extends Projectile
    constructor : (_) ->
      @_ = $.extend {
        range     : 1
        ddy       : 0.41
      }, _
      super @_
      @_.img.row = 2
      
  class SmallShell extends Projectile
    constructor : (_) ->
      @_ = $.extend {
        explosion : 'SmallExplosion'
        range     : 70
        damage    : 90
      }, _
      super @_
      @_.img.row = 2

# # # # Mines # # # #

  class SmallMine extends Projectile
    constructor : (_) ->
      @_ = $.extend {
        accuracy  : [0.6, 0]
        explosion : 'FragExplosion'
        damage    : 20
        img :
          w   : 5
          h   : 2
          row : 0
      }, _
      super @_
      @setSpriteSheet('mine')
  
  class SmallChemMine extends Projectile
    constructor : (_) ->
      @_ = $.extend {
        accuracy  : [0.6, 0]
        explosion : 'ChemExplosion'
        damage    : 6
        blinktime :
          current : 6
          max     : 6
        img :
          w   : 5
          h   : 2
          row : 0
      }, _
      super @_
      @setSpriteSheet('chemmine')
    
    gfx : ->
      if @_.blinktime.current
        @_.blinktime.current--
      else
        @_.img.row++
        if @_.img.row==3
          @_.img.row = 0
        else
          @_.blinktime.current = @_.blinktime.max
      
      {
        img     : @_.img.sheet
        imgdx   : if @_.dx>0 then @_.img.w else 0
        imgdy   : @_.img.row*@_.img.h
        worldx  : @_.x-(@_.img.w>>1)
        worldy  : @_.y-(@_.img.h>>1)
        imgw    : @_.img.w
        imgh    : @_.img.h
      }
  
# # # # Homing Missiles # # # #
  class HomingMissile extends Projectile
    constructor : (_) ->
      @_ = $.extend {
        maxSpeed          : 90
        range             : 280
        rangeTravelled    : 0
        ddy               : 0.081
        dspeed            : 0.84
        sight             : 8
        homingDelay       : 12
        smokeTrailType    : 'SmokeCloud'
        smokeTrailLength  : 8
        dx                : 0.01
        dy                : 0.01
        img :
          w     : 15
          h     : 15
          frame : 0
          sheet : preloader.getFile('missilered')
      }, _
      super @_
    
    gfx : ->
      # Set the correct angle automatically per frame.
      frame = @getAngle()
      
      {
        img     : @_.img.sheet
        imgdx   : @_.img.w*frame
        imgdy   : 0
        worldx  : @_.x-(@_.img.w>>1)
        worldy  : @_.y-(@_.img.h>>1)
        imgw    : @_.img.w
        imgh    : @_.img.h
      }
  
    getAngle : ->
      if @_.dx == 0 then @_.dx = 0.001
      if @_.dy == 0 then @_.dy = 0.001      
      dydx = Math.abs(@_.dy/@_.dx)
      
      # Set which frames we're going to be using depending on vector's quadrant
      if      @_.dx<0 and @_.dy<0    then  f = [4,  3,  2,  1,  0]
      else if @_.dx<0 and @_.dy>0    then  f = [4,  5,  6,  7,  8]
      else if @_.dx>0 and @_.dy>0    then  f = [12, 11, 10, 9,  8]
      else                                 f = [12, 13, 14, 15, 0]
      
      frame = f[0]
      if  0.1989 <= dydx < 0.6681 then  frame = f[1]
      if  0.6681 <= dydx < 1.4966 then  frame = f[2]
      if  1.4966 <= dydx < 5.0273 then  frame = f[3]
      if  5.0273 <= dydx          then  frame = f[4]
      
      frame
    
  class HomingMissileSmall extends HomingMissile
    constructor : (_) ->
      @_ = $.extend {
        maxSpeed          : 110
        range             : 90
        rangeTravelled    : 0
        ddy               : 0.0173
        dspeed            : 0.84
        sight             : 8
        homingDelay       : 12
        smokeTrailType    : 'SmokeCloudSmall'
        smokeTrailLength  : 6
        img :
          w     : 10
          h     : 10
          frame : 0
          sheet : preloader.getFile('missilepurple')
      }, _
      super @_
  
  class MediumRocketHE extends HomingMissile
    constructor : (_) ->
      @_ = $.extend {
        maxSpeed          : 65
        range             : 60
        rangeTravelled    : 0
        ddy               : 0.0241
        dspeed            : 0.001*$.R(600,2100)
        smokeTrailType    : 'SmokeCloudSmall'
        smokeTrailLength  : 12
        
        # Dumb missile.
        target            : { _ : { x:_.targetX, y:_.targetY} }
        # Set the target X, Y here and the target should be defined automatically
        targetX           : undefined
        targetY           : undefined
        
        img :
          w     : 10
          h     : 10
          frame : 0
          sheet : preloader.getFile('missilepurple')
      }, _
      super @_
  
  # export
  (Classes) ->
    $.extend(Classes, {
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
    })
    