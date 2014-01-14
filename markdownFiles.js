// Edit this file when adding pages into table of contents.
var FILES = [
  'Behavior-Trees',
  'Design-Notes',
  'Devlog',
  'Gameplay',
  'Internals',
  'Misc',
  'Pieces'
];

FILES.forEach(function(v,i){
  FILES[i] = 'text!markdown/' + v + '.md';
});