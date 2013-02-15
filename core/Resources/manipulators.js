define([
  'core/Campaign/Resources/list',
  'core/Campaign/Resources/Manipulator'
], function(Resources, Manipulator){

  var Manipulators = {};
  
  // Generate maintainers and synthesizer resources for now..
  for(var name in Resources) {
    if(!$$.isUndefined(Resources[name].synth)) {
      
    }
  }
  
  return Manipulators;
});