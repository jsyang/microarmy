define ['core/Battle/Pawn'], (Pawn) ->
  VARIABLESTATS = [
    'variant'
  ]
  
  class Prop extends Pawn
    targetable : false
    
    constructor : (params) ->
      @[k]  = v for k, v of params
      @_setVariableStats VARIABLESTATS
      @_setHalfDimensions()
      
    getName : ->
      "#{@variant}"

  class Tree extends Prop
    variant : ->
      "smalltree-#{$.R(0,2)}"

  exportClasses = {
    Prop
    Tree
  }
    
  # Attach all these classes to the "importer" object.
  (importer) -> importer[k] = v for k, v of exportClasses