# Storage 'trait' class
define [
  'core/util/$'
], ($) ->
  # todo: decay items in tiles.
  # this is for skipping the decay check for all tiles in a turn
  # just count up the turns since last check
  # check only if there are things to decay + things that are alive or if
  # the user tried to poll the storage's contents
  
  # Location storage should not have limits?
  
  class CampaignStorage
    constructor : (_) ->
      @_ = $.extend {
        lastPoll    : 0     # Turns since we last calculated what's decayed
        decayRate   : 10    # Max things to throw away (decay) per turn
        contents    : {}
      }, _
    
    isEmpty : ->
      ( k for k,v of @_.contents ).length == 0
    
    add : (stuff) ->
      (
        if @_.contents[k]? and v>0
          @_.contents[k] += v
        else
          @_.contents[k] = v
      ) for k,v of stuff
      return
      
    remove : (stuff) ->
      (
        if @_.contents[k] and v>0
          @_.contents[k] -= v
          if @_.contents[k]<=0
            delete @_.contents[k]
          
      ) for k,v of stuff
      return
      
    has : (stuff) ->
      if typeof stuff == 'string'
        return stuff of @_.contents
      else
        (
          if @_.contents[k] < v
            return false
        ) for k,v of stuff
        true
        
    getContents : ->
      $.extend {}, @_.contents
      
    printContents : ->
      stuff = @_.contents
      text = (( k + ' x ' + v ) for k,v of stuff)
      
      if text.length>0
        text.join('\n')
      else
        'nothing'