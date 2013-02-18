# Add Resources to the locations in our world

define [
  'core/util/$'
  'core/Resources/Campaign'
], ($, Resources) ->
  (_) ->
    Resources_ = Resources
    giveResources = (loc) ->
      pile = {}
      bucket = ($$.shuffle $$.pairs Resources_).slice 0, 3
      ( pile[name] = $.R(1,30) ) for [name] in bucket
      _.map[loc.y][loc.x].store.add pile

    giveResources loc for loc in _.locations
    _
