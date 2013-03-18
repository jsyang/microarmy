define [
  'core/Battle/Pawn'
], (Pawn) ->

  class Explosion extends Pawn
    constructor : (_) ->
      @_ = $.extend {
        damage      : 0
        damageDecay : 2
        corpsetime  : 1
      }, _
      super @_
    
    # Don't want to be able to target explosions
    isDead : -> true
    
    gfx : ->
      {
        img     : @_.img.sheet
        imgdx   : @_.img.frame*@_img.w
        imgdy   : 0
        worldx  : @_.x-(@_.img.w>>1)
        worldy  : @_.y-(@_.img.h>>1)
        imgw    : @_.img.w
        imgh    : @_.img.h
      }

  # todo