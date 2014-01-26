define ->
  (_atomContext) ->
    # Bolt-on for atom that does multi-line text.
    _atomContext.textBaseline = 'top'
    _atomContext.font         = '10px verdana'
    
    _atomContext.drawText = (text='No text provided.', x = 4, y = 0, color = '#889988', halign = 'left') ->
      if text instanceof Array
        lines = text
      else
        lines = text.split('\n')
      
      @save()
      @fillStyle = color
      for i in [0...lines.length]
        dx = x
        switch halign
          when 'center'
            dx -= @measureText(lines[i]).width >> 1
          when 'right'
            dx -= @measureText(lines[i]).width
        
        @fillText(lines[i], dx, y + 10*i)      
      @restore()
      
    _atomContext.drawText.lineHeight = 12