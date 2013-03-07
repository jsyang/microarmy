# Storage 'trait' class
define [
  'core/Resources/campaign'
], (Res) ->  
  class CampaignStorage
    constructor : (_) ->
      @_ = $.extend {
        contents    : {}    # Inventory that we can see
        buried      : {}    # Hidden cache that we can harvest from to add to our inventory
        owner       : {}    # TRUE/FALSE for who can manipulate
        production  : {}    # ON/OFF for producing various things. should list out the requirements per turn
      }, _
    
    add : (stuff) ->
      (
        if @_.contents[k]? and v>0
          @_.contents[k] += v
          
          # Adding a resource that can synthesize others?
          #if Res[k].make?
          #  $.extend @_.production, Res[k].make
            
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
    
    # todo: fix this, for better resource property names
    trySynthesizing : ->
      products = {}
      (
        trash = {}
        needs = Res[k].make.needs
        if needs?
          qtyProducers = 0  # qty able to produce the product.
          
          # 1. Find out our production limit
          (
            qtyContents = if @_.contents[kn]? then @_.contents[kn] else 0
            qtyNeeds    = v * vn
            
            if qtyContents < qtyNeeds
              console.log("not enough #{kn} for #{k} to fully produce #{k}")
              break
            else
              qtyProducers++
            
          ) for kn,vn of needs
          
      ) for k,v of @_.contents when (Res[k].make? and @_.production[k] is true)
      return
    
    # needs some rework
    tryMaintain : ->
      (
        trash = {}
        needs = Res[k].keep.needs
        if needs?
          (
            qtyContents = if @_.contents[kn]? then @_.contents[kn] else 0
            qtyNeeds    = v * vn
            
            if qtyContents < qtyNeeds
              qtyToTrashTotal   = Math.floor(v*(1 - qtyContents/qtyNeeds))
              qtyToTrashChance  = Math.round($.r() * qtyToTrashTotal)
              trash[k] = qtyToTrashChance
              console.log("lost #{qtyToTrashChance} x #{k} -- not enough #{kn}")
              
              break
            
            else
              qtyMaintenance = qtyNeeds
            
            trash[kn] = if trash[kn]? then trash[kn] + qtyMaintenance else qtyMaintenance
            if qtyContents >= qtyMaintenance
              console.log("#{qtyToTrashChance} x #{k} used #{qtyMaintenance} x #{kn} for maintenance")
            
          ) for kn,vn of needs
          
          # Resources can't be used twice
          @remove trash
          
      ) for k,v of @_.contents when (Res[k].keep?)
      
      return