define [
  'core/Battle/Pawn'
], (Pawn) ->
  CONST =
    ACTION :
      IDLING  : 0
      MOVING  : 1
      TURNING : 2
      WRECK   : 3

  class Vehicle extends Pawn
    CONST : CONST
    
    constructor : (_) ->
      @_ = $.extend {
        corpsetime  : 240
      }, _
      super @_
      
  
