define [
  'core/Battle/Pawn'
], (Pawn) ->

  CONST :
    STATE :
      PITCHHIGH : 0
      PITCHZERO : 1
      PITCHLOW  : 2
      TURNING   : 3
    MANEUVER :
      LANDING   : 0
      LOADING   : 1
      DODGING   : 2
      PATROL    : 3
      STRAFE    : 4
      UNLOADING : 5
    ALTITUDE :
      # turn these into different classes?
      HIGH    : 0
      MEDIUM  : 1
      LOW     : 2

  class Aircraft extends Pawn
    CONST : CONST  
  
    constructor : (_) ->
      @_ = $.extend {
        corpsetime  : 800
        imgsheet    : null
        target      : null
        squad       : null
        direction   : null
        state       : null
      }, _
      @setSpriteSheet(@_.imgsheet)
      super @_
      
  
  class AttackHelicopter extends Aircraft
    constructor : (_) ->
      @_ = $.extend {
        imgsheet    : 'heli'
        img         : { w:42, h:26, hDist2:625 }
        maxAltitude : CONST.ALTITUDE.LOW
        state       : CONST.STATE.PITCHZERO
        projectile  : 'MGBullet'
        sight       : 7
        frame       : 0
        maxSpeed    : 40
        dSpeed      : 0.379
        dx          : 0.001
        dy          : 0.001
        
        reload :
          ing   : 0
          time  : 70
        ammo :
          clip  : 12
          max   : 12
        health :
          current : $.R(2100,2500)
          max     : $.R(2500,2600)
        turn :
          ing     : 0
          current : 0
          last    : 4
      }, _
      super @_
      
    gfx : ->
      if @_.turn.ing 
        @_.frame = @_.turn.current;
      else
        # Rotor spin.
        @_.frame++
        @_.frame %= 2

      @getAngle()
      
      imgdy = if @_.direction>0 then @_.img.h*(@_.state+4) else @_.img.h*@_.state
      
      {
        img     : @_.img.sheet
        imgdx   : @_.img.w*@_.frame
        imgdy   : imgdy
        worldx  : @_.x-(@_.img.w>>1)
        worldy  : @_.y-(@_.img.h>>1)
        imgw    : @_.img.w
        imgh    : @_.img.h
      }
    
    getAngle : ->
      if not @_.turn.ing
        # ensure no divisions by 0
        @_.dx = 0.01 if @_.dx == 0
        
        if Math.abs(@_.dy/@_.dx)>3
          @_.state = CONST.STATE.PITCHZERO
        else
          if @_.dx*@_.dx+@_.dy*@_.dy>@_.maxSpeed*0.3
            if @_.dx*@_.direction>0
              @_.state = CONST.STATE.PITCHLOW
            else
              @_.state = CONST.STATE.PITCHHIGH
          else
            # Not going fast enough to pitch.
            @_.state = CONST.STATE.PITCHZERO
  
  # export
  (Classes) ->
    $.extend(Classes, {
      Aircraft
      AttackHelicopter
    })