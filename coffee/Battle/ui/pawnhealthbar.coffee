define ->
  class BattleUIPawnHealthBar
    h      : 4
    margin : 6
    constructor : (pawn, battle) ->
      @battle = battle
      @pawn = pawn
      @_1health_max = 1 / pawn.health_max
      name = pawn.getName()
      @pawnSpriteHeight = GFXINFO[name].height
      @pawnSpriteWidth  = GFXINFO[name].width
      @w  = @pawnSpriteWidth
      @w2 = @w >> 1
      
      @threshold_good = pawn.health_max * 0.65
      @threshold_okay = pawn.health_max * 0.3
    
    _calculateColor : ->
      health = @pawn.health_current
      color = @color_good
      color = @color_okay if health < @threshold_good
      color = @color_bad  if health < @threshold_okay
      color
    
    _calculateBarWidth : ->
      (@pawn.health_current * @_1health_max * @pawnSpriteWidth) >> 0
    
    color_background : 'rgb(44,44,44)'
    color_good       : 'rgb(44,252,44)'
    color_okay       : 'rgb(44,44,44)'
    color_bad        : 'rgb(44,44,44)'
    
    draw : ->
      x = @pawn.x - @w2 - @battle.scroll.x
      y = @pawn.y - @pawnSpriteHeight - @margin - @h
      atom.context.save()
      
      atom.context.fillStyle   = @color_background
      atom.context.fillRect x, y, @w, @h
      atom.context.fillStyle   = @_calculateColor()
      atom.context.fillRect x + 1, y + 1, @_calculateBarWidth() - 2, @h - 2
      
      atom.context.restore()
      
      