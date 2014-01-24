define ->

  # Behavior interpreter
  class Behaviors
    constructor : (params) ->
      @[k] = v for k, v of params
      @Trees[k] = @ConvertShortHand(v) for k,v of @Trees

    Decorators : {}
    Trees      : {}
    
    # Behavior Tree Parser
    Execute : (thisArg, btree) ->
      if btree? and btree.id?
        switch btree.id
          
          # Quit on first false, otherwise true
          when 'sequence'
            (
              result = @Execute(thisArg, subtree)
              return result unless result is true
            ) for subtree in btree.children
            return result
          
          # Quit on first true, otherwise false
          when 'selector' 
            (
              result = @Execute(thisArg, subtree)
              return result unless result is false
            ) for subtree in btree.children
            return result
        
          # Custom behaviors and decorators
          else
            negate  = btree.id.indexOf('!') > -1
            pass    = btree.id.indexOf('~') > -1
            
            id_ = btree.id
            id_ = id_[1..] if negate
            id_ = id_[1..] if pass
            
            # Look in Decorators first
            subtree = @Decorators[id_]
            if subtree?
              if typeof subtree is 'boolean'
                return subtree
              else
                result = subtree.call thisArg
                if negate then result = !result
                if pass   then result = true
                return result
        
            # Look in Trees
            subtree = @Trees[id_]
            if subtree?
              result = @Execute(thisArg, subtree)
              if negate then result = !result
              if pass   then result = true
              return result
            
            else
              throw new Error "Tree/Decorator '#{id_}' not found!"
      else
        throw new Error 'No behavior tree specified for #{thisArg::constructor.name}!'
      
      return
    
    # String to BTree
    ConvertShortHand : (code) ->
      if typeof code is 'string'
        btreeJSON = code
          .replace(/\s+/g,    '')
          .replace(/\[/g,     '{id:"')
          .replace(/\]/g,     '"}')
          .replace(/\(/g,     '{id:"selector",children:[')
          .replace(/</g,      '{id:"sequence",children:[')
          .replace(/(>|\))/g, ']}')
        
        # todo: evil eval
        btree = eval("(#{btreeJSON})")
      
      else
        throw new Error 'btree shorthand must be given as a string!'