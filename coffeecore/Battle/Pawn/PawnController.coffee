define [
  'core/Battle/Pawn'
], (Pawn) ->

  CONST :

    DISPOSITION :
      #SUICIDAL    : 0
      #BRUTAL      : 1
      AGGRESSIVE  : 0
      CAUTIOUS    : 1
      DEFENSIVE   : 2
      #FEARFUL     : 5


    GOAL :
      IDLE      : 0   # Not doing anything
      BUILD     : 1   # Construct
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
        targetable  : false

        # todo: tie these to NPCs with names
        special     : ($.R(1,10) for i in [0...7])

        squadLimit  : $.R(1,60)                 # How many squads can a commander manage at once?
        squads      : []                        # Squads under management by this commander
        comm        : []                        # Orders from superiors 
        repair      : []                        # List of known repair facilities
        depot       : []                        # Caches of units that can be used
        HQ          : null                      # If a commander is situated in a particular Pawn
        goal        : @CONST.GOAL.IDLE

        disposition : @CONST.DISPOSITION.CAUTIOUS
        
        # squad limit

        # How predisposed is the commander to forming squads of this type?
        squadBias   : 
          Infantry  : 1

        # How predisposed will the next member of the squad be of this type?
        memberBias :
          Infantry :
            PistolInfantry    : $.R(2,5)
            RocketInfantry    : $.R(2,5)
            EngineerInfantry  : 1

        attention   :
          point   : null
          urgency : 0
      }, _
      super @_
  
  # A collection of Pawns.
  class Squad extends PawnController
    constructor : (_) ->
      @_ = $.extend {
        meanX            : null
        targetable       : false
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
      