define ->
  class Behaviors
    constructor : (_) ->
      if 'Trees' of _      then (@['Trees'][k]  = @ConvertShortHand @['Trees'][k]) for k,v of @['Trees']
      if 'Decorators' of _ then @['Decorators'] = _['Decorators']
    
    Decorators : {}
    Trees      : {}
    
    Execute : (btree, thisArg) ->
      if btree? and btree.id?
        switch btree.id
          
          when 'sequence' # Quit on first false
            return false for subtree in btree.children when @Execute(subtree, thisArg) is false
          
          when 'selector' # Quit on first true
            return true for subtree in btree.children when @Execute(subtree, thisArg) is true
        
          else            # Custom behaviors and decorators
            negate  = btree.id[0] is '!'
            id_     = if negate then btree.id[1..] else btree.id
            
            # Look in Decorators first
            subtree = @Decorators[id_]
            if subtree?
              if typeof subtree is 'boolean'
                return subtree
              else
                result = subtree.call thisArg
                if negate then result = !result
                return result
        
            # Look in Trees
            subtree = @Trees[id_]
            if subtree?
              result = @Execute(subtree, thisArg)
              if negate then result = !result
              return result
            
            else
              throw new Error "Tree/Decorator '#{id_}' not found!"
      else
        throw new Error 'No behavior tree specified!'
      
      return
        
    ConvertShortHand : (code) ->
      if typeof code == 'string'
        btree = code
          .replace(/\[/g, '{id:"')
          .replace(/\]/g, '"}')
          .replace(/\(/g, '{id:"selector",children:[')
          .replace(/</g,  '{id:"sequence",children:[')
          .replace(/>/g,  ']}')
          .replace(/\)/g, ']}')
        
        btree = eval("(#{btree})")
      
      else
        code