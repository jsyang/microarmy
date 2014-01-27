define ->
  class BattleVoices
    playing : false
    say : (snd) ->
      unless @playing
        phrase = atom.playSound snd
        phrase.onended = => @playing = false
        
    UNITSSELECTED : ->
      @say $.AR([
        'uv1_awaitingorders'
        'uv1_reporting'
      ])
      
    UNITORDERRECEIVED : ->
      @say $.AR([
        'uv1_yessir'
        'uv1_rightawaysir'
        'uv1_acknowledged'
        'uv1_notaproblem'
        'uv1_affirmative'
      ])