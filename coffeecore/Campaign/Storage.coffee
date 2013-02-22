# Storage 'trait' class
define [
  'core/util/$'
  'core/Resources/campaign'
], ($, Res) ->
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
      contents = {}
      ( contents[k] = Math.floor v ) for k,v of @_.contents
      contents
      
    printContents : (stuff=@_.contents) ->
      text = (( k + ' x ' + v ) for k,v of stuff)
      
      if text.length>0
        text.join('\n')
      else
        'nothing'
    
    isEmpty : ->
      ( k for k,v of @_.contents ).length == 0
    
    tryDecay : ->
      trash = {}
      (
        needs = Res[k].keep?.needs
        if needs?
          (
            qtyContents = if @_.contents[kn]? then @_.contents[kn] else 0
            qtyNeeds    = v * vn
            
            if qtyContents < qtyNeeds
              qtyToTrash = Math.ceil(1 - qtyContents/qtyNeeds) * v
              qtyToTrash = Math.round($.r() * qtyToTrash)
              trash[k] = qtyToTrash
              console.log("lost #{trash[k]} x #{k} -- not enough #{kn}")
              
              # todo: fix this.
              trash[kn] = if trash[kn]? then trash[kn] + vn*(v-qtyToTrash) else vn*(v-qtyToTrash)
              console.log("#{v-qtyToTrash} x #{k} used #{vn*(v-qtyToTrash)} x #{kn} for maintenance")
              break
            
            else
              trash[kn] = if trash[kn]? then trash[kn] + qtyNeeds else qtyNeeds
              console.log("#{v} x #{k} used #{qtyNeeds} x #{kn} for maintenance")
            
          ) for kn,vn of needs
          
      ) for k,v of @_.contents
      
      return