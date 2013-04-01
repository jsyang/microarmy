define ->
  class Pawn
    constructor : (_) ->
      @_ = $.extend {
        x           : 0
        y           : 0
        team        : 0
        corpsetime  : 0
        
        img :
          w     : 0
          h     : 0
          hDist : 0
          sheet : 0
      }, _

    # Set sprite sheet based on team
    setSpriteSheet : (type=@_.img.sheet, team=@_.team) ->
      if !(team?) then team = ''
      @_.img.sheet = preloader.getFile(type+team)
      
    # Interface for rendering pawns.
    gfx : ->
      {
        img     : @_.img.sheet                # Sprite sheet
        imgdx   : @_.frame.current*@_.img.w   # X-frames denote action frames
        imgdy   : @_.action*@_.img.h          # Y-frames denote actions
        worldx  : @_.x-(@_.img.w>>1)          # Center sprite horizontally
        worldy  : @_.y-@_.img.h               # Bottom align
        imgw    : @_.img.w
        imgh    : @_.img.h
      }
    
    
    # is___ funcs
    
    isAlly          : (pawn) -> @_.team == pawn._.team
    
    isDead          : -> !(@_.health?.current > 0)
    
    isCrewDead      : -> if @_.crew? then @_.crew.current < 0 else false
    
    isOutOfAmmo     : -> if @_.ammo? then @_.ammo.supply <=0 else false
    
    isAbleToTarget  : (pawn) ->
      if (pawn._.fly? and !@_.canTargetAircraft)
        false
      else
        true
    
    # # # # # # # #
    
    takeDamage  : (damageValue) ->
      if damageValue > 0
        @_.health.current -= damageValue
        @_.health.current = 0 if @_.health.current < 0
    
    setTarget   : (t) -> if t? then @_.target = t else delete @_.target
    
    setRallyPoint : (x, y) -> @_.rally = [x, y]
    
    setDirection : ->
      switch @_.team
        when 0
          d = 1
        when 1
          d = -1
      @_.direction = d
    
    distX       : (pawn) -> Math.abs(@_.x - pawn._.x)
    
    # todo: Might need to overwrite this func for certain classes
    distHit     : (pawn) ->
      [dx, dy] = [pawn._.x-(pawn._.img.w>>1), pawn._.y-(pawn._.img.h>>1)]
      [dx, dy] = [Math.abs(@_.x - dx), Math.abs(@_.y - dy)]
      
      dx*dx + dy*dy