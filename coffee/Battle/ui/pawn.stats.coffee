define ->
  class BattleUIPawnHealthBar
    h      : 4
    margin : 4
    
    COLOR :
      BACKGROUND : 'rgb(44,44,44)'
      GOOD       : 'rgb(44,252,44)'
      OKAY       : 'rgb(44,44,44)'
      BAD        : 'rgb(44,44,44)'
    
    constructor : (pawn, battle) ->
      @battle = battle
      @pawn = pawn
      @_1health_max = 1 / pawn.health_max
      name = pawn.getName()
      @pawnSpriteHeight = GFXINFO[name].height
      @pawnSpriteWidth  = GFXINFO[name].width
      @w  = @pawnSpriteWidth
      @w2 = @w >> 1
      
      @THRESHOLD =
        GOOD : pawn.health_max * 0.65
        OKAY : pawn.health_max * 0.3
    
    _getHealthColor : ->
      health = @pawn.health_current
      color = @COLOR.GOOD
      color = @COLOR.OKAY if health < @THRESHOLD.GOOD
      color = @COLOR.BAD  if health < @THRESHOLD.OKAY
      color
    
    _getHealthWidth : ->
      (@pawn.health_current * @_1health_max * @pawnSpriteWidth) >> 0
    
    draw : ->
      x = @pawn.x - @w2 - @battle.scroll.x
      y = @pawn.y - @pawnSpriteHeight - @margin - @h
      atom.context.save()
      
      atom.context.fillStyle   = @COLOR.BACKGROUND
      atom.context.fillRect x, y, @w, @h
      
      atom.context.fillStyle   = @_getHealthColor()
      atom.context.fillRect x + 1, y + 1, @_getHealthWidth() - 2, @h - 2
      
      atom.context.restore()
      
      