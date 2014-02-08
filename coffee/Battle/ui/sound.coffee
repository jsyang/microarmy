define ->
  
  
  # Battle UI Sound Interface
  class BattleUISound
    constructor : ->
      @[k] = atom.playSound.bind atom, v for k, v of @
      
    INVALID               : 'invalid'
    BUILDING              : 'feed'
    SWITCH_DIRECTION      : 'metalclink'
    
    INFANTRY_DEATH1       : 'die1'
    INFANTRY_DEATH2       : 'die2'
    INFANTRY_DEATH3       : 'die3'
    INFANTRY_DEATH4       : 'die4'
    
    ADD_SCAFFOLD          : 'dropitem'