define ->
  (_atomContext) ->
    # Bolt-on for atom that does multi-line text.
    _atomContext.textBaseline = 'top'
    _atomContext.font         = '10px verdana'

    _atomContext.drawText = (text='No text provided.', x = 0, y = 0, color = '#ff0000') ->
      lines = text.split('\n')
      @fillStyle = color
      for i in [0...lines.length]
        @fillText(lines[i], x, y + 10*i)