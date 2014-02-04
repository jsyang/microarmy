require [
  '../core/util'
  '../core/BehaviorExecutor'
], ($, BehaviorExecutor) ->

  global.$ = $

  describe 'BehaviorExecutor', ->
    
    describe 'constructor', ->
      it 'adds Decorators and converts Trees if within options', ->
        b = new BehaviorExecutor({
          Trees :
            Sample : '([doStuff])'
          
          Decorators :
            doStuff : -> true
        })
        
        expect(b.Trees.Sample.id).toEqual('selector')
        expect(b.Trees.Sample.children[0].id).toEqual('doStuff')
        expect(b.Decorators).toBeDefined()
        expect(b.Decorators.doStuff).toBeDefined()
        expect(b.Decorators.doStuff()).toEqual(true)
    
    describe 'ConvertShortHand', ->
      b = {}
      
      beforeEach ->
        b = new BehaviorExecutor()
        
      it 'throws if arg is not string', ->
        expect(-> b.ConvertShortHand({ stuff : 0 })).toThrow()
      
      it 'converts selectors and sequences correctly', ->
        a = [
          b.ConvertShortHand('([stuff])')
          b.ConvertShortHand('(([stuff]))')
          b.ConvertShortHand('(<[stuff]>)')
          b.ConvertShortHand('<<[stuff]>>')
          b.ConvertShortHand('<[stuff]>')
        ]
        expect(a[0].id).toEqual('selector')
        expect(a[0].children.length).toEqual(1)
        expect(a[0].children[0].id).toEqual('stuff')
        
        expect(a[1].id).toEqual('selector')
        expect(a[1].children.length).toEqual(1)
        expect(a[1].children[0].children.length).toEqual(1)
        expect(a[1].children[0].id).toEqual('selector')
        expect(a[1].children[0].children[0].id).toEqual('stuff')
        
        expect(a[2].id).toEqual('selector')
        expect(a[2].children.length).toEqual(1)
        expect(a[2].children[0].children.length).toEqual(1)
        expect(a[2].children[0].id).toEqual('sequence')
        expect(a[2].children[0].children[0].id).toEqual('stuff')
        
        expect(a[3].id).toEqual('sequence')
        expect(a[3].children.length).toEqual(1)
        expect(a[3].children[0].children.length).toEqual(1)
        expect(a[3].children[0].id).toEqual('sequence')
        expect(a[3].children[0].children[0].id).toEqual('stuff')
        
        expect(a[4].id).toEqual('sequence')
        expect(a[4].children.length).toEqual(1)
        expect(a[4].children[0].id).toEqual('stuff')
    
    describe 'Execute', ->
      mockPawn = {}
      
      beforeEach ->
        mockPawn = 
          health : 30
            
      b = new BehaviorExecutor({
        Decorators :
          setHealth0 : -> @health = 0
          TRUE       : true
          FALSE      : false
          
        Trees :
          sequence1 : '<[TRUE]>'
          sequence2 : '<[FALSE]>'
          sequence3 : '<[FALSE],[TRUE]>'
          sequence4 : '<[TRUE],[FALSE]>'
          
          selector1 : '([TRUE])'
          selector2 : '([FALSE])'
          selector3 : '([FALSE],[FALSE],[FALSE],[TRUE])'
          selector4 : '([FALSE],[FALSE],[FALSE],[TRUE],[setHealth0])'
          selector5 : '([FALSE],[FALSE],[FALSE])'
          
          mix1      : '([sequence2],[sequence1])'
          mix2      : '([sequence3],[sequence2])'
      })
      
      it 'throws if not given a valid btree', ->
        expect(-> b.Execute(mockPawn, { stuff : 0 })).toThrow()
        expect(-> b.Execute(mockPawn, null)).toThrow()
      
      it 'runs <[TRUE]> and returns true', ->
        expect(b.Execute(mockPawn,b.Trees.sequence1)).toEqual(true)
      
      it 'runs <[FALSE]> and returns false', ->
        expect(b.Execute(mockPawn,b.Trees.sequence2)).toEqual(false)
      
      it 'runs <[FALSE],[TRUE]> and returns false', ->
        expect(b.Execute(mockPawn,b.Trees.sequence3)).toEqual(false)
      
      it 'runs <[TRUE],[FALSE]> and returns false', ->
        expect(b.Execute(mockPawn,b.Trees.sequence4)).toEqual(false)
        
      it 'runs ([TRUE]) and returns true', ->
        expect(b.Execute(mockPawn,b.Trees.selector1)).toEqual(true)
        
      it 'runs ([FALSE]) and returns false', ->
        expect(b.Execute(mockPawn,b.Trees.selector2)).toEqual(false)
        
      it 'runs ([FALSE],[FALSE],[FALSE],[TRUE]) and returns true', ->
        expect(b.Execute(mockPawn,b.Trees.selector3)).toEqual(true)
      
      it 'runs ([FALSE],[FALSE],[FALSE],[TRUE],[setHealth0]) and returns true without setting health to 0', ->
        expect(b.Execute(mockPawn,b.Trees.selector4)).toEqual(true)
        expect(mockPawn.health).toEqual(30)
        
      it 'runs ([FALSE],[FALSE],[FALSE]) and returns false', ->
        expect(b.Execute(mockPawn,b.Trees.selector5)).toEqual(false)
      
      it 'runs ([sequence2],[sequence1]) and returns true', ->
        expect(b.Execute(mockPawn,b.Trees.mix1)).toEqual(true)
      
      it 'runs ([sequence3],[sequence2]) and returns false', ->
        expect(b.Execute(mockPawn,b.Trees.mix2)).toEqual(false)