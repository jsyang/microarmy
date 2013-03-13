define ->
  class Pawn
    constructor : (_) ->
      @_ = $.extend {
        x           : 0
        y           : 0
        team        : 0
        corpsetime  : 0
        
        img :             # TODO: move these somewhere else, possible into part of map view?
          w     : 0
          h     : 0
          hDist : 0
          sheet : 0
          
        behavior :        # TODO: move this into behavior separate from model?
          alive : null
          dead  : null
      }, _

    # Set sprite sheet based on team
    setSpriteSheet : (type, team=@_.team) ->
      @_.img.sheet = preloader.getFile(type+team)
      
    # Interface for rendering pawns.
    gfx : ->
      {
        img     : @_.img.sheet                # Sprite sheet
        imgdx   : @_.frame.current*@_.img.w   # X-frames denote action frames
        imgdy   : @_.action*@_.img.h          # Y-frames denote actions
        worldx  : @_.x-(@_.img.w>>1)          # Center sprite horizontally
        worldy  : @_.y-(@_.img.h+1)           # Bottom align
        imgw    : @_.img.w
        imgh    : @_.img.h
      }
    
    
    # is___ funcs
    
    isAlly          : (pawn) -> @_.team == pawn._.team
    
    isDead          : -> !(@_.health?.current > 0)
    
    isCrewDead      : -> if @_.crew? then @_.crew.current < 0 else false
    
    isOutOfAmmo     : -> if @_.ammo? then @_.ammo.supply <=0 else false
    
    isAbleToTarget  : (pawn) ->
      if pawn._.fly? and !@_.canTargetAircraft
        false
      else
        true
    
    # # # # # # # #
    
    setTarget   : (t) -> if t? then @_.target = t else delete @_.target
      
    distX       : (pawn) -> Math.abs(@_.x - pawn._.x)