define ->
  class ElectronicVoiceAgent

    DELAY                         : (t) -> @add t
  
    NEW_CONSTRUCTION_OPTIONS      : -> @add 'v_newconstructionoptions'
    BUILDING                      : -> @add 'v_building'
    CANNOT_BUILD_HERE             : -> @add 'v_cannotbuildhere'
    COMMAND_INTERFACE_INITIATED   : -> @add 'v_commandinterfaceinitiated'
    SELECT_BUILD_LOCATION         : -> @add 'v_selectbuildlocation'
    CONSTRUCTION_COMPLETE         : -> @add 'v_constructioncomplete'
    DESTROY_ALL_ENEMY_FORCES      : -> @add 'v_destroyallenemyforces'
    ENGINEER_LOST                 : -> @add 'v_engineerlost'
    ESTABLISH_AND_DEFEND_BASE     : -> @add 'v_establishanddefendbase'
    INSUFFICIENT_FUNDS            : -> @add 'v_insufficientfunds'
    MISSION_ACCOMPLISHED          : -> @add 'v_missionaccomplished'
    MISSION_FAILED                : -> @add 'v_missionfailed'
    NEW_CONSTRUCTION_OPTIONS      : -> @add 'v_newconstructionoptions'
    NEW_MISSION_OBJECTIVE         : -> @add 'v_newmissionobjective'
    OUR_BASE_IS_UNDER_ATTACK      : -> @add 'v_ourbaseisunderattack'
    WARNING_INCOMING_ENEMY_FORCES : -> @add 'v_warningincomingenemyforces'
    YOUR_OBJECTIVE                : -> @add 'v_yourobjective'
    
    INITIAL_BASE_CONSTRUCTION   : ->
      @COMMAND_INTERFACE_INITIATED()
      @DELAY 10
      @SELECT_BUILD_LOCATION()
    
    # # # #

    PLAYLIST : []

    playing : false
    
    delay : 0
    
    add : (item) ->
      if not @playing
        if @PLAYLIST.length is 0
          if item instanceof Array
            @PLAYLIST = item
          else
            @PLAYLIST = [item]
        else
          if item instanceof Array
            @PLAYLIST = @PLAYLIST.concat item
          else
            @PLAYLIST.push item
            
    tick : ->
      if not @playing
        # Next item in queue
        v = @PLAYLIST[0]
        if v?
          if isNaN v
            @playing = true
            source = atom.playSound v
            source.onended = =>
              @playing = false
              @PLAYLIST.shift()
          else
            if @delay > 0
              @delay--
              @PLAYLIST.shift() if @delay is 0
            else
              @delay = v
          