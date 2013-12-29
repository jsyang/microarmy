define [
  'core/Battle/Pawn'
], (Pawn) ->

  CONST =
    STATE :
      PRISTINE  : 0
      GOOD      : 1
      FAIR      : 2
      POOR      : 3
      JUNK      : 4
    TYPE :
      FACILITY  : 0   # structure
      PERSONNEL : 1   # prisoner?
      COMPONENT : 2   # part of sth
      VEHICLE   : 3
      AIRCRAFT  : 4
      AMMO      : 5
      
    
  class Salvage extends Pawn
    constructor : (_) ->
      @_ = $.extend {
        targetable  : false # Don't want to be able to target explosions
        corpsetime  : Infinity
      }, _
      super @_
    
  # export
  (Classes) ->
    $.extend(Classes, {
      Salvage
    })