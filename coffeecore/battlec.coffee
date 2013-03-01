define [
  'core/util/$'
  'core/Behaviors'
], ($, Behaviors) ->
  class Battle
    constructor : (_) ->
      @_ = $.extend {
        w        : 3000
        h        : 900
        tileDist : 3
      }, _
      
      