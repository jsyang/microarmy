define ->
  class ElectronicVoiceAgent

    PLAYLIST : []

    playing : false
    
    delay : 0
    
    add : (item) ->
      if not @playing and @PLAYLIST.length is 0
        if item instanceof Array
          @PLAYLIST = item
        else
          @PLAYLIST = [item]
    
    _nextItem : ->
      @MESSAGES.shift()
    
    tick : ->
      if not @playing
        # Next item in queue
        v = @MESSAGES[0]
        if v?
          if isNaN v
            @
            source = atom.playSound v
            source.onended = => @playing = false
          else
            if @delay > 0
              @delay--
              @_nextItem() if @delay is 0
            else
              @delay = v