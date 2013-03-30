define [
  'core/Battle/Pawn'
], (Pawn) ->

  CONST :
    GOAL :
      IDLE      : 0
      BUILD     : 1
      ATTACK    : 2
      DEFEND    : 3
      ESCORT    : 4
      REPAIR    : 5
      CAPTURE   : 6
      EVACUATE  : 7
      HARVEST   : 8
      PATROL    : 9

  class PawnController extends Pawn
    CONST : CONST  
  
  
  class Commander extends PawnController
    constructor : (_) ->
      @_ = $.extend {
        bandwidth : $.R(1,60)               # How many squads can a commander manage at once?
        attention :
          point   : null
          urgency : 0
        squads  : []                        # Squads under management by this commander
        comm    : []                        # Orders from superiors 
        repair  : []                        # List of known repair facilities
        depot   : []                        # Caches of units that can be used
        HQ      : null                      # If a commander is situated in a particular Pawn
        goal    : CONST.GOAL.IDLE
      }, _
      super @_
      
  class Squad extends PawnController
    constructor : (_) ->
      @_ = $.extend {
        rally            : []
        members          : []
        allMembersJoined : false
      }, _
  
  # export
  (Classes) ->
    $.extend(Classes, {
      PawnController
      Commander
      Squad
    })
      