define ->
  class ElectronicVoiceAgent
    MESSAGES : [
      100
      'incomingobjective'
      90
      'v_yourmission'
      20
      'v_defendareaagainstenemyattacks'
      5
      'v_and'
      6
      'v_constructbasetosecurethisregion'
      100
      'v_selectlocationtobuildstructures'
    ]
    
    delay : 0
    
    _nextItem : ->
      @MESSAGES.shift()
      delete @_source
    
    tick : ->
      if @_source?
        
      else
        # Next item in queue
        v = @MESSAGES[0]
        if v? and isNaN(v)
          @_source = atom.playSound v
          @_source.onended = => @_nextItem()
        else if v?
          if @delay > 0
            @delay--
            @_nextItem() if @delay is 0
          else
            @delay = v