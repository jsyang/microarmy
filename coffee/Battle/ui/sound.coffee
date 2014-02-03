define ->
  
  
  # Battle UI Sound Interface
  class BattleUISound
    constructor : ->
      @[k] = atom.playSound.bind atom, v for k, v of @
      
    INVALID               : 'invalid'
    BUILDING              : 'feed'
    
    ADD_SCAFFOLD          : 'dropitem'