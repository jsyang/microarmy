define [
  'core/Battle/Pawn'
  'core/Battle/Pawn/FRAMES'
], (Pawn, FRAMES) ->

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
        behavior    : 'behavior tree here!'
        img :
          sheet : null
          w     : 3
          h     : 3
          row   : 0
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

      
# # # # Bullets # # # #
      
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
        behavior  : 'MortarShell' # todo: take the constructor.name to use as the behavior.
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
        # todo: take the constructor.name to use as the behavior.
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
        # todo: take the constructor.name to use as the behavior.
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
    {
      img     : @_.img.sheet
      imgdx   : @_.img.w*@_.img.frame
      imgdy   : 0
      worldx  : @_.x-(@_.img.w>>1)
      worldy  : @_.y-(@_.img.h>>1)
      imgw    : @_.img.w
      imgh    : @_.img.h
    }
  
  # TODO: move the rest of the stuff over from projectile.js