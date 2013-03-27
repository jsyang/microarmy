define [
  'core/Battle/Pawn'
], (Pawn) ->

  STATE =
    GOOD  : 0
    BAD   : 1
    WRECK : 2

  class Structure extends Pawn
    
    constructor : (_) ->
      @_ = $.extend {
        targetable  : true
        corpsetime  : 1
        state       : STATE.GOOD
      }, _
      super @_
      @setSpriteSheet()
      
    
    gfx : ->
      {
        img     : @_.img.sheet
        imgdx   : if @_.direction>0 then @_.img.w else 0
        imgdy   : @_.state*@_.img.h
        worldx  : @_.x-(@_.img.w>>1)
        worldy  : @_.y-@_.img.h+1
        imgw    : @_.img.w
        imgh    : @_.img.h
      }

  
  # export
  (Classes) ->
    $.extend(Classes, {
      Structure
      
    })