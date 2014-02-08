define ->
  
  
  # Battle UI Sound Interface
  class BattleUISound
    constructor : ->
      @[k] = atom.playSound.bind atom, v for k, v of @
      
    INVALID               : 'invalid'
    BUILDING              : 'feed'
    SWITCH_DIRECTION      : 'metalclink'
    
    ADD_SCAFFOLD          : 'dropitem'