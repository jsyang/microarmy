function testConversion(){
  var a=
  "(\n\
    [isReloading],\n\
    <[foundTarget],(\n\
      <[!isFacingTarget],[loopAnimation]>,\n\
      <[seeTarget],[attack]>\n\
    )>,\n\
    <[movePawn],[loopAnimation],<\n\
      [isOutsideWorld],\n\
      [walkingOffMapCheck]\n\
    >>\n\
  )";
  
  var o={id:"selector",children:[
    {id:"isReloading"},
    {id:"sequence",children:[{id:"foundTarget"},{id:"selector",children:[
      {id:"sequence",children:[{id:"!isFacingTarget"},{id:"loopAnimation"}]},
      {id:"sequence",children:[{id:"seeTarget"},{id:"attack"}]}
    ]}]},
    {id:"sequence",children:[{id:"movePawn"},{id:"loopAnimation"},{id:"sequence",children:[
      {id:"isOutsideWorld"},
      {id:"walkingOffMapCheck"}
    ]}]}
  ]};
  
  return Behavior.ConvertShortHand(a)==o;
}

// regex for whitespace removal: string.replace(/ +?/g,'');