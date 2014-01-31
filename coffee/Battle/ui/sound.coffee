define ->
  
  
  # Battle UI Sound Interface
  class BattleUISound
    constructor : ->
      @[k] = atom.playSound.bind atom, v for k, v of @
      
    BUTTON_CLICK_INVALID  : 'invalid'
    
    ADD_SCAFFOLD          : 'dropitem'