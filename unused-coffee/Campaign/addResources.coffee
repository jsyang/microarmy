# Add Resources to the locations in our world

define [
  'core/Resources/Campaign'
], (Resources) ->
  (_) ->
    Resources_ = Resources
    
    # Give 3 totally random resources to the location.
    give3RandomResources = (loc) ->
      pile = {}
      bucket = ($$.shuffle $$.pairs Resources_).slice 0, 3
      ( pile[name] = $.R(1,30) ) for [name] in bucket
      _.map[loc.y][loc.x].store.add pile

    # Choose what resources to assign based on type
    chooseResources = (type) ->
      switch type
        # { 'resource name' : maxAmountToGiveIfChosen }
        when 'city'
          bucket = [
            { 'citizen'               : 2000 }
            { 'policeman'             : 5 }
            { 'food'                  : 2500 }
            { 'agriculture'           : 10 }
            { 'fuel'                  : 250 }
          ]
        when 'base'
          bucket = [
            { 'pistol infantry'       : 60 }
            { 'rocket infantry'       : 20 }
            { 'engineer infantry'     : 10 }
            { 'food'                  : 2000 }
            { 'alloy'                 : 80 }
            { 'fuel'                  : 1000 }
            { 'policeman'             : 2 }
            { 'small arms'            : 30 }
            { 'small arms ammo'       : 120 }
            { 'small rocket launcher' : 10 }
            { 'small rocket'          : 20 }
            { 'combustible'           : 150 }
            { 'explosive'             : 50 }
            { 'munitions factory'     : 3 }
          ]
        when 'farm'
          bucket = [
            { 'citizen'               : 100 }
            { 'policeman'             : 1 }
            { 'food'                  : 3000 }
            { 'agriculture'           : 1500 }
            { 'advanced agriculture'  : 500 }
            { 'fuel'                  : 750 }
            { 'metal'                 : 50 }
            { 'explosive'             : 10 }
          ]
        when 'mine'
          bucket = [
            { 'citizen'               : 100 }
            { 'policeman'             : 10 }
            { 'food'                  : 750 }
            { 'fuel'                  : 750 }
            { 'metal'                 : 250 }
            { 'alloy'                 : 10 }
            { 'combustible'           : 10 }
            { 'mining facility'       : 5 }
            { 'smelting plant'        : 2 }
          ]
        when 'oilwell'
          bucket = [
            { 'citizen'               : 20 }
            { 'food'                  : 100 }
            { 'fuel'                  : 400 }
            { 'metal'                 : 50 }
            { 'alloy'                 : 10 }
            { 'oil well'              : 3 }
            { 'oil refinery'          : 2 }
          ]
        when 'factory'
          bucket = [
            { 'citizen'               : 60 }
            { 'food'                  : 200 }
            { 'fuel'                  : 800 }
            { 'metal'                 : 250 }
            { 'combustible'           : 100 }
            { 'alloy'                 : 100 }
            { 'munitions factory'     : 2 }
            { 'smelting plant'        : 2 }
            { 'engineering kit'       : 10 }
          ]
      bucketSize = $.R(4, bucket.length)
      bucket = ($$.shuffle bucket)[0...bucketSize]
      
      bucketObj = {}
      
      # Build the return as an object.
      (
        (
          bucketObj[k] = $.R(1,v)
        ) for k,v of item
      ) for item in bucket
      
      bucketObj
      
    # Give resources based on location type.
    giveResources = (loc) ->
      pile = chooseResources(loc.type)
      _.map[loc.y][loc.x].store.add pile
    
    # Exec
    giveResources loc for loc in _.locations
    _
