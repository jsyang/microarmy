define ->
  # Additional info tooltip for selected entities.
  class BattleUIPawnLabelBox
    margin : 16
    
    border_color : 'rgb(11,11,11)'
    
    _setColors : (team) ->
      
      @header_color = [
        'rgb(135,171,237)'
        'rgb(147,217,147)'
      ][team]
      @body_color = [
        'rgb(211,220,235)'
        'rgb(212,235,211)'
      ][team]
    
    _getBoxWidth : (lines) ->
      longestLine = ''
      for l in lines when l.length > longestLine.length
        longestLine = l
      atom.context.measureText(longestLine).width
    
    _getText : ->
      lines = [ @pawn.NAMETEXT ]
      c = @battle.world.Classes
      if @pawn instanceof c['Scaffold']
        lines.push "Building #{c[@pawn.build_type]::NAMETEXT}"
      lines
    
    draw : ->
      lines = @_getText()
      w = @_getBoxWidth(lines) + 4
      w2 = w >> 1
      h = lines.length * atom.context.drawText.lineHeight + 2
      
      x = @pawn.x - w2 - @battle.scroll.x
      y = @pawn.y - h - @pawnSpriteHeight - @margin
      
      atom.context.save()
      
      atom.context.fillStyle = @border_color
      atom.context.fillRect x, y, w, h
      
      x += 1
      
      atom.context.fillStyle = @body_color
      atom.context.fillRect x, y + 1, w - 2, h - 2
      
      atom.context.fillStyle = @header_color
      atom.context.fillRect x, y + 1, w - 2, atom.context.drawText.lineHeight - 1
      
      atom.context.drawText lines, x, y, @border_color
      
      atom.context.restore()
    
    constructor : (pawn, battle) ->
      @battle = battle
      @pawn   = pawn
      @NAMETEXT = pawn.NAMETEXT
      @pawnSpriteHeight = @pawn._halfHeight << 1
      @_setColors pawn.team