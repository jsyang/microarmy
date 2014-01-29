define ->
  # Battle UI Sound Interface
  class BattleUISound
    constructor : ->
      @[k] = atom.playSound.bind atom, v for k, v of @
      
    # todo: USE this!
    BUTTON_CLICK : 'tack'
    
    ADD_SCAFFOLD : 'dropitem'