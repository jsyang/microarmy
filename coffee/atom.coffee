define [
  'core/atom/spritesheet'
  'core/atom/text'
], (atomSpritesheet, atomText) ->

  if global?
    globalscope = global
  else if window?
    globalscope = window
  else
    throw new Error 'could not find a global scope'

  window.requestAnimationFrame = window.requestAnimationFrame or
    window.webkitRequestAnimationFrame or
    window.mozRequestAnimationFrame or
    window.oRequestAnimationFrame or
    window.msRequestAnimationFrame or
    (callback) ->
      window.setTimeout((-> callback 1000 / 60), 1000 / 60)
  
  # todo: test this on other browsers (non-webkit)
  window.cancelAnimationFrame = window.cancelAnimationFrame or
    window.webkitCancelAnimationFrame or
    window.mozCancelAnimationFrame or
    window.oCancelAnimationFrame or
    window.msCancelAnimationFrame or
    window.clearTimeout
  
  atom = {}
  
  atom.input = {
    _bindings: {}
    _down: {}
    _pressed: {}
    _released: []
    mouse: { x:0, y:0 }
  
    bind: (key, action) ->
      @_bindings[key] = action
  
    onkeydown: (e) ->
      action = @_bindings[eventCode e]
      return unless action
  
      @_pressed[action] = true unless @_down[action]
      @_down[action] = true
  
      e.stopPropagation()
      e.preventDefault()
  
    onkeyup: (e) ->
      action = @_bindings[eventCode e]
      return unless action
      @_released.push action
      e.stopPropagation()
      e.preventDefault()
  
    clearPressed: ->
      for action in @_released
        @_down[action] = false
      @_released = []
      @_pressed = {}
  
    pressed:  (action) -> @_pressed[action]
    down:     (action) -> @_down[action]
    released: (action) -> (action in @_released)
  
    ontouchmove: (e) ->
      # jsyang: only grab the first finger for now
      @mouse.x = e.changedTouches[0].pageX
      @mouse.y = e.changedTouches[0].pageY
    ontouchstart: (e) ->
      @mouse.x = e.changedTouches[0].pageX
      @mouse.y = e.changedTouches[0].pageY
      @onkeydown(e)
    ontouchend: (e) ->
      @mouse.x = e.changedTouches[0].pageX
      @mouse.y = e.changedTouches[0].pageY
      @onkeyup(e)
  
    onmousemove: (e) ->
      @mouse.x = e.pageX
      @mouse.y = e.pageY
    onmousedown: (e) -> @onkeydown(e)
    onmouseup: (e) -> @onkeyup(e)
    onmousewheel: (e) ->
      @onkeydown e
      @onkeyup e
      
    oncontextmenu: (e) ->
      if @_bindings[atom.button.RIGHT]
        e.stopPropagation()
        e.preventDefault()
  }
  
  document.onkeydown      = atom.input.onkeydown.bind(atom.input)
  document.onkeyup        = atom.input.onkeyup.bind(atom.input)
  document.onmouseup      = atom.input.onmouseup.bind(atom.input)
  document.ontouchend     = atom.input.ontouchend.bind(atom.input)
  document.ontouchcancel  = atom.input.ontouchend.bind(atom.input)
  document.ontouchleave   = atom.input.ontouchend.bind(atom.input)
  
  atom.touch =
    TOUCHING: 1000
  atom.button =
    LEFT: -1
    MIDDLE: -2
    RIGHT: -3
    WHEELDOWN: -4
    WHEELUP: -5
  atom.key =
    TAB: 9
    ENTER: 13
    ESC: 27
    SPACE: 32
    LEFT_ARROW: 37
    UP_ARROW: 38
    RIGHT_ARROW: 39
    DOWN_ARROW: 40
  
  for c in [65..90]
    atom.key[String.fromCharCode c] = c
  
  eventCode = (e) ->
    if e.type == 'keydown' or e.type == 'keyup'
      e.keyCode
    else if e.type == 'mousedown' or e.type == 'mouseup'
      switch e.button
        when 0 then atom.button.LEFT
        when 1 then atom.button.MIDDLE
        when 2 then atom.button.RIGHT
    else if e.type == 'mousewheel'
      if e.wheel > 0
        atom.button.WHEELUP
      else
        atom.button.WHEELDOWN
    else if e.type == 'touchstart' or e.type == 'touchend' or e.type == 'touchcancel' or e.type == 'touchleave'
      atom.touch.TOUCHING
  
  atom.canvas = document.getElementsByTagName('canvas')[0]
  atom.canvas.style.position = "absolute"
  atom.canvas.style.top = "0"
  atom.canvas.style.left = "0"
  atom.context = atom.canvas.getContext '2d'
  atom.context.clear = -> @clearRect(0,0,atom.width,atom.height)
  
  atom.canvas.ontouchstart    = atom.input.ontouchstart.bind(atom.input)
  atom.canvas.ontouchmove     = atom.input.ontouchmove.bind(atom.input)
  atom.canvas.ontouchend      = atom.input.ontouchend.bind(atom.input)
  atom.canvas.ontouchcancel   = atom.input.ontouchend.bind(atom.input)
  atom.canvas.ontouchleave    = atom.input.ontouchend.bind(atom.input)
  
  atom.canvas.onmousemove     = atom.input.onmousemove.bind(atom.input)
  atom.canvas.onmousedown     = atom.input.onmousedown.bind(atom.input)
  atom.canvas.onmouseup       = atom.input.onmouseup.bind(atom.input)
  atom.canvas.onmousewheel    = atom.input.onmousewheel.bind(atom.input)
  atom.canvas.oncontextmenu   = atom.input.oncontextmenu.bind(atom.input)
  
  window.onresize = (e) ->
    atom.canvas.width = window.innerWidth
    atom.canvas.height = window.innerHeight
    atom.width = atom.canvas.width
    atom.height = atom.canvas.height
  window.onresize()
  
  #window.onorientationchange = (e) ->
  #  atom.orientation = window.orientation
  #  # does this mean we should resize too?
  #window.onorientationchange()
  
  class Game
    constructor: ->
    update: (dt) -> # 1. Run controller logic, game logic.
    draw: ->        # 2. Update the UI.
    run: ->
      return if @running
      @running = true
  
      # jsyang: Set target FPS
      @_FPSTHRESHOLD = 1000 / @TARGETFPS
  
      s = =>
        @step()
        # jsyang: Need this limiter here otherwise CPU climbs to 100%.
        # Browser is so fast that it requests a frame nearly every ms.
        # a la http://code.bytespider.eu/post/20484989272/requestanimationframe-and-html5-game-loops
        @_frametimer = setTimeout(=> @frameRequest = window.requestAnimationFrame s, 20)
  
      @last_step = Date.now()
      @frameRequest = window.requestAnimationFrame s
    TARGETFPS : 40
    stop: ->
      cancelAnimationFrame @frameRequest if @frameRequest
      clearTimeout(@_frametimer)
      @frameRequest = null
      @running = false
    step: ->
      now = Date.now()
      #dt = (now - @last_step) * 0.001
      #@last_step = now
      #@update dt
      #@draw()

      dt = now - @last_step
      if dt >= @_FPSTHRESHOLD
        @last_step = now
        # Expensive step here.
        @update()
        atom.input.clearPressed()
        
      @draw()
        
  atom.Game = Game
  
  ## Images
  
  atom.gfx = {}
  
  atom.loadImage = (url, callback) ->
    try
      request = new Image()
    
      request.onload = ->
        callback?(null, request)
      
      request.onerror = ->
        callback?(error)
        
      request.src = url
  
    catch e
      callback? e.message
  
  atom.preloadImages = (gfx, cb) ->
    # gfx is { name: 'url' }
    toLoad = 0
    for name, url of gfx
      toLoad++
      do (name, url) ->
        atom.loadImage url, (error, buffer) ->
          console.error error if error
          atom.gfx[name] = buffer if buffer
          cb?() unless --toLoad
  
  # Graphics bolt-ons
  atomSpritesheet(atom.context)
  atomText(atom.context)
  
  ## Audio
  
  
  atom.audioContext = new webkitAudioContext?()
  
  atom._mixer = atom.audioContext?.createGainNode()
  atom._mixer?.connect atom.audioContext.destination
  atom._mixer?._activeSounds = []
  atom._mixer?._activeLoops = []
  
  atom.loadSound = (url, callback) ->
    return callback? 'No audio support' unless atom.audioContext
  
    request = new XMLHttpRequest()
    request.open 'GET', url, true
    request.responseType = 'arraybuffer'
  
    request.onload = ->
      atom.audioContext.decodeAudioData request.response, (buffer) ->
        callback? null, buffer
      , (error) ->
        callback? error
  
    try
      request.send()
    catch e
      callback? e.message
  
  atom.sfx = {}
  atom.preloadSounds = (sfx, cb) ->
    return cb? 'No audio support' unless atom.audioContext
    # sfx is { name: 'url' }
    toLoad = 0
    for name, url of sfx
      toLoad++
      do (name, url) ->
        atom.loadSound url, (error, buffer) ->
          console.error error if error
          atom.sfx[name] = buffer if buffer
          cb?() unless --toLoad
  
  atom.loopSound = (name, track = true, time = 0) ->
    return unless atom.sfx[name] and atom.audioContext
    source = atom.audioContext.createBufferSource()
    source.buffer = atom.sfx[name]
    
    source.connect atom._mixer
    source.noteOn time
    
    # Keep track of active sounds.
    #atom._mixer._activeSounds.push(source) if track
    
    source
  
  atom.playSound = (name, loop_ = false, track = true, time = 0) ->
    return unless atom.sfx[name] and atom.audioContext
    source = atom.audioContext.createBufferSource()
    source.buffer = atom.sfx[name]
    source.loop = true unless !loop_
    source.connect atom._mixer
    
    source.noteOn time
    
    # Keep track of active sounds.
    #atom._mixer._activeSounds.push(source) if track
    
    source
    
  
  atom.stopAllSounds = ->
    return unless atom.audioContext
    for sound in atom._mixer._activeSounds
      if sound?
        sound.stop(0)
    
    atom._mixer._activeSounds = []
    return
  
  atom.setVolume = (v) ->
    atom._mixer?.gain.value = v

  globalscope.atom = atom