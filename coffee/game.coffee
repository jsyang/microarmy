define [
  'core/util/$' # Consumed globally.
  'core/Battle'
  
  'text!core/spritesheet.json'
  'text!core/RESOURCES_SND.txt'
], ($, Battle, GFXJSON, SFXLIST) ->

  startGame = ->
    @Microarmy = new Battle()
    @Microarmy.GFXINFO = JSON.parse(GFXJSON)
    
    # Start the battle.
    @Microarmy.play()

  # Preload all the sounds in SM2
  window.soundManager.onready( ->
    window.soundManager.defaultOptions.volume = 45
    SFXLIST.split('\n').forEach(
      (v) -> window.soundManager.createSound(v,"./core/snd/#{v}") unless v.length is 0
    )
  )

  # Preload the spritesheet and start the game when loaded
  i = new Image()
  i.onload = startGame.bind(window)
  i.src = 'core/spritesheet.png'
  
  return
