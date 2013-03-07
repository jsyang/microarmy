define ->
  class Pawn
    constuctor : (_) ->
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
      
    gfx : ->
    # Interface for rendering pawns.
      {
        img     : @_.img.sheet                # Sprite sheet
        imgdx   : @_.frame.current*@_.img.w   # X-frames denote action frames
        imgdy   : @_.action*@_.img.h          # Y-frames denote actions
        worldx  : @_.x-(@_.img.w>>1)          # Center sprite horizontally
        worldy  : @_.y-(@_.img.h+1)           # Bottom align
        imgw    : @_.img.w
        imgh    : @_.img.h
      }